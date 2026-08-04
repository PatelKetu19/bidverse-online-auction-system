# BidVerse – Online Auction Management System

A full-stack **Online Auction Management System** built with **Node.js, Express.js, MongoDB, HTML, CSS, and JavaScript**. The platform provides a secure environment where sellers can list products, buyers can participate in auctions, and administrators can manage users, products, and auction activities.

---

## 📖 Overview

BidVerse is designed to simplify online auctions through a role-based system consisting of **Admin**, **Seller**, and **Buyer**. Sellers can upload auction items, buyers can place bids, and administrators can manage the platform efficiently.

---

## ✨ Features

### 🔐 Authentication
- User Registration
- Secure Login
- Password Hashing using bcryptjs
- Role-Based Access Control

### 👨‍💼 Admin
- Manage Users
- View Platform Dashboard
- Monitor Auctions
- Manage Products
- Control System Activities

### 🛍 Seller
- Add New Products
- Upload Product Images
- Edit Product Details
- Delete Products
- View Listed Products

### 💰 Buyer
- Browse Available Products
- Participate in Auctions
- Place Bids
- View Highest Bid
- Track Auction Status

### ⚡ Auction
- Online Bidding
- Highest Bid Tracking
- Product Auction Management
- Auction Status Updates

---

# 🛠 Technology Stack

## Frontend
- HTML5
- CSS3
- JavaScript

## Backend
- Node.js
- Express.js

## Database
- MongoDB
- Mongoose

## Authentication
- bcryptjs

## File Upload
- Multer

## Middleware
- CORS
- Body Parser

---

# 📂 Project Structure

```
project_v9
│
├── client
│   ├── admin.html
│   ├── buyer.html
│   ├── dashboard.html
│   ├── login.html
│   ├── register.html
│   └── seller.html
│
├── server
│   ├── models
│   │   ├── user.js
│   │   ├── product.js
│   │   └── bid.js
│   │
│   ├── uploads
│   ├── db.js
│   ├── server.js
│   ├── package.json
│   └── node_modules
│
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Install the following software:

- Node.js (v18 or later)
- MongoDB
- Git

---

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/PatelKetu19/bidverse-online-auction-system.git
```

### 2. Open Project

```bash
cd bidverse-online-auction-system/server
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure MongoDB

Open `db.js` and update your MongoDB connection string.

Example:

```javascript
mongoose.connect("mongodb://127.0.0.1:27017/bidverse");
```

or

```javascript
mongoose.connect("your_mongodb_atlas_connection_string");
```

### 5. Start the Server

```bash
npm start
```

Server runs on:

```
http://localhost:5000
```

*(Use the port configured in `server.js`.)*

---

# 📄 Available Pages

| Page | Description |
|------|-------------|
| login.html | User Login |
| register.html | User Registration |
| dashboard.html | Main Dashboard |
| admin.html | Admin Panel |
| seller.html | Seller Dashboard |
| buyer.html | Buyer Dashboard |

---

# 🗄 Database Models

### User
- Name
- Email
- Password
- Role

### Product
- Product Name
- Description
- Starting Price
- Image
- Seller

### Bid
- Bid Amount
- Product
- Buyer
- Timestamp

---

# 🔒 Security

- Password Encryption (bcryptjs)
- Role-Based Authorization
- Secure Authentication
- Protected Routes
- Input Validation

---

# 📸 Screenshots

Add screenshots inside a `screenshots` folder.

Example:

```
screenshots/
│
├── login.png
├── register.png
├── dashboard.png
├── seller.png
├── buyer.png
└── admin.png
```

Then display them like this:

```md
## Login Page

![Login](screenshots/login.png)
```

---

# 📦 Dependencies

- express
- mongoose
- bcryptjs
- multer
- cors
- body-parser

---

# 💡 Future Enhancements

- Real-Time Bidding using Socket.io
- Auction Countdown Timer
- Email Notifications
- OTP Verification
- Payment Gateway Integration
- Product Categories
- Search & Filters
- Wishlist
- User Profile Management
- Admin Analytics Dashboard
- Responsive Mobile Design

---

# 🎯 Learning Outcomes

This project demonstrates:

- Full Stack Web Development
- REST API Development
- MongoDB CRUD Operations
- MVC Concepts
- Authentication & Authorization
- Image Upload Handling
- Database Design
- Express.js Server Development

---

# 🤝 Contributing

Contributions are welcome!

1. Fork this repository
2. Create a new branch

```bash
git checkout -b feature-name
```

3. Commit changes

```bash
git commit -m "Added new feature"
```

4. Push

```bash
git push origin feature-name
```

5. Open a Pull Request

---

# 📜 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Ketukumar Prahaladbhai Patel**

Bachelor of Engineering (Information Technology)

Vishwakarma Government Engineering College (VGEC)

---

## ⭐ If you found this project useful, don't forget to give it a Star on GitHub!

```
⭐ Star this repository
🍴 Fork this repository
🐛 Report Issues
💡 Suggest Improvements
```
