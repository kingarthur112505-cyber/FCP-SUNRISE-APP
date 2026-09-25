import React, { useState } from 'react';
import { 
  Home, 
  Folder, 
  Star, 
  Trash2, 
  CheckSquare, 
  Calendar, 
  Users, 
  BarChart3, 
  Settings, 
  ChevronRight, 
  ChevronDown, 
  FolderPlus, 
  HardDrive, 
  Plus, 
  X,
  Plane,
  FileText
} from 'lucide-react';
import { useWorkspace, formatBytes } from '../../context/WorkspaceContext';
import { ActiveNavTab } from '../../types';
import { FcpLogo } from './FcpLogo';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { 
    activeTab, 
    setActiveTab, 
    folders, 
    currentFolderId, 
    setCurrentFolderId, 
    totalStorageBytes, 
    totalActiveFilesCount,
    totalTrashCount, 
    totalFavoritesCount, 
    setIsUploadModalOpen,
    tasks,
    clients
  } = useWorkspace();

  const [isFoldersExpanded, setIsFoldersExpanded] = useState(true);

  // Root folders for navigation
  const rootFolders = folders.filter((f) => f.parentId === null);

  const handleNavClick = (tab: ActiveNavTab) => {
    setActiveTab(tab);
    if (tab !== 'files') {
      // keep currentFolderId or reset
    }
    onCloseMobile();
  };

  const handleFolderClick = (folderId: string) => {
    setCurrentFolderId(folderId);
    setActiveTab('files');
    onCloseMobile();
  };

  const activeTasksCount = tasks.filter((t) => t.status !== 'completed').length;
  const activeClientsCount = clients.length;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0A2A43]/60 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Persistent Desktop Sidebar & Collapsible Mobile Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0A2A43] text-white flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header with Brand & Tagline */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex flex-col">
            <FcpLogo variant="full" size="md" theme="dark" />
            <p className="text-[10px] text-slate-300 font-medium tracking-wide mt-1.5 pl-0.5 select-none">
              “Creating Memories, Breaking the Distance.”
            </p>
          </div>
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Upload CTA inside Sidebar */}
        <div className="px-3 pt-3">
          <button
            onClick={() => {
              setIsUploadModalOpen(true);
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#1498CC] hover:bg-[#0f82b0] active:scale-[0.98] text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Upload or Add Item</span>
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {/* Main Navigation */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Main Navigation
            </div>
            <nav className="space-y-0.5 text-xs">
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-[#1498CC] text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Home className="w-4 h-4" />
                  <span>Dashboard</span>
                </div>
              </button>

              {/* My Files with Folders Subtree */}
              <div>
                <button
                  onClick={() => {
                    handleNavClick('files');
                    setCurrentFolderId(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'files' && currentFolderId === null
                      ? 'bg-[#1498CC] text-white'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Folder className="w-4 h-4" />
                    <span>My Files</span>
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFoldersExpanded(!isFoldersExpanded);
                    }}
                    className="p-0.5 hover:bg-white/10 rounded cursor-pointer"
                  >
                    {isFoldersExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Subfolder list */}
                {isFoldersExpanded && (
                  <div className="mt-1 ml-4 pl-2 border-l border-white/10 space-y-0.5">
                    {rootFolders.map((folder) => {
                      const isSelected = activeTab === 'files' && currentFolderId === folder.id;
                      return (
                        <button
                          key={folder.id}
                          onClick={() => handleFolderClick(folder.id)}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-normal transition-colors truncate text-left ${
                            isSelected
                              ? 'bg-white/15 text-[#FFDF00] font-semibold'
                              : 'text-slate-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <Folder className="w-3.5 h-3.5 shrink-0 text-[#1498CC]" />
                          <span className="truncate">{folder.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Favorites */}
              <button
                onClick={() => handleNavClick('favorites')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'favorites'
                    ? 'bg-[#1498CC] text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Star className="w-4 h-4 text-[#FFDF00]" />
                  <span>Favorites</span>
                </div>
                {totalFavoritesCount > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white/10 rounded text-slate-300">
                    {totalFavoritesCount}
                  </span>
                )}
              </button>

              {/* Trash */}
              <button
                onClick={() => handleNavClick('trash')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'trash'
                    ? 'bg-[#1498CC] text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Trash2 className="w-4 h-4" />
                  <span>Trash</span>
                </div>
                {totalTrashCount > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-red-500/20 text-red-300 rounded">
                    {totalTrashCount}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Workspace Section */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Workspace
            </div>
            <nav className="space-y-0.5 text-xs">
              <button
                onClick={() => handleNavClick('tasks')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'tasks'
                    ? 'bg-[#1498CC] text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  <span>Tasks</span>
                </div>
                {activeTasksCount > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded">
                    {activeTasksCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavClick('calendar')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'calendar'
                    ? 'bg-[#1498CC] text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-sky-400" />
                  <span>Calendar</span>
                </div>
              </button>

              <button
                onClick={() => handleNavClick('clients')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'clients'
                    ? 'bg-[#1498CC] text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>Clients</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white/10 text-slate-300 rounded">
                  {activeClientsCount}
                </span>
              </button>

              <button
                onClick={() => handleNavClick('reports')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'reports'
                    ? 'bg-[#1498CC] text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  <span>Reports</span>
                </div>
              </button>
            </nav>
          </div>

          {/* System Section */}
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              System
            </div>
            <nav className="space-y-0.5 text-xs">
              <button
                onClick={() => handleNavClick('settings')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-[#1498CC] text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Storage Architecture Footer Card */}
        <div className="p-3 border-t border-white/10 bg-[#071F32]">
          <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1.5">
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-[#1498CC]" />
              <span className="font-semibold text-white">S3 Object Storage</span>
            </div>
            <span className="font-mono text-[10px] text-[#FFDF00]">Scalable</span>
          </div>

          {/* Clean progress indicator */}
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-1.5">
            <div className="bg-[#1498CC] h-full w-[24%]" />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>{formatBytes(totalStorageBytes)} in vault</span>
            <span>{totalActiveFilesCount} files</span>
          </div>
        </div>
      </aside>
    </>
  );
};
