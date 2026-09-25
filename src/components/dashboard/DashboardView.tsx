import React from 'react';
import { 
  FileText, 
  HardDrive, 
  CheckSquare, 
  Clock, 
  Users, 
  ArrowRight, 
  Upload, 
  FolderPlus, 
  Plus, 
  Calendar, 
  Plane, 
  ChevronRight,
  Star,
  Download,
  AlertCircle
} from 'lucide-react';
import { useWorkspace, formatBytes, formatDate } from '../../context/WorkspaceContext';
import { FileItem, Task, CalendarEvent } from '../../types';

export const DashboardView: React.FC = () => {
  const { 
    currentUser, 
    files, 
    folders, 
    tasks, 
    clients, 
    calendarEvents, 
    totalActiveFilesCount, 
    totalStorageBytes, 
    setActiveTab, 
    setCurrentFolderId, 
    setPreviewingFile,
    setIsUploadModalOpen,
    downloadFile 
  } = useWorkspace();

  const activeFiles = files.filter((f) => !f.isTrash);
  const recentFiles = [...activeFiles]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const activeTasks = tasks.filter((t) => t.status !== 'completed').slice(0, 4);
  const upcomingEvents = [...calendarEvents]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'normal':
        return 'text-sky-700 bg-sky-50 border-sky-100';
      case 'low':
        return 'text-slate-500 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC] overflow-y-auto">
      {/* Top Banner & Greeting */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-extrabold tracking-wider text-[#1498CC]">
                FCP Sunrise Workspace
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span className="text-xs text-slate-400 font-medium">Friday, September 25, 2026</span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-[#0A2A43] tracking-tight">
              Good afternoon, {currentUser.name}!
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1 italic">
              “Creating Memories, Breaking the Distance.”
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1498CC] hover:bg-[#0f82b0] active:scale-[0.98] text-white rounded-lg text-xs font-semibold shadow-xs hover:shadow transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Files</span>
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus className="w-4 h-4 text-[#1498CC]" />
              <span>New Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto w-full p-4 md:p-8 space-y-6">
        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          {/* Total Files */}
          <div
            onClick={() => setActiveTab('files')}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-[#1498CC]/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Files</span>
              <FileText className="w-4 h-4 text-[#1498CC] group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#0A2A43]">{totalActiveFilesCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">In 9 active folders</div>
          </div>

          {/* Storage Used */}
          <div
            onClick={() => setActiveTab('settings')}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-[#1498CC]/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Storage Used</span>
              <HardDrive className="w-4 h-4 text-sky-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#0A2A43]">{formatBytes(totalStorageBytes)}</div>
            <div className="text-[11px] text-[#1498CC] font-medium mt-1">Scalable S3 Object Vault</div>
          </div>

          {/* Active Tasks */}
          <div
            onClick={() => setActiveTab('tasks')}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-[#1498CC]/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Tasks</span>
              <CheckSquare className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#0A2A43]">{activeTasks.length}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">In progress & review</div>
          </div>

          {/* Upcoming Deadlines */}
          <div
            onClick={() => setActiveTab('calendar')}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-[#1498CC]/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Upcoming Deadlines</span>
              <Clock className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#0A2A43]">{upcomingEvents.length}</div>
            <div className="text-[11px] text-amber-600 font-medium mt-1">Next: Sept 27 (Embassy)</div>
          </div>

          {/* Active Clients */}
          <div
            onClick={() => setActiveTab('clients')}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-[#1498CC]/50 transition-all cursor-pointer group col-span-2 lg:col-span-1"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Clients</span>
              <Users className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#0A2A43]">{clients.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">54 total travelers booked</div>
          </div>
        </div>

        {/* Middle Two-Column Grid: Left (Files + Tasks) / Right (Upcoming Deadlines & Destinations) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 2-Column: Recent Files & Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Files Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">Recent Files</span>
                  <span className="text-xs text-slate-400 font-mono">({recentFiles.length})</span>
                </div>
                <button
                  onClick={() => setActiveTab('files')}
                  className="flex items-center gap-1 text-xs font-semibold text-[#1498CC] hover:underline"
                >
                  <span>View All Files</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {recentFiles.map((file) => {
                  const folder = folders.find((f) => f.id === file.folderId);

                  return (
                    <div
                      key={file.id}
                      onClick={() => setPreviewingFile(file)}
                      className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 p-2 rounded-lg cursor-pointer group transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* File icon / thumb */}
                        <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#1498CC] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {file.extension}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate group-hover:text-[#1498CC] transition-colors">
                            {file.name}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="capitalize">{file.category}</span>
                            <span>·</span>
                            <span className="truncate">{folder?.name || 'Workspace'}</span>
                            <span>·</span>
                            <span className="font-mono">{formatBytes(file.size)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-400">
                        <span className="font-mono hidden sm:inline">{formatDate(file.updatedAt)}</span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#1498CC] transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Tasks Section (ClickUp style) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">Active Tour Tasks</span>
                  <span className="text-xs text-slate-400 font-mono">({activeTasks.length})</span>
                </div>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="flex items-center gap-1 text-xs font-semibold text-[#1498CC] hover:underline"
                >
                  <span>Open Task Board</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {activeTasks.map((task) => {
                  const completedChecklist = task.checklist.filter((c) => c.completed).length;

                  return (
                    <div
                      key={task.id}
                      onClick={() => setActiveTab('tasks')}
                      className="p-3 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-200 hover:border-[#1498CC]/50 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] uppercase font-bold text-[#1498CC] tracking-wider">
                            {task.project}
                          </span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.2 rounded border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate">{task.title}</h4>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 text-xs text-slate-500">
                        {task.checklist.length > 0 && (
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            <CheckSquare className="w-3.5 h-3.5 text-[#1498CC]" />
                            <span>
                              {completedChecklist}/{task.checklist.length}
                            </span>
                          </div>
                        )}

                        <span className="font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          Due {formatDate(task.dueDate)}
                        </span>

                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Upcoming & Destinations */}
          <div className="space-y-6">
            {/* Upcoming Deadlines & Flights */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#1498CC]" />
                  <h3 className="text-sm font-bold text-slate-900">Upcoming Schedule</h3>
                </div>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className="text-xs font-semibold text-[#1498CC] hover:underline"
                >
                  Calendar
                </button>
              </div>

              <div className="space-y-3">
                {upcomingEvents.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => setActiveTab('calendar')}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-mono font-bold text-[#1498CC]">
                        {formatDate(ev.date)} {ev.time ? `· ${ev.time}` : ''}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-slate-500">
                        {ev.type.replace('_', ' ')}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 leading-snug">{ev.title}</h5>
                    {ev.description && (
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{ev.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* FCP Sunrise Operations Quick Folders */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Direct Department Access</h3>
              <div className="space-y-1.5 text-xs">
                {[
                  { name: 'Travel Packages', folderId: 'fld-pkg', count: '8 destinations' },
                  { name: 'Visa Documentation', folderId: 'fld-visa', count: '6 consulate checklists' },
                  { name: 'Marketing Collateral', folderId: 'fld-mkt', count: 'Posters & Reels' },
                  { name: 'Airline Tickets & PNR', folderId: 'fld-tkt', count: 'Flight manifests' },
                  { name: 'PSA Requirements', folderId: 'fld-psa', count: 'Civil registry guides' },
                ].map((item) => (
                  <div
                    key={item.name}
                    onClick={() => {
                      setCurrentFolderId(item.folderId);
                      setActiveTab('files');
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#1498CC]" />
                      <span className="font-medium text-slate-800 group-hover:text-[#1498CC]">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
