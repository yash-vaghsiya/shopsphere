import React, { useEffect, useState } from "react";
import { UsersTable } from "../../components/admin/AdminComponents";
import { User } from "../../types";
import { axiosInstance } from "../../services/api";
import { toast } from "react-hot-toast";

export const AdminCustomers = () => {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get("/api/users");
        setUsersList(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to retrieve the active user base");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          System Users Directory
        </h1>
        <p className="text-xs text-gray-400">
          Trace active customer acquisitions, access roles, and default telephone information
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 animate-pulse">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <UsersTable users={usersList} />
      )}
    </div>
  );
};

export default AdminCustomers;
