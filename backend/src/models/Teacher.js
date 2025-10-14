import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema(
  {
    teacher_id: { type: String, required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    subject: { type: String },
    department: { type: String },
    phone: { type: String },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    role: { type: String, default: 'teacher', enum: ['teacher'] },
  },
  { timestamps: true }
);

teacherSchema.index({ email: 1 }, { unique: true });
teacherSchema.index({ teacher_id: 1 }, { unique: false });

export default mongoose.model('Teacher', teacherSchema);


