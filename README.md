# Marketplace Jewellery Backend

This is a modular backend for a marketplace jewelry platform built with Node.js, TypeScript, and MongoDB. It supports master-level CRUD operations, image uploads, email notifications, and basic authentication.

## 📦 Tech Stack

- Node.js + Express + TypeScript
- MongoDB + Mongoose
- Redis (ioredis)
- AWS S3 (file uploads)
- AWS SES (email service)
- Twilio (SMS OTP)
- JWT-based Authentication
- Docker, Jest for testing

## 📁 Project Structure

- `controllers/`: Organized by domain (Product, Category, User, etc.)
- `models/`: Mongoose schemas for each module
- `routes/`: Route grouping for each domain
- `middlewares/`: Auth, error handler, multer, rate limiter
- `config/`: AWS, DB, Twilio config files
- `utils/`: Common helpers, file uploads, rate calculation

## 🚧 Work In Progress

This project is still under development. The following features are pending:

- Role-Based Access Control (RBAC)
- Order Placement
- Cart & Wishlist Workflow
- Payment Gateway Integration (e.g., Razorpay/Stripe)
