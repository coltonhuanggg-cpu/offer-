import React from 'react';
import { Student, OfferStatus, OfferType } from '../types';
import { getApplicationsForStudent, getTasksForApplication } from '../services/storageService';

const StudentDetail: React.FC<{ student: Student }> = ({ student }) => {
  const applications = getApplicationsForStudent(student.student_id);

  const getStatusColor = (status: OfferStatus) => {
    switch(status) {
      case OfferStatus.OFFER: return 'bg-emerald-100 text-emerald-700';
      case OfferStatus.REJECT: return 'bg-red-100 text-red-700';
      case OfferStatus.WAITLIST: return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  // Helper to translate status for display
  const getStatusText = (status: OfferStatus) => {
    switch(status) {
        case OfferStatus.OFFER: return '已录取';
        case OfferStatus.REJECT: return '被拒绝';
        case OfferStatus.WAITLIST: return '候补';
        default: return '待处理';
    }
  }

  const getOfferTypeText = (type: OfferType) => {
      switch(type) {
          case OfferType.CONDITIONAL: return '有条件 (Con)';
          case OfferType.UNCONDITIONAL: return '无条件 (Uncon)';
          default: return '';
      }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{student.name}</h2>
          <p className="text-slate-500 mt-1"><i className="fas fa-id-badge mr-2"></i>{student.student_id}</p>
        </div>
        <div className="flex gap-2">
           <span className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium">
             顾问: {student.consultant_name}
           </span>
        </div>
      </div>

      {/* Applications Grid */}
      <h3 className="text-lg font-bold text-slate-800">申请记录</h3>
      <div className="grid grid-cols-1 gap-6">
        {applications.length === 0 && (
          <p className="text-slate-400 italic">该学生暂无申请记录。</p>
        )}
        {applications.map(app => {
            const tasks = getTasksForApplication(app.application_id);
            return (
              <div key={app.application_id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 text-lg">
                      <i className="fas fa-university"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{app.university}</h4>
                      <p className="text-sm text-slate-500">{app.program}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(app.offer_status)}`}>
                      {getStatusText(app.offer_status)}
                    </span>
                    {app.offer_type !== OfferType.UNKNOWN && (
                      <span className="text-xs text-slate-400 font-medium">{getOfferTypeText(app.offer_type)}</span>
                    )}
                  </div>
                </div>

                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                   {/* Info Column */}
                   <div className="space-y-3">
                      <div className="text-sm">
                        <span className="text-slate-400 block text-xs uppercase font-bold">押金截止日期</span>
                        <span className={`font-medium ${app.deposit_deadline ? 'text-red-600' : 'text-slate-800'}`}>
                           {app.deposit_deadline || 'N/A'}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-400 block text-xs uppercase font-bold">押金金额</span>
                        <span className="font-medium text-slate-800">{app.deposit_amount || 'N/A'}</span>
                      </div>
                      <div className="text-sm">
                         <span className="text-slate-400 block text-xs uppercase font-bold">Offer 发出日期</span>
                         <span className="font-medium text-slate-800">{app.offer_date}</span>
                      </div>
                   </div>

                   {/* Tasks Column */}
                   <div className="md:col-span-2 bg-slate-50 rounded-lg p-4">
                      <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">任务与条件</h5>
                      {tasks.length === 0 ? (
                        <p className="text-xs text-slate-400">无待办任务。</p>
                      ) : (
                        <ul className="space-y-2">
                           {tasks.map(task => (
                             <li key={task.task_id} className="flex items-center justify-between text-sm bg-white p-2 rounded border border-slate-100">
                                <div className="flex items-center gap-2">
                                  <i className={`fas fa-circle text-[8px] ${task.status === 'done' ? 'text-green-400' : 'text-amber-400'}`}></i>
                                  <span className={task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-700'}>
                                    {task.task_description}
                                  </span>
                                </div>
                                {task.deadline && (
                                  <span className="text-xs text-red-500 font-bold">{task.deadline}</span>
                                )}
                             </li>
                           ))}
                        </ul>
                      )}
                   </div>
                </div>
              </div>
            );
        })}
      </div>
    </div>
  );
};

export default StudentDetail;