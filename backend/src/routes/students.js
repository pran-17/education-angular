import { Router } from 'express';
import Student from '../models/Student.js';
import bcrypt from 'bcryptjs';

const router = Router();

router.get('/', async (req, res) => {
  const items = await Student.find().lean();
  // Map className -> class for frontend compatibility
  const mapped = items.map((s) => ({ ...s, class: s.className }));
  res.json(mapped);
});

router.get('/:id', async (req, res) => {
  const item = await Student.findById(req.params.id).lean();
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json({ ...item, class: item.className });
});

router.post('/', async (req, res) => {
  const { password, class: classInput, ...data } = req.body;
  const passwordHash = await bcrypt.hash(password || '', 10);
  const created = await Student.create({ ...data, className: classInput, passwordHash });
  const createdObj = created.toObject();
  res.status(201).json({ ...createdObj, class: createdObj.className });
});

router.put('/:id', async (req, res) => {
  const { password, ...data } = req.body;
  const update = { ...data };
  if (password) update.passwordHash = await bcrypt.hash(password, 10);
  const updated = await Student.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!updated) return res.status(404).json({ message: 'Not found' });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const deleted = await Student.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  res.json({ success: true });
});

// Student login by email + student_id + password
router.post('/login', async (req, res) => {
  const { email, student_id, password } = req.body;
  const student = await Student.findOne({ email, student_id });
  if (!student) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password || '', student.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({
    _id: student._id,
    student_id: student.student_id,
    name: student.name,
    email: student.email,
    class: student.className,
    role: 'student'
  });
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const { password, class: classInput, ...data } = req.body;
    const update = { ...data };
    if (classInput) update.className = classInput;
    if (password) update.passwordHash = await bcrypt.hash(password, 10);
    const updated = await Student.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated) return res.status(404).json({ message: 'Student not found' });
    const updatedObj = updated.toObject();
    res.json({ ...updatedObj, class: updatedObj.className });
  } catch (error) {
    res.status(500).json({ message: 'Error updating student', error: error.message });
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Student not found' });
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting student', error: error.message });
  }
});

export default router;


