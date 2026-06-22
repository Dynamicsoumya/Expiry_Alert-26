import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../utils/api';
import { getCategoryIcon } from '../utils/helpers';

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6b7280'];

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashRes, recordRes] = await Promise.all([
          api.get('/dashboard'),
          api.get('/records/stats')
        ]);
        setStats({ dashboard: dashRes.data.dashboard, records: recordRes.data.stats });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  const { dashboard, records } = stats || {};
  const { summary, categoryBreakdown, monthlyExpiryTrend } = dashboard || {};

  const statusData = [
    { name: 'Active', value: summary?.active || 0, color: '#10b981' },
    { name: 'Expiring Soon', value: summary?.expiringSoon || 0, color: '#f59e0b' },
    { name: 'Expired', value: summary?.expired || 0, color: '#ef4444' }
  ].filter(d => d.value > 0);

  const priorityData = records?.byPriority?.map(p => ({
    name: p._id.charAt(0).toUpperCase() + p._id.slice(1),
    count: p.count
  })) || [];

  const monthlyData = monthlyExpiryTrend?.map(m => ({
    name: new Date(m._id.year, m._id.month - 1).toLocaleString('default', { month: 'short', year: '2-digit' }),
    documents: m.count
  })) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Insights into your document management</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Records', value: summary?.total || 0, icon: '📋', color: 'text-blue-600' },
          { label: 'Active', value: summary?.active || 0, icon: '✅', color: 'text-green-600' },
          { label: 'Expiring in 7 Days', value: summary?.expiringIn7Days || 0, icon: '⚡', color: 'text-orange-600' },
          { label: 'Expired', value: summary?.expired || 0, icon: '🚨', color: 'text-red-600' }
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="text-2xl mb-2">{card.icon}</div>
            <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>
            <div className="text-sm text-gray-500 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Status Distribution</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Documents']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">No data available</div>
          )}
        </div>

        {/* Priority Distribution Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Priority Breakdown</h3>
          {priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={priorityData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" name="Documents" radius={[6, 6, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={index} fill={['#10b981', '#f59e0b', '#f97316', '#ef4444'][index % 4]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">No data available</div>
          )}
        </div>

        {/* Monthly Expiry Trend */}
        {monthlyData.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm lg:col-span-2">
            <h3 className="font-bold text-gray-900 mb-4">Upcoming Expirations (Next 90 Days)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} barSize={50}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="documents" name="Documents Expiring" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">Category Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-2 text-gray-500 font-medium">Category</th>
                <th className="text-right py-3 px-2 text-gray-500 font-medium">Total</th>
                <th className="text-right py-3 px-2 text-gray-500 font-medium">Expired</th>
                <th className="text-right py-3 px-2 text-gray-500 font-medium">Expiring Soon</th>
                <th className="text-right py-3 px-2 text-gray-500 font-medium">Health</th>
              </tr>
            </thead>
            <tbody>
              {categoryBreakdown?.map((cat, i) => {
                const healthPct = cat.count > 0 ? Math.round(((cat.count - cat.expired - cat.expiringSoon) / cat.count) * 100) : 100;
                return (
                  <tr key={cat._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <span>{getCategoryIcon(cat._id)}</span>
                        <span className="font-medium text-gray-800">{cat._id}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-2 font-bold text-gray-900">{cat.count}</td>
                    <td className="text-right py-3 px-2">
                      {cat.expired > 0 ? <span className="text-red-600 font-semibold">{cat.expired}</span> : <span className="text-gray-400">0</span>}
                    </td>
                    <td className="text-right py-3 px-2">
                      {cat.expiringSoon > 0 ? <span className="text-yellow-600 font-semibold">{cat.expiringSoon}</span> : <span className="text-gray-400">0</span>}
                    </td>
                    <td className="text-right py-3 px-2">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${healthPct >= 80 ? 'bg-green-500' : healthPct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${healthPct}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${healthPct >= 80 ? 'text-green-600' : healthPct >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {healthPct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!categoryBreakdown?.length && (
            <div className="text-center py-8 text-gray-400">No records to analyze</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
