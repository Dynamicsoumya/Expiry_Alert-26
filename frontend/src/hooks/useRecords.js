import { useState, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export const useRecords = () => {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});

  const fetchRecords = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await api.get('/records', { params });
      setRecords(res.data.records);
      setPagination({
        total: res.data.total,
        totalPages: res.data.totalPages,
        currentPage: res.data.currentPage
      });
    } catch (err) {
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/records/stats');
      setStats(res.data.stats);
    } catch {}
  }, []);

  const createRecord = async (data) => {
    const res = await api.post('/records', data);
    toast.success('Record added successfully!');
    return res.data.record;
  };

  const updateRecord = async (id, data) => {
    const res = await api.put(`/records/${id}`, data);
    toast.success('Record updated!');
    return res.data.record;
  };

  const deleteRecord = async (id) => {
    await api.delete(`/records/${id}`);
    toast.success('Record deleted');
  };

  const archiveRecord = async (id) => {
    await api.put(`/records/${id}/archive`);
    toast.success('Record archived');
  };

  return { records, stats, loading, pagination, fetchRecords, fetchStats, createRecord, updateRecord, deleteRecord, archiveRecord };
};
