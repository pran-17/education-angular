// MongoDB initialization script
db = db.getSiblingDB('education');

// Create collections
db.createCollection('teachers');
db.createCollection('students');
db.createCollection('timetables');
db.createCollection('marks');
db.createCollection('attendance');
db.createCollection('quizzes');
db.createCollection('quizsubmissions');
db.createCollection('admins');

// Create indexes for better performance
db.teachers.createIndex({ "teacher_id": 1 }, { unique: true });
db.teachers.createIndex({ "email": 1 }, { unique: true });
db.students.createIndex({ "student_id": 1 }, { unique: true });
db.students.createIndex({ "email": 1 }, { unique: true });
db.quizzes.createIndex({ "quiz_code": 1 }, { unique: true });
db.quizsubmissions.createIndex({ "quiz_id": 1, "student_id": 1 }, { unique: true });

// Insert default admin
db.admins.insertOne({
  email: "admin@smartedu.com",
  password_hash: "$2a$10$rKvVJkN8N8N8N8N8N8N8N8N8N8N8N8N8N8N8N8N8N8N8N8N8N8", // admin123
  created_at: new Date()
});

print("Database initialized successfully!");
