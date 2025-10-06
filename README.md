# Smart Education System

A comprehensive Angular-based education management system with MongoDB backend.

## Features

- 🏠 **Home Dashboard**: Beautiful landing page with role-based navigation
- 👨‍💼 **Admin Panel**: Direct access to manage teachers, students, and timetables
- 👩‍🏫 **Teacher Dashboard**: Grade management, quiz creation, and student progress tracking
- 👨‍🎓 **Student Dashboard**: View grades, attendance, and take quizzes
- 📊 **Quiz System**: Interactive quiz creation and submission with QR codes
- 🔐 **Authentication**: Secure login system for teachers and students

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Angular CLI

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-eductionangular-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   ng serve
   ```

4. **Access the application**
   - Open your browser and navigate to `http://localhost:4200`
   - You'll see the home dashboard with three role options

## Usage

### Admin Access
- **Direct Access**: Click "Access Admin Panel" on the home dashboard
- **No Login Required**: Admin can directly manage the system
- **Features**: Add/remove teachers and students, manage timetables

### Teacher Access
- **Login Required**: Click "Login as Teacher" on the home dashboard
- **Credentials**: Use teacher email and teacher ID
- **Features**: Manage grades, create quizzes, track student progress

### Student Access
- **Login Required**: Click "Login as Student" on the home dashboard
- **Credentials**: Use student email and student ID
- **Features**: View grades, check attendance, take quizzes

## Technology Stack

- **Frontend**: Angular 20
- **Backend**: MongoDB with Mongoose
- **Authentication**: bcryptjs for password hashing
- **UI**: Custom CSS with modern design
- **QR Codes**: QR code generation for quiz sharing

## Database

The application uses MongoDB for data storage. See [MONGODB_SETUP.md](./MONGODB_SETUP.md) for detailed setup instructions.

### Collections
- Teachers
- Students
- Timetables
- Marks
- Attendance
- Quizzes
- Quiz Submissions

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── home/           # Home dashboard
│   │   ├── admin/          # Admin panel
│   │   ├── teacher/        # Teacher dashboard
│   │   ├── student/        # Student dashboard
│   │   ├── login/          # Login component
│   │   └── quiz/           # Quiz system
│   └── services/
│       └── mongodb.service.ts  # Database service
```

## Development

### Running in Development Mode
```bash
ng serve
```

### Building for Production
```bash
ng build --configuration production
```

### Running Tests
```bash
ng test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please refer to the documentation or create an issue in the repository.
