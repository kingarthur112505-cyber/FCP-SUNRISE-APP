import React, { useState } from 'react';
import { 
  Plus, 
  CheckSquare, 
  Calendar, 
  Paperclip, 
  Clock, 
  Filter, 
  Kanban, 
  List as ListIcon, 
  Search, 
  AlertCircle,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';
import { useWorkspace, formatDate } from '../../context/WorkspaceContext';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { TaskDetailModal } from './TaskDetailModal';

export const TasksView: React.FC = () => {
  const { tasks, addTask, updateTask, currentUser, teamMembers } = useWorkspace();

  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isQuickAdding, setIsQuickAdding] = useState(false);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskProject, setNewTaskProject] = useState('Marketing Campaigns');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('normal');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-09-30');
  const [newTaskAssignee, setNewTaskAssignee] = useState(currentUser.name);

  // Unique projects list
  const projects = Array.from(new Set(tasks.map((t) => t.project)));

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (selectedProject !== 'all' && t.project !== selectedProject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchProject = t.project.toLowerCase().includes(q);
      const matchAssignee = t.assignee.toLowerCase().includes(q);
      return matchTitle || matchProject || matchAssignee;
    }
    return true;
  });

  const columns: { id: TaskStatus; title: string; color: string }[] = [
    { id: 'todo', title: 'To Do', color: 'border-t-slate-400' },
    { id: 'in_progress', title: 'In Progress', color: 'border-t-[#1498CC]' },
    { id: 'review', title: 'Review', color: 'border-t-amber-500' },
    { id: 'completed', title: 'Completed', color: 'border-t-emerald-500' },
  ];

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const assignedUser = teamMembers.find((m) => m.name === newTaskAssignee) || currentUser;

    addTask({
      title: newTaskTitle.trim(),
      project: newTaskProject.trim() || 'General Operations',
      status: 'todo',
      priority: newTaskPriority,
      dueDate: newTaskDueDate,
      assignee: assignedUser.name,
      assigneeRole: assignedUser.department,
      assigneeAvatar: assignedUser.avatarUrl,
      notes: '',
      checklist: [
        { id: `chk-${Date.now()}-1`, text: 'Initial scoping and documentation', completed: false },
        { id: `chk-${Date.now()}-2`, text: 'Execution and stakeholder review', completed: false },
      ],
      attachmentIds: [],
    });

    setNewTaskTitle('');
    setIsQuickAdding(false);
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return <span className="text-[10px] font-bold uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">Urgent</span>;
      case 'high':
        return <span className="text-[10px] font-bold uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">High</span>;
      case 'normal':
        return <span className="text-[10px] font-medium uppercase text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">Normal</span>;
      case 'low':
        return <span className="text-[10px] font-medium uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Low</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
      {/* Top Action Bar */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base md:text-lg font-bold text-[#0A2A43]">Task Operations</h2>
          <p className="text-xs text-slate-500">Track tour preparations, visa applications, and marketing pipelines</p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Project Filter */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-[#1498CC]"
          >
            <option value="all">All Projects</option>
            {projects.map((proj) => (
              <option key={proj} value={proj}>
                {proj}
              </option>
            ))}
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#1498CC] w-36 sm:w-48"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'board' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500'
              }`}
              title="Board View"
            >
              <Kanban className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500'
              }`}
              title="List View"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setIsQuickAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1498CC] hover:bg-[#0f82b0] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Quick Add Task Modal / Bar */}
      {isQuickAdding && (
        <div className="bg-sky-50/70 border-b border-sky-100 px-4 md:px-6 py-3">
          <form onSubmit={handleCreateTask} className="flex flex-wrap items-center gap-2 text-xs">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task name (e.g. Confirm Tour Bus Allotment for Osaka)..."
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 flex-1 min-w-[200px] outline-none focus:border-[#1498CC]"
              autoFocus
            />

            <select
              value={newTaskProject}
              onChange={(e) => setNewTaskProject(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 outline-none"
            >
              <option value="Marketing Campaigns">Marketing Campaigns</option>
              <option value="Visa Processing">Visa Processing</option>
              <option value="Corporate Bookings">Corporate Bookings</option>
              <option value="Tour Operations">Tour Operations</option>
            </select>

            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 outline-none"
            >
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
              <option value="low">Low</option>
            </select>

            <input
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 outline-none font-mono"
            />

            <button
              type="submit"
              className="px-4 py-1.5 bg-[#1498CC] text-white rounded-lg font-semibold hover:bg-[#0f82b0]"
            >
              Add Task
            </button>
            <button
              type="button"
              onClick={() => setIsQuickAdding(false)}
              className="px-2.5 py-1.5 text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Main View Area */}
      <div className="flex-1 p-4 md:p-6 overflow-x-auto overflow-y-auto">
        {viewMode === 'board' ? (
          /* KANBAN BOARD */
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 min-w-[800px] h-full items-start">
            {columns.map((col) => {
              const colTasks = filteredTasks.filter((t) => t.status === col.id);

              return (
                <div
                  key={col.id}
                  className="bg-slate-100/70 rounded-xl p-3 border border-slate-200 flex flex-col max-h-full"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{col.title}</span>
                      <span className="text-[11px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded-full border border-slate-200">
                        {colTasks.length}
                      </span>
                    </div>
                  </div>

                  {/* Task Cards Column */}
                  <div className="space-y-2.5 overflow-y-auto pr-0.5">
                    {colTasks.map((task) => {
                      const completedCount = task.checklist.filter((c) => c.completed).length;

                      return (
                        <div
                          key={task.id}
                          onClick={() => setEditingTask(task)}
                          className="bg-white rounded-xl p-3.5 border border-slate-200 hover:border-[#1498CC] shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
                        >
                          {/* Project Tag & Priority */}
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <span className="text-[10px] font-bold text-[#1498CC] uppercase tracking-wider truncate max-w-[140px]">
                              {task.project}
                            </span>
                            {getPriorityBadge(task.priority)}
                          </div>

                          {/* Title */}
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#1498CC] transition-colors leading-snug line-clamp-2 mb-2">
                            {task.title}
                          </h4>

                          {/* Checklist preview */}
                          {task.checklist.length > 0 && (
                            <div className="mb-2.5 bg-slate-50 p-2 rounded-lg border border-slate-100 text-[11px] text-slate-600">
                              <div className="flex items-center justify-between mb-1">
                                <span className="flex items-center gap-1 font-medium">
                                  <CheckSquare className="w-3 h-3 text-[#1498CC]" />
                                  Checklist
                                </span>
                                <span className="font-mono text-[10px] text-slate-400">
                                  {completedCount}/{task.checklist.length}
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                <div
                                  className="bg-[#1498CC] h-full"
                                  style={{
                                    width: `${(completedCount / task.checklist.length) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Card Footer: Due Date, Attachments, Assignee */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1 font-mono text-[10px]">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {formatDate(task.dueDate)}
                              </span>
                              {task.attachmentIds.length > 0 && (
                                <span className="flex items-center gap-0.5 text-slate-400" title={`${task.attachmentIds.length} attachments`}>
                                  <Paperclip className="w-3 h-3" />
                                  <span className="font-mono text-[10px]">{task.attachmentIds.length}</span>
                                </span>
                              )}
                            </div>

                            <img
                              src={task.assigneeAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=FcpUser'}
                              alt={task.assignee}
                              referrerPolicy="no-referrer"
                              className="w-5 h-5 rounded-full object-cover border border-slate-200"
                              title={`Assigned to ${task.assignee}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                  <th className="py-2.5 px-4">Task Name</th>
                  <th className="py-2.5 px-3">Project</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Checklist</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Assignee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((task) => {
                  const completedCount = task.checklist.filter((c) => c.completed).length;

                  return (
                    <tr
                      key={task.id}
                      onClick={() => setEditingTask(task)}
                      className="hover:bg-slate-50/80 cursor-pointer group transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 group-hover:text-[#1498CC]">
                        {task.title}
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-medium">
                        {task.project}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {task.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {getPriorityBadge(task.priority)}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {completedCount}/{task.checklist.length}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                        {formatDate(task.dueDate)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <img
                            src={task.assigneeAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=FcpUser'}
                            alt={task.assignee}
                            referrerPolicy="no-referrer"
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="truncate max-w-[120px] text-slate-700">{task.assignee}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Task Details Modal */}
      {editingTask && (
        <TaskDetailModal task={editingTask} onClose={() => setEditingTask(null)} />
      )}
    </div>
  );
};
