import { Router } from 'express';
import Quiz from '../models/Quiz.js';

const router = Router();

// Get all quizzes
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find().lean();
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quizzes', error: error.message });
  }
});

// Get quiz by ID
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).lean();
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quiz', error: error.message });
  }
});

// Get quiz by code
router.get('/code/:code', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ quiz_code: req.params.code, active: true }).lean();
    if (!quiz) return res.status(404).json({ message: 'Quiz not found or inactive' });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quiz', error: error.message });
  }
});

// Create new quiz
router.post('/', async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Error creating quiz', error: error.message });
  }
});

// Update quiz
router.put('/:id', async (req, res) => {
  try {
    const updated = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Quiz not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating quiz', error: error.message });
  }
});

// Delete quiz
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Quiz.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Quiz not found' });
    res.json({ success: true, message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting quiz', error: error.message });
  }
});

// Get quizzes by teacher
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ teacher_id: req.params.teacherId }).lean();
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teacher quizzes', error: error.message });
  }
});

// Get active quizzes for class
router.get('/class/:className', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ class: req.params.className, active: true }).lean();
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching class quizzes', error: error.message });
  }
});

export default router;
