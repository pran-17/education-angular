import { Router } from 'express';
import Teacher from '../models/Teacher.js';
import bcrypt from 'bcryptjs';

const router = Router();

router.get('/', async (req, res) => {
  const items = await Teacher.find().lean();
  res.json(items);
});

router.get('/:id', async (req, res) => {
  const item = await Teacher.findById(req.params.id).lean();
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
});

router.post('/', async (req, res) => {
  const { password, ...data } = req.body;
  const passwordHash = await bcrypt.hash(password || '', 10);
  const created = await Teacher.create({ ...data, passwordHash });
  res.status(201).json(created);
});

router.put('/:id', async (req, res) => {
  const { password, ...data } = req.body;
  const update = { ...data };
  if (password) update.passwordHash = await bcrypt.hash(password, 10);
  const updated = await Teacher.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!updated) return res.status(404).json({ message: 'Not found' });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const deleted = await Teacher.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  res.json({ success: true });
});

// Teacher login by email + teacher_id + password
router.post('/login', async (req, res) => {
  const { email, teacher_id, password } = req.body;
  const teacher = await Teacher.findOne({ email, teacher_id });
  if (!teacher) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password || '', teacher.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({
    _id: teacher._id,
    teacher_id: teacher.teacher_id,
    name: teacher.name,
    email: teacher.email,
    subject: teacher.subject,
    role: 'teacher'
  });
});

// Update teacher
router.put('/:id', async (req, res) => {
  try {
    const { password, ...data } = req.body;
    const update = { ...data };
    if (password) update.passwordHash = await bcrypt.hash(password, 10);
    const updated = await Teacher.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated) return res.status(404).json({ message: 'Teacher not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating teacher', error: error.message });
  }
});

// Delete teacher
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Teacher.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Teacher not found' });
    res.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting teacher', error: error.message });
  }
});

export default router;


