import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Star, 
  Trash2, 
  Folder, 
  Tag as TagIcon, 
  CheckSquare, 
  Users, 
  Calendar, 
  FileText, 
  ExternalLink, 
  HardDrive, 
  Plus, 
  Edit3,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import { useWorkspace, formatBytes, formatDate } from '../../context/WorkspaceContext';
import { FileItem } from '../../types';

interface FilePreviewModalProps {
  file: FileItem;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, onClose }) => {
  const { 
    toggleFavorite, 
    deleteFile, 
    downloadFile, 
    updateFileTags, 
    renameFile, 
    folders, 
    tasks, 
    clients, 
    setActiveTab,
    setMovingItem,
    showToast 
  } = useWorkspace();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(file.name);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  const folder = folders.find((f) => f.id === file.folderId);
  const connectedTask = tasks.find((t) => t.id === file.relatedTaskId || t.attachmentIds.includes(file.id));
  const connectedClient = clients.find((c) => c.id === file.relatedClientId || c.relatedFileIds.includes(file.id));

  const handleSaveName = () => {
    if (editedName.trim() && editedName !== file.name) {
      renameFile(file.id, editedName.trim());
    }
    setIsEditingName(false);
  };

  const handleAddTag = () => {
    if (newTagInput.trim() && !file.tags.includes(newTagInput.trim())) {
      updateFileTags(file.id, [...file.tags, newTagInput.trim()]);
      setNewTagInput('');
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateFileTags(file.id, file.tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-[#0A2A43]/70 backdrop-blur-xs">
      <div 
        className="w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="h-14 px-5 bg-white border-b border-slate-200 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-sky-50 text-[#1498CC] border border-sky-100 shrink-0">
              {file.extension}
            </span>

            {isEditingName ? (
              <div className="flex items-center gap-1.5 min-w-0">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="px-2 py-1 border border-[#1498CC] rounded text-sm font-semibold text-slate-800 outline-none w-72"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="px-2 py-1 text-xs bg-[#1498CC] text-white rounded font-medium"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-0 group">
                <h3 className="text-sm md:text-base font-bold text-[#0A2A43] truncate">
                  {file.name}
                </h3>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Rename File"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => toggleFavorite(file.id)}
              className={`p-2 rounded-lg transition-colors ${
                file.isFavorite ? 'text-[#FFDF00] bg-amber-50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
              title={file.isFavorite ? 'Starred' : 'Add to Favorites'}
            >
              <Star className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={() => downloadFile(file)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={() => {
                deleteFile(file.id);
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Move to Trash"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="w-[1px] h-6 bg-slate-200 mx-1" />

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content: Left Viewer + Right Metadata Panel */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Main Document / Media Preview */}
          <div className="flex-1 bg-slate-100/80 p-4 md:p-6 overflow-y-auto flex flex-col items-center justify-center relative">
            {/* Zoom / Viewer controls if visual */}
            {(file.category === 'image' || file.category === 'pdf') && (
              <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-xs border border-slate-200 px-2 py-1 rounded-lg shadow-sm text-xs text-slate-600">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
                  className="p-1 hover:bg-slate-100 rounded"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] px-1">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(200, z + 25))}
                  className="p-1 hover:bg-slate-100 rounded"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Visual rendering based on file category */}
            {file.previewUrl ? (
              <div className="max-w-full max-h-full flex items-center justify-center p-2">
                <img
                  src={file.previewUrl}
                  alt={file.name}
                  referrerPolicy="no-referrer"
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
                  className="max-w-full max-h-[70vh] rounded-lg shadow-md object-contain transition-transform"
                />
              </div>
            ) : file.category === 'pdf' ? (
              /* Simulated High-Res PDF Document Viewer */
              <div 
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                className="w-full max-w-2xl bg-white rounded-lg shadow-lg border border-slate-200 p-8 text-slate-800 space-y-5 transition-transform"
              >
                {/* PDF Header with FCP Sunrise Watermark */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#0A2A43] tracking-tight">FCP SUNRISE TRAVEL & TOURS INC.</h2>
                    <p className="text-[11px] text-[#1498CC] font-semibold tracking-wider uppercase">Official Operations & Client Documentation</p>
                  </div>
                  <div className="text-right text-[11px] text-slate-400">
                    <p>Doc Ref: {file.name.replace('.pdf', '')}</p>
                    <p>DOT Accreditation: 2026-2028</p>
                  </div>
                </div>

                <div className="text-sm font-semibold text-slate-900 bg-sky-50/70 p-3 rounded border border-sky-100">
                  {file.name.replace(/_/g, ' ').replace('.pdf', '')}
                </div>

                {/* Formatted Content Preview */}
                <div className="space-y-3 text-xs leading-relaxed text-slate-700 whitespace-pre-line bg-slate-50 p-4 rounded-lg border border-slate-100 font-sans">
                  {file.contentPreview || `This official document is stored securely in FCP Sunrise S3 Vault.\n\nKey Parameters:\n• Destination: Asia / Europe Operations\n• Validity: 2026 Season\n• Lead Coordinator: ${file.ownerName}\n\nFor questions, contact operations@fcpsunrise.com.`}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Page 1 of 1</span>
                  <span>Digitally verified via FCP Sunrise S3 Vault</span>
                </div>
              </div>
            ) : file.category === 'spreadsheet' ? (
              /* Interactive Spreadsheet Grid View */
              <div className="w-full max-w-3xl bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-slate-800">Spreadsheet Workbook Preview</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">Formula Engine Active</span>
                </div>

                <div className="p-4 text-xs space-y-3">
                  <div className="p-3 bg-emerald-50/60 rounded border border-emerald-100 text-emerald-900 font-mono text-[11px] whitespace-pre-line">
                    {file.contentPreview || 'DATA SHEET: Travel Pricing & Manifest Breakdown\nColumns: Item | Description | Cost (PHP) | PAX | Total'}
                  </div>

                  <table className="w-full border-collapse border border-slate-200 text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 font-semibold text-slate-700">
                        <th className="border border-slate-200 p-2">Item Code</th>
                        <th className="border border-slate-200 p-2">Category Description</th>
                        <th className="border border-slate-200 p-2 text-right">Unit Rate (PHP)</th>
                        <th className="border border-slate-200 p-2 text-right">Allotment</th>
                        <th className="border border-slate-200 p-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="tabular-nums">
                      <tr>
                        <td className="border border-slate-200 p-2 font-mono text-slate-500">TRV-01</td>
                        <td className="border border-slate-200 p-2">International Airfare Segment</td>
                        <td className="border border-slate-200 p-2 text-right">24,500.00</td>
                        <td className="border border-slate-200 p-2 text-right">25 Pax</td>
                        <td className="border border-slate-200 p-2 text-right text-emerald-600 font-semibold">Confirmed</td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="border border-slate-200 p-2 font-mono text-slate-500">HTL-02</td>
                        <td className="border border-slate-200 p-2">Twin Sharing 4-Star Accommodations</td>
                        <td className="border border-slate-200 p-2 text-right">18,200.00</td>
                        <td className="border border-slate-200 p-2 text-right">13 Rooms</td>
                        <td className="border border-slate-200 p-2 text-right text-emerald-600 font-semibold">Reserved</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-200 p-2 font-mono text-slate-500">LND-03</td>
                        <td className="border border-slate-200 p-2">Coach Transfers & Guided Tours</td>
                        <td className="border border-slate-200 p-2 text-right">12,800.00</td>
                        <td className="border border-slate-200 p-2 text-right">Full Tour</td>
                        <td className="border border-slate-200 p-2 text-right text-sky-600 font-semibold">Locked</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Generic Clean Document View */
              <div className="w-full max-w-xl bg-white rounded-xl shadow-md border border-slate-200 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-sky-50 text-[#1498CC] flex items-center justify-center font-bold text-base uppercase">
                    {file.extension}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{file.name}</h4>
                    <p className="text-xs text-slate-500">{formatBytes(file.size)} · {file.mimeType}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {file.contentPreview || file.notes || 'Preview ready. File metadata synchronized with PostgreSQL and S3 object storage reference.'}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => downloadFile(file)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#1498CC] text-white rounded-lg text-xs font-semibold hover:bg-[#0f82b0] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Document
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Metadata & Connection Sidebar */}
          <div className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-l border-slate-200 p-5 overflow-y-auto space-y-5 text-xs text-slate-700">
            {/* File Info Card */}
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                File Details
              </h4>
              <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Size:</span>
                  <span className="font-mono text-slate-900">{formatBytes(file.size)}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Folder:</span>
                  <span className="text-slate-900 font-medium truncate max-w-[140px]">
                    {folder?.name || 'Root'}
                  </span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Owner:</span>
                  <span className="text-slate-900 font-medium">{file.ownerName}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Last Modified:</span>
                  <span className="text-slate-900">{formatDate(file.updatedAt)}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Version:</span>
                  <span className="font-mono text-slate-900">v{file.version}.0</span>
                </div>
              </div>
            </div>

            {/* Storage Architecture Reference */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                <HardDrive className="w-3.5 h-3.5 text-[#1498CC]" />
                <span>Object Storage Key</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200 font-mono text-[10px] text-slate-600 break-all select-all">
                {file.storageRef}
              </div>
            </div>

            {/* Tags Section */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                <div className="flex items-center gap-1.5">
                  <TagIcon className="w-3.5 h-3.5 text-[#1498CC]" />
                  <span>Tags</span>
                </div>
                <button
                  onClick={() => setIsAddingTag(true)}
                  className="text-[#1498CC] hover:underline font-semibold"
                >
                  + Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {file.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 group"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-slate-400 hover:text-red-500 rounded-full"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>

              {isAddingTag && (
                <div className="mt-2 flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="New tag..."
                    className="flex-1 px-2 py-1 border border-slate-200 rounded text-xs outline-none focus:border-[#1498CC]"
                    autoFocus
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-2 py-1 bg-[#1498CC] text-white rounded text-xs font-semibold"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setIsAddingTag(false)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Related Tasks (File + Task Connection) */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
                <span>Connected Tasks</span>
              </div>

              {connectedTask ? (
                <div
                  onClick={() => {
                    setActiveTab('tasks');
                    onClose();
                  }}
                  className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-50 cursor-pointer transition-colors"
                >
                  <p className="font-semibold text-slate-900 truncate">{connectedTask.title}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>{connectedTask.project}</span>
                    <span className="font-medium text-amber-700 capitalize">{connectedTask.status.replace('_', ' ')}</span>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">No tasks currently linked to this file.</p>
              )}
            </div>

            {/* Related Clients (File + Client Connection) */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span>Connected Client</span>
              </div>

              {connectedClient ? (
                <div
                  onClick={() => {
                    setActiveTab('clients');
                    onClose();
                  }}
                  className="p-2.5 rounded-lg border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 cursor-pointer transition-colors"
                >
                  <p className="font-semibold text-slate-900 truncate">{connectedClient.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{connectedClient.destination}</p>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">No client profile linked to this document.</p>
              )}
            </div>

            {/* Move File Action */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setMovingItem({ type: 'file', id: file.id, name: file.name });
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
              >
                <Folder className="w-3.5 h-3.5" />
                <span>Move to Another Folder</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
