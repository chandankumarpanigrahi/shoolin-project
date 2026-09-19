import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    requestedBy: { type: String, required: true },
    requestedByName: { type: String, default: '' },
    requestedByEmail: { type: String, default: '' },
    approverId: { type: String, default: '', index: true },
    approverName: { type: String, default: '' },
    participantIds: [{ type: String }],
    participants: [{ type: String }],
    optionalMemberIds: [{ type: String }],
    optionalMembers: [{ type: String }],
    meetUrl: { type: String, default: '' }, // Direct Google Meet / Teams / Zoom link
    date: { type: String, required: true, index: true },
    time: { type: String, default: '10:00' },
    duration: { type: String, default: '45 mins' },
    priority: { type: String, default: 'Medium' },
    projectId: { type: String, index: true },
    relatedTaskId: { type: String },
    description: { type: String, default: '' },
    status: { type: String, default: 'Pending Approval', index: true }, // 'Pending Approval' | 'Approved' | 'Declined' | 'Rescheduled' | 'Archived'
    isArchived: { type: Boolean, default: false, index: true },
    archivedAt: { type: Date, default: null },
    approvedAt: { type: Date, default: null },
    rescheduleCount: { type: Number, default: 0 },
    comments: [
      {
        authorName: { type: String, default: '' },
        authorId: { type: String, default: '' },
        text: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

meetingSchema.index({ participantIds: 1, date: 1 });
meetingSchema.index({ requestedBy: 1, status: 1 });
meetingSchema.index({ approverId: 1, status: 1 });

export const Meeting = mongoose.models.Meeting || mongoose.model('Meeting', meetingSchema);
