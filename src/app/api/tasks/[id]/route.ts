import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { TaskModel } from "@/models/Task";

// PATCH — update a task (status, fruit, completedAt)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const body = await req.json();
    const { id } = await params;
    const task = await TaskModel.findByIdAndUpdate(id, body, { new: true });

    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    return NextResponse.json(task);
  } catch (error) {
    console.error("PATCH /api/tasks/[id] failed:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

// DELETE — remove a task
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const task = await TaskModel.findByIdAndDelete(id);

    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tasks/[id] failed:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}