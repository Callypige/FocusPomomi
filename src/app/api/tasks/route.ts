import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { TaskModel } from "@/models/Task";

// GET — fetch all tasks
export async function GET() {
  try {
    await connectDB();
    const tasks = await TaskModel.find().sort({ createdAt: -1 });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET /api/tasks failed:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

// POST — create a task
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const task = await TaskModel.create(body);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks failed:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}