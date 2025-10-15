import mongoose from 'mongoose';

const quizSubmissionSchema = new mongoose.Schema(
  {
    quiz_id: { type: String, required: true },
    student_id: { type: String, required: true },
    answers: { type: Object, required: true },
    score: { type: Number, required: true, min: 0 },
    submitted_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

quizSubmissionSchema.index({ quiz_id: 1 });
quizSubmissionSchema.index({ student_id: 1 });
quizSubmissionSchema.index({ submitted_at: -1 });

export default mongoose.model('QuizSubmission', quizSubmissionSchema);
