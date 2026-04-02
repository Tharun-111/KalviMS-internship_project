# 🎓 KalviMS – College ERP & LMS System

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing college academic activities including attendance, assignments, study materials, and student performance.

---

## 📁 Project Structure

```
kalvims/
├── backend/
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── cloudinary.js       # Cloudinary + Multer config
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── attendanceController.js
│   │   ├── assignmentController.js
│   │   ├── materialController.js
│   │   ├── marksController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js             # JWT protect + role authorize
│   │   └── errorHandler.js     # Global error handler
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Attendance.js
│   │   ├── Assignment.js
│   │   ├── Submission.js
│   │   ├── Material.js
│   │   └── Marks.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── courses.js
│   │   ├── attendance.js
│   │   ├── assignments.js
│   │   ├── materials.js
│   │   ├── marks.js
│   │   └── users.js
│   ├── seed.js                 # Database seeder
│   ├── server.js               # Entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── axios.js        # Axios instance with JWT interceptor
    │   │   └── services.js     # All API service functions
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── Modal.jsx
    │   │   ├── PageHeader.jsx
    │   │   ├── StatCard.jsx
    │   │   └── Spinner.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx  # Auth state management
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── admin/
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── Courses.jsx
    │   │   │   ├── Users.jsx
    │   │   │   └── Marks.jsx
    │   │   ├── teacher/
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── Courses.jsx
    │   │   │   ├── Attendance.jsx
    │   │   │   ├── Assignments.jsx
    │   │   │   ├── Materials.jsx
    │   │   │   └── Marks.jsx
    │   │   └── student/
    │   │       ├── Dashboard.jsx
    │   │       ├── Courses.jsx
    │   │       ├── Attendance.jsx
    │   │       ├── Assignments.jsx
    │   │       ├── Materials.jsx
    │   │       └── Marks.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── vercel.json
    └── package.json
```

---

## ⚙️ Prerequisites

- Node.js v18+
- npm v9+
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier works)

---

## 🚀 Local Setup

### Step 1 – Clone & navigate

```bash
git clone https://github.com/yourusername/kalvims.git
cd kalvims
```

### Step 2 – Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your real values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/kalvims
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

### Step 3 – Seed the database

```bash
node seed.js
```

This creates:
- `admin@kalvims.com` / `admin123` (Admin)
- `teacher@kalvims.com` / `teacher123` (Teacher)
- `student@kalvims.com` / `student123` (Student)
- `bob@kalvims.com` / `student123` (Student)
- 3 sample courses

### Step 4 – Start backend

```bash
npm run dev     # development (nodemon)
# or
npm start       # production
```

Backend runs at: `http://localhost:5000`

### Step 5 – Frontend setup

```bash
cd ../frontend
npm install
cp .env.example .env
# .env already has VITE_API_URL=/api which proxies to localhost:5000
```

### Step 6 – Start frontend

```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 📡 API Reference

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register student/teacher |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Private | Get current user |
| POST | `/api/auth/create-user` | Admin | Create any role user |

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users` | Admin | Get all users (filter by ?role=) |
| GET | `/api/users/stats` | Admin | Get dashboard stats |
| PUT | `/api/users/:id` | Admin | Update user |
| DELETE | `/api/users/:id` | Admin | Delete user |

### Courses
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/courses` | All | Get courses (role-filtered) |
| POST | `/api/courses` | Admin | Create course |
| PUT | `/api/courses/:id` | Admin | Update course |
| DELETE | `/api/courses/:id` | Admin | Delete course |
| PUT | `/api/courses/:id/assign-teacher` | Admin | Assign teacher |
| PUT | `/api/courses/:id/enroll` | Admin | Enroll student |
| PUT | `/api/courses/:id/unenroll` | Admin | Unenroll student |

### Attendance
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/attendance` | Teacher/Admin | Mark attendance |
| GET | `/api/attendance/course/:id` | Teacher/Admin | Course attendance |
| GET | `/api/attendance/student/:id` | Any | Student attendance % |

### Assignments
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/assignments` | All | Get assignments (role-filtered) |
| POST | `/api/assignments` | Teacher/Admin | Create assignment |
| POST | `/api/assignments/:id/submit` | Student | Submit file |
| GET | `/api/assignments/:id/submissions` | Teacher/Admin | View submissions |
| PUT | `/api/assignments/submissions/:id/grade` | Teacher/Admin | Grade submission |
| GET | `/api/assignments/my-submissions` | Student | My submissions |

### Materials
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/materials` | All | Get materials (role-filtered) |
| POST | `/api/materials` | Teacher/Admin | Upload material |
| DELETE | `/api/materials/:id` | Teacher/Admin | Delete material |

### Marks
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/marks/me` | Student | Get my marks |
| GET | `/api/marks/course/:id` | Teacher/Admin | Course marks |
| GET | `/api/marks/student/:id` | Any | Student marks |
| POST | `/api/marks` | Teacher/Admin | Add/update marks |

---

## ☁️ Deployment

### MongoDB Atlas
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. Add a database user and copy the connection string
4. Whitelist IP: `0.0.0.0/0` (all IPs) for Render deployment

### Cloudinary
1. Go to [cloudinary.com](https://cloudinary.com) → Sign up free
2. Go to Dashboard → copy Cloud Name, API Key, API Secret

### Backend → Render
1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo
3. Set **Root Directory**: `backend`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node server.js`
6. Add all environment variables from `.env.example`
7. Deploy → copy the URL (e.g., `https://kalvims-api.onrender.com`)

### Frontend → Vercel
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Set **Root Directory**: `frontend`
4. Add environment variable:
   ```
   VITE_API_URL = https://kalvims-api.onrender.com/api
   ```
5. Deploy

---

## 👥 User Roles & Permissions

| Feature | Admin | Teacher | Student |
|---------|-------|---------|---------|
| Create courses | ✅ | ❌ | ❌ |
| Assign teachers | ✅ | ❌ | ❌ |
| Enroll students | ✅ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ |
| Mark attendance | ✅ | ✅ (own courses) | ❌ |
| View attendance | ✅ | ✅ | ✅ (own) |
| Create assignments | ✅ | ✅ (own courses) | ❌ |
| Submit assignments | ❌ | ❌ | ✅ |
| Grade submissions | ✅ | ✅ | ❌ |
| Upload materials | ✅ | ✅ | ❌ |
| Download materials | ✅ | ✅ | ✅ |
| Enter marks | ✅ | ✅ (own courses) | ❌ |
| View marks | ✅ | ✅ | ✅ (own) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| HTTP | Axios |
| Charts | Recharts |
| Icons | Lucide React |
| Toasts | React Hot Toast |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) |
| Passwords | bcryptjs |
| File Upload | Multer + Cloudinary |
| Dev Server | Nodemon |

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📝 License

MIT — free to use and modify.
