import mongoose from 'mongoose';

const personalTodoSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    userEmail: { type: String, default: '', index: true },
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
    category: {
      type: String,
      enum: ['Focus', 'Quick Win', 'Follow-up', 'Prep', 'Review'],
      default: 'Focus'
    }
  },
  { timestamps: true }
);

export const PersonalTodo =
  mongoose.models.PersonalTodo || mongoose.model('PersonalTodo', personalTodoSchema);
