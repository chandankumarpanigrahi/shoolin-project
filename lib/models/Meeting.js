import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    requestedBy: { type: String, required: true },
    participantIds: [{ type: String }],
    meetUrl: { type: String, required: true }, // Direct Google Meet / Teams / Zoom link
    date: { type: String, required: true, index: true },
    duration: { type: String, default: '30m' },
    priority: { type: String, default: 'Medium' },
    projectId: { type: String, index: true },
    relatedTaskId: { type: String },
    description: { type: String, default: '' },
    status: { type: String, default: 'Scheduled' },
  },
  { timestamps: true }
);

meetingSchema.index({ participantIds: 1, date: 1 });

export const Meeting = mongoose.models.Meeting || mongoose.model('Meeting', meetingSchema);
