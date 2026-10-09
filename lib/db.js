import mongoose from 'mongoose';
import dns from 'dns';

// Fix for Windows / ISP SRV DNS lookup failure on Atlas clusters
export function configureDNS() {
  try {
    if (dns.setDefaultResultOrder) {
      dns.setDefaultResultOrder('ipv4first');
    }
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  } catch (e) {
    // Ignore DNS override failure
  }
}

configureDNS();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI && process.env.NODE_ENV !== 'production') {
  // During local startup, Next.js loads .env.local automatically
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  configureDNS();

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      dbName: process.env.DB_NAME || 'shoolin_os',
      bufferCommands: false,
      maxPoolSize: 5, // Limit max connections per Node process (prevents Atlas M0 50-connection cap)
      minPoolSize: 1,
      maxIdleTimeMS: 30000, // Automatically close idle connections after 30 seconds
      serverSelectionTimeoutMS: 10000,
    };

    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('Please define the MONGO_URI environment variable inside .env.local');
    }

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      console.log(`✅ MongoDB Connected to Atlas database [${opts.dbName}]`);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB Connection Error:', e);
    throw e;
  }

  return cached.conn;
}
