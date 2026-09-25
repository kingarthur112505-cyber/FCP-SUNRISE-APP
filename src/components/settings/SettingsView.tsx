import React, { useState } from 'react';
import { 
  Settings, 
  HardDrive, 
  Database, 
  ShieldCheck, 
  UserCheck, 
  Building2, 
  RotateCcw, 
  Check, 
  Save, 
  Sparkles,
  Server
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { UserRole } from '../../types';

export const SettingsView: React.FC = () => {
  const { 
    currentUser, 
    setCurrentUser, 
    teamMembers, 
    resetAllData, 
    showToast 
  } = useWorkspace();

  const [storageProvider, setStorageProvider] = useState<'s3' | 'r2' | 'gcp' | 'minio'>('s3');
  const [s3BucketName, setS3BucketName] = useState('fcp-sunrise-vault');
  const [s3Region, setS3Region] = useState('ap-southeast-1 (Singapore)');
  const [agencyName, setAgencyName] = useState('FCP Sunrise Travel & Tours Inc.');
  const [secReg, setSecReg] = useState('CS202204918');
  const [dotAccreditation, setDotAccreditation] = useState('DOT-NCR-TTA-2026-0042');

  const handleSaveSettings = () => {
    showToast('Workspace settings saved');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-3.5 flex items-center justify-between">
        <div>
          <h2 className="text-base md:text-lg font-bold text-[#0A2A43]">System & Architecture Settings</h2>
          <p className="text-xs text-slate-500">Configure file storage providers, relational database schemas, and agency roles</p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1498CC] hover:bg-[#0f82b0] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Main Settings Body */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 max-w-4xl">
        {/* Section 1: Storage Architecture Separation (PostgreSQL + S3) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-[#1498CC] flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0A2A43]">Storage Architecture & Provider Abstraction</h3>
              <p className="text-xs text-slate-500">
                PostgreSQL manages relational metadata; scalable S3-compatible storage handles binary media files.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* PostgreSQL Engine Info */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-[#1498CC]" />
                  PostgreSQL Metadata Engine
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  Connected
                </span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Stores users, file references, folder hierarchy trees, tasks, checklists, clients, and role-based permissions.
              </p>
              <div className="font-mono text-[10px] text-slate-600 bg-white p-2 rounded border border-slate-200">
                host: postgresql-db.internal:5432 / db: fcpsunrise_vault
              </div>
            </div>

            {/* S3 Object Storage Provider */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-amber-500" />
                  S3-Compatible Object Vault
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-[#1498CC] border border-sky-200 font-semibold">
                  Scalable
                </span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Stores high-resolution tour posters, itineraries, passport scans, visa PDFs, flight manifests, and media.
              </p>
              <div className="font-mono text-[10px] text-slate-600 bg-white p-2 rounded border border-slate-200">
                bucket: s3://fcp-sunrise-vault/ (No artificial quota)
              </div>
            </div>
          </div>

          {/* Provider selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Storage Provider</label>
              <select
                value={storageProvider}
                onChange={(e) => setStorageProvider(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 outline-none focus:border-[#1498CC]"
              >
                <option value="s3">Amazon S3 / AWS Vault</option>
                <option value="r2">Cloudflare R2 (Zero Egress)</option>
                <option value="gcp">Google Cloud Storage</option>
                <option value="minio">Self-Hosted MinIO</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bucket Vault Name</label>
              <input
                type="text"
                value={s3BucketName}
                onChange={(e) => setS3BucketName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 font-mono outline-none focus:border-[#1498CC]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Storage Region</label>
              <input
                type="text"
                value={s3Region}
                onChange={(e) => setS3Region(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 outline-none focus:border-[#1498CC]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: User Role & Permissions Testing */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-[#1498CC] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0A2A43]">User Role & Access Matrix</h3>
              <p className="text-xs text-slate-500">
                Prepared architecture for RBAC permissions: Admin, Manager, Staff, and Viewer.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                onClick={() => {
                  setCurrentUser(member);
                  showToast(`Active user set to ${member.name}`);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  currentUser.id === member.id
                    ? 'border-[#1498CC] bg-sky-50/70 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover border border-slate-200"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{member.name}</p>
                    <span className="text-[10px] font-mono uppercase font-bold text-[#1498CC]">
                      {member.role}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{member.department}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Agency Identity & Legal Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-[#1498CC] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0A2A43]">FCP Sunrise Agency Profile</h3>
              <p className="text-xs text-slate-500">Corporate accreditations and branch locations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Registered Entity Name</label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">SEC Registration No.</label>
              <input
                type="text"
                value={secReg}
                onChange={(e) => setSecReg(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-mono outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">DOT Accreditation</label>
              <input
                type="text"
                value={dotAccreditation}
                onChange={(e) => setDotAccreditation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-mono outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
            <span className="font-semibold text-slate-800">Official Tagline:</span>
            <p className="italic text-slate-700">“Creating Memories, Breaking the Distance.”</p>
            <p className="text-[11px] text-slate-400">
              Primary Office: Suite 802, Prestige Tower, F. Ortigas Jr. Rd, Ortigas Center, Pasig City, Metro Manila.
            </p>
          </div>
        </div>

        {/* Section 4: Data Maintenance & Reset */}
        <div className="bg-white rounded-2xl border border-red-200 p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-red-600 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4" />
                Reset Sample Workspace Data
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Restore default travel packages, marketing folders, visa checklists, and ClickUp tasks.
              </p>
            </div>
            <button
              onClick={resetAllData}
              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-semibold transition-colors"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
