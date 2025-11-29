import React, { useState } from 'react';
import { getTasks, updateTaskStatus, getApplications, getStudents } from '../services/storageService';
import { Task, TaskStatus } from '../types';

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(getTasks());
  const apps = getApplications();
  const students = getStudents();

  // Helper to enrich task data
  const enrichedTasks = tasks.map(t => {
    const app = apps.find(a => a.application_id === t.application_id);
    const student = app ? students.find(s => s.student_id === app.student_id) : null;
    return { ...t, app, student };
  });

  const toggleStatus = (taskId: string, currentStatus: TaskStatus) => {
    const newStatus = currentStatus === TaskStatus.PENDING ? TaskStatus.DONE : TaskStatus.PENDING;
    updateTaskStatus(taskId, newStatus);
    setTasks(getTasks()); // Refresh
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-800">任务与提醒</h2>
        <p className="text-slate-500 text-sm mt-1">系统根据 Offer 条件和截止日期自动生成。</p>
      </div>

      <div className="divide-y divide-slate-100">
        {enrichedTasks.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <i className="fas fa-check-circle text-4xl mb-4 text-slate-200"></i>
            <p>太棒了！所有任务都已完成。</p>
          </div>
        ) : (
          enrichedTasks.map(task => (
            <div key={task.task_id} className={`p-4 flex items-center justify-between hover:bg-slate-50 transition-colors ${task.status === TaskStatus.DONE ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-4">
                <button 
                  onClick={() => toggleStatus(task.task_id, task.status)}
                  className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    task.status === TaskStatus.DONE 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-slate-300 hover:border-indigo-500'
                  }`}
                >
                  {task.status === TaskStatus.DONE && <i className="fas fa-check text-xs"></i>}
                </button>
                
                <div>
                  <p className={`font-medium ${task.status === TaskStatus.DONE ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {task.task_description}
                  </p>
                  <div className="flex gap-2 text-xs mt-1">
                    {task.student && (
                      <span className="text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                        {task.student.name}
                      </span>
                    )}
                    {task.app && (
                      <span className="text-slate-500">
                         @ {task.app.university}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                {task.deadline && (
                  <div className={`text-xs font-bold ${task.status === TaskStatus.DONE ? 'text-slate-400' : 'text-red-500'} flex items-center gap-1`}>
                    <i className="far fa-clock"></i>
                    {task.deadline}
                  </div>
                )}
                {task.status === TaskStatus.PENDING && (
                  <span className="text-[10px] uppercase tracking-wider text-amber-500 font-bold">待办</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;