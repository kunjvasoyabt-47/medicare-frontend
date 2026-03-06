import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { 
  ArrowLeft, Mail, Calendar, MapPin, Phone, 
  Activity, Clock, FileText, Upload, CheckCircle 
} from 'lucide-react';

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State to toggle the expandable editor
  const [isEditing, setIsEditing] = useState(false);
  
  // State to track individual PDF uploads
  const [files, setFiles] = useState({
    bill: null,
    report: null,
    prescription: null
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/admin/patients/${id}`);
        setData(res.data);
      } catch (err) { 
        console.error("Fetch error:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetch();
  }, [id]);

  // Strict PDF validation logic
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file && file.type !== 'application/pdf') {
      alert("Validation Error: Only PDF files are permitted for medical records.");
      e.target.value = ''; 
      return;
    }
    setFiles(prev => ({ ...prev, [type]: file }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-black text-slate-300 italic animate-pulse" style={{ fontFamily: 'Inter, sans-serif' }}>
        SYNCHRONIZING RECORDS...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 relative overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="auth-bg-highlight"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 mb-8 px-5 py-2.5 bg-white text-slate-600 rounded-2xl font-bold border border-slate-100 shadow-sm hover:bg-slate-50 transition-all text-[15px]"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden transition-all duration-500">
          
          {/* Obsidian Header */}
          <div className="bg-[#0f172a] p-10 text-white flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 bg-white/10 rounded-[2.5rem] flex items-center justify-center text-4xl font-black border border-white/20 shadow-2xl backdrop-blur-md">
              {data?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-black tracking-tight mb-2">{data?.full_name}</h1>
              <div className="flex gap-3 justify-center md:justify-start">
                <span className="px-4 py-1.5 bg-green-500/20 text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/30">
                  Active Case
                </span>
              </div>
            </div>
          </div>

          {/* Standard Info Grid */}
          <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            <DetailItem icon={<Mail />} label="Email" value={data?.email} />
            <DetailItem icon={<Phone />} label="Phone" value={data?.phone_number || "Not Linked"} />
            <DetailItem icon={<Calendar />} label="Date of Birth" value={data?.dob} />
            <DetailItem icon={<Activity />} label="Gender" value={data?.gender} />
            <div className="md:col-span-2">
              <DetailItem icon={<MapPin />} label="Address" value={data?.address || "No primary address provided"} />
            </div>
            <DetailItem icon={<Clock />} label="Discharge" value={data?.discharge_date || "Still Admitted"} />
          </div>

          {/* Expandable Section: Documents in Separate Rows */}
          {isEditing && (
            <div className="px-10 pb-10 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200">
                <h3 className="text-slate-800 font-black text-[18px] mb-8 flex items-center gap-2">
                  <FileText className="text-[#0f172a]" size={22} /> Document Management
                </h3>
                
                {/* Vertical Stack for Rows */}
                <div className="flex flex-col gap-8">
                  <UploadRow 
                    label="Upload Bill" 
                    id="bill" 
                    file={files.bill} 
                    onChange={(e) => handleFileChange(e, 'bill')} 
                  />
                  <UploadRow 
                    label="Upload Report" 
                    id="report" 
                    file={files.report} 
                    onChange={(e) => handleFileChange(e, 'report')} 
                  />
                  <UploadRow 
                    label="Upload Prescription" 
                    id="prescription" 
                    file={files.prescription} 
                    onChange={(e) => handleFileChange(e, 'prescription')} 
                  />
                </div>

                <button className="mt-10 w-full btn-auth-pill py-4 flex items-center justify-center gap-3 text-[16px] shadow-2xl">
                   Generate Discharge Summary
                </button>
              </div>
            </div>
          )}
          
          {/* Action Footer */}
          <div className="bg-slate-50 p-8 border-t border-slate-100 flex flex-col md:flex-row gap-4">
             <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`flex-1 py-4 rounded-2xl font-bold text-[16px] transition-all ${
                isEditing 
                ? 'bg-white text-slate-900 border border-slate-300 shadow-sm' 
                : 'btn-auth-pill text-white'
              }`}
             >
               {isEditing ? 'Cancel Records' : 'Edit Records'}
             </button>
             <button className="flex-1 bg-white text-slate-900 border border-slate-200 py-4 rounded-2xl font-bold hover:border-slate-900 transition-all text-[16px]">
               Download PDF
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * UploadRow Component
 * Each document gets its own full-width row
 */
function UploadRow({ label, id, file, onChange }) {
  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Label above the row */}
      <label className="text-slate-700 font-bold text-[15px] ml-1">
        {label}
      </label>
      
      <div className="flex flex-col md:flex-row items-center gap-3">
        <input 
          type="file" 
          id={id} 
          accept=".pdf" 
          onChange={onChange} 
          className="hidden" 
        />
        
        {/* Filename display beside the button */}
        <div className={`flex-1 w-full flex items-center gap-3 px-5 py-4 bg-white border border-slate-200 rounded-2xl text-[15px] transition-all ${file ? 'border-green-500 bg-green-50/20' : ''}`}>
          {file ? (
            <>
              <CheckCircle size={18} className="text-green-500 shrink-0" />
              <span className="text-green-800 font-medium truncate">{file.name}</span>
            </>
          ) : (
            <span className="text-slate-400">No PDF selected</span>
          )}
        </div>

        {/* Action button beside the display field */}
        <label 
          htmlFor={id} 
          className="w-full md:w-auto px-8 py-4 bg-[#0f172a] text-white rounded-2xl font-bold text-[14px] cursor-pointer hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 shrink-0"
        >
          <Upload size={18} /> Upload 
        </label>
      </div>
    </div>
  );
}

/**
 * Detail Display Item
 */
function DetailItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-4 p-5 rounded-3xl bg-[#f8fafc] border border-slate-100 group hover:border-[#0f172a] transition-all">
      <div className="p-3 bg-white text-slate-400 rounded-2xl shadow-sm border border-slate-100 group-hover:bg-[#0f172a] group-hover:text-white transition-all">
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <div>
        <p className="text-slate-700 font-bold text-[15px] mb-1">{label}</p>
        <p className="text-slate-500 text-[15px]">{value}</p>
      </div>
    </div>
  );
}