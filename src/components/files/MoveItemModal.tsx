import React, { useState } from 'react';
import { X, Folder, ArrowRight, Check } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const MoveItemModal: React.FC = () => {
  const { 
    movingItem, 
    setMovingItem, 
    folders, 
    moveFile, 
    moveFolder 
  } = useWorkspace();

  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);

  if (!movingItem) return null;

  const handleConfirmMove = () => {
    if (movingItem.type === 'file') {
      moveFile(movingItem.id, targetFolderId || folders[0]?.id || 'fld-mkt');
    } else {
      moveFolder(movingItem.id, targetFolderId);
    }
    setMovingItem(null);
  };

  // Filter out the folder itself and its descendants if moving a folder
  const availableFolders = folders.filter((f) => {
    if (movingItem.type === 'folder' && f.id === movingItem.id) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A2A43]/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0A2A43]">Move {movingItem.type}</h3>
            <p className="text-xs text-slate-500 truncate max-w-xs mt-0.5">
              Moving &ldquo;{movingItem.name}&rdquo;
            </p>
          </div>
          <button
            onClick={() => setMovingItem(null)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-72 overflow-y-auto space-y-1">
          {movingItem.type === 'folder' && (
            <div
              onClick={() => setTargetFolderId(null)}
              className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                targetFolderId === null
                  ? 'border-[#1498CC] bg-sky-50 font-semibold text-[#1498CC]'
                  : 'border-slate-100 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Folder className="w-4 h-4 shrink-0 text-[#1498CC]" />
              <span className="text-xs">FCP SUNRISE (Root Directory)</span>
            </div>
          )}

          {availableFolders.map((f) => (
            <div
              key={f.id}
              onClick={() => setTargetFolderId(f.id)}
              className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                targetFolderId === f.id
                  ? 'border-[#1498CC] bg-sky-50 font-semibold text-[#1498CC]'
                  : 'border-slate-100 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Folder className="w-4 h-4 shrink-0 text-[#1498CC]" />
              <span className="text-xs truncate">
                {f.parentId ? '  ↳ ' : ''}{f.name}
              </span>
            </div>
          ))}
        </div>

        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            onClick={() => setMovingItem(null)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmMove}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1498CC] text-white rounded-lg text-xs font-semibold hover:bg-[#0f82b0] transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Move Here</span>
          </button>
        </div>
      </div>
    </div>
  );
};
