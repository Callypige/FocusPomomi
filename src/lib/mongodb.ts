import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

// Cache connection across hot reloads in dev
const cached = global as typeof global & {
  mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

if (!cached.mongoose) {
  cached.mongoose = { conn: null, promise: null };
}

// Connect to MongoDB immediately
cached.mongoose!.promise = mongoose.connect(MONGODB_URI).then((m) => {
  console.log("✅ MongoDB connected");
  return m;
});

export async function connectDB() {
  if (cached.mongoose!.conn) return cached.mongoose!.conn;

  if (!cached.mongoose!.promise) {
    cached.mongoose!.promise = mongoose.connect(MONGODB_URI);
  }

  cached.mongoose!.conn = await cached.mongoose!.promise;
  return cached.mongoose!.conn;
}