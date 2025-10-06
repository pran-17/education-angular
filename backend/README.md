# Smart Education Backend (Portable)

This is a portable Node/Express backend that stores data in a local JSON file by default, so it works on any laptop without extra setup. Optionally, you can later connect to MongoDB Atlas by setting `MONGODB_URI` in `.env` (scaffold in place to extend).

## Quick Start

1) Install dependencies

```bash
cd backend
npm install
```

2) Create env (optional)

```bash
# Windows PowerShell
cp .env.example .env
# Edit PORT if needed
```

3) Run server

```bash
npm start
# Server on http://localhost:3001
```

## API Overview
- GET /api/health
- Teachers: GET/POST /api/teachers
- Students: GET/POST /api/students
- Timetables: GET/POST /api/timetables
- Marks: GET /api/marks/student/:studentId, GET /api/marks/teacher/:teacherId, POST /api/marks, PATCH /api/marks/:id
- Attendance: GET /api/attendance/student/:studentId, POST /api/attendance
- Quizzes: POST /api/quizzes, GET /api/quizzes/code/:code, GET /api/quizzes/teacher/:teacherId, GET /api/quizzes/class/:class, POST /api/quizzes/:quizId/submissions

Data persists in `backend/data/db.json`.
