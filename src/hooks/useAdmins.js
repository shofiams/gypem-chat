import { useState, useEffect, useCallback } from "react";
import { adminService } from "../api/adminService";

// Hook untuk fetch all admins
export const useAdmins = (opts = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await adminService.fetchAll();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message);
        setData([]);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch admins");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!opts.manual) {
      fetchAdmins();
    }
  }, [fetchAdmins, opts.manual]);

  return {
    data,
    loading,
    error,
    refetch: fetchAdmins,
  };
};

// Hook untuk fetch admin details by ID
export const useAdminDetails = (id, opts = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAdminDetails = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const result = await adminService.fetchById(id);

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message);
        setData(null);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch admin details");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id && !opts.manual) {
      fetchAdminDetails();
    }
  }, [id, fetchAdminDetails, opts.manual]);

  return {
    data,
    loading,
    error,
    refetch: fetchAdminDetails,
  };
};

// Hook untuk admin operations (create, update, delete)
export const useAdminOperations = (opts = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = useCallback(async (adminData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await adminService.create(adminData);

      if (result.success) {
        return { success: true, data: result.data, message: result.message };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to create admin";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (adminId, adminData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await adminService.update(adminId, adminData);

      if (result.success) {
        return { success: true, data: result.data, message: result.message };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to update admin";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (adminId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await adminService.delete(adminId);

      if (result.success) {
        return { success: true, data: result.data, message: result.message };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to delete admin";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    create,
    update,
    remove,
    loading,
    error,
    clearError,
  };
};