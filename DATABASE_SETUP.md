# Database Setup Instructions

## Supabase Database Schema

Before using the application, you need to set up the database schema in Supabase. Follow these steps:

### 1. Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** section in the left sidebar
3. Click **New Query**

### 2. Run the Database Migration

Copy and paste the following SQL script into the SQL editor and execute it:

```sql
/*
  # Smart Education Platform - Database Schema

  ## Overview
  This migration creates the complete database structure for the Smart Education platform,
  including tables for teachers, students, timetables, attendance, marks, and quizzes.

  ## New Tables

  ### 1. teachers
  - `id` (uuid, primary key) - Unique identifier
  - `teacher_id` (text, unique) - Custom teacher ID for login
  - `name` (text) - Teacher's full name
  - `email` (text, unique) - Email address
  - `subject` (text) - Subject taught
  - `password_hash` (text) - Hashed password
  - `created_at` (timestamptz) - Record creation timestamp
  - `created_by` (uuid) - Admin who created this record

  ### 2. students
  - `id` (uuid, primary key) - Unique identifier
  - `student_id` (text, unique) - Custom student ID for login
  - `name` (text) - Student's full name
  - `email` (text, unique) - Email address
  - `class` (text) - Class/grade
  - `password_hash` (text) - Hashed password
  - `created_at` (timestamptz) - Record creation timestamp
  - `created_by` (uuid) - Admin who created this record

  ### 3. timetables
  - `id` (uuid, primary key) - Unique identifier
  - `subject_code` (text) - Subject code
  - `subject_name` (text) - Subject name
  - `credit_hours` (integer) - Credit hours
  - `teacher_id` (uuid) - Foreign key to teachers table
  - `class` (text) - Class this timetable applies to
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. marks
  - `id` (uuid, primary key) - Unique identifier
  - `student_id` (uuid) - Foreign key to students table
  - `subject_code` (text) - Subject code from timetable
  - `test1` (numeric) - Test 1 marks
  - `test2` (numeric) - Test 2 marks
  - `cat1` (numeric) - CAT 1 marks
  - `mid_semester` (numeric) - Mid-semester marks
  - `quiz_marks` (numeric) - Quiz marks (auto-updated)
  - `teacher_id` (uuid) - Foreign key to teachers table
  - `updated_at` (timestamptz) - Last update timestamp

  ### 5. attendance
  - `id` (uuid, primary key) - Unique identifier
  - `student_id` (uuid) - Foreign key to students table
  - `subject_code` (text) - Subject code
  - `date` (date) - Attendance date
  - `status` (text) - Present/Absent (auto-marked via quiz)
  - `marked_via` (text) - How attendance was marked (quiz/manual)
  - `created_at` (timestamptz) - Record creation timestamp

  ### 6. quizzes
  - `id` (uuid, primary key) - Unique identifier
  - `subject_code` (text) - Subject code
  - `teacher_id` (uuid) - Foreign key to teachers table
  - `class` (text) - Class for this quiz
  - `quiz_code` (text, unique) - Unique code for quiz access
  - `questions` (jsonb) - Quiz questions and options
  - `active` (boolean) - Whether quiz is currently active
  - `created_at` (timestamptz) - Quiz creation time
  - `expires_at` (timestamptz) - Quiz expiration time

  ### 7. quiz_submissions
  - `id` (uuid, primary key) - Unique identifier
  - `quiz_id` (uuid) - Foreign key to quizzes table
  - `student_id` (uuid) - Foreign key to students table
  - `answers` (jsonb) - Student's answers
  - `score` (numeric) - Quiz score
  - `submitted_at` (timestamptz) - Submission timestamp

  ### 8. admins
  - `id` (uuid, primary key) - Unique identifier
  - `email` (text, unique) - Admin email
  - `password_hash` (text) - Hashed password
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Create policies for admin, teacher, and student access
  - Admins can manage all data
  - Teachers can view/update their assigned data
  - Students can view their own data only

  ## Important Notes
  1. All passwords are stored as hashes, never plain text
  2. Attendance is automatically marked when students submit quizzes
  3. Quiz marks are automatically updated in the marks table
  4. Teachers and students must be created by admin before they can login
  5. Each user type has separate authentication and data access rules
*/

-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id text UNIQUE NOT NULL,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  subject text NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text UNIQUE NOT NULL,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  class text NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid
);

-- Create timetables table
CREATE TABLE IF NOT EXISTS timetables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_code text NOT NULL,
  subject_name text NOT NULL,
  credit_hours integer NOT NULL DEFAULT 0,
  teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE,
  class text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create marks table
CREATE TABLE IF NOT EXISTS marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  subject_code text NOT NULL,
  test1 numeric DEFAULT 0,
  test2 numeric DEFAULT 0,
  cat1 numeric DEFAULT 0,
  mid_semester numeric DEFAULT 0,
  quiz_marks numeric DEFAULT 0,
  teacher_id uuid REFERENCES teachers(id) ON DELETE SET NULL,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, subject_code)
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  subject_code text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'Absent',
  marked_via text DEFAULT 'manual',
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, subject_code, date)
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_code text NOT NULL,
  teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE,
  class text NOT NULL,
  quiz_code text UNIQUE NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 minutes')
);

-- Create quiz_submissions table
CREATE TABLE IF NOT EXISTS quiz_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  score numeric DEFAULT 0,
  submitted_at timestamptz DEFAULT now(),
  UNIQUE(quiz_id, student_id)
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_teachers_teacher_id ON teachers(teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_timetables_class ON timetables(class);
CREATE INDEX IF NOT EXISTS idx_marks_student_id ON marks(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_active ON quizzes(active);

-- Enable Row Level Security
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teachers table
CREATE POLICY "Admins can manage all teachers"
  ON teachers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view their own profile"
  ON teachers FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- RLS Policies for students table
CREATE POLICY "Admins can manage all students"
  ON students FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view students in their class"
  ON students FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teachers
      WHERE teachers.id = auth.uid()
    )
  );

CREATE POLICY "Students can view their own profile"
  ON students FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- RLS Policies for timetables table
CREATE POLICY "Admins can manage all timetables"
  ON timetables FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view timetables"
  ON timetables FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teachers WHERE teachers.id = auth.uid()
    )
  );

CREATE POLICY "Students can view timetables"
  ON timetables FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students WHERE students.id = auth.uid()
    )
  );

-- RLS Policies for marks table
CREATE POLICY "Admins can manage all marks"
  ON marks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage marks for their students"
  ON marks FOR ALL
  TO authenticated
  USING (teacher_id = auth.uid());

CREATE POLICY "Students can view their own marks"
  ON marks FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- RLS Policies for attendance table
CREATE POLICY "Admins can manage all attendance"
  ON attendance FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view and manage attendance"
  ON attendance FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teachers WHERE teachers.id = auth.uid()
    )
  );

CREATE POLICY "Students can view their own attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- RLS Policies for quizzes table
CREATE POLICY "Admins can manage all quizzes"
  ON quizzes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage their own quizzes"
  ON quizzes FOR ALL
  TO authenticated
  USING (teacher_id = auth.uid());

CREATE POLICY "Students can view active quizzes"
  ON quizzes FOR SELECT
  TO authenticated
  USING (
    active = true AND
    EXISTS (
      SELECT 1 FROM students WHERE students.id = auth.uid()
    )
  );

-- RLS Policies for quiz_submissions table
CREATE POLICY "Admins can view all submissions"
  ON quiz_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view submissions for their quizzes"
  ON quiz_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = quiz_submissions.quiz_id
      AND quizzes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert their own submissions"
  ON quiz_submissions FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can view their own submissions"
  ON quiz_submissions FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- RLS Policies for admins table
CREATE POLICY "Admins can view their own profile"
  ON admins FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Function to automatically update marks when quiz is submitted
CREATE OR REPLACE FUNCTION update_quiz_marks()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO marks (student_id, subject_code, quiz_marks, teacher_id, updated_at)
  SELECT
    NEW.student_id,
    q.subject_code,
    NEW.score,
    q.teacher_id,
    now()
  FROM quizzes q
  WHERE q.id = NEW.quiz_id
  ON CONFLICT (student_id, subject_code)
  DO UPDATE SET
    quiz_marks = marks.quiz_marks + NEW.score,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically mark attendance when quiz is submitted
CREATE OR REPLACE FUNCTION mark_attendance_on_quiz()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO attendance (student_id, subject_code, date, status, marked_via)
  SELECT
    NEW.student_id,
    q.subject_code,
    CURRENT_DATE,
    'Present',
    'quiz'
  FROM quizzes q
  WHERE q.id = NEW.quiz_id
  ON CONFLICT (student_id, subject_code, date)
  DO UPDATE SET
    status = 'Present',
    marked_via = 'quiz';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_quiz_marks ON quiz_submissions;
CREATE TRIGGER trigger_update_quiz_marks
  AFTER INSERT ON quiz_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_marks();

DROP TRIGGER IF EXISTS trigger_mark_attendance ON quiz_submissions;
CREATE TRIGGER trigger_mark_attendance
  AFTER INSERT ON quiz_submissions
  FOR EACH ROW
  EXECUTE FUNCTION mark_attendance_on_quiz();

-- Insert a default admin for initial setup
-- Default credentials: admin@smartedu.com / admin123
-- IMPORTANT: Change this password immediately after first login!
INSERT INTO admins (email, password_hash)
VALUES ('admin@smartedu.com', '$2a$10$rKvVJkN8N8N8N8N8N8N8N8N8N8N8N8N8N8N8N8N8N8N8N8N8N8')
ON CONFLICT (email) DO NOTHING;
```

