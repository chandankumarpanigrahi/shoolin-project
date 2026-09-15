'use client';

import React, { useState } from 'react';
import { X, Video, Calendar, Clock, Link as LinkIcon, Plus, Flag } from 'lucide-react';

export function ScheduleMeetingModal({
  isOpen,
  onClose,
  projects,
  tasks,
  users,
  currentUser,
  onScheduleMeeting
}) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-09-18');
  const [time, setTime] = useState('11:00 AM');
  const [duration, setDuration] = useState('45 mins');
  const [priority, setPriority] = useState('Medium');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [relatedTaskId, setRelatedTaskId] = useState('');
  const [description, setDescription] = useState('');
  const [participants, setParticipants] = useState([currentUser.id, users[2]?.id || 'usr-3']);
  const [meetUrl, setMeetUrl] = useState('');

  if (!isOpen) return null;

  const projectTasks = tasks.filter(t => t.projectId === projectId);

  const toggleParticipant = (userId) => {
    if (participants.includes(userId)) {
      setParticipants(participants.filter(id => id !== userId));
    } else {
      setParticipants([...participants, userId]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newMeeting = {
      id: "mtg-" + Date.now(),
      title: title.trim(),
      requestedBy: currentUser.id,
      participants,
      meetUrl: meetUrl.trim() || null,
      date,
      time,
      duration,
      priority,
      projectId,
      relatedTaskId: relatedTaskId || null,
      description: description.trim() || "No agenda provided.",
      status: "Requested"
    };

    onScheduleMeeting(newMeeting);
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
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Schedule Team Meeting Sync</h3>
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
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-sm text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="10:30 AM"
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-sm text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-sm text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600 font-medium"
              >
                <option value="15 mins">15 mins</option>
                <option value="30 mins">30 mins</option>
                <option value="45 mins">45 mins</option>
                <option value="60 mins">60 mins</option>
                <option value="90 mins">90 mins</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-sm text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600 font-medium"
              >
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Project and Related Task */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-sm text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600 font-medium"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Related Task (Optional)</label>
              <select
                value={relatedTaskId}
                onChange={(e) => setRelatedTaskId(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-sm text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600 font-medium"
              >
                <option value="">-- No specific task --</option>
                {projectTasks.map(t => (
                  <option key={t.id} value={t.id}>{t.code} · {t.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Paste Custom Video Link */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Meeting Video Link <span className="text-slate-400 dark:text-slate-500 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="url"
                value={meetUrl}
                onChange={(e) => setMeetUrl(e.target.value)}
                placeholder="Paste existing Google Meet, Zoom, or Teams URL..."
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-sm font-mono text-[11px] text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600"
              />
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              Leave blank if meeting is in-person or link will be shared later
            </p>
          </div>

          {/* Participants Checklist */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Participants ({participants.length} invited)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-28 overflow-y-auto p-2 border border-slate-200 dark:border-slate-700 rounded-sm bg-slate-50/50 dark:bg-slate-800/40">
              {users.map(u => (
                <label key={u.id} className="flex items-center gap-2 p-1 hover:bg-white dark:hover:bg-slate-700/60 rounded-sm cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={participants.includes(u.id)}
                    onChange={() => toggleParticipant(u.id)}
                    className="rounded-xs text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate">{u.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Agenda & Objectives</label>
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
              <Plus className="w-3.5 h-3.5" />
              Schedule Meeting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
