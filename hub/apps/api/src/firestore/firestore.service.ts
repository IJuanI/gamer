import { Injectable, OnModuleInit } from "@nestjs/common";
import { initializeApp, cert, getApp } from "firebase-admin/app";
import { getFirestore, Firestore, Query } from "firebase-admin/firestore";
import * as process from "process";

@Injectable()
export class FirestoreService implements OnModuleInit {
  private db: Firestore | null = null;
  private initPromise: Promise<Firestore> | null = null;

  onModuleInit() {
    // Initialize Firestore asynchronously without blocking app startup
    this.initPromise = this.initialize().catch((error) => {
      console.error("Failed to initialize Firestore:", error);
      throw error;
    });
  }

  private async initialize(): Promise<Firestore> {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;

    if (!projectId) {
      throw new Error("FIREBASE_PROJECT_ID environment variable is not set");
    }

    try {
      const app = getApp();
      this.db = getFirestore(app);
    } catch {
      const app = initializeApp({
        projectId,
      });
      this.db = getFirestore(app);
    }

    // Log connection info for debugging
    if (emulatorHost) {
      console.log(`[Firestore] Connected to Emulator at ${emulatorHost}`);
    } else {
      console.log(`[Firestore] Connected to production (project: ${projectId})`);
    }

    return this.db;
  }

  async getFirestore(): Promise<Firestore> {
    if (this.db) {
      return this.db;
    }
    if (this.initPromise) {
      return this.initPromise;
    }
    return this.initialize();
  }

  async collection(name: string) {
    return (await this.getFirestore()).collection(name);
  }

  async findUnique<T>(collection: string, id: string): Promise<T | null> {
    const doc = await (await this.getFirestore()).collection(collection).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as T;
  }

  async findByField<T>(
    collection: string,
    field: string,
    value: string | number
  ): Promise<T | null> {
    const query = await (await this.getFirestore())
      .collection(collection)
      .where(field, "==", value)
      .limit(1)
      .get();

    if (query.empty) return null;
    const doc = query.docs[0];
    return { id: doc.id, ...doc.data() } as T;
  }

  async create<T>(collection: string, data: Record<string, any>): Promise<T> {
    const docRef = await (await this.getFirestore()).collection(collection).add({
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as T;
  }

  async set<T>(
    collection: string,
    id: string,
    data: Record<string, any>
  ): Promise<T> {
    const db = await this.getFirestore();
    await db
      .collection(collection)
      .doc(id)
      .set(
        {
          ...data,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

    const doc = await db.collection(collection).doc(id).get();
    return { id: doc.id, ...doc.data() } as T;
  }

  async delete(collection: string, id: string): Promise<void> {
    await (await this.getFirestore()).collection(collection).doc(id).delete();
  }

  async query<T>(
    collection: string,
    where: Array<[field: string, operator: string, value: any]>
  ): Promise<T[]> {
    let q: any = (await this.getFirestore()).collection(collection);

    for (const [field, operator, value] of where) {
      q = q.where(field, operator as any, value);
    }

    const snapshot = await q.get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as T));
  }

  async findAll<T>(collection: string): Promise<T[]> {
    const snapshot = await (await this.getFirestore()).collection(collection).get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as T));
  }
}
