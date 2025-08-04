import { streams, type Stream, type InsertStream } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, lt } from "drizzle-orm";

export interface IStorage {
  getStream(id: string): Promise<Stream | undefined>;
  getAllStreams(): Promise<Stream[]>;
  getActiveStreams(): Promise<Stream[]>;
  getRecentStreams(limit?: number): Promise<Stream[]>;
  createStream(stream: InsertStream): Promise<Stream>;
  updateStream(id: string, updates: Partial<Stream>): Promise<Stream | undefined>;
  deleteStream(id: string): Promise<boolean>;
  getExpiredStreams(): Promise<Stream[]>;
  deleteExpiredStreams(): Promise<number>;
  getServerStats(): Promise<{
    totalStreams: number;
    activeStreams: number;
    storageUsed: number;
    bandwidth: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getStream(id: string): Promise<Stream | undefined> {
    const [stream] = await db.select().from(streams).where(eq(streams.id, id));
    return stream || undefined;
  }

  async getAllStreams(): Promise<Stream[]> {
    return await db.select().from(streams).orderBy(desc(streams.createdAt));
  }

  async getActiveStreams(): Promise<Stream[]> {
    return await db.select().from(streams).where(eq(streams.isActive, true));
  }

  async getRecentStreams(limit: number = 10): Promise<Stream[]> {
    return await db.select().from(streams)
      .orderBy(desc(streams.createdAt))
      .limit(limit);
  }

  async createStream(insertStream: InsertStream): Promise<Stream> {
    const [stream] = await db
      .insert(streams)
      .values(insertStream)
      .returning();
    return stream;
  }

  async updateStream(id: string, updates: Partial<Stream>): Promise<Stream | undefined> {
    const [stream] = await db
      .update(streams)
      .set(updates)
      .where(eq(streams.id, id))
      .returning();
    return stream || undefined;
  }

  async deleteStream(id: string): Promise<boolean> {
    const result = await db.delete(streams).where(eq(streams.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getExpiredStreams(): Promise<Stream[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return await db.select().from(streams)
      .where(lt(streams.createdAt, sevenDaysAgo));
  }

  async deleteExpiredStreams(): Promise<number> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const result = await db.delete(streams)
      .where(lt(streams.createdAt, sevenDaysAgo));
    return result.rowCount || 0;
  }

  async getServerStats() {
    const allStreams = await this.getAllStreams();
    const activeStreams = await this.getActiveStreams();
    
    const storageUsed = allStreams.reduce((total, stream) => total + (stream.fileSize || 0), 0);
    const bandwidth = activeStreams.length * 5; // Mock bandwidth calculation
    
    return {
      totalStreams: allStreams.length,
      activeStreams: activeStreams.length,
      storageUsed,
      bandwidth
    };
  }
}

export const storage = new DatabaseStorage();
