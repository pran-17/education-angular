## Education Backend (Express + Mongoose)

### Setup
1. Install dependencies:
   ```bash
   cd backend && npm install
   ```
2. Create `.env` from the example and set your MongoDB Atlas URI:
   ```bash
   copy .env.example .env
   # then edit .env
   ```

Example Atlas URI (replace placeholders):
```bash
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-name>.<id>.mongodb.net/education?retryWrites=true&w=majority&appName=<appName>
```

### Run
```bash
npm run dev
```

Server runs on `http://localhost:4000`.

### API
- `GET /api/health`

- Teachers
  - `GET /api/teachers`
  - `GET /api/teachers/:id`
  - `POST /api/teachers` { name, email, subject }
  - `PUT /api/teachers/:id`
  - `DELETE /api/teachers/:id`

- Students
  - `GET /api/students`
  - `GET /api/students/:id`
  - `POST /api/students` { name, email, rollNumber, className }
  - `PUT /api/students/:id`
  - `DELETE /api/students/:id`


