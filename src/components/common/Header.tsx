import React, { useState } from 'react';
import { 
  Search, 
  Upload, 
  Bell, 
  Menu, 
  ChevronRight, 
  Plus, 
  Sparkles, 
  UserCheck, 
  FolderPlus, 
  CheckCircle2 
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { FcpLogo } from './FcpLogo';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { 
    currentUser, 
    setCurrentUser, 
    teamMembers, 
    activeTab, 
    currentFolderId, 
    getFolderPath, 
    setIsGlobalSearchOpen,
    setIsUploadModalOpen,
    toastMessage,
    showToast
  } = useWorkspace();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const folderPath = getFolderPath(currentFolderId);

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'files':
        if (folderPath.length === 0) return 'All Workspace Files';
        return folderPath.map((f) => f.name).join(' / ');
      case 'favorites':
        return 'Starred Files';
      case 'trash':
        return 'Trash Vault';
      case 'tasks':
        return 'Task Operations';
      case 'calendar':
        return 'Schedule & Deadlines';
      case 'clients':
        return 'Client CRM';
      case 'reports':
        return 'Analytics & Reports';
      case 'settings':
        return 'Workspace Settings';
      default:
        return 'Workspace';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Zone 1: Breadcrumb & Context (Desktop) or Mobile Logo */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="md:hidden">
            <FcpLogo variant="icon" size="sm" />
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="text-[#0A2A43] font-semibold">FCP Sunrise</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="capitalize text-slate-700 truncate max-w-[320px]">
              {getBreadcrumbTitle()}
            </span>
          </div>
        </div>

        {/* Zone 2: Global Search Trigger */}
        <div className="flex-1 max-w-md mx-2">
          <button
            type="button"
            onClick={() => setIsGlobalSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg text-slate-400 hover:text-slate-600 text-xs sm:text-sm transition-all shadow-2xs group"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-4 h-4 text-[#1498CC] group-hover:scale-110 transition-transform shrink-0" />
              <span className="truncate">Search files, tasks, clients...</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-500 shrink-0">
              <span>⌘</span>
              <span>K</span>
            </div>
          </button>
        </div>

        {/* Zone 3: Actions & Account Menu */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Upload Action */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1498CC] hover:bg-[#0f82b0] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs hover:shadow transition-all whitespace-nowrap"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 pl-2 rounded-lg hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            >
              <div className="hidden lg:flex flex-col text-right leading-tight">
                <span className="text-xs font-semibold text-slate-800">{currentUser.name}</span>
                <span className="text-[10px] text-[#1498CC] capitalize font-medium">{currentUser.role}</span>
              </div>
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-slate-200 ring-2 ring-transparent group-hover:ring-[#1498CC]/30"
              />
            </button>

            {isUserMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="font-semibold text-slate-900">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-400">{currentUser.email}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-sky-50 text-[#1498CC] border border-sky-100">
                      {currentUser.role}
                    </span>
                    <span className="text-[11px] text-slate-500">{currentUser.department}</span>
                  </div>
                </div>

                <div className="py-1">
                  <div className="px-3.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Switch Test Role:
                  </div>
                  {teamMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => {
                        setCurrentUser(member);
                        showToast(`Switched user to ${member.name} (${member.role.toUpperCase()})`);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-1.5 text-left hover:bg-slate-50 transition-colors ${
                        member.id === currentUser.id ? 'bg-sky-50/60 font-semibold text-[#1498CC]' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          referrerPolicy="no-referrer"
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span>{member.name}</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono text-slate-400">
                        {member.role}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-100 mt-1 pt-1">
                  <div className="px-3.5 py-1.5 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Tagline:</span>
                    <span className="text-[10px] font-medium text-slate-600 italic">“Creating Memories”</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-[#0A2A43] text-white rounded-lg shadow-xl text-xs font-medium border border-white/10 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#FFDF00] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
};
