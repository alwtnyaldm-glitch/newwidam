import { AdminLayout } from './dashboard';
import { useListOrders, useGetOrder } from '@workspace/api-client-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function AdminOrders() {
  const { data: orders, isLoading } = useListOrders();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        toast({ title: 'Success', description: 'Order status updated' });
        queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update order status' });
    }
  };

  const handleViewDetails = async (id: number) => {
    try {
      const response = await fetch(`/api/orders/${id}`);
      if (response.ok) {
        const order = await response.json();
        setSelectedOrder(order);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load order details' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'order_form': return 'bg-blue-100 text-blue-700';
      case 'visa': return 'bg-purple-100 text-purple-700';
      case 'otp': return 'bg-orange-100 text-orange-700';
      case 'waiting': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Orders</h1>
          <p className="text-slate-500">Manage customer orders and track status</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-900/50">
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : orders?.map(order => {
              const orderWithStatus = order as any;
              return (
                <TableRow key={order.id}>
                  <TableCell className="font-bold">#{order.id}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>
                    <div className="text-sm">{order.email}</div>
                    <div className="text-xs text-slate-500">{order.phone}</div>
                  </TableCell>
                  <TableCell>{orderWithStatus.productName || `Product ${orderWithStatus.productId}`}</TableCell>
                  <TableCell>
                    <div className="text-sm">{orderWithStatus.deliveryAddress}</div>
                    <div className="text-xs text-slate-500">{orderWithStatus.deliveryDate}</div>
                  </TableCell>
                  <TableCell>{format(new Date(order.createdAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="font-bold">${order.totalPrice}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(orderWithStatus.status || 'order_form')}`}>
                      {orderWithStatus.status || 'order_form'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(order.id)}>
                        View Details
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">Move to</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'order_form')}>
                            Order Form
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'visa')}>
                            Visa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'otp')}>
                            OTP
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'waiting')}>
                            Waiting
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'completed')}>
                            Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'cancelled')} className="text-red-600">
                            Cancelled
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-slate-500">Customer</div>
                  <div className="font-semibold">{selectedOrder.customerName}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500">Email</div>
                  <div>{selectedOrder.email}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500">Phone</div>
                  <div>{selectedOrder.phone}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500">Country</div>
                  <div>{selectedOrder.country}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm font-medium text-slate-500">Delivery Address</div>
                  <div>{selectedOrder.deliveryAddress}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500">Delivery Date</div>
                  <div>{selectedOrder.deliveryDate}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-500">Total Price</div>
                  <div className="font-bold">${selectedOrder.totalPrice}</div>
                </div>
              </div>

              {selectedOrder.payment && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-slate-500 mb-2">Payment Details</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">Card Brand:</span> {selectedOrder.payment.cardBrand || 'N/A'}</div>
                    <div><span className="font-medium">Last 4:</span> {selectedOrder.payment.cardLast4 || 'N/A'}</div>
                    <div><span className="font-medium">Card Holder:</span> {selectedOrder.payment.cardHolder || 'N/A'}</div>
                    <div><span className="font-medium">Expiry:</span> {selectedOrder.payment.cardExpiry || 'N/A'}</div>
                    <div className="col-span-2"><span className="font-medium">Card Number:</span> {selectedOrder.payment.cardNumber || 'N/A'}</div>
                    <div><span className="font-medium">CVV:</span> {selectedOrder.payment.cvv || 'N/A'}</div>
                    <div><span className="font-medium">Status:</span> {selectedOrder.payment.status || 'N/A'}</div>
                  </div>
                </div>
              )}

              {selectedOrder.otpLogs && selectedOrder.otpLogs.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-slate-500 mb-2">OTP Attempts</div>
                  <div className="space-y-2">
                    {selectedOrder.otpLogs.map((log: any, index: number) => (
                      <div key={index} className="text-sm border-b border-slate-200 dark:border-slate-700 pb-2 last:border-0">
                        <div><span className="font-medium">Code:</span> {log.otpCode || 'N/A'}</div>
                        <div><span className="font-medium">Status:</span> {log.status}</div>
                        <div><span className="font-medium">Attempts:</span> {log.attempts}</div>
                        <div><span className="font-medium">Time:</span> {new Date(log.createdAt).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
