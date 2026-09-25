import React, { useState } from 'react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { FilePreviewModal } from './components/files/FilePreviewModal';
import { FileUploadModal } from './components/files/FileUploadModal';
import { MoveItemModal } from './components/files/MoveItemModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { FilesView } from './components/files/FilesView';
import { TasksView } from './components/tasks/TasksView';
import { CalendarView } from './components/calendar/CalendarView';
import { ClientsView } from './components/clients/ClientsView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { AuthModal } from './components/auth/AuthModal';

import { ErrorBoundary } from './components/common/ErrorBoundary';

const WorkspaceShell: React.FC = () => {
  const { 
    activeTab, 
    previewingFile, 
    setPreviewingFile 
  } = useWorkspace();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'files':
        return <FilesView mode="all" />;
      case 'favorites':
        return <FilesView mode="favorites" />;
      case 'trash':
        return <FilesView mode="trash" />;
      case 'tasks':
        return <TasksView />;
      case 'calendar':
        return <CalendarView />;
      case 'clients':
        return <ClientsView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC]">
      {/* Persistent Left Sidebar (Desktop) / Drawer (Mobile) */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main View Container (offset by sidebar width on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64 h-full">
        <Header
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {renderActiveView()}
        </main>
      </div>

      {/* Universal Global Search Overlay (⌘K) */}
      <GlobalSearchModal />

      {/* File Upload Modal */}
      <FileUploadModal />

      {/* Move File / Folder Modal */}
      <MoveItemModal />

      {/* File Preview & Metadata Modal */}
      {previewingFile && (
        <FilePreviewModal
          file={previewingFile}
          onClose={() => setPreviewingFile(null)}
        />
      )}

      {/* Authentication & Role Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <WorkspaceProvider>
        <WorkspaceShell />
      </WorkspaceProvider>
    </ErrorBoundary>
  );
}
