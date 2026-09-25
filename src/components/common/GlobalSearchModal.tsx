import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  FileText, 
  Folder, 
  CheckSquare, 
  Users, 
  ArrowRight, 
  Sparkles, 
  Filter, 
  Tag, 
  Calendar 
} from 'lucide-react';
import { useWorkspace, formatBytes, formatDate } from '../../context/WorkspaceContext';
import { FileItem, Task, Client, Folder as FolderType } from '../../types';

export const GlobalSearchModal: React.FC = () => {
  const { 
    isGlobalSearchOpen, 
    setIsGlobalSearchOpen, 
    files, 
    folders, 
    tasks, 
    clients, 
    setPreviewingFile,
    setCurrentFolderId,
    setActiveTab 
  } = useWorkspace();

  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'files' | 'folders' | 'tasks' | 'clients'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isGlobalSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isGlobalSearchOpen]);

  // Keyboard shortcut listener: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      }
      if (e.key === 'Escape' && isGlobalSearchOpen) {
        setIsGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGlobalSearchOpen, setIsGlobalSearchOpen]);

  // Perform search
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    // Matching files
    const matchedFiles = files.filter((f) => {
      if (f.isTrash) return false;
      if (categoryFilter !== 'all' && f.category !== categoryFilter) return false;
      if (!q) return true;
      const matchName = f.name.toLowerCase().includes(q);
      const matchTags = f.tags.some((t) => t.toLowerCase().includes(q));
      const matchNotes = f.notes?.toLowerCase().includes(q) || false;
      const matchExt = f.extension.toLowerCase().includes(q);
      return matchName || matchTags || matchNotes || matchExt;
    });

    // Matching folders
    const matchedFolders = folders.filter((fld) => {
      if (!q) return true;
      return fld.name.toLowerCase().includes(q);
    });

    // Matching tasks
    const matchedTasks = tasks.filter((t) => {
      if (!q) return true;
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchProject = t.project.toLowerCase().includes(q);
      const matchAssignee = t.assignee.toLowerCase().includes(q);
      const matchChecklist = t.checklist.some((c) => c.text.toLowerCase().includes(q));
      return matchTitle || matchProject || matchAssignee || matchChecklist;
    });

    // Matching clients
    const matchedClients = clients.filter((c) => {
      if (!q) return true;
      const matchName = c.name.toLowerCase().includes(q);
      const matchDest = c.destination.toLowerCase().includes(q);
      const matchEmail = c.email.toLowerCase().includes(q);
      return matchName || matchDest || matchEmail;
    });

    return {
      files: matchedFiles.slice(0, 8),
      folders: matchedFolders.slice(0, 5),
      tasks: matchedTasks.slice(0, 5),
      clients: matchedClients.slice(0, 5),
      totalMatches: matchedFiles.length + matchedFolders.length + matchedTasks.length + matchedClients.length,
    };
  }, [query, categoryFilter, files, folders, tasks, clients]);

  if (!isGlobalSearchOpen) return null;

  const handleSelectFile = (file: FileItem) => {
    setPreviewingFile(file);
    setIsGlobalSearchOpen(false);
  };

  const handleSelectFolder = (folderId: string) => {
    setCurrentFolderId(folderId);
    setActiveTab('files');
    setIsGlobalSearchOpen(false);
  };

  const handleSelectTask = (_task: Task) => {
    setActiveTab('tasks');
    setIsGlobalSearchOpen(false);
  };

  const handleSelectClient = (_client: Client) => {
    setActiveTab('clients');
    setIsGlobalSearchOpen(false);
  };

  // Sample prompt suggestions for future AI semantic query demonstration
  const samplePrompts = [
    'Taiwan packages for November',
    'Korea visa requirements 2026',
    'Yunnan promotional poster',
    'Boracay corporate booking',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-[#0A2A43]/50 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-white">
          <Search className="w-5 h-5 text-[#1498CC] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files, tasks, clients..."
            className="w-full text-slate-800 placeholder-slate-400 text-sm md:text-base outline-none bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsGlobalSearchOpen(false)}
            className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded hover:bg-slate-200 transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-1">
            {(['all', 'files', 'folders', 'tasks', 'clients'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-2.5 py-1 rounded font-medium capitalize transition-colors ${
                  activeFilter === tab
                    ? 'bg-white text-[#0A2A43] shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'all' ? 'All Results' : tab}
              </button>
            ))}
          </div>

          {(activeFilter === 'all' || activeFilter === 'files') && (
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-[11px]">Type:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 rounded px-1.5 py-0.5 text-xs outline-none"
              >
                <option value="all">All Types</option>
                <option value="pdf">PDFs</option>
                <option value="doc">Documents</option>
                <option value="spreadsheet">Spreadsheets</option>
                <option value="image">Images</option>
                <option value="archive">Archives</option>
              </select>
            </div>
          )}
        </div>

        {/* Search Results / Suggestion Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* AI Semantic Search Architecture Notice */}
          <div className="p-2.5 bg-sky-50/70 border border-sky-100 rounded-lg text-xs text-sky-800 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#1498CC] shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold text-[#0A2A43]">Semantic Architecture Ready</span>
              <p className="text-sky-700 text-[11px] mt-0.5">
                Indexes file tags, OCR manifests & relational metadata. Try quick travel queries:
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {samplePrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => setQuery(p)}
                    className="text-[10px] bg-white px-2 py-0.5 rounded border border-sky-200 text-[#0A2A43] hover:border-[#1498CC] hover:text-[#1498CC] transition-colors"
                  >
                    “{p}”
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Sections */}
          {results.totalMatches === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              No matching files, folders, tasks, or clients found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <>
              {/* Files */}
              {(activeFilter === 'all' || activeFilter === 'files') && results.files.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2 px-1">
                    <span>FILES ({results.files.length})</span>
                    <span className="text-[11px] font-normal text-slate-400">Press to preview</span>
                  </div>
                  <div className="space-y-1">
                    {results.files.map((file) => (
                      <div
                        key={file.id}
                        onClick={() => handleSelectFile(file)}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer group transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded bg-sky-50 text-[#1498CC] flex items-center justify-center shrink-0 text-xs font-bold uppercase">
                            {file.extension}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate group-hover:text-[#1498CC]">
                              {file.name}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              <span>{formatBytes(file.size)}</span>
                              <span>·</span>
                              <span>{formatDate(file.updatedAt)}</span>
                              {file.tags.length > 0 && (
                                <>
                                  <span>·</span>
                                  <span className="truncate max-w-[120px]">{file.tags[0]}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#1498CC] opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Folders */}
              {(activeFilter === 'all' || activeFilter === 'folders') && results.folders.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-2 px-1">
                    FOLDERS ({results.folders.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.folders.map((fld) => (
                      <div
                        key={fld.id}
                        onClick={() => handleSelectFolder(fld.id)}
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 border border-slate-100 hover:border-slate-200 cursor-pointer group transition-all"
                      >
                        <Folder className="w-5 h-5 text-[#1498CC] shrink-0" />
                        <span className="text-sm font-medium text-slate-800 truncate group-hover:text-[#1498CC]">
                          {fld.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {(activeFilter === 'all' || activeFilter === 'tasks') && results.tasks.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-2 px-1">
                    TASKS ({results.tasks.length})
                  </div>
                  <div className="space-y-1">
                    {results.tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleSelectTask(task)}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer group transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CheckSquare className="w-4 h-4 text-amber-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate group-hover:text-[#1498CC]">
                              {task.title}
                            </p>
                            <span className="text-[11px] text-slate-400">
                              {task.project} · Due {formatDate(task.dueDate)}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clients */}
              {(activeFilter === 'all' || activeFilter === 'clients') && results.clients.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-2 px-1">
                    CLIENTS ({results.clients.length})
                  </div>
                  <div className="space-y-1">
                    {results.clients.map((client) => (
                      <div
                        key={client.id}
                        onClick={() => handleSelectClient(client)}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer group transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate group-hover:text-[#1498CC]">
                              {client.name}
                            </p>
                            <span className="text-[11px] text-slate-400">
                              {client.destination} · {client.contactNumber}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] capitalize font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                          {client.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">↵</kbd> Select
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">ESC</kbd> Close
            </span>
          </div>
          <span className="text-slate-400">
            FCP Sunrise Unified Index
          </span>
        </div>
      </div>
    </div>
  );
};
