import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

const uri = process.env.MONGO_URI || '';
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGO_URI) {
    throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so the client is not constantly reinitialized.
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

// Function to connect to MongoDB using Mongoose with retries
const connectDB = async () => {
    const state = mongoose.connections[0].readyState;
    if (state === 1) return; // Connected
    if (state === 2) {
        // If connecting, wait until connected or timeout
        await new Promise((resolve) => {
            const check = setInterval(() => {
                if (mongoose.connections[0].readyState === 1) {
                    clearInterval(check);
                    resolve(true);
                }
            }, 100);
            setTimeout(() => {
                clearInterval(check);
                resolve(false);
            }, 5000);
        });
        if (mongoose.connections[0].readyState === 1) return;
    }

    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[MongoDB] Connection attempt ${attempt}/${maxRetries}...`);
            await mongoose.connect(uri, { 
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 5000,
            });
            console.log('[MongoDB] ✓ Connected successfully');
            return;
        } catch (error) {
            lastError = error;
            console.error(`[MongoDB] ✗ Attempt ${attempt} failed:`, (error as Error).message);
            
            if (attempt < maxRetries) {
                console.log(`[MongoDB] Retrying in 2 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }

    console.error('[MongoDB] ✗ All connection attempts failed');
    throw new Error(`MongoDB connection failed after ${maxRetries} attempts: ${(lastError as Error).message}`);
};

// Export a module-scoped MongoClient promise. By doing this in a separate
// module, the client can be shared across functions.
export { clientPromise, connectDB };
