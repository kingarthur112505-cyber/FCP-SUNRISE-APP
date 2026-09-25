import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  CheckSquare, 
  Trash2, 
  Edit3,
  ExternalLink,
  Users
} from 'lucide-react';
import { useWorkspace, formatDate } from '../../context/WorkspaceContext';
import { Client, ClientStatus } from '../../types';

interface ClientDetailModalProps {
  client: Client;
  onClose: () => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({ client, onClose }) => {
  const { 
    updateClient, 
    deleteClient, 
    files, 
    tasks, 
    setPreviewingFile, 
    setActiveTab,
    showToast 
  } = useWorkspace();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(client.name);
  const [contactNumber, setContactNumber] = useState(client.contactNumber);
  const [email, setEmail] = useState(client.email);
  const [destination, setDestination] = useState(client.destination);
  const [status, setStatus] = useState<ClientStatus>(client.status);
  const [notes, setNotes] = useState(client.notes);
  const [paxCount, setPaxCount] = useState(client.paxCount);
  const [departureDate, setDepartureDate] = useState(client.departureDate || '');

  const clientFiles = files.filter((f) => !f.isTrash && (client.relatedFileIds.includes(f.id) || f.relatedClientId === client.id));
  const clientTasks = tasks.filter((t) => client.relatedTaskIds.includes(t.id) || t.relatedClientId === client.id);

  const handleSave = () => {
    updateClient({
      ...client,
      name: name.trim() || client.name,
      contactNumber,
      email,
      destination,
      status,
      notes,
      paxCount: Number(paxCount) || 1,
      departureDate,
    });
    setIsEditing(false);
  };

  const getStatusBadge = (s: ClientStatus) => {
    switch (s) {
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'follow_up':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'new_lead':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'contacted':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'completed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'cancelled':
        return 'bg-red-50 text-red-600 border-red-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-[#0A2A43]/70 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${getStatusBadge(
                client.status
              )}`}
            >
              {client.status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                deleteClient(client.id);
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
              title="Delete Client Record"
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
          {/* Client Title & Destination */}
          <div>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-base font-bold text-slate-900 border border-slate-300 rounded p-1.5 outline-none focus:border-[#1498CC]"
                  placeholder="Client name"
                />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full text-xs text-slate-700 border border-slate-300 rounded p-1.5 outline-none focus:border-[#1498CC]"
                  placeholder="Interested package / Destination"
                />
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base md:text-lg font-bold text-[#0A2A43]">{client.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-[#1498CC] font-semibold mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{client.destination}</span>
                    <span>·</span>
                    <span className="font-mono text-slate-500">{client.paxCount} Pax</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#1498CC] p-1 rounded"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {isEditing ? (
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="p-1 border border-slate-200 rounded text-xs w-full bg-white"
                  />
                ) : (
                  <span className="font-mono">{client.contactNumber}</span>
                )}
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {isEditing ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="p-1 border border-slate-200 rounded text-xs w-full bg-white"
                  />
                ) : (
                  <span>{client.email}</span>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400">Status:</span>
                {isEditing ? (
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ClientStatus)}
                    className="p-1 border border-slate-200 rounded text-xs bg-white"
                  >
                    <option value="new_lead">New Lead</option>
                    <option value="contacted">Contacted</option>
                    <option value="follow_up">Follow-Up</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                ) : (
                  <span className="font-semibold text-slate-800 capitalize">{client.status.replace('_', ' ')}</span>
                )}
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400">Target Departure:</span>
                {isEditing ? (
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="p-1 border border-slate-200 rounded text-xs bg-white font-mono"
                  />
                ) : (
                  <span className="font-mono text-slate-800">
                    {client.departureDate ? formatDate(client.departureDate) : 'Not specified'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-slate-900 mb-1">Traveler Notes & Special Requirements</label>
            {isEditing ? (
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#1498CC]"
              />
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-slate-700 leading-relaxed">
                {client.notes || 'No traveler notes recorded.'}
              </div>
            )}
          </div>

          {/* Linked Files (Passports, Vouchers, Itineraries) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Linked Documentation ({clientFiles.length})</span>
            </div>
            {clientFiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {clientFiles.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => {
                      setPreviewingFile(f);
                      onClose();
                    }}
                    className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 hover:border-[#1498CC] rounded-lg cursor-pointer group transition-colors"
                  >
                    <FileText className="w-4 h-4 text-[#1498CC] shrink-0" />
                    <span className="truncate font-medium text-slate-800 group-hover:text-[#1498CC]">
                      {f.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic text-[11px]">No files linked to this client yet.</p>
            )}
          </div>

          {/* Linked Tasks */}
          <div className="space-y-2">
            <span className="font-bold text-slate-900">Associated Tasks ({clientTasks.length})</span>
            {clientTasks.length > 0 ? (
              <div className="space-y-1.5">
                {clientTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setActiveTab('tasks');
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 hover:border-[#1498CC] rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <CheckSquare className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{t.title}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase px-2 py-0.5 bg-white rounded border border-slate-200 shrink-0">
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic text-[11px]">No active tasks currently connected.</p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-1.5 bg-[#1498CC] text-white rounded-lg font-semibold hover:bg-[#0f82b0]"
              >
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
