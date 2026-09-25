import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Check, 
  Folder, 
  AlertCircle,
  HardDrive
} from 'lucide-react';
import { useWorkspace, formatBytes } from '../../context/WorkspaceContext';

export const FileUploadModal: React.FC = () => {
  const { 
    isUploadModalOpen, 
    setIsUploadModalOpen, 
    folders, 
    currentFolderId, 
    uploadFiles 
  } = useWorkspace();

  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    currentFolderId || 'fld-mkt'
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isUploadModalOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    try {
      await uploadFiles(selectedFiles, selectedFolderId);
      setSelectedFiles([]);
      setIsUploadModalOpen(false);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A2A43]/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#1498CC] flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0A2A43]">Upload to Vault</h3>
              <p className="text-xs text-slate-500">Add documents, media, or archives to S3 object storage</p>
            </div>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Target Folder Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Destination Folder:
            </label>
            <div className="relative">
              <select
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs md:text-sm text-slate-800 outline-none focus:border-[#1498CC]"
              >
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.parentId ? '  ↳ ' : ''}{f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#1498CC] bg-sky-50/60 scale-[0.99]'
                : 'border-slate-300 hover:border-[#1498CC] hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.gif,.mp4,.mov,.zip,.txt"
            />
            <div className="w-12 h-12 mx-auto rounded-full bg-sky-50 text-[#1498CC] flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Drag & drop files here, or <span className="text-[#1498CC]">browse files</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports PDF, Word, Excel, CSV, PowerPoint, Images, Video, ZIP & text files
            </p>
          </div>

          {/* Selected Files Queue */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-1">
                <span>Selected Files ({selectedFiles.length})</span>
                <button
                  onClick={() => setSelectedFiles([])}
                  className="text-xs text-red-500 hover:underline"
                >
                  Clear all
                </button>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-[#1498CC] shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 truncate">{file.name}</p>
                        <span className="text-[11px] text-slate-400">{formatBytes(file.size)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(idx)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* S3 Object Architecture Badge */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#1498CC]" />
              <span>Storage Provider: Scalable S3 Object Vault</span>
            </div>
            <span className="font-mono text-[11px] text-[#0A2A43] font-semibold">Active</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            onClick={() => setIsUploadModalOpen(false)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUploadSubmit}
            disabled={selectedFiles.length === 0 || isUploading}
            className={`flex items-center gap-1.5 px-4 py-2 bg-[#1498CC] text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-[#0f82b0] transition-all ${
              selectedFiles.length === 0 || isUploading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'
            }`}
          >
            {isUploading ? (
              <span>Uploading to S3...</span>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
