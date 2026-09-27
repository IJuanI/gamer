import { Injectable, Logger } from "@nestjs/common";
import { FirestoreService } from "../firestore/firestore.service";

@Injectable()
export class DatabaseInitializer {
  private readonly logger = new Logger(DatabaseInitializer.name);

  constructor(private readonly firestore: FirestoreService) {}

  async verifyDatabase(): Promise<boolean> {
    try {
      this.logger.log("Verifying Firestore connectivity...");
      const db = await this.firestore.getFirestore();

      // Quick test query to ensure read access
      await db.collection("users").limit(1).get();

      this.logger.log("✓ Firestore verified and accessible");
      return true;
    } catch (error) {
      this.logger.error(`✗ Firestore verification failed: ${error}`);
      return false;
    }
  }

  async ensureCollections(): Promise<void> {
    const collections = [
      "users",
      "teams",
      "games",
      "gameProfiles",
      "recruitmentPosts",
      "platformLinks",
    ];

    this.logger.log("Ensuring required collections exist...");
    const db = await this.firestore.getFirestore();

    for (const collectionName of collections) {
      try {
        // Check if collection has documents
        const snapshot = await db.collection(collectionName).limit(1).get();
        const exists = !snapshot.empty;
        if (exists) {
          this.logger.debug(`  ✓ Collection '${collectionName}' exists`);
        } else {
          this.logger.warn(`  ! Collection '${collectionName}' is empty`);
        }
      } catch (error) {
        this.logger.warn(`  ! Cannot verify collection '${collectionName}': ${error}`);
      }
    }
  }
}
