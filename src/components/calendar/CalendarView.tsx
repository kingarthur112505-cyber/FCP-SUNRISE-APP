import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Plus, 
  X,
  Plane,
  Users,
  CheckSquare
} from 'lucide-react';
import { useWorkspace, formatDate } from '../../context/WorkspaceContext';
import { CalendarEvent, CalendarEventType } from '../../types';

export const CalendarView: React.FC = () => {
  const { calendarEvents, addCalendarEvent, tasks, clients, setActiveTab } = useWorkspace();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 25)); // Sept 2026
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // New event form state
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('2026-09-28');
  const [newEventTime, setNewEventTime] = useState('10:00');
  const [newEventType, setNewEventType] = useState<CalendarEventType>('task_deadline');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('');

  // Year & Month details
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Days in current month
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 7);
      setCurrentDate(prev);
    } else {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 1);
      setCurrentDate(prev);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 7);
      setCurrentDate(next);
    } else {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 1);
      setCurrentDate(next);
    }
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    addCalendarEvent({
      title: newEventTitle.trim(),
      date: newEventDate,
      time: newEventTime,
      type: newEventType,
      description: newEventDesc,
      location: newEventLocation,
    });

    setNewEventTitle('');
    setIsAddingEvent(false);
  };

  const getEventBadgeClass = (type: CalendarEventType) => {
    switch (type) {
      case 'travel_date':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'task_deadline':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'client_appointment':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'internal_event':
        return 'bg-sky-50 text-sky-700 border-sky-200';
    }
  };

  const filteredEvents = calendarEvents.filter((ev) => {
    if (selectedEventType !== 'all' && ev.type !== selectedEventType) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC]">
      {/* Calendar Header Controls */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-base md:text-lg font-bold text-[#0A2A43]">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-slate-500">Track flight departures, embassy submissions, and client consultations</p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={handlePrev}
              className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date(2026, 8, 25))}
              className="px-2 py-0.5 text-xs font-semibold text-slate-700 hover:bg-white rounded"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View toggles & Event filters */}
        <div className="flex items-center gap-2.5">
          {/* Event Type Filter */}
          <select
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-none"
          >
            <option value="all">All Events</option>
            <option value="travel_date">Flight & Travel Dates</option>
            <option value="task_deadline">Task Deadlines</option>
            <option value="client_appointment">Client Appointments</option>
            <option value="internal_event">Internal Events</option>
          </select>

          {/* Month / Week / Day toggles */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            {(['month', 'week', 'day'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded capitalize font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddingEvent(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1498CC] hover:bg-[#0f82b0] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Main Calendar Grid / View */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {viewMode === 'month' ? (
          /* MONTH VIEW */
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-2 text-xs font-bold text-slate-600">
              {daysOfWeek.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            {/* Month Day Cells */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
              {/* Padding cells before 1st of month */}
              {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-28 bg-slate-50/40 p-2 text-slate-300 text-xs">
                  {/* Empty */}
                </div>
              ))}

              {/* Real month days */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const formattedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const dayEvents = filteredEvents.filter((ev) => ev.date === formattedDateStr);
                const isCurrentDay = dayNum === 25; // Sept 25, 2026

                return (
                  <div
                    key={`day-${dayNum}`}
                    className={`min-h-[110px] p-2 transition-colors hover:bg-slate-50/50 flex flex-col justify-between ${
                      isCurrentDay ? 'bg-sky-50/30' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded-full ${
                          isCurrentDay
                            ? 'bg-[#1498CC] text-white'
                            : 'text-slate-700'
                        }`}
                      >
                        {dayNum}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {dayEvents.length} ev
                        </span>
                      )}
                    </div>

                    {/* Events list in cell */}
                    <div className="space-y-1 overflow-y-auto flex-1 max-h-20">
                      {dayEvents.map((ev) => (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          className={`p-1 rounded text-[11px] font-medium border truncate cursor-pointer transition-transform hover:scale-[1.02] ${getEventBadgeClass(
                            ev.type
                          )}`}
                          title={`${ev.time ? ev.time + ' - ' : ''}${ev.title}`}
                        >
                          <span className="truncate">{ev.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* WEEK / DAY AGENDA VIEW */
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs max-w-4xl mx-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Schedule Agenda for {monthNames[month]} {year}
              </h3>
              <span className="text-xs text-slate-400">{filteredEvents.length} events booked</span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className="py-3 flex items-start justify-between gap-4 hover:bg-slate-50 p-2 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 text-center shrink-0">
                      <span className="block text-xs font-mono font-bold text-[#0A2A43]">
                        {ev.date?.split('-')?.[2] || '—'}
                      </span>
                      <span className="block text-[10px] uppercase text-slate-400">
                        {(() => {
                          try {
                            const parts = ev.date?.split('-');
                            if (parts && parts.length >= 2) {
                              const idx = parseInt(parts[1], 10) - 1;
                              if (idx >= 0 && idx < monthNames.length) return monthNames[idx].slice(0, 3);
                            }
                            return 'EVT';
                          } catch {
                            return 'EVT';
                          }
                        })()}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{ev.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{ev.description}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5">
                        {ev.time && (
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {ev.time}
                          </span>
                        )}
                        {ev.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#1498CC]" />
                            {ev.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border shrink-0 ${getEventBadgeClass(
                      ev.type
                    )}`}
                  >
                    {ev.type.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {isAddingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A2A43]/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900">Add Calendar Entry</h3>
              <button
                onClick={() => setIsAddingEvent(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Event Title</label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Flight Departure: Mendoza Group"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-[#1498CC]"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value as CalendarEventType)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none"
                >
                  <option value="travel_date">Flight & Travel Date</option>
                  <option value="task_deadline">Task Deadline</option>
                  <option value="client_appointment">Client Appointment</option>
                  <option value="internal_event">Internal Agency Event</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location / Details</label>
                <input
                  type="text"
                  value={newEventLocation}
                  onChange={(e) => setNewEventLocation(e.target.value)}
                  placeholder="e.g. NAIA Terminal 1 or Agency Meeting Room"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-[#1498CC]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingEvent(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1498CC] text-white rounded-lg font-semibold hover:bg-[#0f82b0]"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A2A43]/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getEventBadgeClass(
                  selectedEvent.type
                )}`}
              >
                {selectedEvent.type.replace('_', ' ')}
              </span>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">{selectedEvent.title}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {selectedEvent.description || 'Scheduled event in FCP Sunrise workspace calendar.'}
              </p>
            </div>

            <div className="space-y-1.5 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-3.5 h-3.5 text-[#1498CC]" />
                <span>{formatDate(selectedEvent.date)}</span>
              </div>
              {selectedEvent.time && (
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedEvent.time}</span>
                </div>
              )}
              {selectedEvent.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
