import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import { Activity, Shield } from 'lucide-react';
import api from '../services/api';

const ActivityLogsPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await api.get('/activities');
      setActivities(res.activities || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'createdAt',
      render: (row) => <span className="text-xs text-slate-300">{new Date(row.createdAt).toLocaleString()}</span>,
    },
    {
      header: 'User',
      accessor: 'user',
      render: (row) => (
        <div>
          <p className="font-bold text-white text-xs">{row.user?.name || 'System Auto'}</p>
          <span className="text-[10px] uppercase font-bold text-indigo-400">{row.role}</span>
        </div>
      ),
    },
    {
      header: 'Module',
      accessor: 'module',
      render: (row) => <Badge variant="purple">{row.module}</Badge>,
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row) => <span className="font-bold text-emerald-400 text-xs">{row.action}</span>,
    },
    {
      header: 'Audit Description',
      accessor: 'description',
      render: (row) => <span className="text-xs text-slate-300 max-w-md truncate">{row.description}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">System Activity Audit Logs</h1>
        <p className="text-xs text-slate-400 mt-1">Complete immutable audit trail of user actions across all modules</p>
      </div>

      <DataTable columns={columns} data={activities} searchPlaceholder="Search audit logs..." />
    </div>
  );
};

export default ActivityLogsPage;
