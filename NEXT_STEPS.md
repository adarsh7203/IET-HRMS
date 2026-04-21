# 🚀 IET HRMS v2 - Next Steps Guide

Congratulations! Your Multi-Department Human Resource Management System is now fully built. Follow these steps to get everything running and start using the platform.

---

## 🛠 Step 1: Start the Backend Server
1. Open a terminal in the `backend/` folder.
2. Ensure your `.env` file has the correct Supabase `DATABASE_URL`.
3. Run the following command:
   ```powershell
   uvicorn main:app --reload
   ```
4. **Verification**: Open `http://localhost:8000/docs` in your browser. If you see the Swagger UI, the backend is live!

---

## 💻 Step 2: Start the Frontend App
1. Open a **new** terminal in the `frontend/` folder.
2. Run the following command:
   ```powershell
   npm run dev
   ```
3. **Verification**: Open `http://localhost:5173` in your browser. You should see the Login Page.

---

## 🔑 Step 3: Create Your First Super Admin
Since the database starts empty, you need to create your first "Master" account:
1. Go to the **Backend Docs**: `http://localhost:8000/docs`.
2. Find the `POST /api/auth/register` endpoint.
3. Click **"Try it out"** and enter your details.
   - **IMPORTANT**: Set the `role` field to `super_admin`.
   - Set `department_id` to `1` (or leave as is for now).
4. Click **Execute**. Your account is now created!

---

## 🧪 Step 4: Testing the Workflow (The "Happy Path")
Follow this sequence to test the entire system:

1. **Login as Super Admin**: Use the email/password you just created at `http://localhost:5173`.
2. **Create a Department**: Go to the **Departments** page and add one (e.g., "Computer Science").
3. **Create a Staff Member**: Go to **Employees** and register a new person.
   - Assign them the `staff` role.
   - Select the "Computer Science" department you just created.
4. **Logout & Login as Staff**: Use the staff credentials.
   - **Mark Attendance**: Click "Mark Present".
   - **Apply Leave**: Fill out the leave form.
5. **Login as HOD**: (Create an employee with `hod` role first).
   - View the pending leave request and **Approve** it.

---

## 📁 Project Structure Recap
- `backend/`: FastAPI logic, Supabase connection, and role-based routes.
- `frontend/src/pages/`: Modular folders containing `.jsx` and `.css` for every feature.
- `frontend/src/context/`: Authentication and user state management.

---

## 🆘 Troubleshooting
- **Connection Refused**: Ensure your Supabase database is active and the password in `.env` is correct.
- **Login Failed**: Check the terminal output in the backend to see if there's an error message.
- **Page Not Found**: Make sure you are running `npm run dev` from the `frontend/` folder.

**Happy Coding! 🚀**
