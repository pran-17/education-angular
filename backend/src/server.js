import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import teachersRouter from './routes/teachers.js';
import studentsRouter from './routes/students.js';
import quizzesRouter from './routes/quizzes.js';
import quizSubmissionsRouter from './routes/quiz-submissions.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('Environment variable MONGODB_URI is not set.');
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/teachers', teachersRouter);
app.use('/api/students', studentsRouter);
app.use('/api/quizzes', quizzesRouter);
app.use('/api/quiz-submissions', quizSubmissionsRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`🚀 Server listening on http://localhost:${port}`);
});


