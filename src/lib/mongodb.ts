import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

// Cache connection across hot reloads in dev
const cached = global as typeof global & {
  mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

if (!cached.mongoose) {
  cached.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.mongoose!.conn) return cached.mongoose!.conn;

  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Configure it in environment variables for local and production."
    );
  }

  if (!cached.mongoose!.promise) {
    const uri = MONGODB_URI.trim();
    cached.mongoose!.promise = mongoose
      .connect(uri, {
        dbName: MONGODB_DB,
        serverSelectionTimeoutMS: 10_000,
        maxPoolSize: 10,
      })
      .then((connection) => {
        console.log("MongoDB connected");
        return connection;
      });
  }

  try {
    cached.mongoose!.conn = await cached.mongoose!.promise;
  } catch (error) {
    cached.mongoose!.conn = null;
    cached.mongoose!.promise = null;
    throw error;
  }

  return cached.mongoose!.conn;
}