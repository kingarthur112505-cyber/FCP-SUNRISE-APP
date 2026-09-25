import React, { useState, useMemo } from 'react';
import { 
  Folder as FolderIcon, 
  FolderPlus, 
  Upload, 
  Grid, 
  List, 
  Search, 
  Star, 
  Download, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  ChevronRight, 
  ArrowUpDown, 
  CornerDownRight, 
  FileText, 
  FileSpreadsheet, 
  FileImage, 
  FileArchive, 
  FileVideo, 
  FileCode, 
  Eye, 
  Sparkles,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { useWorkspace, formatBytes, formatDate } from '../../context/WorkspaceContext';
import { FileItem, Folder, FileCategory } from '../../types';

interface FilesViewProps {
  mode?: 'all' | 'favorites' | 'trash';
}

export const FilesView: React.FC<FilesViewProps> = ({ mode = 'all' }) => {
  const { 
    files, 
    folders, 
    currentFolderId, 
    setCurrentFolderId, 
    getFolderPath, 
    createFolder, 
    renameFolder, 
    deleteFolder, 
    renameFile, 
    deleteFile, 
    restoreFile, 
    permanentDeleteFile, 
    emptyTrash, 
    toggleFavorite, 
    downloadFile, 
    setPreviewingFile, 
    setIsUploadModalOpen, 
    setMovingItem,
    showToast 
  } = useWorkspace();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // New folder dialog
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Renaming folder dialog
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [folderRenameText, setFolderRenameText] = useState('');

  // Active folder menu
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const folderPath = getFolderPath(currentFolderId);

  // Subfolders in current view (only relevant in 'all' mode)
  const currentSubfolders = useMemo(() => {
    if (mode !== 'all') return [];
    return folders.filter((f) => f.parentId === currentFolderId);
  }, [folders, currentFolderId, mode]);

  // Files in current view
  const currentFiles = useMemo(() => {
    let list: FileItem[] = [];

    if (mode === 'trash') {
      list = files.filter((f) => f.isTrash);
    } else if (mode === 'favorites') {
      list = files.filter((f) => !f.isTrash && f.isFavorite);
    } else {
      // In 'all' mode: show files belonging to current folder, or if currentFolderId is null, show all active files
      if (currentFolderId === null) {
        list = files.filter((f) => !f.isTrash);
      } else {
        list = files.filter((f) => !f.isTrash && f.folderId === currentFolderId);
      }
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      list = list.filter((f) => f.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((f) => 
        f.name.toLowerCase().includes(q) || 
        f.tags.some(t => t.toLowerCase().includes(q)) ||
        f.extension.toLowerCase().includes(q)
      );
    }

    // Sort files
    list.sort((a, b) => {
      if (sortBy === 'name') {
        const res = a.name.localeCompare(b.name);
        return sortOrder === 'asc' ? res : -res;
      }
      if (sortBy === 'size') {
        return sortOrder === 'asc' ? a.size - b.size : b.size - a.size;
      }
      // date
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return list;
  }, [files, mode, currentFolderId, selectedCategory, searchQuery, sortBy, sortOrder]);

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    createFolder(newFolderName.trim(), currentFolderId);
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  const handleSaveRenameFolder = (folderId: string) => {
    if (folderRenameText.trim()) {
      renameFolder(folderId, folderRenameText.trim());
    }
    setRenamingFolderId(null);
  };

  const getCategoryIcon = (category: FileCategory, ext: string) => {
    switch (category) {
      case 'pdf':
        return <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs uppercase">PDF</div>;
      case 'spreadsheet':
        return <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs uppercase">{ext.slice(0, 3)}</div>;
      case 'doc':
        return <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">DOC</div>;
      case 'image':
        return <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs uppercase">{ext.slice(0, 3)}</div>;
      case 'video':
        return <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs uppercase">VID</div>;
      case 'archive':
        return <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs uppercase">ZIP</div>;
      default:
        return <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs uppercase">{ext.slice(0, 3)}</div>;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
      {/* Top Action Bar */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-3.5 space-y-3">
        {/* Breadcrumb Path & Primary Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 overflow-x-auto py-0.5">
            {mode === 'trash' ? (
              <span className="font-bold text-red-600 flex items-center gap-1.5">
                <Trash2 className="w-4 h-4" /> Trash Bin
              </span>
            ) : mode === 'favorites' ? (
              <span className="font-bold text-[#0A2A43] flex items-center gap-1.5">
                <Star className="w-4 h-4 text-[#FFDF00] fill-current" /> Starred Favorites
              </span>
            ) : (
              <>
                <button
                  onClick={() => setCurrentFolderId(null)}
                  className={`hover:text-[#1498CC] transition-colors whitespace-nowrap ${
                    currentFolderId === null ? 'font-bold text-[#0A2A43]' : 'text-slate-600'
                  }`}
                >
                  FCP SUNRISE
                </button>
                {folderPath.map((f, index) => {
                  const isLast = index === folderPath.length - 1;
                  return (
                    <React.Fragment key={f.id}>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <button
                        onClick={() => setCurrentFolderId(f.id)}
                        className={`hover:text-[#1498CC] transition-colors whitespace-nowrap ${
                          isLast ? 'font-bold text-[#0A2A43]' : 'text-slate-600'
                        }`}
                      >
                        {f.name}
                      </button>
                    </React.Fragment>
                  );
                })}
              </>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            {mode === 'trash' ? (
              <button
                onClick={emptyTrash}
                disabled={currentFiles.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Empty Trash</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsCreatingFolder(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-[#1498CC]" />
                  <span>New Folder</span>
                </button>

                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1498CC] hover:bg-[#0f82b0] text-white rounded-lg text-xs font-semibold shadow-xs transition-all whitespace-nowrap"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Files</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Inline Folder Creation Form */}
        {isCreatingFolder && (
          <form
            onSubmit={handleCreateFolder}
            className="flex items-center gap-2 p-2.5 bg-sky-50/70 border border-sky-200 rounded-xl text-xs animate-in fade-in"
          >
            <FolderPlus className="w-4 h-4 text-[#1498CC]" />
            <span className="font-semibold text-[#0A2A43]">New Folder Name:</span>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="e.g. Autumn Promotions 2026"
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-800 text-xs outline-none focus:border-[#1498CC] flex-1 max-w-xs"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1 bg-[#1498CC] text-white rounded-md font-semibold hover:bg-[#0f82b0]"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setIsCreatingFolder(false)}
              className="px-2 py-1 text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          </form>
        )}

        {/* Filter Bar, Search, and Grid/List Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 text-xs">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {[
              { id: 'all', label: 'All Files' },
              { id: 'pdf', label: 'PDFs' },
              { id: 'doc', label: 'Documents' },
              { id: 'spreadsheet', label: 'Spreadsheets' },
              { id: 'image', label: 'Images' },
              { id: 'archive', label: 'Archives' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-[#0A2A43] text-white font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search within view & View Toggles */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter current view..."
                className="pl-8 pr-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#1498CC] w-36 sm:w-48"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [b, o] = e.target.value.split('-');
                  setSortBy(b as any);
                  setSortOrder(o as any);
                }}
                className="bg-transparent text-slate-700 text-xs outline-none cursor-pointer"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="size-desc">Size (Largest)</option>
                <option value="size-asc">Size (Smallest)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid View"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Folders + Files */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
        {/* SUBFOLDERS SECTION (Only in normal view) */}
        {mode === 'all' && currentSubfolders.length > 0 && (
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-0.5">
              Folders ({currentSubfolders.length})
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {currentSubfolders.map((folder) => {
                const isRenaming = renamingFolderId === folder.id;
                const fileCountInFolder = files.filter((f) => !f.isTrash && f.folderId === folder.id).length;

                return (
                  <div
                    key={folder.id}
                    onClick={() => !isRenaming && setCurrentFolderId(folder.id)}
                    className="group relative bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#1498CC]/50 rounded-xl p-3 shadow-2xs transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-9 h-9 rounded-lg bg-sky-50 text-[#1498CC] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <FolderIcon className="w-5 h-5 fill-sky-100" />
                      </div>

                      {/* Folder Dropdown Menu */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative"
                      >
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === folder.id ? null : folder.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {activeMenuId === folder.id && (
                          <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 text-xs text-slate-700 animate-in fade-in duration-100">
                            <button
                              onClick={() => {
                                setRenamingFolderId(folder.id);
                                setFolderRenameText(folder.name);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-left"
                            >
                              <Edit3 className="w-3 h-3 text-slate-500" />
                              <span>Rename</span>
                            </button>
                            <button
                              onClick={() => {
                                setMovingItem({ type: 'folder', id: folder.id, name: folder.name });
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-left"
                            >
                              <CornerDownRight className="w-3 h-3 text-slate-500" />
                              <span>Move</span>
                            </button>
                            <button
                              onClick={() => {
                                deleteFolder(folder.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 text-red-600 text-left"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-2.5 min-w-0">
                      {isRenaming ? (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1"
                        >
                          <input
                            type="text"
                            value={folderRenameText}
                            onChange={(e) => setFolderRenameText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveRenameFolder(folder.id)}
                            className="w-full px-1.5 py-0.5 border border-[#1498CC] rounded text-xs font-semibold text-slate-900 outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveRenameFolder(folder.id)}
                            className="px-1.5 py-0.5 bg-[#1498CC] text-white rounded text-[10px]"
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <>
                          <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-[#1498CC] transition-colors">
                            {folder.name}
                          </h4>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">
                            {fileCountInFolder} file{fileCountInFolder !== 1 ? 's' : ''}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FILES SECTION */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-0.5">
            <span>
              {mode === 'trash' ? 'Deleted Files' : mode === 'favorites' ? 'Starred Files' : 'Files'} ({currentFiles.length})
            </span>
            <span className="text-[11px] font-normal normal-case text-slate-400">
              Click any file card or row to preview & inspect
            </span>
          </div>

          {currentFiles.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mb-3">
                <FolderOpen className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                {mode === 'trash' ? 'Trash is Empty' : mode === 'favorites' ? 'No Starred Files Yet' : 'This Folder is Empty'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                {mode === 'trash'
                  ? 'Items deleted from workspace will appear here before being permanently removed.'
                  : mode === 'favorites'
                  ? 'Star important itineraries, visa guidelines, and marketing materials for instant access.'
                  : 'Upload itineraries, vouchers, flyers, or quotations to keep your workspace organized.'}
              </p>
              {mode === 'all' && (
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-[#1498CC] hover:bg-[#0f82b0] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload First File</span>
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {currentFiles.map((file) => {
                const folderName = folders.find((f) => f.id === file.folderId)?.name;

                return (
                  <div
                    key={file.id}
                    onClick={() => setPreviewingFile(file)}
                    className="group relative bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#1498CC]/60 rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                  >
                    {/* Card Top: Thumbnail or Category Badge + Quick Actions */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        {getCategoryIcon(file.category, file.extension)}

                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1"
                        >
                          {mode === 'trash' ? (
                            <button
                              onClick={() => restoreFile(file.id)}
                              className="p-1 text-slate-400 hover:text-emerald-600 rounded transition-colors"
                              title="Restore File"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => toggleFavorite(file.id)}
                              className={`p-1 rounded transition-colors ${
                                file.isFavorite ? 'text-[#FFDF00]' : 'text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100'
                              }`}
                              title={file.isFavorite ? 'Starred' : 'Add to Favorites'}
                            >
                              <Star className="w-3.5 h-3.5 fill-current" />
                            </button>
                          )}

                          <button
                            onClick={() => downloadFile(file)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Download"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Visual Thumbnail preview if image */}
                      {file.previewUrl && (
                        <div className="w-full h-24 mb-2 rounded-lg bg-slate-100 overflow-hidden border border-slate-100 flex items-center justify-center">
                          <img
                            src={file.previewUrl}
                            alt={file.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      )}

                      {/* File Name */}
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-2 group-hover:text-[#1498CC] transition-colors leading-snug">
                        {file.name}
                      </h4>
                    </div>

                    {/* Card Bottom: Metadata (Zero-pill text discipline) */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-mono text-slate-600">{formatBytes(file.size)}</span>
                        <span>·</span>
                        <span className="truncate">{folderName || 'Root'}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 shrink-0">
                        {formatDate(file.updatedAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* LIST VIEW */
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                      <th className="py-2.5 px-4">Name</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Folder</th>
                      <th className="py-2.5 px-3 text-right">Size</th>
                      <th className="py-2.5 px-3">Modified</th>
                      <th className="py-2.5 px-3">Owner</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentFiles.map((file) => {
                      const folderName = folders.find((f) => f.id === file.folderId)?.name;

                      return (
                        <tr
                          key={file.id}
                          onClick={() => setPreviewingFile(file)}
                          className="hover:bg-slate-50/80 cursor-pointer group transition-colors"
                        >
                          {/* Name + Icon */}
                          <td className="py-2.5 px-4 font-medium text-slate-800">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="px-1.5 py-0.5 bg-sky-50 text-[#1498CC] rounded font-bold uppercase text-[10px] shrink-0">
                                {file.extension}
                              </span>
                              <span className="truncate max-w-xs md:max-w-md group-hover:text-[#1498CC] transition-colors">
                                {file.name}
                              </span>
                            </div>
                          </td>

                          {/* Category Type */}
                          <td className="py-2.5 px-3 text-slate-500 capitalize">
                            {file.category}
                          </td>

                          {/* Folder */}
                          <td className="py-2.5 px-3 text-slate-500 truncate max-w-[140px]">
                            {folderName || 'Root'}
                          </td>

                          {/* Size */}
                          <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                            {formatBytes(file.size)}
                          </td>

                          {/* Modified */}
                          <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                            {formatDate(file.updatedAt)}
                          </td>

                          {/* Owner */}
                          <td className="py-2.5 px-3 text-slate-500 truncate max-w-[120px]">
                            {file.ownerName}
                          </td>

                          {/* Actions */}
                          <td
                            onClick={(e) => e.stopPropagation()}
                            className="py-2.5 px-3 text-right"
                          >
                            <div className="flex items-center justify-end gap-1.5">
                              {mode === 'trash' ? (
                                <>
                                  <button
                                    onClick={() => restoreFile(file.id)}
                                    className="p-1 text-slate-400 hover:text-emerald-600 rounded"
                                    title="Restore"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => permanentDeleteFile(file.id)}
                                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                                    title="Delete Permanently"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => toggleFavorite(file.id)}
                                    className={`p-1 rounded ${
                                      file.isFavorite ? 'text-[#FFDF00]' : 'text-slate-300 hover:text-slate-600'
                                    }`}
                                  >
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                  </button>
                                  <button
                                    onClick={() => downloadFile(file)}
                                    className="p-1 text-slate-400 hover:text-slate-700 rounded"
                                    title="Download"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => deleteFile(file.id)}
                                    className="p-1 text-slate-400 hover:text-red-500 rounded"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
