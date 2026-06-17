import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { fetchOrdersThunk, updateOrderStatusThunk } from "../../features/orders/orderSlice";
import { OrdersTable } from "../../components/admin/AdminComponents";
import { toast } from "react-hot-toast";

export const AdminOrders = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrdersThunk());
  }, [dispatch]);

  const handleStatusChange = async (id, status) => {
    try {
      await dispatch(updateOrderStatusThunk({ id, status })).unwrap();
      toast.success(`Transaction status shifted to ${status}`);
    } catch (err) {
      toast.error(err || "Failed to update order status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          Invoiced System Orders
        </h1>
        <p className="text-xs text-gray-400">
          Supervise order delivery destinations, shift parcel logistics statuses, and manage cancellations
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <OrdersTable orders={orders} onStatusChange={handleStatusChange} />
      )}
    </div>
  );
};

export default AdminOrders;
