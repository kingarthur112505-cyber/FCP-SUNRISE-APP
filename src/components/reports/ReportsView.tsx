import React from 'react';
import { 
  BarChart3, 
  HardDrive, 
  TrendingUp, 
  FileCheck, 
  Users, 
  Plane, 
  Download, 
  Calendar 
} from 'lucide-react';
import { useWorkspace, formatBytes } from '../../context/WorkspaceContext';

export const ReportsView: React.FC = () => {
  const { files, totalStorageBytes, totalActiveFilesCount, tasks, clients, showToast } = useWorkspace();

  // Calculate file counts by category
  const activeFiles = files.filter((f) => !f.isTrash);
  const pdfs = activeFiles.filter((f) => f.category === 'pdf');
  const images = activeFiles.filter((f) => f.category === 'image');
  const sheets = activeFiles.filter((f) => f.category === 'spreadsheet');
  const docs = activeFiles.filter((f) => f.category === 'doc');

  const destinationsBreakdown = [
    { name: 'Japan (Tokyo, Osaka, Hokkaido)', share: 38, count: 18, color: 'bg-[#1498CC]' },
    { name: 'Western Europe & Schengen', share: 24, count: 11, color: 'bg-indigo-600' },
    { name: 'Korea (Seoul, Nami, Busan)', share: 18, count: 9, color: 'bg-emerald-500' },
    { name: 'China & Yunnan Highland Tour', share: 12, count: 6, color: 'bg-amber-500' },
    { name: 'Domestic (Boracay, Batanes, Palawan)', share: 8, count: 4, color: 'bg-purple-500' },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base md:text-lg font-bold text-[#0A2A43]">Operations & Vault Analytics</h2>
          <p className="text-xs text-slate-500">Real-time overview of files, bookings, visa pipelines, and storage utilization</p>
        </div>

        <button
          onClick={() => showToast('Exporting operations summary CSV...')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Summary</span>
        </button>
      </div>

      {/* Main Analytics Content */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-400 block mb-1">Active Files in Vault</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-[#0A2A43]">{totalActiveFilesCount}</span>
              <span className="text-xs text-emerald-600 font-semibold font-mono">+8 this week</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-2 block">Across 9 primary department folders</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-400 block mb-1">S3 Vault Allocation</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-[#0A2A43]">{formatBytes(totalStorageBytes)}</span>
              <span className="text-xs text-slate-500 font-mono">Scalable</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-2 block">Zero application-level caps</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-400 block mb-1">Active Travelers Booked</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-[#0A2A43]">
                {clients.reduce((acc, c) => acc + (c.paxCount || 1), 0)} Pax
              </span>
              <span className="text-xs text-emerald-600 font-semibold font-mono">98% on-time</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-2 block">5 current client accounts</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-400 block mb-1">Visa Processing Rate</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-[#0A2A43]">99.4%</span>
              <span className="text-xs text-emerald-600 font-semibold font-mono">Japan/KR/US</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-2 block">Accredited agency submission</span>
          </div>
        </div>

        {/* Middle Two Columns: Storage Distribution & Destination Popularity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* S3 Storage Vault Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-[#1498CC]" />
                <h3 className="text-sm font-bold text-slate-900">Vault Media Type Distribution</h3>
              </div>
              <span className="font-mono text-xs text-slate-500">{formatBytes(totalStorageBytes)}</span>
            </div>

            {/* Visual Bar */}
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
              <div className="bg-rose-500 h-full" style={{ width: '45%' }} title="PDFs: 45%" />
              <div className="bg-purple-500 h-full" style={{ width: '30%' }} title="Images: 30%" />
              <div className="bg-emerald-500 h-full" style={{ width: '15%' }} title="Spreadsheets: 15%" />
              <div className="bg-blue-500 h-full" style={{ width: '10%' }} title="Documents: 10%" />
            </div>

            {/* Legend & Details */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="font-medium text-slate-700">PDF Itineraries & Forms</span>
                </div>
                <span className="font-mono text-slate-500">{pdfs.length} files</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span className="font-medium text-slate-700">Marketing Posters & Images</span>
                </div>
                <span className="font-mono text-slate-500">{images.length} files</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-medium text-slate-700">Pricing & Manifest Sheets</span>
                </div>
                <span className="font-mono text-slate-500">{sheets.length} files</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="font-medium text-slate-700">Word Quotations & Guides</span>
                </div>
                <span className="font-mono text-slate-500">{docs.length} files</span>
              </div>
            </div>
          </div>

          {/* Tour Destination Share */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-[#1498CC]" />
                <h3 className="text-sm font-bold text-slate-900">Destination Package Activity</h3>
              </div>
              <span className="text-xs text-slate-400">Autumn / Winter Season</span>
            </div>

            <div className="space-y-3 pt-1">
              {destinationsBreakdown.map((dest) => (
                <div key={dest.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{dest.name}</span>
                    <span className="font-mono font-semibold text-slate-700">{dest.share}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${dest.color}`}
                      style={{ width: `${dest.share}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
