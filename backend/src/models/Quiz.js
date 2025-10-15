import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    subject_code: { type: String, required: true },
    teacher_id: { type: String, required: true },
    class: { type: String, required: true },
    quiz_code: { type: String, required: true },
    questions: [{
      question: { type: String, required: true },
      options: [{ type: String, required: true }],
      correctAnswer: { type: Number, required: true, min: 0, max: 3 }
    }],
    active: { type: Boolean, default: true },
    expires_at: { type: Date },
    created_by: { type: String },
  },
  { timestamps: true }
);

quizSchema.index({ quiz_code: 1 }, { unique: true });
quizSchema.index({ teacher_id: 1 });
quizSchema.index({ class: 1 });
quizSchema.index({ active: 1 });

export default mongoose.model('Quiz', quizSchema);
