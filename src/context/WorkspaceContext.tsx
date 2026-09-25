import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  Folder, 
  FileItem, 
  Task, 
  Client, 
  CalendarEvent, 
  ActiveNavTab,
  FileCategory 
} from '../types';
import { 
  CURRENT_USER, 
  TEAM_MEMBERS, 
  INITIAL_FOLDERS, 
  INITIAL_FILES, 
  INITIAL_TASKS, 
  INITIAL_CLIENTS, 
  INITIAL_CALENDAR_EVENTS 
} from '../data/mockData';

interface WorkspaceContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  teamMembers: User[];
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  
  // Folder state & actions
  folders: Folder[];
  currentFolderId: string | null;
  setCurrentFolderId: (id: string | null) => void;
  createFolder: (name: string, parentId: string | null) => Folder;
  renameFolder: (id: string, newName: string) => void;
  deleteFolder: (id: string) => void;
  moveFolder: (id: string, newParentId: string | null) => void;
  getFolderPath: (folderId: string | null) => Folder[];
  
  // File state & actions
  files: FileItem[];
  uploadFiles: (filesList: FileList | File[], targetFolderId?: string | null) => Promise<void>;
  renameFile: (id: string, newName: string) => void;
  deleteFile: (id: string) => void; // moves to trash
  restoreFile: (id: string) => void; // restores from trash
  permanentDeleteFile: (id: string) => void;
  emptyTrash: () => void;
  moveFile: (id: string, newFolderId: string) => void;
  toggleFavorite: (id: string) => void;
  updateFileTags: (id: string, tags: string[]) => void;
  downloadFile: (file: FileItem) => void;
  
  // Modals & previews
  previewingFile: FileItem | null;
  setPreviewingFile: (file: FileItem | null) => void;
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;
  movingItem: { type: 'file' | 'folder'; id: string; name: string } | null;
  setMovingItem: (item: { type: 'file' | 'folder'; id: string; name: string } | null) => void;
  
  // Task actions
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleChecklistItem: (taskId: string, checklistId: string) => void;
  
  // Client actions
  clients: Client[];
  addClient: (client: Omit<Client, 'id'>) => Client;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  
  // Calendar actions
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  
  // Storage stats
  totalStorageBytes: number;
  totalActiveFilesCount: number;
  totalTrashCount: number;
  totalFavoritesCount: number;
  
  // Notification toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
  
  // Reset demo data
  resetAllData: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const STORAGE_PREFIX = 'fcp_sunrise_ws_';

const safeGetItem = (key: string): string | null => {
  try {
    return typeof window !== 'undefined' && window.localStorage ? localStorage.getItem(key) : null;
  } catch (e) {
    return null;
  }
};

const safeSetItem = (key: string, value: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  } catch (e) {
    // If quota exceeded or security restriction in iframe, handle gracefully
    try {
      if (key.includes('files')) {
        // Fallback: clear stale files cache
        localStorage.removeItem(key);
      }
    } catch {}
  }
};

