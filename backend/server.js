/* eslint-disable */
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Simple JSON file datastore (portable, no external DB required)
const dataDir = path.join(__dirname, 'data');
const dbFile = path.join(dataDir, 'db.json');

function ensureDatafile() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dbFile)) {
    const seed = {
      teachers: [],
      students: [],
      timetables: [],
      marks: [],
      attendance: [],
      quizzes: [],
      quizSubmissions: []
    };
    fs.writeFileSync(dbFile, JSON.stringify(seed, null, 2), 'utf8');
  }
}

function readDb() {
  ensureDatafile();
  return JSON.parse(fs.readFileSync(dbFile, 'utf8'));
}

function writeDb(db) {
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf8');
}

// Helpers
function nowIso() {
  return new Date().toISOString();
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development' });
});

// Teachers
app.get('/api/teachers', (req, res) => {
  const db = readDb();
  res.json(db.teachers.sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0)));
});

app.post('/api/teachers', (req, res) => {
  const db = readDb();
  const { teacher_id, name, email, subject, password } = req.body || {};
  if (!teacher_id || !name || !email || !subject) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const teacher = {
    _id: uuidv4(),
    teacher_id,
    name,
    email,
    subject,
    password_hash: password ? `hash:${Buffer.from(password).toString('base64')}` : undefined,
    created_at: nowIso()
  };
  db.teachers.push(teacher);
  writeDb(db);
  res.json(teacher);
});

// Students
app.get('/api/students', (req, res) => {
  const db = readDb();
  res.json(db.students.sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0)));
});

app.post('/api/students', (req, res) => {
  const db = readDb();
  const { student_id, name, email, class: className, password } = req.body || {};
  if (!student_id || !name || !email || !className) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const student = {
    _id: uuidv4(),
    student_id,
    name,
    email,
    class: className,
    password_hash: password ? `hash:${Buffer.from(password).toString('base64')}` : undefined,
    created_at: nowIso()
  };
  db.students.push(student);
  writeDb(db);
  res.json(student);
});

// Timetables
app.get('/api/timetables', (req, res) => {
  const db = readDb();
  res.json(db.timetables.sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0)));
});

app.post('/api/timetables', (req, res) => {
  const db = readDb();
  const { subject_code, subject_name, credit_hours, teacher_id, class: className } = req.body || {};
  if (!subject_code || !subject_name || !teacher_id || !className) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const t = {
    _id: uuidv4(),
    subject_code,
    subject_name,
    credit_hours: Number(credit_hours) || 0,
    teacher_id,
    class: className,
    created_at: nowIso()
  };
  db.timetables.push(t);
  writeDb(db);
  res.json(t);
});

// Marks
app.get('/api/marks/student/:studentId', (req, res) => {
  const db = readDb();
  res.json(db.marks.filter(m=>m.student_id===req.params.studentId));
});

app.get('/api/marks/teacher/:teacherId', (req, res) => {
  const db = readDb();
  const teacherMarks = db.marks.filter(m=>m.teacher_id===req.params.teacherId);
  // attach student info
  const withStudents = teacherMarks.map(m => {
    const s = db.students.find(s=>s.student_id===m.student_id);
    return { ...m, students: s ? { name: s.name, student_id: s.student_id, class: s.class } : undefined };
  });
  res.json(withStudents);
});

app.post('/api/marks', (req, res) => {
  const db = readDb();
  const m = { _id: uuidv4(), updated_at: nowIso(), ...(req.body||{}) };
  db.marks.push(m);
  writeDb(db);
  res.json(m);
});

app.patch('/api/marks/:id', (req, res) => {
  const db = readDb();
  const idx = db.marks.findIndex(m=>m._id===req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Marks not found' });
  db.marks[idx] = { ...db.marks[idx], ...(req.body||{}), updated_at: nowIso() };
  writeDb(db);
  res.json(db.marks[idx]);
});

// Attendance
app.get('/api/attendance/student/:studentId', (req, res) => {
  const db = readDb();
  const records = db.attendance
    .filter(a=>a.student_id===req.params.studentId)
    .sort((a,b)=>new Date(b.date)-new Date(a.date));
  res.json(records);
});

app.post('/api/attendance', (req, res) => {
  const db = readDb();
  const a = { _id: uuidv4(), created_at: nowIso(), ...(req.body||{}) };
  db.attendance.push(a);
  writeDb(db);
  res.json(a);
});

// Quizzes
app.post('/api/quizzes', (req, res) => {
  const db = readDb();
  const q = { _id: uuidv4(), created_at: nowIso(), ...(req.body||{}), active: req.body?.active!==false };
  db.quizzes.push(q);
  writeDb(db);
  res.json(q);
});

app.get('/api/quizzes/code/:code', (req, res) => {
  const db = readDb();
  const quiz = db.quizzes.find(q=>q.quiz_code===req.params.code && q.active);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  res.json(quiz);
});

app.get('/api/quizzes/teacher/:teacherId', (req, res) => {
  const db = readDb();
  const list = db.quizzes
    .filter(q=>q.teacher_id===req.params.teacherId)
    .sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  res.json(list);
});

app.get('/api/quizzes/class/:class', (req, res) => {
  const db = readDb();
  const list = db.quizzes
    .filter(q=>q.class===req.params.class && q.active)
    .sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  res.json(list);
});

app.post('/api/quizzes/:quizId/submissions', (req, res) => {
  const db = readDb();
  const submission = { _id: uuidv4(), submitted_at: nowIso(), quiz_id: req.params.quizId, ...(req.body||{}) };
  db.quizSubmissions.push(submission);
  writeDb(db);
  res.json(submission);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend server running on http://localhost:${PORT}`);
});


