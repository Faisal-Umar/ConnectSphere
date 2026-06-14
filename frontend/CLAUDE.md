# CLAUDE.md

# ConnectSphere

## Project Vision

ConnectSphere is a modern social-professional networking platform that combines:

* Social networking
* Real-time communication
* Project collaboration
* Community building
* AI-powered recommendations

The platform should feel like a fusion of:

* LinkedIn (professional networking)
* Discord (communities)
* WhatsApp (messaging)
* GitHub (collaboration)
* Notion (organization)

The goal is to provide a single ecosystem where users can connect, communicate, collaborate, and grow.

---

# Design Philosophy

## Core Principles

1. Clean Architecture
2. Scalable Backend
3. Responsive UI
4. Modern UX
5. Reusable Components
6. Real-Time Experience
7. AI-Ready Infrastructure

Every feature should follow:

* Simplicity
* Consistency
* Performance
* Accessibility

---

# Theme & Visual Identity

## Design Language

Theme Style:

* Futuristic
* Metallic
* Modern
* Premium
* Minimal

Inspired By:

* Apple
* Linear
* Notion
* Discord
* Tesla Dashboard

---

## Color System

### Dark Theme (Primary)

Background:
#0A0A0A

Surface:
#111111

Card:
#1A1A1A

Border:
#2A2A2A

Primary:
#4F8CFF

Accent:
#00E5FF

Success:
#22C55E

Warning:
#F59E0B

Danger:
#EF4444

Text:
#FFFFFF

Secondary Text:
#A1A1AA

---

### Light Theme

Background:
#FFFFFF

Surface:
#F8FAFC

Card:
#FFFFFF

Border:
#E2E8F0

Primary:
#2563EB

Accent:
#06B6D4

Text:
#111827

Secondary:
#6B7280

---

## UI Effects

Use:

* Glassmorphism
* Soft shadows
* Smooth animations
* Hover transitions
* Floating cards
* Gradient highlights

Avoid:

* Excessive neon
* Overly bright colors
* Heavy animations

---

# Application Architecture

## Architecture Pattern

Frontend:

Presentation Layer
↓
State Layer
↓
API Layer

Backend:

Routes
↓
Controllers
↓
Services
↓
Models
↓
MongoDB

---

# System Architecture

User
↓
React Frontend
↓
REST API
↓
Express Backend
↓
MongoDB

For Realtime:

User A
↓
Socket.IO Server
↓
User B

---

# Tech Stack

## Frontend

React.js

React Router

Axios

Context API

Tailwind CSS

Framer Motion

Socket.IO Client

---

## Backend

Node.js

Express.js

JWT

bcrypt

Multer

Socket.IO

---

## Database

MongoDB

Mongoose

---

# Folder Structure

client/
├── src/
│
├── components/
│
├── pages/
│
├── layouts/
│
├── hooks/
│
├── services/
│
├── context/
│
├── utils/
│
├── assets/
│
└── App.jsx

server/
├── controllers/
├── routes/
├── services/
├── middleware/
├── models/
├── utils/
├── config/
├── sockets/
└── server.js

---

# Main Modules

## Authentication

Features:

* Register
* Login
* Logout
* JWT Authentication
* Protected Routes
* Refresh Sessions

Collections:

Users

---

## User Profile

Fields:

* Name
* Username
* Email
* Bio
* Skills
* Interests
* Profile Image
* Cover Image
* Social Links

Capabilities:

* Edit Profile
* View Profiles
* Follow Users

---

## Connections

Features:

* Send Request
* Accept Request
* Reject Request
* Remove Connection

Collections:

Connections

---

## Social Feed

Features:

* Create Posts
* Image Upload
* Like
* Comment
* Share

Collections:

Posts
Comments
Likes

---

## Messaging

Features:

* One-to-One Chat
* Real-Time Messages
* Read Receipts
* Typing Indicator
* Online Status

Collections:

Chats
Messages

Socket Events:

* send_message
* receive_message
* typing
* stop_typing
* online_users

---

## Notifications

Features:

* Message Alerts
* Connection Requests
* Post Interactions

Collection:

Notifications

---

## Communities

Future Module

Features:

* Create Community
* Join Community
* Community Feed
* Community Chat

Collections:

Communities

---

## Project Collaboration

Future Module

Features:

* Create Project
* Invite Members
* Tasks
* Milestones
* Discussions

Collections:

Projects
Tasks

---

# Database Collections

Users

Posts

Comments

Likes

Connections

Chats

Messages

Notifications

Projects

Tasks

Communities

---

# API Standards

Response Success

{
"success": true,
"data": {}
}

Response Error

{
"success": false,
"message": "Error message"
}

---

# Security Standards

Always:

* Hash passwords with bcrypt
* Validate input
* Sanitize user content
* Protect JWT secrets
* Verify permissions
* Prevent unauthorized access

Never:

* Store plain passwords
* Expose secrets
* Trust client-side validation

---

# Coding Standards

## React

Use:

* Functional Components
* Hooks
* Reusable Components
* Custom Hooks

Avoid:

* Class Components
* Massive Components

---

## Backend

Use:

* MVC Architecture
* Service Layer
* Async/Await

Avoid:

* Business logic in routes
* Duplicate code

---

# Performance Goals

Page Load:

< 2 seconds

API Response:

< 300ms

Realtime Message Delay:

< 100ms

---

# Future AI Features

AI Connection Suggestions

AI Community Recommendations

AI Project Matching

AI Goal Tracking

AI Productivity Assistant

AI Content Suggestions

---

# Claude Instructions

When working on ConnectSphere:

1. Preserve architecture.
2. Follow MERN best practices.
3. Keep components reusable.
4. Maintain responsive design.
5. Optimize database queries.
6. Follow REST standards.
7. Use TypeScript if migration occurs.
8. Keep code production-ready.
9. Write secure code.
10. Maintain futuristic premium UI.

If a feature conflicts with scalability, choose scalability.

If a feature conflicts with security, choose security.

If a feature conflicts with UI beauty, choose usability.

Always think like a senior full-stack architect before modifying the codebase.
