import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    student_id: { type: String, required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    rollNumber: { type: String, index: true },
    className: { type: String },
    section: { type: String },
    phone: { type: String },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    role: { type: String, default: 'student', enum: ['student'] },
  },
  { timestamps: true }
);

studentSchema.index({ email: 1 }, { unique: true });
studentSchema.index({ rollNumber: 1 }, { unique: false });
studentSchema.index({ student_id: 1 }, { unique: false });

export default mongoose.model('Student', studentSchema);


