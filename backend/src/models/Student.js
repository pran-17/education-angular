import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    student_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    rollNumber: { type: String },
    className: { type: String },
    section: { type: String },
    phone: { type: String },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    role: { type: String, default: 'student', enum: ['student'] },
  },
  { timestamps: true }
);

// Indexes are already defined in the schema above

export default mongoose.model('Student', studentSchema);


