# TeamChat – Full Stack Realtime Chat Application

A modern, full-stack chat application built as an internship assignment.  
Features include authentication, channels, real-time messaging, pagination, online users, and a clean UI.

---

## 🚀 Features

### ✅ User Authentication
- Register & Login using JWT  
- Password hashing using bcrypt  
- Protected routes using middleware  

### ✅ Channels
- Create channel  
- List all channels  
- Join channel  
- Store members of each channel  

### ✅ Realtime Messaging (Socket.io)
- Join channel room  
- Send & receive messages instantly  
- Broadcast messages only to room participants  

### ✅ Message Storage
- Messages stored in MongoDB  
- Pagination (20 messages per page)  
- Infinite scroll to load older messages  

### ✅ Optional + Bonus Features (Implemented)
- Online users indicator  
- Typing indicator  
- Seen delivery metadata  
- Smooth UI animations  
- Optimistic message rendering  
- Fully responsive UI  

---

## 🛠️ Tech Stack

### **Frontend**
- HTML5  
- CSS3 (modern gradient UI + animations)  
- Vanilla JavaScript  
- Socket.io Client  

### **Backend**
- Node.js  
- Express.js  
- MongoDB + Mongoose  
- Socket.io (server)  
- JWT Authentication  
- Bcrypt hashing  
- CORS  

### **Deployment**
- Hosted on a server with a public IP  
- Node backend running on port 8080  
- MongoDB Atlas as database  

---

## 📦 Requirements
- Node.js 18+  
- MongoDB Atlas connection string  
- Git  
- Any browser (Chrome recommended)  

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository**
     git clone https://github.com/Deepak-O5/teamchat-fullstack.git
     cd teamchat-fullstack
### 2️⃣ Clone Repository**
    cd Backend
    npm install  
### 3️⃣ Create .env file**
     MONGO_URI=your_mongo_atlas_connection
    JWT_SECRET=your_secret_key
     PORT=5000
### 4️⃣ Start Backend Server
     npm run dev

### 5️⃣ Start Frontend
    Frontend/index.html


git clone https://github.com/Deepak-O5/teamchat-fullstack.git
cd teamchat-fullstack
