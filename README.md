# eCommerce Application

## Introduction
This is an eCommerce application designed to provide a seamless shopping experience for users. It includes features such as user authentication, product browsing, rating and reviewing, and admin functionalities for managing products and users. This is my first website project, and it was very challenging. I hope it will please the users.

---

## Technologies Used
- **Frontend**: Next.js with TypeScript  
- **Backend**: Flask  
- **Database**: MongoDB Atlas  

---

## Login Instructions

### Regular User and Admin User
1. Navigate to the login page via the top-right login button.
2. Enter your username, email, and password.
3. Select whether you are an admin or a regular user using the checkbox.

---

## User Guide After Login

### For Regular Users
1. **Browse Products**: Navigate through categories. If you want to see the details, click the **"View Details"** button.  
   On the details page, users can see product information, add reviews, and give ratings.
2. **Account**: View your username, user role, average rating, and reviews.

### For Admin Users
1. **Browse Products**: Same as regular users—navigate through categories and view product details.
2. **Admin Settings**: Click the **Admin** button to access the admin panel.  
   From this page, admins can:
   - Add or remove products  
   - View and remove users  
   - Add new users  

---

## Why These Choices?

### Programming Language
I chose **Flask** because I was somewhat familiar with it thanks to my final project group members. The backend of our final project was also built using Flask, so I felt more comfortable using it.  
However, it turned out to be a difficult choice because I couldn't establish a proper Vercel deployment with Flask first.

I chose **Next.js** for the frontend because my research showed that deploying with Vercel would be much easier using it.

---

## Future Improvements
- Implementing a registration page

---

## Vercel URL
Because Vercel is primarily for frontend (Next.js) projects. So I could not directly deploy Flask on Vercel. Instead, I have deployed my Flask backend on a backend-friendly service like: Render!
It gave me a public URL: https://ecommerceapp-3ntu.onrender.com/  and I have set the environment variable in Vercel: Here is the link:
👉 [https://e-commerce-app-flax-ten.vercel.app/](https://e-commerce-app-flax-ten.vercel.app/)

## For running application

### Backend
- cd backend
- python -m venv venv
- source venv/bin/activate 
- pip install flask pymongo flask-cors python-dotenv

### Activate Backend
- cd backend
- source venv/bin/activate
- python3 app.py

### Frontend
- cd frontend
- npm install next react react-dom
- npm install react-icons
- npm install @vercel/fonts

### Activate Frontend 
- cd frontend
- npm run dev

