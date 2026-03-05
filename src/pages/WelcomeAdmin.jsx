import { useAuth } from '../context/AuthContext';
import { LogOut, ShieldCheck, Mail, Cpu, Settings } from 'lucide-react';

export default function WelcomeAdmin() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      {/* Top Navigation Bar */}
      <nav className="max-w-6xl mx-auto flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-100 mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2.5 rounded-2xl text-white">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="font-black text-slate-900 tracking-tight leading-none">Admin Console</h2>
            <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">System Active</span>
          </div>
        </div>

        <button 
          onClick={logout}
          className="group flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-600 rounded-2xl font-bold hover:bg-red-50 hover:text-red-600 transition-all active:scale-95"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          Logout
        </button>
      </nav>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-inner">
              <span className="text-3xl font-black text-slate-400">AD</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">{user?.full_name}</h1>
            <p className="text-slate-400 font-bold text-sm mb-6">System Administrator</p>
            
            <div className="w-full space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl text-left">
                <Mail size={18} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-600 truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl text-left">
                <Cpu size={18} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-600">Access Level: Full</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Stats / Dashboard Placeholder */}
        <div className="md:col-span-2 bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
          <div className="relative z-10">
            <h3 className="text-3xl font-black mb-4 tracking-tight">Management Dashboard</h3>
            <p className="text-slate-400 font-medium mb-8 max-w-md">
              Welcome back to the command center. You can manage patient records, monitor readmission penalties, and oversee insurance documentation from here.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <button className="p-6 bg-white/10 hover:bg-white/20 rounded-[2rem] border border-white/10 transition-all text-left">
                <Settings className="mb-3 text-blue-400" />
                <p className="font-black">System Settings</p>
                <p className="text-xs text-slate-400">Configure core parameters</p>
              </button>
              {/* You can add more cards here later */}
            </div>
          </div>
          
          {/* Decorative Background Element */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
        </div>

      </div>
    </div>
  );
}