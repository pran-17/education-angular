import { Router } from 'express';
import QuizSubmission from '../models/QuizSubmission.js';

const router = Router();

// Get all submissions
router.get('/', async (req, res) => {
  try {
    const submissions = await QuizSubmission.find().lean();
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching submissions', error: error.message });
  }
});

// Get submission by ID
router.get('/:id', async (req, res) => {
  try {
    const submission = await QuizSubmission.findById(req.params.id).lean();
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching submission', error: error.message });
  }
});

// Create new submission
router.post('/', async (req, res) => {
  try {
    const submission = await QuizSubmission.create(req.body);
    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Error creating submission', error: error.message });
  }
});

// Get submissions by quiz
router.get('/quiz/:quizId', async (req, res) => {
  try {
    const submissions = await QuizSubmission.find({ quiz_id: req.params.quizId }).lean();
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quiz submissions', error: error.message });
  }
});

// Get submissions by student
router.get('/student/:studentId', async (req, res) => {
  try {
    const submissions = await QuizSubmission.find({ student_id: req.params.studentId }).lean();
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student submissions', error: error.message });
  }
});

export default router;
