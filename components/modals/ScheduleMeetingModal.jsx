'use client';

import React, { useState, useEffect } from 'react';
import { X, Video, Calendar, Clock, Link as LinkIcon, Plus, Check, Flag } from 'lucide-react';
import { UserAvatar } from '@/components/common/UserAvatar';

export function ScheduleMeetingModal({
  isOpen,
  onClose,
  projects = [],
  tasks = [],
  users = [],
  currentUser,
  meetingToEdit = null,
  onScheduleMeeting,
  onUpdateMeeting,
}) {
  const activeProjects = (projects || []).filter(
    (p) => p && !p.isDeleted && p.status !== 'Deleted'
  );

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-09-18');
  const [time, setTime] = useState('11:00');
  const [duration, setDuration] = useState('45 mins');
  const [priority, setPriority] = useState('Medium');
  const [projectId, setProjectId] = useState(activeProjects[0]?.id || '');
  const [relatedTaskId, setRelatedTaskId] = useState('');
  const [description, setDescription] = useState('');
  const [approverId, setApproverId] = useState('');
  const [participants, setParticipants] = useState(() => [
    currentUser?.id || currentUser?._id || 'admin-1',
  ]);
  const [optionalMembers, setOptionalMembers] = useState([]);
  const [meetUrl, setMeetUrl] = useState('');

  // Populate form if meetingToEdit is provided or reset
  useEffect(() => {
    if (meetingToEdit) {
      setTitle(meetingToEdit.title || '');
      setDate(meetingToEdit.date || '2026-09-18');
      setTime(meetingToEdit.time || '11:00');
      setDuration(meetingToEdit.duration || '45 mins');
      setPriority(meetingToEdit.priority || 'Medium');
      setProjectId(meetingToEdit.projectId || activeProjects[0]?.id || '');
      setRelatedTaskId(meetingToEdit.relatedTaskId || '');
      setDescription(meetingToEdit.description || '');
      setApproverId(meetingToEdit.approverId || '');
      setParticipants(
        meetingToEdit.participants || meetingToEdit.participantIds || [
          currentUser?.id || currentUser?._id || 'admin-1',
        ]
      );
      setOptionalMembers(
        meetingToEdit.optionalMembers || meetingToEdit.optionalMemberIds || []
      );
      setMeetUrl(meetingToEdit.meetUrl || '');
    } else {
      setTitle('');
      setDate('2026-09-18');
      setTime('11:00');
      setDuration('45 mins');
      setPriority('Medium');
      setProjectId(activeProjects[0]?.id || '');
      setRelatedTaskId('');
      setDescription('');
      const defaultApprover =
        users.find((u) => u.role === 'Super Admin' || u.role === 'Project Manager')?.id ||
        users.find((u) => u.role === 'Super Admin' || u.role === 'Project Manager')?._id ||
        users[0]?.id ||
        users[0]?._id ||
        '';
      setApproverId(defaultApprover);
      setParticipants([currentUser?.id || currentUser?._id || 'admin-1']);
      setOptionalMembers([]);
      setMeetUrl('');
    }
  }, [meetingToEdit, isOpen, currentUser]);

  if (!isOpen) return null;

  const projectTasks = tasks.filter((t) => t.projectId === projectId);

  const isParticipantSelected = (u) => {
    const ids = [u.id, u._id, u.email].filter(Boolean);
    return participants.some((pId) => ids.includes(pId));
  };

  const toggleParticipant = (u) => {
    const mainId = u.id || u._id || u.email;
    if (isParticipantSelected(u)) {
      setParticipants((prev) =>
        prev.filter((id) => id !== u.id && id !== u._id && id !== u.email)
      );
    } else {
      setParticipants((prev) => [...prev, mainId]);
    }
  };

  const invitedCount = users.filter(isParticipantSelected).length;

  const toggleOptionalMember = (userId) => {
    if (optionalMembers.includes(userId)) {
      setOptionalMembers(optionalMembers.filter((id) => id !== userId));
    } else {
      setOptionalMembers([...optionalMembers, userId]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (meetingToEdit) {
      const updates = {
        title: title.trim(),
        approverId,
        participants,
        participantIds: participants,
        optionalMembers,
        optionalMemberIds: optionalMembers,
        meetUrl: meetUrl.trim() || '',
        date,
        time,
        duration,
        priority,
        projectId,
        relatedTaskId: relatedTaskId || null,
        description: description.trim() || 'No agenda provided.',
      };
      if (onUpdateMeeting) {
        onUpdateMeeting(meetingToEdit.id || meetingToEdit._id, updates);
      }
    } else {
      const newMeeting = {
        id: 'mtg-' + Date.now(),
        title: title.trim(),
        requestedBy: currentUser?.id || currentUser?._id || 'admin-1',
        approverId,
        participants,
        participantIds: participants,
        optionalMembers,
        optionalMemberIds: optionalMembers,
        meetUrl: meetUrl.trim() || '',
        date,
        time,
        duration,
        priority,
        projectId,
        relatedTaskId: relatedTaskId || null,
        description: description.trim() || 'No agenda provided.',
        status: 'Pending Approval',
        isArchived: false,
      };

      if (onScheduleMeeting) {
        onScheduleMeeting(newMeeting);
      }
    }
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-100">
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
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
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
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-sm text-xs font-medium focus:outline-none focus:border-indigo-600 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Date, Time, Duration, Priority Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-sm text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Time</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-sm text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-sm text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:border-indigo-600"
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
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-sm text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:border-indigo-600"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Project & Related Task Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-sm text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:border-indigo-600"
              >
                <option value="">No Project Linked</option>
                {activeProjects.map((p) => (
                  <option key={p.id || p._id} value={p.id || p._id}>
                    {p.code} - {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Related Task / Milestone
              </label>
              <select
                value={relatedTaskId}
                onChange={(e) => setRelatedTaskId(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-sm text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:border-indigo-600"
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

          {/* Video Room Link */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Google Meet / Video Link
            </label>
            <div className="relative">
              <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="url"
                value={meetUrl}
                onChange={(e) => setMeetUrl(e.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij"
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-sm text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Approver Designation */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Designated Approver <span className="text-rose-500">*</span>
            </label>
            <select
              value={approverId}
              onChange={(e) => setApproverId(e.target.value)}
              required
              className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-sm text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
            >
              <option value="">Select Approver</option>
              {users.map((u) => (
                <option key={u.id || u._id} value={u.id || u._id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Only the creator and this approver can see the meeting until approved.
            </p>
          </div>

          {/* Attendees / Participants Multi-Select */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Attendees / Participants ({invitedCount} selected)
              </label>
              <span className="text-[10px] text-slate-500">Visible to them after approval</span>
            </div>
            <div className="max-h-32 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-sm p-2 grid grid-cols-2 gap-1.5 bg-slate-50/50 dark:bg-slate-800/50">
              {users.map((u) => {
                const isSelected = isParticipantSelected(u);
                return (
                  <label
                    key={u.id || u._id}
                    className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors text-[11px] ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleParticipant(u)}
                      className="sr-only"
                    />
                    <UserAvatar user={u} size="xs" />
                    <div className="truncate flex-1">
                      <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{u.name}</p>
                      <p className="text-[9px] text-slate-400 truncate">{u.role}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Agenda & Objectives
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="List agenda points, deliverables to review, or calibration goals..."
              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-sm text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium rounded-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-sm transition-colors flex items-center gap-1.5 shadow-sm"
            >
              {meetingToEdit ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {meetingToEdit ? 'Save Changes' : 'Schedule Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
