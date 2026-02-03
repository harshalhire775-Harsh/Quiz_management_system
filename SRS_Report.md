# SRS Summary - Quiz Management System

## 1. Introduction
QuizPro is a cutting-edge web application designed for interactive learning and assessment. It features a modern design and follows a role-based access model for Students and Administrators.

## 2. Functional Requirements
- **FR1: User Authentication**: Secure login/register with JWT.
- **FR2: Quiz Participation**: Students can browse and take timed quizzes.
- **FR3: Certificate Generation**: PDF certificate issued upon successful completion (>= 50% score).
- **FR4: Global Leaderboard**: Rankings based on points and accuracy.
- **FR5: Admin Dashboard**: 
    - Create and manage quizzes and questions.
    - View data analytics via visual charts.
    - Monitor platform usage.

## 3. Technical Stack
- **Frontend**: React, Vite, Recharts, jsPDF, Lucide Icons.
- **Backend**: Node.js, Express, MongoDB.
- **Security**: Bcrypt password hashing, JWT authorization headers.

## 4. UI/UX Design Goals
- Glassmorphic interface.
- Mobile-responsive layout.
- Engaging micro-animations (Framer Motion).
- High-contrast typography for readability.

---
*Created by Antigravity AI*
