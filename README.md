# Applications for Processing Selected Tasks with Large Language Models

## 🧠 Overview

**Applications for Processing Selected Tasks with Large Language Models** is an AI-powered chat assistant application developed as a diploma project for **VŠB - Technical University of Ostrava** by **Maksym Yeromenko**.

The application leverages the power of modern AI (OpenAI API) to provide a user-friendly platform for text-based tasks such as:

- Language translation  
- Text formatting  
- Document summarization  
- Task-specific custom chats

---

## ✨ Features

### Core Functionalities

- 🌍 **Translation Service** — Translate between multiple languages  
- 🎨 **Text Formatter** — Style and reformat text using different tones  
- 📄 **File Processing** — Upload and summarize document content  
- 💬 **Custom Chat Templates** — Create reusable chat agents for specific tasks  

### Technical Features

- ✅ User authentication with JWT  
- 💬 Real-time chat interface with auto-scrolling  
- 📱 Responsive UI for desktop and mobile  
- 📁 File upload & parsing support  
- 💾 Chat history and saved prompts  
- ⚙️ Task management for AI queries  

---

## ⚙️ Technology Stack

### Frontend

- [React.js](https://reactjs.org/)  
- [Tanstack Query (React Query)](https://tanstack.com/query/latest)  
- [Axios](https://axios-http.com/)  
- CSS  
- [React Loading Skeleton](https://github.com/dvtng/react-loading-skeleton)  
- [React Hot Toast](https://react-hot-toast.com/)

### Backend

- [Node.js](https://nodejs.org/)  
- [Express.js](https://expressjs.com/)  
- [Prisma ORM](https://www.prisma.io/)  
- [Multer](https://github.com/expressjs/multer) — file uploads  
- [OpenAI API](https://platform.openai.com/)  
- [JWT](https://jwt.io/) — authentication

### Database

- [PostgreSQL](https://www.postgresql.org/)
- [Prisma](https://www.prisma.io/) — ORM for PostgreSQL

---
## 🚀 Getting Started
### Installation
A step-by-step guide to set up the project locally.
1. Clone the repository
```
https://github.com/Yeromenk/vsb-ai.git
```
2. In a new terminal, start the frontend server:
```
cd ../frontend && npm install && npm run dev
```
3. In another terminal, start the backend server:
```
cd ../backend && npm install && npm run dev
```
4. To `.env` file, add your OpenAI API key, PostgreSQL connection string, and JWT secret:
5. After that you can use the application. Enjoy!

