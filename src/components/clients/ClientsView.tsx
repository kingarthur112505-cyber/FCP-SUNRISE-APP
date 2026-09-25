import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  CheckSquare, 
  MoreVertical,
  X
} from 'lucide-react';
import { useWorkspace, formatDate } from '../../context/WorkspaceContext';
import { Client, ClientStatus } from '../../types';
import { ClientDetailModal } from './ClientDetailModal';

export const ClientsView: React.FC = () => {
  const { clients, addClient } = useWorkspace();

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isAddingClient, setIsAddingClient] = useState(false);

  // New client form state
  const [name, setName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [destination, setDestination] = useState('');
  const [status, setStatus] = useState<ClientStatus>('new_lead');
  const [paxCount, setPaxCount] = useState(2);
  const [departureDate, setDepartureDate] = useState('2026-11-15');
  const [notes, setNotes] = useState('');

  const statuses: { id: string; label: string }[] = [
    { id: 'all', label: 'All Clients' },
    { id: 'new_lead', label: 'New Lead' },
    { id: 'contacted', label: 'Contacted' },
    { id: 'follow_up', label: 'Follow-Up' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const filteredClients = clients.filter((c) => {
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchDest = c.destination.toLowerCase().includes(q);
      const matchPhone = c.contactNumber.toLowerCase().includes(q);
      return matchName || matchDest || matchPhone;
    }
    return true;
  });

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addClient({
      name: name.trim(),
      contactNumber: contactNumber.trim() || '+63 900 000 0000',
      email: email.trim() || 'inquiry@traveler.ph',
      destination: destination.trim() || 'Custom Tour Itinerary',
      inquiryDate: new Date().toISOString().split('T')[0],
      status,
      notes,
      paxCount: Number(paxCount) || 1,
      departureDate,
      relatedFileIds: [],
      relatedTaskIds: [],
    });

    setName('');
    setContactNumber('');
    setEmail('');
    setDestination('');
    setNotes('');
    setIsAddingClient(false);
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
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
      {/* Top Header Controls */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base md:text-lg font-bold text-[#0A2A43]">Client CRM Records</h2>
          <p className="text-xs text-slate-500">Manage tourist bookings, corporate travel packages, and visa inquiries</p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients..."
              className="pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#1498CC] w-36 sm:w-48"
            />
          </div>

          <button
            onClick={() => setIsAddingClient(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1498CC] hover:bg-[#0f82b0] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-2 flex items-center gap-1 overflow-x-auto text-xs">
        {statuses.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedStatus(s.id)}
            className={`px-3 py-1 rounded-md font-medium capitalize transition-colors whitespace-nowrap ${
              selectedStatus === s.id
                ? 'bg-[#0A2A43] text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Main Table / Card View */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                  <th className="py-3 px-4">Client / Organization</th>
                  <th className="py-3 px-3">Destination / Package</th>
                  <th className="py-3 px-3">Pax</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Target Departure</th>
                  <th className="py-3 px-3">Files / Tasks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className="hover:bg-slate-50/80 cursor-pointer group transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 group-hover:text-[#1498CC]">
                      {client.name}
                    </td>

                    <td className="py-3 px-3 text-slate-700 font-medium">
                      <div className="flex items-center gap-1.5 truncate max-w-xs">
                        <MapPin className="w-3.5 h-3.5 text-[#1498CC] shrink-0" />
                        <span className="truncate">{client.destination}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-600">
                      {client.paxCount} Pax
                    </td>

                    <td className="py-3 px-3 text-slate-500">
                      <div className="space-y-0.5">
                        <div className="font-mono text-[11px] text-slate-700">{client.contactNumber}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{client.email}</div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border inline-block whitespace-nowrap ${getStatusBadge(
                          client.status
                        )}`}
                      >
                        {client.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                      {client.departureDate ? formatDate(client.departureDate) : 'TBD'}
                    </td>

                    <td className="py-3 px-3 text-slate-400">
                      <div className="flex items-center gap-2">
                        {client.relatedFileIds.length > 0 && (
                          <span className="flex items-center gap-1 text-[#1498CC]">
                            <FileText className="w-3 h-3" />
                            <span className="font-mono text-[10px]">{client.relatedFileIds.length}</span>
                          </span>
                        )}
                        {client.relatedTaskIds.length > 0 && (
                          <span className="flex items-center gap-1 text-amber-600">
                            <CheckSquare className="w-3 h-3" />
                            <span className="font-mono text-[10px]">{client.relatedTaskIds.length}</span>
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Client Modal */}
      {isAddingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A2A43]/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900">Add New Client Inquiry</h3>
              <button
                onClick={() => setIsAddingClient(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Client Name / Group</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tan Family (5 Pax) or Ayala Land Corp"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-[#1498CC]"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Number</label>
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+63 917 000 0000"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@gmail.com"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Destination / Package</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Tokyo Autumn Tour"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pax Count</label>
                  <input
                    type="number"
                    min="1"
                    value={paxCount}
                    onChange={(e) => setPaxCount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ClientStatus)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none"
                  >
                    <option value="new_lead">New Lead</option>
                    <option value="contacted">Contacted</option>
                    <option value="follow_up">Follow-Up</option>
                    <option value="confirmed">Confirmed</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Departure Date</label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Inquiry Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Preferences, budget, requested airlines..."
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-[#1498CC] resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingClient(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1498CC] text-white rounded-lg font-semibold hover:bg-[#0f82b0]"
                >
                  Create Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Client Modal */}
      {selectedClient && (
        <ClientDetailModal client={selectedClient} onClose={() => setSelectedClient(null)} />
      )}
    </div>
  );
};
