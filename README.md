# 🍅 FocusPomomi

**FR** — Application de gestion de tâches intégrée à la technique Pomodoro. Créer une tâche démarre automatiquement le timer. Quand le timer arrive à zéro, tu peux marquer la tâche comme réussie et récolter un fruit 🍎.

**EN** — Task management app integrated with the Pomodoro technique. Creating a task automatically starts the timer. When the timer reaches zero, you can mark the task as completed and collect a fruit 🍎.

---

## Stack

- **Next.js 15** — App Router
- **TypeScript** — strict mode
- **Tailwind CSS** — styling
- **MongoDB Atlas** — database
- **Mongoose** — ODM
- **TanStack Query** — server state management

## Getting started
```bash
# Install dependencies
npm install

# Create .env.local and add your MongoDB URI
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/focuspomomi

# Start dev server
npm run dev
```

## Features

- ✅ Create a task → timer starts automatically
- ✅ Switch between tasks → timer resets to new task duration
- ✅ Complete a task → fruit reward 🍎
- ✅ Short and long breaks
- ✅ Session counter 🍅
- ✅ Data persisted in MongoDB
- ✅ Responsive — mobile & desktop