import { useAuth } from '../context/AuthContext';
import { LogOut, User, Mail, Hash } from 'lucide-react';

export default function WelcomePatient() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-8 border border-slate-100">
        <div className="flex justify-between items-start mb-8">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg">
            <User size={24} />
          </div>
          {/* Logout Button */}
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        <h1 className="text-2xl font-black text-slate-900 mb-2">
          Welcome, {user?.full_name || 'Patient'}
        </h1>
        
        <div className="space-y-4 mt-6">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
            <Hash className="text-slate-400" size={20} />
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patient ID</p>
              <p className="text-slate-700 font-bold">{user?.pid}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
            <Mail className="text-slate-400" size={20} />
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
              <p className="text-slate-700 font-bold">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}