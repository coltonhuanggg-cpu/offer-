import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { getApplications, getStudents, getTasks } from '../services/storageService';
import { OfferStatus, OfferType } from '../types';

const Dashboard: React.FC = () => {
  const apps = getApplications();
  const tasks = getTasks();
  const students = getStudents();

  // Calculate Stats
  const totalOffers = apps.filter(a => a.offer_status === OfferStatus.OFFER).length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const totalStudents = students.length;
  const totalDepositAmount = apps.reduce((acc, curr) => {
    if (!curr.deposit_amount) return acc;
    // Basic extraction of numbers, ignoring currency for rough sum
    const num = parseFloat(curr.deposit_amount.replace(/[^0-9.]/g, ''));
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  // Chart Data
  const statusData = [
    { name: '已录取 (Offer)', value: totalOffers, color: '#10B981' }, // Success
    { name: '等待/候补', value: apps.filter(a => a.offer_status === OfferStatus.NONE || a.offer_status === OfferStatus.WAITLIST).length, color: '#F59E0B' }, // Warning
    { name: '被拒 (Reject)', value: apps.filter(a => a.offer_status === OfferStatus.REJECT).length, color: '#EF4444' }, // Danger
  ];

  const universityData = Object.entries(apps.reduce((acc, curr) => {
    acc[curr.university] = (acc[curr.university] || 0) + 1;
    return acc;
  }, {} as Record<string, number>))
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">学生总数</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{totalStudents}</h3>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
              <i className="fas fa-users"></i>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <i className="fas fa-arrow-up mr-1"></i>
            <span>活跃申请中</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Offer 总数</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{totalOffers}</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
              <i className="fas fa-envelope-open-text"></i>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            {apps.filter(a => a.offer_type === OfferType.UNCONDITIONAL).length} 个无条件录取 (Uncon)
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">待办任务</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{pendingTasks}</h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
              <i className="fas fa-clipboard-list"></i>
            </div>
          </div>
           <p className="mt-4 text-sm text-slate-400">即将截止或需处理</p>
        </div>

         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">预计押金总额</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">~{totalDepositAmount.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
              <i className="fas fa-coins"></i>
            </div>
          </div>
           <p className="mt-4 text-sm text-slate-400">基于已解析金额估算</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-bold text-slate-800 mb-6">申请结果分布</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
             {statusData.map((item, idx) => (
               <div key={idx} className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                 <span className="text-sm text-slate-600">{item.name} ({item.value})</span>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-bold text-slate-800 mb-6">热门申请院校 (Top 5)</h4>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={universityData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="count" fill="#4F46E5" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;