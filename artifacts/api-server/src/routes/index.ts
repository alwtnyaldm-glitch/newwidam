import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminRouter from "./admin";
import matchesRouter from "./matches";
import ticketsRouter from "./tickets";
import postsRouter from "./posts";
import ordersRouter from "./orders";
import productsRouter from "./products";
import paymentsRouter from "./payments";
import otpLogsRouter from "./otp-logs";
import usersRouter from "./users";
import visitorsRouter from "./visitors";
import messagesRouter from "./messages";

const router = Router();

router.use(healthRouter);
router.use("/admin", adminRouter);
router.use("/matches", matchesRouter);
router.use("/tickets", ticketsRouter);
router.use("/posts", postsRouter);
router.use("/orders", ordersRouter);
router.use("/products", productsRouter);
router.use("/payments", paymentsRouter);
router.use("/otp-logs", otpLogsRouter);
router.use("/users", usersRouter);
router.use("/visitors", visitorsRouter);
router.use("/messages", messagesRouter);

export default router;