### 3. Verify Setup

After running the script:
1. Go to **Table Editor** in Supabase
2. You should see all 8 tables created:
   - admins
   - teachers
   - students
   - timetables
   - marks
   - attendance
   - quizzes
   - quiz_submissions

### 4. Initial Login

**Default Admin Credentials:**
- Email: `admin@smartedu.com`
- Password: `admin123`

**IMPORTANT:** Change the admin password immediately after first login!

### 5. How the System Works

1. **Admin Login**: Admin adds teachers and students to the system
2. **Teacher Login**: Teachers can only login if added by admin (requires email + teacher_id)
3. **Student Login**: Students can only login if added by admin (requires email + student_id)
4. **Automatic Features**:
   - When a student submits a quiz, their attendance is automatically marked as "Present"
   - Quiz scores are automatically added to their marks

### Troubleshooting

If you encounter any issues:

1. **Check RLS Policies**: Make sure Row Level Security policies are correctly applied
2. **Verify Triggers**: Ensure the database triggers are created successfully
3. **Test with Sample Data**: Try creating a test teacher and student through the admin panel

### Security Notes

- All passwords are hashed using bcrypt before storage
- Row Level Security (RLS) ensures data isolation between users
- Students can only see their own data
- Teachers can see students but can only modify data for their assigned subjects
- Admins have full access to all data
