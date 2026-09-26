'use client';

import React, { useState, useEffect } from 'react';
import { X, Video, Calendar, Clock, Link as LinkIcon, MapPin, Plus, Check, Lock, AlertCircle } from 'lucide-react';
import { UserAvatar } from '@/components/common/UserAvatar';
import { formatDate } from '@/lib/dateUtils';

const getLocalToday = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

export function ScheduleMeetingModal({
  isOpen,
  onClose,
  projects = [],
  tasks = [],
  users = [],
  meetings = [],
  currentUser,
  meetingToEdit = null,
  onScheduleMeeting,
  onUpdateMeeting,
}) {
  const activeProjects = (projects || []).filter(
    (p) => p && !p.isDeleted && p.status !== 'Deleted'
  );
  const activeUsers = (users || []).filter(
    (user) => user && user.status !== 'Inactive' && user.status !== 'Disabled'
  );
  const currentUserId = currentUser?.id || currentUser?._id || '';

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getLocalToday);
  const [time, setTime] = useState('11:00');
  const [duration, setDuration] = useState('45 mins');
  const [priority, setPriority] = useState('Medium');
  const [meetUrl, setMeetUrl] = useState('');
  const [projectId, setProjectId] = useState('');
  const [relatedTaskId, setRelatedTaskId] = useState('');
  const [description, setDescription] = useState('');
  const [participants, setParticipants] = useState(() =>
    [currentUser?.id || currentUser?._id].filter(Boolean)
  );
  const [optionalMembers, setOptionalMembers] = useState([]);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [allowConflict, setAllowConflict] = useState(false);

  // Populate form if meetingToEdit is provided or reset
  useEffect(() => {
    if (meetingToEdit) {
      setTitle(meetingToEdit.title || '');
      setDate(meetingToEdit.date || getLocalToday());
      setTime(meetingToEdit.time || '11:00');
      setDuration(meetingToEdit.duration || '45 mins');
      setPriority(meetingToEdit.priority || 'Medium');
      setMeetUrl(meetingToEdit.meetUrl || '');
      setProjectId(meetingToEdit.projectId || '');
      setRelatedTaskId(meetingToEdit.relatedTaskId || '');
      setDescription(meetingToEdit.description || '');
      setParticipants(
        meetingToEdit.participants || meetingToEdit.participantIds || [
          currentUser?.id || currentUser?._id,
        ].filter(Boolean)
      );
      setOptionalMembers(
        meetingToEdit.optionalMembers || meetingToEdit.optionalMemberIds || []
      );
    } else {
      setTitle('');
      setDate(getLocalToday());
      setTime('11:00');
      setDuration('45 mins');
      setPriority('Medium');
      setMeetUrl('');
      setProjectId('');
      setRelatedTaskId('');
      setDescription('');
      setParticipants([currentUser?.id || currentUser?._id].filter(Boolean));
      setOptionalMembers([]);
    }
    setFormError('');
    setAttendeeSearch('');
  }, [meetingToEdit, isOpen, currentUser, users, projects]);

  if (!isOpen) return null;

  const projectTasks = projectId
    ? tasks.filter((t) => t.projectId === projectId || t.project === projectId)
    : tasks;

  // Time Interval Parser for Conflict Detection
  const parseTimeInterval = (dStr, tStr, durStr = '45 mins') => {
    if (!dStr || !tStr) return null;
    const match = String(tStr).trim().match(/^(\d{1,2}):(\d{2})(?:\s*([ap]m))?$/i);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const amPm = match[3]?.toLowerCase();
    if (hours > 23 || minutes > 59) return null;
    if (amPm) {
      if (hours > 12 || hours === 0) return null;
      if (amPm === 'pm' && hours < 12) hours += 12;
      if (amPm === 'am' && hours === 12) hours = 0;
    }
    const start = new Date(`${dStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
    if (isNaN(start.getTime())) return null;
    const durMinutes = parseInt(durStr, 10) || 45;
    const end = new Date(start.getTime() + durMinutes * 60 * 1000);
    return { start: start.getTime(), end: end.getTime() };
  };

  const hasIntervalOverlap = (intA, intB) => {
    if (!intA || !intB) return false;
    return intA.start < intB.end && intA.end > intB.start;
  };

  // Real-time conflict computation for all users
  const currentInterval = parseTimeInterval(date, time, duration);
  const editMeetingId = meetingToEdit?.id || meetingToEdit?._id;

  const userConflictMap = {};
  if (currentInterval) {
    (meetings || []).forEach((m) => {
      const mId = m.id || m._id;
      if (editMeetingId && (String(mId) === String(editMeetingId))) return;
      if (m.date !== date) return;
      if (m.isArchived === true || m.status === 'Archived' || m.status === 'Cancelled' || m.status === 'Declined') return;

      const mInterval = parseTimeInterval(m.date, m.time, m.duration);
      if (!hasIntervalOverlap(currentInterval, mInterval)) return;

      const mUserTokens = [
        m.requestedBy,
        m.requestedByEmail,
        m.approverId,
        m.approverEmail,
        ...(m.participants || []),
        ...(m.participantIds || []),
        ...(m.optionalMembers || []),
        ...(m.optionalMemberIds || []),
      ].filter(Boolean).map((v) => String(v).toLowerCase());

      activeUsers.forEach((u) => {
        const uTokens = [u.id, u._id, u.email].filter(Boolean).map((v) => String(v).toLowerCase());
        const isConflict = uTokens.some((tok) => mUserTokens.includes(tok));
        if (isConflict) {
          const uKey = String(u.id || u._id);
          if (!userConflictMap[uKey]) userConflictMap[uKey] = [];
          userConflictMap[uKey].push(m);
        }
      });
    });
  }

  const isParticipantSelected = (u) => {
    const ids = [u.id, u._id, u.email].filter(Boolean).map(String);
    return participants.some((pId) => ids.includes(String(pId)));
  };

  // Selected attendees that currently have a conflict
  const conflictingAttendees = activeUsers.filter(
    (u) => isParticipantSelected(u) && userConflictMap[String(u.id || u._id)]?.length > 0
  );

  const toggleParticipant = (u) => {
    const mainId = u.id || u._id || u.email;
    if (isParticipantSelected(u)) {
      setParticipants((prev) =>
        prev.filter(
          (id) =>
            String(id) !== String(u.id) &&
            String(id) !== String(u._id) &&
            String(id) !== String(u.email)
        )
      );
    } else {
      setParticipants((prev) => [...prev, mainId]);
    }
  };

  const selectAllAttendees = () => {
    const allIds = activeUsers.map((u) => u.id || u._id).filter(Boolean);
    setParticipants(allIds);
  };

  const clearAllAttendees = () => {
    setParticipants([]);
  };

  const filteredUsers = activeUsers.filter((u) => {
    if (!attendeeSearch.trim()) return true;
    const q = attendeeSearch.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  });

  const invitedCount = activeUsers.filter(isParticipantSelected).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!title.trim()) {
      setFormError('Enter a meeting title.');
      return;
    }

    // Check attendee schedule conflicts
    if (conflictingAttendees.length > 0 && !allowConflict) {
      const names = conflictingAttendees.map((u) => u.name).join(', ');
      setFormError(
        `Schedule conflict detected for: ${names}. Please choose another time or check "Acknowledge conflict and proceed anyway" below.`
      );
      return;
    }

    setIsSaving(true);

    try {
      if (meetingToEdit) {
        const updates = {
          title: title.trim(),
          requestedBy: meetingToEdit.requestedBy || currentUserId,
          approverId: '',
          participants,
          participantIds: participants,
          optionalMembers,
          optionalMemberIds: optionalMembers,
          locationType: 'Online',
          meetUrl: meetUrl.trim(),
          date,
          time,
          duration,
          priority,
          projectId: projectId || null,
          relatedTaskId: relatedTaskId || null,
          description: description.trim() || 'No agenda provided.',
          status: meetingToEdit.status === 'Cancelled' ? 'Scheduled' : (meetingToEdit.status || 'Scheduled'),
          allowConflict,
        };
        await onUpdateMeeting?.(meetingToEdit.id || meetingToEdit._id, updates);
      } else {
        const newMeeting = {
          title: title.trim(),
          requestedBy: currentUserId,
          requestedByName: currentUser?.name || currentUser?.email || 'User',
          requestedByEmail: currentUser?.email || '',
          approverId: '',
          approverName: '',
          participants,
          participantIds: participants,
          optionalMembers,
          optionalMemberIds: optionalMembers,
          locationType: 'Online',
          meetUrl: meetUrl.trim(),
          date,
          time,
          duration,
          priority,
          projectId: projectId || null,
          relatedTaskId: relatedTaskId || null,
          description: description.trim() || 'No agenda provided.',
          status: 'Scheduled',
          allowConflict,
        };
        await onScheduleMeeting?.(newMeeting);
      }
      onClose();
    } catch (error) {
      setFormError(error.message || 'Unable to save this meeting.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {meetingToEdit ? 'Modify Meeting Sync' : 'Schedule Team Meeting Sync'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {formError && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">
              {formError}
            </div>
          )}

          {meetingToEdit && (
            <div className="rounded-md border border-sky-200 bg-sky-50 dark:border-sky-900/60 dark:bg-sky-950/40 p-2.5 flex items-center gap-2 text-sky-800 dark:text-sky-300 text-[11px]">
              <AlertCircle className="w-4 h-4 text-sky-600 shrink-0" />
              <span>
                <strong>Editing Meeting:</strong> Changes will be updated immediately for all participating attendees.
              </span>
            </div>
          )}

          {/* Meeting Title */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Meeting Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Architecture Sprint Calibration & UI Review"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium focus:outline-none focus:border-emerald-600 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Date, Time, Duration, Priority Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date {date ? `(${formatDate(date)})` : ''}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Time</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-600"
              >
                <option value="15 mins">15 mins</option>
                <option value="30 mins">30 mins</option>
                <option value="45 mins">45 mins</option>
                <option value="60 mins">60 mins (1 hr)</option>
                <option value="90 mins">90 mins</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-600"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Video Meeting Link (Optional) */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
              <span>Google Meet / Teams Video Room Link <span className="text-slate-400 font-normal">(Optional)</span></span>
            </label>
            <div className="relative">
              <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="url"
                value={meetUrl}
                onChange={(e) => setMeetUrl(e.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij (optional)"
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 font-mono"
              />
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              Add a video conference link now or later. Attendees can click &ldquo;Join Meeting&rdquo; directly from their dashboard or meetings list.
            </p>
          </div>

          {/* Project & Related Task Links (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-600"
              >
                <option value="">No Project Linked (General Meeting)</option>
                {activeProjects.map((p) => (
                  <option key={p.id || p._id} value={p.id || p._id}>
                    {p.code} - {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Related Task / Milestone <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <select
                value={relatedTaskId}
                onChange={(e) => setRelatedTaskId(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-600"
              >
                <option value="">None (General Meeting)</option>
                {projectTasks.map((t) => (
                  <option key={t.id || t._id} value={t.id || t._id}>
                    {t.code} - {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Attendees / Participants Multi-Select (List design rows with checkboxes) */}
          <div>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
              <div className="flex items-center gap-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Select Attendees
                </label>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  {invitedCount} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllAttendees}
                  className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <button
                  type="button"
                  onClick={clearAllAttendees}
                  className="text-[10px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Conflict Warning Banner */}
            {conflictingAttendees.length > 0 && (
              <div className="mb-2 p-2.5 rounded-md border border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/60 text-[11px] text-amber-900 dark:text-amber-200 space-y-1.5 animate-in fade-in duration-150">
                <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Attendee Schedule Conflict ({conflictingAttendees.length} user{conflictingAttendees.length > 1 ? 's' : ''}):</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[10px] pl-1">
                  {conflictingAttendees.map((u) => {
                    const cMeeting = userConflictMap[String(u.id || u._id)]?.[0];
                    return (
                      <li key={u.id || u._id}>
                        <strong>{u.name}</strong> is in &ldquo;{cMeeting?.title || 'Another Meeting'}&rdquo; at {cMeeting?.time} ({cMeeting?.duration || '45 mins'})
                      </li>
                    );
                  })}
                </ul>
                <label className="flex items-center gap-2 pt-1 text-[10px] font-semibold text-amber-900 dark:text-amber-200 cursor-pointer border-t border-amber-200 dark:border-amber-800/80">
                  <input
                    type="checkbox"
                    checked={allowConflict}
                    onChange={(e) => setAllowConflict(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                  />
                  <span>Acknowledge conflict and proceed anyway</span>
                </label>
              </div>
            )}

            <div className="mb-1.5">
              <input
                type="text"
                value={attendeeSearch}
                onChange={(e) => setAttendeeSearch(e.target.value)}
                placeholder="Search users by name, role, or email..."
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Vertical List Design Rows with Checkboxes */}
            <div className="max-h-52 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
              {filteredUsers.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No users found matching “{attendeeSearch}”
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const uid = u.id || u._id;
                  const isSelected = isParticipantSelected(u);
                  const userConflicts = userConflictMap[String(uid)];
                  const hasConflict = userConflicts && userConflicts.length > 0;
                  const isCurrent = String(uid) === String(currentUserId);
                  return (
                    <label
                      key={uid}
                      className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                        isSelected
                          ? hasConflict
                            ? 'bg-amber-50/70 dark:bg-amber-950/30'
                            : 'bg-emerald-50/50 dark:bg-emerald-950/30'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleParticipant(u)}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 shrink-0 cursor-pointer"
                      />
                      <UserAvatar user={u} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {u.name}
                            {isCurrent && <span className="ml-1 text-[10px] text-slate-400 font-normal">(You)</span>}
                          </p>
                          {hasConflict && (
                            <span
                              className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shrink-0"
                              title={`Busy: "${userConflicts[0]?.title}" at ${userConflicts[0]?.time}`}
                            >
                              Busy / Conflict
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 truncate">
                          <span>{u.role || 'Member'}</span>
                          {u.email && <span>• {u.email}</span>}
                        </div>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              All selected attendees will immediately have access to this meeting and its video link.
            </p>
          </div>

          {/* Agenda & Description */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Agenda & Objectives
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="List agenda points, deliverables to review, or calibration goals..."
              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
            >
              {meetingToEdit ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {isSaving ? 'Saving...' : meetingToEdit ? 'Update Meeting' : 'Schedule Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
