import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const navItems = [
    { id: 'dashboard', label: '数据看板', icon: 'fa-chart-pie' },
    { id: 'upload', label: '上传 Offer', icon: 'fa-file-upload' },
    { id: 'students', label: '学生管理', icon: 'fa-users' },
    { id: 'tasks', label: '任务清单', icon: 'fa-tasks' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-lg z-10">
        <div className="p-6 border-b border-slate-700 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <i className="fas fa-graduation-cap text-white text-sm"></i>
          </div>
          <span className="text-xl font-bold tracking-tight">OfferFlow</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <i className={`fas ${item.icon} w-5 text-center`}></i>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-300">
              AG
            </div>
            <div className="text-sm">
              <p className="text-white font-medium">管理员</p>
              <p className="text-slate-500 text-xs">资深顾问</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 z-20 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800 capitalize">
            {navItems.find(i => i.id === activeTab)?.label}
          </h1>
          <div className="flex gap-3">
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <i className="fas fa-bell"></i>
            </button>
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <i className="fas fa-cog"></i>
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto pb-20">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;