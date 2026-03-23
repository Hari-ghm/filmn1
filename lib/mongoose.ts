import mongoose from "mongoose";

const globalAny = globalThis as unknown as {
  mongooseConn?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

async function createConnection(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI.");
  }

  // Using default mongoose connection options.
  await mongoose.connect(uri);
  return mongoose;
}

export async function connectToMongo(): Promise<typeof mongoose | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;

  if (!globalAny.mongooseConn) {
    globalAny.mongooseConn = { conn: null, promise: null };
  }

  // Already connected.
  if (globalAny.mongooseConn.conn && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (globalAny.mongooseConn.promise) {
    return globalAny.mongooseConn.promise;
  }

  globalAny.mongooseConn.promise = createConnection().then((m) => {
    globalAny.mongooseConn!.conn = m;
    globalAny.mongooseConn!.promise = null;
    return m;
  });

  return globalAny.mongooseConn.promise;
}