function categorizeFile(filename: string, mime: string): { category: FileCategory; ext: string } {
  const parts = filename.split('.');
  const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : '';

  if (['pdf'].includes(ext) || mime.includes('pdf')) return { category: 'pdf', ext };
  if (['doc', 'docx', 'odt', 'rtf'].includes(ext) || mime.includes('word')) return { category: 'doc', ext };
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext) || mime.includes('spreadsheet') || mime.includes('csv')) return { category: 'spreadsheet', ext };
  if (['ppt', 'pptx'].includes(ext) || mime.includes('presentation')) return { category: 'presentation', ext };
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif'].includes(ext) || mime.startsWith('image/')) return { category: 'image', ext };
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext) || mime.startsWith('video/')) return { category: 'video', ext };
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || mime.includes('zip')) return { category: 'archive', ext };
  if (['txt', 'md', 'json', 'log'].includes(ext) || mime.startsWith('text/')) return { category: 'text', ext };
  
  return { category: 'other', ext: ext || 'file' };
}

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from localStorage if available, or fallback to mock
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = safeGetItem(`${STORAGE_PREFIX}user`);
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u.name === 'Maria Santos' || u.email?.includes('maria.santos')) {
          return CURRENT_USER;
        }
        return u;
      } catch {
        return CURRENT_USER;
      }
    }
    return CURRENT_USER;
  });

  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const [folders, setFolders] = useState<Folder[]>(() => {
    const saved = safeGetItem(`${STORAGE_PREFIX}folders`);
    return saved ? JSON.parse(saved) : INITIAL_FOLDERS;
  });

  const [files, setFiles] = useState<FileItem[]>(() => {
    const saved = safeGetItem(`${STORAGE_PREFIX}files`);
    if (saved) {
      try {
        const parsed: FileItem[] = JSON.parse(saved);
        if (!parsed.some(f => f.id === 'fil-fcp-official-logo')) {
          const logoFile = INITIAL_FILES.find(f => f.id === 'fil-fcp-official-logo');
          if (logoFile) return [logoFile, ...parsed];
        }
        return parsed;
      } catch {
        return INITIAL_FILES;
      }
    }
    return INITIAL_FILES;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = safeGetItem(`${STORAGE_PREFIX}tasks`);
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = safeGetItem(`${STORAGE_PREFIX}clients`);
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = safeGetItem(`${STORAGE_PREFIX}events`);
    return saved ? JSON.parse(saved) : INITIAL_CALENDAR_EVENTS;
  });

  // UI state
  const [previewingFile, setPreviewingFile] = useState<FileItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [movingItem, setMovingItem] = useState<{ type: 'file' | 'folder'; id: string; name: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  // Sync to localStorage safely
  useEffect(() => {
    safeSetItem(`${STORAGE_PREFIX}user`, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    safeSetItem(`${STORAGE_PREFIX}folders`, JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    // Strip large base64 data URLs before storing to prevent QuotaExceededError
    const compactFiles = files.map((f) => {
      if (f.previewUrl && f.previewUrl.startsWith('data:image')) {
        // keep previewUrl in memory but omit from localStorage payload
        const { previewUrl, ...rest } = f;
        return rest;
      }
      return f;
    });
    safeSetItem(`${STORAGE_PREFIX}files`, JSON.stringify(compactFiles));
  }, [files]);

  useEffect(() => {
    safeSetItem(`${STORAGE_PREFIX}tasks`, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    safeSetItem(`${STORAGE_PREFIX}clients`, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    safeSetItem(`${STORAGE_PREFIX}events`, JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  // Compute folder path breadcrumbs
  const getFolderPath = (folderId: string | null): Folder[] => {
    if (!folderId) return [];
    const path: Folder[] = [];
    let curr: Folder | undefined = folders.find((f) => f.id === folderId);
    while (curr) {
      path.unshift(curr);
      if (!curr.parentId) break;
      curr = folders.find((f) => f.id === curr!.parentId);
    }
    return path;
  };

  // Folder CRUD
  const createFolder = (name: string, parentId: string | null): Folder => {
    const newFolder: Folder = {
      id: `fld-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim() || 'New Folder',
      parentId: parentId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser.name,
    };
    setFolders((prev) => [...prev, newFolder]);
    showToast(`Folder "${newFolder.name}" created`);
    return newFolder;
  };

  const renameFolder = (id: string, newName: string) => {
    const clean = newName.trim();
    if (!clean) return;
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name: clean, updatedAt: new Date().toISOString() } : f))
    );
    showToast(`Folder renamed to "${clean}"`);
  };

  const deleteFolder = (id: string) => {
    // recursively get all subfolder IDs
    const getAllSubfolderIds = (parentId: string): string[] => {
      const subs = folders.filter((f) => f.parentId === parentId);
      let ids = subs.map((s) => s.id);
      for (const sub of subs) {
        ids = [...ids, ...getAllSubfolderIds(sub.id)];
      }
      return ids;
    };

    const targetFolder = folders.find((f) => f.id === id);
    const toDeleteIds = [id, ...getAllSubfolderIds(id)];

    // Move associated files to trash
    setFiles((prev) =>
      prev.map((file) =>
        toDeleteIds.includes(file.folderId)
          ? { ...file, isTrash: true, deletedAt: new Date().toISOString() }
          : file
      )
    );

    setFolders((prev) => prev.filter((f) => !toDeleteIds.includes(f.id)));
    if (currentFolderId && toDeleteIds.includes(currentFolderId)) {
      setCurrentFolderId(targetFolder?.parentId || null);
    }
    showToast(`Folder "${targetFolder?.name || 'Folder'}" deleted and files moved to Trash`);
  };

  const moveFolder = (id: string, newParentId: string | null) => {
    if (id === newParentId) return;
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, parentId: newParentId, updatedAt: new Date().toISOString() } : f))
    );
    showToast(`Folder moved`);
  };

  // File Upload with real browser FileReader
  const uploadFiles = async (filesList: FileList | File[], targetFolderId?: string | null) => {
    const folderToUse = targetFolderId !== undefined ? targetFolderId : (currentFolderId || 'fld-mkt');
    const filesArray = Array.from(filesList);

    const newFiles: FileItem[] = [];

    for (const rawFile of filesArray) {
      const { category, ext } = categorizeFile(rawFile.name, rawFile.type);
      
      let previewUrl: string | undefined = undefined;
      let contentPreview: string | undefined = undefined;

      // Handle image or text reading for instant rich preview
      if (rawFile.type.startsWith('image/')) {
        previewUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(rawFile);
        });
      } else if (rawFile.type.startsWith('text/') || ext === 'csv' || ext === 'md' || ext === 'json') {
        contentPreview = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve((e.target?.result as string).slice(0, 1500));
          reader.readAsText(rawFile);
        });
      }

      const cleanFolder = folders.find((f) => f.id === folderToUse);
      const folderSlug = cleanFolder ? cleanFolder.name.toLowerCase().replace(/\s+/g, '-') : 'general';
      const fileSlug = rawFile.name.replace(/\s+/g, '_');

      const fileItem: FileItem = {
        id: `fil-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: rawFile.name,
        extension: ext,
        category,
        folderId: folderToUse || 'fld-mkt',
        size: rawFile.size,
        mimeType: rawFile.type || 'application/octet-stream',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentUser.name,
        ownerName: currentUser.name,
        isFavorite: false,
        isTrash: false,
        tags: [category.toUpperCase(), cleanFolder?.name || 'Workspace'],
        storageRef: `s3://fcp-sunrise-vault/${folderSlug}/${fileSlug}`,
        previewUrl,
        contentPreview,
        version: 1,
      };

      newFiles.push(fileItem);
    }

    setFiles((prev) => [...newFiles, ...prev]);
    showToast(`Uploaded ${newFiles.length} file${newFiles.length > 1 ? 's' : ''} to ${folders.find(f => f.id === folderToUse)?.name || 'workspace'}`);
  };

  const renameFile = (id: string, newName: string) => {
    const clean = newName.trim();
    if (!clean) return;
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name: clean, updatedAt: new Date().toISOString() } : f))
    );
    showToast(`File renamed to "${clean}"`);
  };

  const deleteFile = (id: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isTrash: true, deletedAt: new Date().toISOString() } : f))
    );
    showToast('File moved to Trash');
  };

  const restoreFile = (id: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isTrash: false, deletedAt: undefined } : f))
    );
    showToast('File restored to workspace');
  };

  const permanentDeleteFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    showToast('File permanently deleted');
  };

  const emptyTrash = () => {
    const trashCount = files.filter((f) => f.isTrash).length;
    setFiles((prev) => prev.filter((f) => !f.isTrash));
    showToast(`Emptied ${trashCount} item${trashCount > 1 ? 's' : ''} from Trash`);
  };

  const moveFile = (id: string, newFolderId: string) => {
    const targetFolder = folders.find((f) => f.id === newFolderId);
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, folderId: newFolderId, updatedAt: new Date().toISOString() } : f))
    );
    showToast(`File moved to "${targetFolder?.name || 'Folder'}"`);
  };

  const toggleFavorite = (id: string) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const next = !f.isFavorite;
          showToast(next ? 'Added to Favorites' : 'Removed from Favorites');
          return { ...f, isFavorite: next };
        }
        return f;
      })
    );
  };

  const updateFileTags = (id: string, tags: string[]) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, tags, updatedAt: new Date().toISOString() } : f))
    );
    showToast('Tags updated');
  };

  const downloadFile = (file: FileItem) => {
    // If previewUrl is a data URL or image, trigger direct download
    if (file.previewUrl && file.previewUrl.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = file.previewUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`Downloading ${file.name}`);
      return;
    }

    // For other documents/simulated assets, generate a text/blob payload with the file details
    const sampleContent = file.contentPreview || `FCP SUNRISE TRAVEL & TOURS INC.
File Reference: ${file.name}
Storage Key: ${file.storageRef}
Owner: ${file.ownerName}
Version: v${file.version}
Timestamp: ${file.updatedAt}
--------------------------------------------------
${file.notes || 'Official FCP Sunrise Workspace Document'}`;

    const blob = new Blob([sampleContent], { type: file.mimeType || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloading ${file.name}`);
  };

  // Task actions
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>): Task => {
    const newTask: Task = {
      ...taskData,
      id: `tsk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    showToast(`Task "${newTask.title}" created`);
    return newTask;
  };

  const updateTask = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    showToast('Task updated');
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    showToast('Task deleted');
  };

  const toggleChecklistItem = (taskId: string, checklistId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedList = t.checklist.map((c) =>
            c.id === checklistId ? { ...c, completed: !c.completed } : c
          );
          return { ...t, checklist: updatedList };
        }
        return t;
      })
    );
  };

  // Client actions
  const addClient = (clientData: Omit<Client, 'id'>): Client => {
    const newClient: Client = {
      ...clientData,
      id: `cli-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setClients((prev) => [newClient, ...prev]);
    showToast(`Client "${newClient.name}" added`);
    return newClient;
  };

  const updateClient = (updated: Client) => {
    setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    showToast('Client record updated');
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    showToast('Client record removed');
  };

  // Calendar
  const addCalendarEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEv: CalendarEvent = {
      ...eventData,
      id: `ev-${Date.now()}`,
    };
    setCalendarEvents((prev) => [...prev, newEv]);
    showToast(`Event added to calendar`);
  };

  // Reset to default
  const resetAllData = () => {
    localStorage.removeItem(`${STORAGE_PREFIX}user`);
    localStorage.removeItem(`${STORAGE_PREFIX}folders`);
    localStorage.removeItem(`${STORAGE_PREFIX}files`);
    localStorage.removeItem(`${STORAGE_PREFIX}tasks`);
    localStorage.removeItem(`${STORAGE_PREFIX}clients`);
    localStorage.removeItem(`${STORAGE_PREFIX}events`);

    setCurrentUser(CURRENT_USER);
    setFolders(INITIAL_FOLDERS);
    setFiles(INITIAL_FILES);
    setTasks(INITIAL_TASKS);
    setClients(INITIAL_CLIENTS);
    setCalendarEvents(INITIAL_CALENDAR_EVENTS);
    setCurrentFolderId(null);
    showToast('Workspace reset to default sample data');
  };

  const activeFiles = files.filter((f) => !f.isTrash);
  const totalStorageBytes = activeFiles.reduce((acc, f) => acc + f.size, 0);
  const totalActiveFilesCount = activeFiles.length;
  const totalTrashCount = files.filter((f) => f.isTrash).length;
  const totalFavoritesCount = activeFiles.filter((f) => f.isFavorite).length;

  return (
    <WorkspaceContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        teamMembers: TEAM_MEMBERS,
        activeTab,
        setActiveTab,
        folders,
        currentFolderId,
        setCurrentFolderId,
        createFolder,
        renameFolder,
        deleteFolder,
        moveFolder,
        getFolderPath,
        files,
        uploadFiles,
        renameFile,
        deleteFile,
        restoreFile,
        permanentDeleteFile,
        emptyTrash,
        moveFile,
        toggleFavorite,
        updateFileTags,
        downloadFile,
        previewingFile,
        setPreviewingFile,
        isUploadModalOpen,
        setIsUploadModalOpen,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
        movingItem,
        setMovingItem,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleChecklistItem,
        clients,
        addClient,
        updateClient,
        deleteClient,
        calendarEvents,
        addCalendarEvent,
        totalStorageBytes,
        totalActiveFilesCount,
        totalTrashCount,
        totalFavoritesCount,
        toastMessage,
        showToast,
        resetAllData,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

// Utilities for formatting
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}
