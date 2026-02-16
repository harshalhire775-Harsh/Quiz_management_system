# Quiz Management System - Project Guide (Simple Language)

## 1. Kaise Kaam Karta Hai (The Review) 🔄
Yeh pura system 3 hisson mein bata hua hai:
1.  **Frontend (React)**: Jo aap screen par dekhte hain (Button, Forms, Design).
2.  **Backend (Node.js)**: Jo piche logic chalata hai (Password check karna, Calculation karna).
3.  **Database (MongoDB)**: Jahan saara data hamesha ke liye save hota hai.

---

## 2. Backend Files (Dimag/Brain) 🧠
**Location:** `backend/src`

Backnd ka kaam hai request lena, process karna aur jawab dena.

### A. Entry Points (Shuruat) 🚪
-   **`server.js`**: Yeh **Gadi ki Chabi (Ignition)** hai. Jab aap `npm run dev` karte hain, toh sabse pehle yeh file chalti hai. Yeh Database connect karti hai aur server start karti hai.
-   **`app.js`**: Yeh **Traffic Police** hai. Yeh aane wali requests ko sahi Raste (Route) par bhejta hai. (e.g. "Login wali request `authRoutes` ke paas jao").

### B. Models (Data Ka Dhancha/Blueprints) 📝
Is folder mein hum define karte hain ki data kaisa dikhega.
-   **`userModel.js`**: User kaisa hoga? (Uska Name, Email, Password, Role, CollegeId).
-   **`quizModel.js`**: Quiz kaisa hoga? (Title, Questions, Timer, Marks).
-   **`resultModel.js`**: Result kaisa hoga? (Score, Student ID, Date).
-   **`departmentModel.js`**: College aur Departments ki structure.

### C. Controllers (Asli Kaam Karne Wale/Chefs) 👨‍🍳
Yeh woh files hain jahan **Asli Code Logic** likha hai.
-   **`authController.js`**: Login aur Register sambhalta hai. Password sahi hai ya nahi, Token banana – sab yahi karta hai.
-   **`quizController.js`**: Quiz banana, delete karna, update karna. Yahi woh file hai jisme humne **"College Isolation"** logic lagaya hai.
-   **`userController.js`**: Students aur Teachers ko manage karna. (Bulk Register, Block User, Delete User).
-   **`resultController.js`**: Exam submit hone par marks calculate karna aur result save karna.

### D. Routes (Rasta Dikhane Wale/Waiters) 🗺️
Frontend se request aati hai, toh Routes usse sahi Controller tak le jate hain.
-   **`authRoutes.js`**: `/login`, `/register` -> `authController`.
-   **`quizRoutes.js`**: `/create-quiz`, `/get-quizzes` -> `quizController`.

### E. Middleware (Security Guard) 👮‍♂️
-   **`authMiddleware.js`**: Yeh **Security Guard** hai. Har request pe check karta hai:
    -   "Kya user logged in hai?" (Token check).
    -   "Kya user Admin hai?" (Role check).
    -   Agar token galat hai, toh wahi rok deta hai (401 Error).

---

## 3. Frontend Files (Chehra/Face) 🎨
**Location:** `frontend/src`

Frontend ka kaam hai User se baat karna aur data dikhana.

-   **`App.jsx`**: Yeh puri website ka **Naksha (Map)** hai. Yahan decide hota hai ki kis Link par kaunsa Page khulega.
-   **`api/axios.js`**: Yeh **Telephone Wire** hai. Frontend iske zariye Backend se baat karta hai.

### Pages (Screens) 🖥️
-   **`Login.jsx` / `Register.jsx`**: Login aur Signup ke forms.
-   **`StudentDashboard.jsx`**: Student ka main page jahan Quizzes dikhte hain.
-   **`TeacherDashboard.jsx`**: Teacher ka main page jahan woh Quiz bana sakte hain.
-   **`QuizStart.jsx`**: Yeh woh page hai jahan Student actual exam deta hai.
-   **`ManageUsers.jsx`**: Admin ka page Students add/delete karne ke liye.

---

## 4. Ek Example Flow: "Ek Quiz Kaise Banta Hai?" 🔄
1.  **Teacher (Frontend)**: `CreateQuiz.jsx` page par form bharta hai aur "Create" button dabata hai.
2.  **Phone Call (API)**: `axios.js` data lekar Backend ke paas jata hai.
3.  **Guard (Middleware)**: `authMiddleware.js` check karta hai – "Kya yeh sach mein Teacher hai?". Haan hai.
4.  **Chef (Controller)**: `quizController.js` (creator) data leta hai, usme **College ID** stamp karta hai, aur Database mein save kar deta hai.
5.  **Database**: MongoDB data store kar leta hai.
6.  **Reply**: Backend bolta hai "Success!", aur Frontend par "Quiz Created" ka popup aata hai.

Is tarah har file ka apna-apna distinct role hai aur sab mil kar ek system banate hain! 🚀
