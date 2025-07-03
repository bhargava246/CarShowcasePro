import { MongoClient, Db } from 'mongodb';

const mongoConnectionString = process.env.MONGODB_URI || "mongodb+srv://Himanshu:Himanshu123@himanshu.pe7xrly.mongodb.net/CarStore?retryWrites=true&w=majority&appName=himanshu";

class Database {
  private client: MongoClient;
  private db: Db | null = null;
  private isConnected = false;

  constructor() {
    this.client = new MongoClient(mongoConnectionString);
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;
    
    try {
      await this.client.connect();
      this.db = this.client.db('CarStore');
      this.isConnected = true;
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      await this.client.close();
      this.isConnected = false;
      this.db = null;
      console.log('✅ Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ Failed to disconnect from MongoDB:', error);
      throw error;
    }
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  isConnectedToDb(): boolean {
    return this.isConnected;
  }
}

export const database = new Database();

// Auto-connect when module is imported
database.connect().catch(console.error);

export default database;