import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  LogOut,
  Shield,
  FileSpreadsheet,
  Database,
  History,
  CalendarX,
  X,
  Loader2,
} from 'lucide-react';
import { UserProfile, Appointment, AppointmentStatus, BlockedDate, ClinicSettings, AuditLog } from '../../types/index.ts';

interface AdminDashboardProps {
  user: UserProfile;
  token: string;
  onLogout: () => void;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  token,
  onLogout,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'calendar' | 'blocked' | 'settings' | 'audit' | 'supabase'>('appointments');

  // Appointments state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingApts, setLoadingApts] = useState<boolean>(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Metrics
  const [metrics, setMetrics] = useState<any>({
    todayCount: 0,
    upcomingCount: 0,
    pendingCount: 0,
    confirmedCount: 0,
    completedCount: 0,
    cancelledCount: 0,
  });

  // Blocked dates state
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [newBlockDate, setNewBlockDate] = useState<string>('');
  const [newBlockReason, setNewBlockReason] = useState<string>('');

  // Settings state
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);
  const [settingsSuccess, setSettingsSuccess] = useState<string>('');

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Supabase live status state
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [loadingSupabase, setLoadingSupabase] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [syncingAll, setSyncingAll] = useState<boolean>(false);
  const [syncAllResult, setSyncAllResult] = useState<string>('');

  // Selected appointment for internal notes modal
  const [activeApt, setActiveApt] = useState<Appointment | null>(null);
  const [internalNoteDraft, setInternalNoteDraft] = useState<string>('');

  // Fetch appointments and metrics
  const fetchAppointments = async () => {
    try {
      setLoadingApts(true);
      let url = '/api/admin/appointments';
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedDate) params.append('date', selectedDate);
      if (searchQuery) params.append('search', searchQuery);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const [aptRes, metRes] = await Promise.all([
        fetch(url, { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/metrics', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (aptRes.ok) {
        setAppointments(await aptRes.json());
      }
      if (metRes.ok) {
        setMetrics(await metRes.json());
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoadingApts(false);
    }
  };

  const fetchBlockedDates = async () => {
    try {
      const res = await fetch('/api/admin/blocked-dates', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setBlockedDates(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/clinic-info');
      if (res.ok) setSettings(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setAuditLogs(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSupabaseStatus = async () => {
    try {
      setLoadingSupabase(true);
      const res = await fetch('/api/admin/supabase-status');
      if (res.ok) {
        setSupabaseStatus(await res.json());
      }
    } catch (err) {
      console.error('Error fetching Supabase status:', err);
    } finally {
      setLoadingSupabase(false);
    }
  };

  const handleSyncAllToSupabase = async () => {
    try {
      setSyncingAll(true);
      setSyncAllResult('');
      const res = await fetch('/api/admin/supabase-sync-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setSyncAllResult(
          `Sync completed: ${data.syncedCount} of ${data.total} appointments synced to Supabase.${
            data.failedCount > 0 ? ` (${data.failedCount} failed: ${data.errors.join(', ')})` : ''
          }`
        );
        fetchSupabaseStatus();
      }
    } catch (err: any) {
      setSyncAllResult(`Failed: ${err.message}`);
    } finally {
      setSyncingAll(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedStatus, selectedDate, searchQuery]);

  useEffect(() => {
    if (activeTab === 'blocked') fetchBlockedDates();
    if (activeTab === 'settings') fetchSettings();
    if (activeTab === 'audit') fetchAuditLogs();
    if (activeTab === 'supabase') fetchSupabaseStatus();
  }, [activeTab]);

  // Update appointment status
  const handleUpdateStatus = async (id: string, newStatus: AppointmentStatus) => {
    try {
      const res = await fetch(`/api/admin/appointments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchAppointments();
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  // Save internal notes
  const handleSaveInternalNote = async () => {
    if (!activeApt) return;
    try {
      const res = await fetch(`/api/admin/appointments/${activeApt.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ internalNotes: internalNoteDraft }),
      });
      if (res.ok) {
        setActiveApt(null);
        fetchAppointments();
      }
    } catch (err) {
      console.error('Failed to save notes', err);
    }
  };

  // Add Blocked Date
  const handleAddBlockedDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockDate || !newBlockReason) return;

    try {
      const res = await fetch('/api/admin/blocked-dates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date: newBlockDate, reason: newBlockReason }),
      });
      if (res.ok) {
        setNewBlockDate('');
        setNewBlockReason('');
        fetchBlockedDates();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Remove Blocked Date
  const handleRemoveBlockedDate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/blocked-dates/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchBlockedDates();
    } catch (err) {
      console.error(err);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSavingSettings(true);
    setSettingsSuccess('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSettingsSuccess('Clinic settings saved successfully.');
        setTimeout(() => setSettingsSuccess(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSettings(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    window.open(`/api/admin/export-csv?token=${token}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[94vh]">
        
        {/* Top bar with clinic brand and logged in staff */}
        <div className="px-6 py-3.5 bg-[#172B3A] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0B6B68] flex items-center justify-center font-bold text-xs">
              SA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">Smile Architect Portal</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/10 text-emerald-300">
                  {user.role}
                </span>
              </div>
              <span className="text-[11px] text-slate-300">
                Logged in as {user.name} ({user.email})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 text-xs flex items-center gap-1.5"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
              title="Close Portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="px-6 border-b border-slate-200 bg-[#F5F8F8] flex items-center gap-2 overflow-x-auto shrink-0 no-scrollbar">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'appointments'
                ? 'border-[#0B6B68] text-[#0B6B68]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Appointments List
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'border-[#0B6B68] text-[#0B6B68]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Day Schedule
          </button>

          {user.role !== 'dentist' && (
            <button
              onClick={() => setActiveTab('blocked')}
              className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'blocked'
                  ? 'border-[#0B6B68] text-[#0B6B68]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Holidays & Closures
            </button>
          )}

          {user.role === 'owner' && (
            <>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'border-[#0B6B68] text-[#0B6B68]'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Clinic Settings
              </button>

              <button
                onClick={() => setActiveTab('audit')}
                className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'audit'
                    ? 'border-[#0B6B68] text-[#0B6B68]'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Security Audit Logs
              </button>

              <button
                onClick={() => setActiveTab('supabase')}
                className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'supabase'
                    ? 'border-[#0B6B68] text-[#0B6B68]'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Supabase & Database
              </button>
            </>
          )}
        </div>

        {/* Tab contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: Appointments List */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              {/* Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Today's Visits</span>
                  <strong className="text-xl font-bold text-slate-900 tabular-nums">
                    {metrics.todayCount}
                  </strong>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Upcoming</span>
                  <strong className="text-xl font-bold text-[#0B6B68] tabular-nums">
                    {metrics.upcomingCount}
                  </strong>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Confirmed</span>
                  <strong className="text-xl font-bold text-emerald-700 tabular-nums">
                    {metrics.confirmedCount}
                  </strong>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Pending Review</span>
                  <strong className="text-xl font-bold text-amber-600 tabular-nums">
                    {metrics.pendingCount}
                  </strong>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Completed</span>
                  <strong className="text-xl font-bold text-blue-700 tabular-nums">
                    {metrics.completedCount}
                  </strong>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Cancelled</span>
                  <strong className="text-xl font-bold text-slate-400 tabular-nums">
                    {metrics.cancelledCount}
                  </strong>
                </div>
              </div>

              {/* Filters & Actions Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#F5F8F8] p-3 rounded-xl border border-slate-200">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative w-44">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search patient, phone, ref..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
                    />
                  </div>

                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
                  />

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none font-medium"
                  >
                    <option value="all">All Statuses</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no_show">No-Show</option>
                  </select>

                  {(selectedDate || searchQuery || selectedStatus !== 'all') && (
                    <button
                      onClick={() => {
                        setSelectedDate('');
                        setSearchQuery('');
                        setSelectedStatus('all');
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800 underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCsv}
                    className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-1.5"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Appointments Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                {loadingApts ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin text-[#0B6B68]" />
                    <span className="text-xs">Fetching bookings...</span>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500">
                    No appointments matched the specified criteria.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-3 px-4">Ref & Patient</th>
                          <th className="py-3 px-4">Date & Time</th>
                          <th className="py-3 px-4">Service</th>
                          <th className="py-3 px-4">Doctor</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Clinical Notes</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {appointments.map((apt) => (
                          <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4">
                              <span className="font-mono font-bold text-[#0B6B68] block">
                                {apt.bookingReference}
                              </span>
                              <strong className="text-slate-900 block mt-0.5">
                                {apt.patientName}
                              </strong>
                              <span className="text-slate-500 text-[11px] block">
                                {apt.patientPhone}
                              </span>
                            </td>

                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="font-bold text-slate-800 block">{apt.date}</span>
                              <span className="text-[#0B6B68] font-semibold tabular-nums">
                                {apt.startTime} – {apt.endTime}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <span className="font-medium text-slate-800 block">
                                {apt.serviceName}
                              </span>
                              <span className="text-slate-400 text-[11px]">
                                {apt.serviceDuration} mins
                              </span>
                            </td>

                            <td className="py-3 px-4 text-slate-700">
                              {apt.dentistName}
                            </td>

                            <td className="py-3 px-4">
                              <select
                                value={apt.status}
                                onChange={(e) =>
                                  handleUpdateStatus(apt.id, e.target.value as AppointmentStatus)
                                }
                                className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none capitalize ${
                                  apt.status === 'confirmed'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : apt.status === 'pending'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : apt.status === 'completed'
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : 'bg-red-50 text-red-800 border-red-200'
                                }`}
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="no_show">No-Show</option>
                              </select>
                            </td>

                            <td className="py-3 px-4 max-w-xs">
                              {apt.internalNotes ? (
                                <p className="text-[11px] text-slate-600 line-clamp-2">
                                  {apt.internalNotes}
                                </p>
                              ) : (
                                <span className="text-slate-300 text-[11px] italic">No notes</span>
                              )}
                            </td>

                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => {
                                  setActiveApt(apt);
                                  setInternalNoteDraft(apt.internalNotes || '');
                                }}
                                className="px-2.5 py-1 text-[11px] font-semibold text-[#0B6B68] hover:bg-[#DDF4F0]/60 rounded-lg transition-colors"
                              >
                                Notes
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Calendar / Day Schedule View */}
          {activeTab === 'calendar' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#172B3A]">Day Schedule View</h4>
                  <p className="text-xs text-slate-500">
                    Review chair appointments organized by hour.
                  </p>
                </div>
                <input
                  type="date"
                  value={selectedDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Morning session */}
                <div className="bg-[#F5F8F8] p-4 rounded-xl border border-slate-200 space-y-3">
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Morning Session (10:00 AM – 1:30 PM)</span>
                    <span className="text-[#0B6B68]">
                      {
                        appointments.filter(
                          (a) =>
                            a.startTime < '14:00' &&
                            a.date === (selectedDate || new Date().toISOString().split('T')[0])
                        ).length
                      }{' '}
                      Visits
                    </span>
                  </h5>

                  <div className="space-y-2">
                    {appointments
                      .filter(
                        (a) =>
                          a.startTime < '14:00' &&
                          a.date === (selectedDate || new Date().toISOString().split('T')[0])
                      )
                      .map((a) => (
                        <div
                          key={a.id}
                          className="p-3 bg-white rounded-lg border border-slate-200 text-xs flex justify-between items-center"
                        >
                          <div>
                            <span className="font-bold text-[#0B6B68] tabular-nums block">
                              {a.startTime} – {a.endTime}
                            </span>
                            <strong className="text-slate-800">{a.patientName}</strong>
                            <p className="text-[11px] text-slate-500">{a.serviceName}</p>
                          </div>
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {a.status}
                          </span>
                        </div>
                      ))}
                    {appointments.filter(
                      (a) =>
                        a.startTime < '14:00' &&
                        a.date === (selectedDate || new Date().toISOString().split('T')[0])
                    ).length === 0 && (
                      <div className="text-center py-6 text-xs text-slate-400">
                        No morning appointments scheduled.
                      </div>
                    )}
                  </div>
                </div>

                {/* Evening session */}
                <div className="bg-[#F5F8F8] p-4 rounded-xl border border-slate-200 space-y-3">
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Evening Session (5:00 PM – 8:30 PM)</span>
                    <span className="text-[#0B6B68]">
                      {
                        appointments.filter(
                          (a) =>
                            a.startTime >= '17:00' &&
                            a.date === (selectedDate || new Date().toISOString().split('T')[0])
                        ).length
                      }{' '}
                      Visits
                    </span>
                  </h5>

                  <div className="space-y-2">
                    {appointments
                      .filter(
                        (a) =>
                          a.startTime >= '17:00' &&
                          a.date === (selectedDate || new Date().toISOString().split('T')[0])
                      )
                      .map((a) => (
                        <div
                          key={a.id}
                          className="p-3 bg-white rounded-lg border border-slate-200 text-xs flex justify-between items-center"
                        >
                          <div>
                            <span className="font-bold text-[#0B6B68] tabular-nums block">
                              {a.startTime} – {a.endTime}
                            </span>
                            <strong className="text-slate-800">{a.patientName}</strong>
                            <p className="text-[11px] text-slate-500">{a.serviceName}</p>
                          </div>
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {a.status}
                          </span>
                        </div>
                      ))}
                    {appointments.filter(
                      (a) =>
                        a.startTime >= '17:00' &&
                        a.date === (selectedDate || new Date().toISOString().split('T')[0])
                    ).length === 0 && (
                      <div className="text-center py-6 text-xs text-slate-400">
                        No evening appointments scheduled.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Blocked Holidays & Closures */}
          {activeTab === 'blocked' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-[#172B3A]">Clinic Closures & Blocked Dates</h4>
                <p className="text-xs text-slate-500">
                  Block dates for festival holidays, maintenance, or emergency doctor leave. Online patients cannot book these dates.
                </p>
              </div>

              {/* Add form */}
              <form onSubmit={handleAddBlockedDate} className="p-4 bg-[#F5F8F8] rounded-xl border border-slate-200 flex flex-wrap gap-3 items-end">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Date to Block
                  </label>
                  <input
                    type="date"
                    required
                    value={newBlockDate}
                    onChange={(e) => setNewBlockDate(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Reason for Closure
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ayudha Pooja / Clinic Maintenance"
                    value={newBlockReason}
                    onChange={(e) => setNewBlockReason(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B6B68] text-white rounded-lg text-xs font-bold hover:bg-[#085552]"
                >
                  Block Date
                </button>
              </form>

              {/* List */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Reason</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {blockedDates.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-bold text-slate-800">{b.date}</td>
                        <td className="py-2.5 px-4 text-slate-600">{b.reason}</td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            onClick={() => handleRemoveBlockedDate(b.id)}
                            className="text-red-600 hover:text-red-800 text-xs font-semibold"
                          >
                            Unblock
                          </button>
                        </td>
                      </tr>
                    ))}
                    {blockedDates.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-slate-400">
                          No blocked dates configured.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Clinic Settings */}
          {activeTab === 'settings' && settings && (
            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
              <div>
                <h4 className="text-sm font-bold text-[#172B3A]">Business Information & Rules</h4>
                <p className="text-xs text-slate-500">
                  Update clinic address, phone numbers, booking horizons, and buffers.
                </p>
              </div>

              {settingsSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                  {settingsSuccess}
                </div>
              )}

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    value={settings.businessName}
                    onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Clinic Address</label>
                  <textarea
                    rows={2}
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Telephone</label>
                    <input
                      type="text"
                      value={settings.phone}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">WhatsApp Number</label>
                    <input
                      type="text"
                      value={settings.whatsappNumber}
                      onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Booking Horizon (Days)</label>
                    <input
                      type="number"
                      value={settings.bookingHorizonDays}
                      onChange={(e) =>
                        setSettings({ ...settings, bookingHorizonDays: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Min Notice (Hours)</label>
                    <input
                      type="number"
                      value={settings.minNoticeHours}
                      onChange={(e) =>
                        setSettings({ ...settings, minNoticeHours: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Buffer Between (Mins)</label>
                    <input
                      type="number"
                      value={settings.appointmentBufferMinutes}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          appointmentBufferMinutes: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="px-5 py-2.5 bg-[#0B6B68] text-white text-xs font-bold rounded-xl hover:bg-[#085552] disabled:opacity-50"
              >
                {savingSettings ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          )}

          {/* TAB 5: Audit Logs */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-[#172B3A]">System & Staff Audit Trail</h4>
                <p className="text-xs text-slate-500">
                  Immutable record of appointment bookings, status modifications, and administrative updates.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Timestamp</th>
                      <th className="py-2.5 px-4">Actor</th>
                      <th className="py-2.5 px-4">Action</th>
                      <th className="py-2.5 px-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-2 px-4 whitespace-nowrap text-slate-500">
                          {log.timestamp.slice(0, 19).replace('T', ' ')}
                        </td>
                        <td className="py-2 px-4 text-slate-800">
                          {log.actorEmail} ({log.actorRole})
                        </td>
                        <td className="py-2 px-4 font-bold text-[#0B6B68]">{log.action}</td>
                        <td className="py-2 px-4 text-slate-600 font-sans text-xs">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: Supabase & Architecture */}
          {activeTab === 'supabase' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h4 className="text-sm font-bold text-[#172B3A]">Supabase Backend Integration</h4>
                <p className="text-xs text-slate-500">
                  Direct connection to your Supabase PostgreSQL project (<span className="font-mono font-bold text-[#0B6B68]">egccbzkmprexuhkhixep</span>).
                </p>
              </div>

              {/* Live Connection Card */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#0B6B68] text-white flex items-center justify-center">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">Supabase Cloud Connection</h5>
                      <p className="text-[11px] font-mono text-slate-500">
                        https://egccbzkmprexuhkhixep.supabase.co
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={fetchSupabaseStatus}
                    disabled={loadingSupabase}
                    className="text-xs font-semibold text-[#0B6B68] hover:underline"
                  >
                    {loadingSupabase ? 'Checking...' : 'Refresh Status'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Project ID
                    </span>
                    <span className="font-mono font-bold text-slate-800">egccbzkmprexuhkhixep</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Appointments Table Status
                    </span>
                    {supabaseStatus?.tableExists ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Active in Supabase</span>
                      </span>
                    ) : (
                      <span className="text-amber-700 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Ready (Run SQL Below)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Callout */}
                {supabaseStatus?.tableExists ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Your Supabase appointments table is active!</strong> Every time a patient books online, the appointment is automatically saved and appears in your Supabase Table Editor.
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Quick 1-Minute Setup:</strong> Your API key is connected. To let Supabase store incoming appointments, copy the SQL below and paste it into your Supabase SQL Editor, then click <strong>Run</strong>.
                    </div>
                  </div>
                )}

                {/* Actions: Copy SQL, Open Supabase, Bulk Sync */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      if (supabaseStatus?.setupSql) {
                        navigator.clipboard.writeText(supabaseStatus.setupSql);
                        setCopiedSql(true);
                        setTimeout(() => setCopiedSql(false), 3000);
                      }
                    }}
                    className="px-3 py-1.5 bg-[#0B6B68] text-white rounded-lg text-xs font-semibold hover:bg-[#085552] transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>{copiedSql ? '✓ Copied SQL to Clipboard!' : 'Copy Supabase SQL Script'}</span>
                  </button>

                  <a
                    href="https://supabase.com/dashboard/project/egccbzkmprexuhkhixep/sql/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <span>Open Supabase SQL Editor ↗</span>
                  </a>

                  <button
                    onClick={handleSyncAllToSupabase}
                    disabled={syncingAll}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <span>{syncingAll ? 'Syncing...' : 'Sync All Local Appointments to Supabase'}</span>
                  </button>
                </div>

                {syncAllResult && (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                    {syncAllResult}
                  </div>
                )}
              </div>

              {/* SQL Script Display */}
              <div className="bg-[#172B3A] text-slate-200 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-700">
                  <span>Supabase Table Schema & Public Insert Policy SQL</span>
                  <span className="font-mono text-[10px]">project: egccbzkmprexuhkhixep</span>
                </div>
                <pre className="text-[11px] font-mono overflow-x-auto text-emerald-400 max-h-56">
                  {supabaseStatus?.setupSql || `-- Click "Refresh Status" above to load SQL script`}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Modal: Edit Internal Clinical Notes */}
        {activeApt && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-[#172B3A]">
                  Clinical & Front Desk Notes
                </h4>
                <button onClick={() => setActiveApt(null)} className="text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <strong>Patient:</strong> {activeApt.patientName} ({activeApt.bookingReference})<br />
                <strong>Treatment:</strong> {activeApt.serviceName}
              </div>

              <textarea
                rows={4}
                value={internalNoteDraft}
                onChange={(e) => setInternalNoteDraft(e.target.value)}
                placeholder="Internal notes (e.g. Tooth #36 RCT completed, follow-up crown trial needed, payment method...)"
                className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B6B68]"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setActiveApt(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveInternalNote}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#0B6B68] rounded-lg hover:bg-[#085552]"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
