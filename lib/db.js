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

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb+srv://uxdesigner_db_user:8dNBEg1vuXNDdmfQ@pms-cluster.pvj8mzf.mongodb.net/shoolin_os?retryWrites=true&w=majority&appName=PMS-Cluster';

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
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((m) => {
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
