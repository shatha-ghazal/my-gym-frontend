# My Gym Management System

A full-stack gym management web application built with **Angular, ASP.NET Core, and PostgreSQL**. The system simplifies gym operations by providing membership management, attendance tracking, payment records, trainer information, and administrative reporting.

## Features

- **User Authentication:** Secure registration and login using JWT authentication.
- **Role-Based Access:** Separate permissions for administrators, gym members, and regular users.
- **Dashboard:** User-friendly dashboard with role-specific navigation.
- **Membership Management:** Basic (AED 100), Standard (AED 250), and Premium (AED 800) plans.
- **Attendance Tracking:** Gym members can check in, check out, and view their attendance history.
- **Trainer Information:** Browse trainers and their specializations.
- **Payment Management:** Track membership payments and transaction records.
- **Admin Panel:** Manage gym members, payments, attendance, and reports.
- **Reports:** View membership statistics, revenue summaries, and attendance information.

## Technologies Used

| Layer | Technologies |
|---|---|
| Frontend | Angular 22, TypeScript, HTML, CSS |
| Backend | ASP.NET Core 10, C#, REST API |
| Database | PostgreSQL, Entity Framework Core, Neon |
| Authentication | JWT, Role-Based Authorization |
| Deployment | Vercel, Render |
| CI/CD | GitHub Actions, GitHub |

## User Roles

- **Admin:** Access to all management features, payments, member records, and reports.
- **Gym Member:** Access to memberships, trainers, personal profile, and attendance.
- **Regular User:** Browse trainers and membership plans, manage their profile, and subscribe to a membership.

## Admin Demo Credentials

For demonstration purposes:

- **Email:** `admin@gymmanagement.com`
- **Password:** `admin123`

## Live Application

**Frontend:** https://my-gym-frontend-three.vercel.app/login

**Backend API:** https://my-gym-backend-kzs7.onrender.com

## CI/CD

The project uses **GitHub Actions** for automated build verification, with automatic frontend deployment to **Vercel** and backend deployment to **Render**.

## Note

Membership checkout currently uses demonstration payments and does not process real financial transactions.
