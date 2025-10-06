# MongoDB Setup Guide for Smart Education System

## Overview
The Smart Education System has been migrated from Supabase to MongoDB. This guide will help you set up and run the application with MongoDB.

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Angular CLI

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. MongoDB Setup Options

#### Option A: Local MongoDB Installation
1. Install MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update the connection string in the MongoDB service

#### Option C: Docker MongoDB
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 3. Database Configuration

The application uses an in-memory MongoDB simulation for development. For production, you'll need to:

1. Update `src/app/services/mongodb.service.ts`
2. Replace the mock collections with actual MongoDB connections
3. Use Mongoose for schema validation

### 4. Run the Application
```bash
ng serve
```

## Database Schema

### Collections Structure

#### Teachers Collection
```javascript
{
  _id: ObjectId,
  teacher_id: String,
  name: String,
  email: String,
  subject: String,
  password_hash: String,
  created_at: Date,
  created_by: String
}
```

#### Students Collection
```javascript
{
  _id: ObjectId,
  student_id: String,
  name: String,
  email: String,
  class: String,
  password_hash: String,
  created_at: Date,
  created_by: String
}
```

#### Timetables Collection
```javascript
{
  _id: ObjectId,
  subject_code: String,
  subject_name: String,
  credit_hours: Number,
  teacher_id: String,
  class: String,
  created_at: Date
}
```

#### Marks Collection
```javascript
{
  _id: ObjectId,
  student_id: String,
  subject_code: String,
  test1: Number,
  test2: Number,
  cat1: Number,
  mid_semester: Number,
  quiz_marks: Number,
  teacher_id: String,
  updated_at: Date
}
```

#### Attendance Collection
```javascript
{
  _id: ObjectId,
  student_id: String,
  subject_code: String,
  date: String,
  status: String,
  marked_via: String,
  created_at: Date
}
```

#### Quizzes Collection
```javascript
{
  _id: ObjectId,
  subject_code: String,
  teacher_id: String,
  class: String,
  quiz_code: String,
  questions: Array,
  active: Boolean,
  created_at: Date,
  expires_at: Date
}
```

#### Quiz Submissions Collection
```javascript
{
  _id: ObjectId,
  quiz_id: String,
  student_id: String,
  answers: Object,
  score: Number,
  submitted_at: Date
}
```

## Features

### Current Implementation
- ✅ In-memory data storage (development mode)
- ✅ User authentication and authorization
- ✅ Teacher, Student, and Admin dashboards
- ✅ Quiz creation and submission
- ✅ Marks and attendance management
- ✅ Timetable management

### Production Considerations
- Replace in-memory storage with actual MongoDB connections
- Implement proper error handling
- Add data validation with Mongoose schemas
- Set up database indexes for performance
- Implement data backup and recovery

## API Endpoints (Mock Implementation)

The current implementation simulates MongoDB operations. In production, you would have:

- `GET /api/teachers` - Get all teachers
- `POST /api/teachers` - Create new teacher
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `GET /api/timetables` - Get timetables
- `POST /api/timetables` - Create timetable
- `GET /api/marks/:studentId` - Get student marks
- `PUT /api/marks/:id` - Update marks
- `GET /api/attendance/:studentId` - Get student attendance
- `POST /api/quizzes` - Create quiz
- `GET /api/quizzes/:code` - Get quiz by code
- `POST /api/quiz-submissions` - Submit quiz

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string
   - Verify network access

2. **Authentication Issues**
   - Check user credentials
   - Verify password hashing
   - Ensure proper role assignment

3. **Data Not Persisting**
   - Current implementation uses in-memory storage
   - Data will reset on application restart
   - Implement proper MongoDB connection for persistence

## Migration from Supabase

The following changes were made during migration:

1. **Service Layer**: Replaced `SupabaseService` with `MongoDBService`
2. **Data Models**: Updated interfaces to use MongoDB `_id` instead of `id`
3. **Authentication**: Maintained same authentication flow
4. **Components**: Updated all components to use new service
5. **Dependencies**: Replaced Supabase client with Mongoose

## Next Steps

1. Set up actual MongoDB database
2. Implement Mongoose schemas
3. Add data validation
4. Set up production environment
5. Implement data backup strategy
6. Add monitoring and logging

## Support

For issues or questions regarding the MongoDB integration, please refer to:
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Angular Documentation](https://angular.io/docs)

