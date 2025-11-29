import React, { useState } from 'react';
import { getStudents, getApplicationsForStudent } from '../services/storageService';
import { Student } from '../types';
import StudentDetail from './StudentDetail';

const StudentList: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const students = getStudents();

  if (selectedStudent) {
    return (
      <div>
        <button 
          onClick={() => setSelectedStudent(null)}
          className="mb-4 flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <i className="fas fa-arrow-left"></i> 返回列表
        </button>
        <StudentDetail student={selectedStudent} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">学生档案库</h2>
        <div className="relative">
          <input 
            type="text" 
            placeholder="搜索学生姓名..." 
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
          />
          <i className="fas fa-search absolute left-3 top-2.5 text-slate-400 text-sm"></i>
        </div>
      </div>
      
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">姓名</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">学生 ID</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">申请数量</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">负责顾问</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {students.length === 0 ? (
             <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                暂无学生记录。请上传 Offer 自动创建。
              </td>
            </tr>
          ) : (
            students.map(student => {
              const apps = getApplicationsForStudent(student.student_id);
              return (
                <tr key={student.student_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-800">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">{student.student_id.substring(0,6)}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-bold">
                      {apps.length}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{student.consultant_name}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => setSelectedStudent(student)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      查看详情
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentList;