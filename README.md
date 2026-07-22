# TeamSync - Multi-Tenant Collaborative Web Application

TeamSync is a full-stack collaboration platform that helps teams communicate, manage tasks, and track project progress efficiently. The application provides secure authentication, team management, real-time communication, and role-based task assignment.

## 🚀 Features

- User Authentication (JWT)
- Create and Join Teams
- Group Chat
- Private Chat
- Kanban Task Board
- Drag & Drop Task Tracking
- Role-Based Access Control (Admin & Member)
- Task Assignment
- My Tasks Dashboard
- User Profile & Progress Statistics
- Dark & Light Theme
- Responsive UI

## 🛠️ Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Socket.io

## 📂 Project Structure

```
multi-tenant-collaboration-platform/
│
├── multi-tenant-frontend/
│   ├── app/
│   ├── components/
│   ├── context/
│   └── lib/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── config/
│
└── README.md
```

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/your-username/multi-tenant-collaboration-platform.git
```

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd multi-tenant-frontend
npm install
npm run dev
```

## Environment Variables

Create a `.env` file in the backend folder.

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```
