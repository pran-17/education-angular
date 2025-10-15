import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema(
  {
    teacher_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
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

// Indexes are already defined in the schema above

export default mongoose.model('Teacher', teacherSchema);


