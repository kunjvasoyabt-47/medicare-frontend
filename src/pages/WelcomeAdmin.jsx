import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import {
  LogOut, ShieldCheck, Search, ArrowUpDown,
  ChevronLeft, ChevronRight, Eye
} from 'lucide-react';

export default function WelcomeAdmin() {
  const { logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const searchTerm = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const sortOrder = searchParams.get('sort') || 'asc';
  const itemsPerPage = 5;

  const updateFilters = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    setSearchParams(params);
  };

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const response = await api.get('/admin/patients', {
          params: { search: searchTerm, page: currentPage, size: itemsPerPage, sort: sortOrder }
        });
        setPatients(response.data.items || []);
        setTotalItems(response.data.total || 0);
      } catch (err) {
        console.error("Error fetching patients:", err);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [searchTerm, currentPage, sortOrder]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
      <nav className="max-w-6xl mx-auto flex justify-between items-center bg-white p-5 rounded-3xl shadow-sm border border-slate-100 mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-[#0f172a] p-2.5 rounded-2xl text-white shadow-lg"><ShieldCheck size={24} /></div>
          <div>
            <h2 className="font-black text-slate-900 tracking-tight leading-none text-[18px]">Admin Panel</h2>
            <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Live System</span>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-600 rounded-2xl font-bold hover:bg-red-50 hover:text-red-600 transition-all text-[15px]">
          <LogOut size={18} /> Logout
        </button>
      </nav>

      <div className="max-w-6xl mx-auto bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search patients..."
              className="form-input-field pl-12 text-[15px]"
              value={searchTerm}
              onChange={(e) => updateFilters({ search: e.target.value, page: 1 })}
            />
          </div>
          <button onClick={() => updateFilters({ sort: sortOrder === 'asc' ? 'desc' : 'asc' })} className="flex items-center gap-2 px-5 py-3.5 bg-slate-50 text-slate-900 rounded-2xl font-bold border border-slate-200 hover:border-slate-900 transition-all text-[15px]">
            <ArrowUpDown size={18} /> Sort: {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="pb-4 pl-4 text-xs font-black text-slate-400 uppercase tracking-wider">Patient Info</th>
                <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-wider">Patient ID</th>
                <th className="pb-4 text-right pr-12 text-xs font-black text-slate-400 uppercase tracking-wider">Status</th>
                <th className="pb-4 text-right pr-4 text-xs font-black text-slate-400 uppercase tracking-wider">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="4" className="py-10 text-center text-slate-400 font-bold italic text-[15px]">Refreshing data...</td></tr>
              ) : patients.map((patient) => (
                <tr
                  key={patient.id}
                  className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/patient/${patient.id}`)}
                >
                  <td className="py-5 pl-4 flex items-center gap-3">
                    <div
                      className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center text-white font-black uppercase text-base shadow-md shadow-slate-900/10"
                    >
                      {patient.full_name?.charAt(0) || 'P'}
                    </div>
                    <div><p className="font-bold text-slate-900 text-[15px]">{patient.full_name}</p><p className="text-[13px] text-slate-400">{patient.email}</p></div>
                  </td>
                  <td className="py-5"><span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg font-bold text-xs">#{patient.id}</span></td>
                  <td className="py-5 text-right pr-12">
                    <div className="flex items-center justify-end gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                      <span className="text-[12px] font-bold text-slate-600 uppercase">Active</span>
                    </div>
                  </td>
                  <td className="py-5 text-right pr-4">
                    <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-[#0f172a] group-hover:text-white transition-all">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-50">
          <p className="text-[13px] font-bold text-slate-400">Page {currentPage} of {totalPages || 1} ({totalItems} records)</p>
          <div className="flex gap-2">
            <button disabled={currentPage === 1 || loading} onClick={() => updateFilters({ page: currentPage - 1 })} className="p-2.5 rounded-xl border border-slate-200 disabled:opacity-30 transition-all"><ChevronLeft size={20} /></button>
            <button disabled={currentPage >= totalPages || loading} onClick={() => updateFilters({ page: currentPage + 1 })} className="p-2.5 rounded-xl border border-slate-200 disabled:opacity-30 transition-all"><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}