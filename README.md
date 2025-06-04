# Applications for Processing Selected Tasks with Large Language Models

## 🧠 Overview

**Applications for Processing Selected Tasks with Large Language Models** is an AI-powered chat assistant application developed as a diploma project for **VŠB - Technical University of Ostrava** by **Maksym Yeromenko**.

The application leverages the power of modern AI (OpenAI API) to provide a user-friendly platform for text-based tasks such as:

- Language translation
- Text formatting
- Document summarization
- Task-specific custom chats
- Email sending

---

## ✨ Features

### Core Functionalities

- 🌍 **Translation Service** — Translate between multiple languages
- 🎨 **Text Formatter** — Style and reformat text using different tones
- 📄 **File Processing** — Upload and summarize document content
- 📧 **Email Assistant** — Send emails with AI-generated content
- 💬 **Custom Chat Templates** — Create reusable chat agents for specific tasks

### Technical Features

- ✅ User authentication with JWT, Google, and GitHub
- 💬 Real-time chat interface with auto-scrolling
- 📱 Responsive UI for desktop and mobile
- 📁 File upload and parsing support
- 💾 Chat history and saved prompts
- ⚙️ Task management for AI queries
- 🔒 Secure API endpoints with authentication
- Email verification and password reset functionality
- Searching chat history
- Deleting account and all chats
- Changing password functionality
- User profile management
- Admin panel for managing users
- AI model selection for different tasks
- 

---

## ⚙️ Technology Stack

### Frontend

- [React.js](https://reactjs.org/)
- [Tanstack Query (React Query)](https://tanstack.com/query/latest)
- [Axios](https://axios-http.com/)
- CSS
- [React Loading Skeleton](https://github.com/dvtng/react-loading-skeleton)
- [React Hot Toast](https://react-hot-toast.com/)
- [Lucide Icons](https://lucide.dev/)
- [React Router](https://reactrouter.com/en/main)
- React Markdown

### Backend

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [Prisma ORM](https://www.prisma.io/)
- [Multer](https://github.com/expressjs/multer) — file uploads
- [OpenAI API](https://platform.reformateTextAi.com/)
- [JWT](https://jwt.io/) — authentication
- [bcrypt](https://www.npmjs.com/package/bcrypt) — password hashing
- [nodemailer](https://nodemailer.com/about/) — email sending

### Database

- [PostgreSQL](https://www.postgresql.org/)
- [Prisma](https://www.prisma.io/) — ORM for PostgreSQL

---

## 🚀 Getting Started

### Installation

Follow these steps to set up the project locally:

1. Clone the repository: `git clone https://github.com/Yeromenk/vsb-ai.git`
2. Start the frontend server: `cd frontend && npm install && npm run dev`
3. Start the backend server: `cd backend && npm install && npm run dev`
4. Configure the `.env` file in the `back-end` directory:
    - Add your `OPENAI_API_KEY`, `DATABASE_URL` (PostgreSQL connection string), `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` for Google and GitHub authentication.
    - Add email credentials (`EMAIL_USER` and `EMAIL_PASSWORD`) for nodemailer.
    - Add `SESSION_SECRET` key and `LDAP_URL` for VSB authentication.

5. Access the application at the specified frontend URL.

---

## 📂 Project Structure

### Frontend

- `src/`
    - `components/` — Reusable UI components
    - `pages/` — Application pages
    - `context/` — Context API for global state management
    - `utils/` — Helper functions
    - `styles/` — Global and component-specific styles

### Backend

- `controllers/` — API logic
- `routes/` — API endpoints
- `models/` — Database models
- `middleware/` — Authentication and validation logic
- `config/` — Configuration files (e.g., passport strategies)

---

## 🛠️ Development

### Prerequisites

- Node.js
- PostgreSQL
- npm

### Commands

- **Start Frontend**: `npm run dev` (in `frontend/`)
- **Start Backend**: `npm run dev` (in `backend/`)
- **Build Frontend**: `npm run build` (in `frontend/`)
