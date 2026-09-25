import React, { useState } from 'react';
import { 
  X, 
  CheckSquare, 
  Calendar, 
  Clock, 
  Paperclip, 
  Plus, 
  Trash2, 
  FileText, 
  ExternalLink,
  Users
} from 'lucide-react';
import { useWorkspace, formatDate } from '../../context/WorkspaceContext';
import { Task, TaskPriority, TaskStatus } from '../../types';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
  const { 
    updateTask, 
    deleteTask, 
    toggleChecklistItem, 
    files, 
    clients, 
    setPreviewingFile,
    showToast 
  } = useWorkspace();

  const [title, setTitle] = useState(task.title);
  const [project, setProject] = useState(task.project);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate);
  const [notes, setNotes] = useState(task.notes);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [isAttachingFile, setIsAttachingFile] = useState(false);

  const attachedFiles = files.filter((f) => !f.isTrash && task.attachmentIds.includes(f.id));
  const availableFiles = files.filter((f) => !f.isTrash && !task.attachmentIds.includes(f.id));
  const relatedClient = clients.find((c) => c.id === task.relatedClientId);

  const completedCount = task.checklist.filter((c) => c.completed).length;
  const progressPercent = task.checklist.length > 0 ? Math.round((completedCount / task.checklist.length) * 100) : 0;

  const handleSave = () => {
    updateTask({
      ...task,
      title: title.trim() || task.title,
      project: project.trim() || task.project,
      status,
      priority,
      dueDate,
      notes,
    });
    onClose();
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    const newItem = {
      id: `chk-${Date.now()}`,
      text: newChecklistText.trim(),
      completed: false,
    };
    updateTask({
      ...task,
      checklist: [...task.checklist, newItem],
    });
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (chkId: string) => {
    updateTask({
      ...task,
      checklist: task.checklist.filter((c) => c.id !== chkId),
    });
  };

  const handleAttachFile = (fileId: string) => {
    updateTask({
      ...task,
      attachmentIds: [...task.attachmentIds, fileId],
    });
    setIsAttachingFile(false);
    showToast('File attached to task');
  };

  const handleDetachFile = (fileId: string) => {
    updateTask({
      ...task,
      attachmentIds: task.attachmentIds.filter((id) => id !== fileId),
    });
    showToast('File detached');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-[#0A2A43]/70 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold text-[#1498CC] tracking-wider">
              {task.project}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                deleteTask(task.id);
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-700">
          {/* Title & Project inputs */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-base md:text-lg font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-[#1498CC] outline-none pb-1"
            />
          </div>

          {/* Task Status & Priority Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-white border border-slate-200 rounded-md p-1.5 font-medium text-slate-800 outline-none focus:border-[#1498CC]"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-white border border-slate-200 rounded-md p-1.5 font-medium text-slate-800 outline-none focus:border-[#1498CC]"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-md p-1.5 font-mono text-slate-800 outline-none focus:border-[#1498CC]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Assignee</label>
              <div className="flex items-center gap-1.5 p-1.5 bg-white border border-slate-200 rounded-md">
                <img
                  src={task.assigneeAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=FcpUser'}
                  alt={task.assignee}
                  referrerPolicy="no-referrer"
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span className="truncate font-medium text-slate-800">{task.assignee}</span>
              </div>
            </div>
          </div>

          {/* Interactive Checklist (ClickUp style) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#1498CC]" />
                <span className="font-bold text-slate-900">Checklist</span>
                <span className="font-mono text-slate-400 text-[11px]">
                  ({completedCount}/{task.checklist.length})
                </span>
              </div>
              <span className="font-mono text-slate-500 font-semibold">{progressPercent}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#1498CC] h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Checklist items */}
            <div className="space-y-1 pt-1">
              {task.checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 border border-slate-100 group transition-colors"
                >
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleChecklistItem(task.id, item.id)}
                      className="w-4 h-4 rounded border-slate-300 text-[#1498CC] focus:ring-[#1498CC] cursor-pointer"
                    />
                    <span
                      className={`text-xs ${
                        item.completed ? 'line-through text-slate-400' : 'text-slate-800 font-medium'
                      }`}
                    >
                      {item.text}
                    </span>
                  </label>
                  <button
                    onClick={() => handleRemoveChecklistItem(item.id)}
                    className="p-1 text-slate-300 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add checklist item */}
            <form onSubmit={handleAddChecklistItem} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                placeholder="Add checklist item..."
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:border-[#1498CC]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
              >
                + Add Step
              </button>
            </form>
          </div>

          {/* Notes / Description */}
          <div>
            <label className="block font-bold text-slate-900 mb-1.5">Task Description / Instructions</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add details, flight numbers, or client specifications..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:border-[#1498CC] resize-none"
            />
          </div>

          {/* Attached Files from Workspace (ClickUp + Drive connection) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-[#1498CC]" />
                <span className="font-bold text-slate-900">Attached Workspace Documents</span>
                <span className="font-mono text-slate-400 text-[11px]">({attachedFiles.length})</span>
              </div>
              <button
                onClick={() => setIsAttachingFile(!isAttachingFile)}
                className="text-xs text-[#1498CC] font-semibold hover:underline"
              >
                {isAttachingFile ? 'Cancel' : '+ Attach File from Vault'}
              </button>
            </div>

            {/* File attachment selector dropdown */}
            {isAttachingFile && (
              <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl space-y-2">
                <span className="font-semibold text-slate-800 text-[11px]">Select file from workspace vault:</span>
                <div className="max-h-36 overflow-y-auto space-y-1">
                  {availableFiles.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => handleAttachFile(f.id)}
                      className="flex items-center justify-between p-2 bg-white rounded-md border border-slate-200 hover:border-[#1498CC] cursor-pointer text-xs group"
                    >
                      <span className="truncate font-medium text-slate-800 group-hover:text-[#1498CC]">
                        {f.name}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {f.extension}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* List of currently attached files */}
            {attachedFiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {attachedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs group"
                  >
                    <div
                      onClick={() => {
                        setPreviewingFile(file);
                        onClose();
                      }}
                      className="flex items-center gap-2 min-w-0 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-[#1498CC] shrink-0" />
                      <span className="truncate font-medium text-slate-800 group-hover:text-[#1498CC]">
                        {file.name}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDetachFile(file.id)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded"
                      title="Detach"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic text-[11px]">No files attached to this task yet.</p>
            )}
          </div>

          {/* Related Client Record */}
          {relatedClient && (
            <div className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-indigo-600" />
                <div>
                  <span className="text-[11px] font-bold text-indigo-900 uppercase">Linked Client:</span>
                  <p className="font-semibold text-slate-900">{relatedClient.name}</p>
                </div>
              </div>
              <span className="text-xs text-indigo-700 font-medium">{relatedClient.destination}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#1498CC] hover:bg-[#0f82b0] text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
