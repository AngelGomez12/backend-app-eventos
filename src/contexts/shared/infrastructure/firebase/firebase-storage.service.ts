import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import admin from "firebase-admin";

@Injectable()
export class FirebaseStorageService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseStorageService.name);
  private storage: admin.storage.Storage;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const projectId = this.configService.get<string>("FIREBASE_PROJECT_ID");
    const clientEmail = this.configService.get<string>("FIREBASE_CLIENT_EMAIL");
    const privateKey = this.configService
      .get<string>("FIREBASE_PRIVATE_KEY")
      ?.replace(/\\n/g, "\n");
    const storageBucket = this.configService.get<string>(
      "FIREBASE_STORAGE_BUCKET",
    );

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn(
        "Firebase configuration is incomplete. Firebase features will not work.",
      );
      return;
    }

    try {
      if (admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
          storageBucket,
        });
        this.logger.log("Firebase Admin initialized");
      }

      this.storage = admin.storage();
    } catch (error) {
      this.logger.error("Failed to initialize Firebase Admin", error);
    }
  }

  async uploadFile(
    path: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string> {
    if (!this.storage) {
      throw new Error("Firebase Storage is not initialized");
    }
    const bucket = this.storage.bucket();
    const file = bucket.file(path);

    await file.save(buffer, {
      metadata: {
        contentType,
      },
    });

    // Make the file public if needed, or get a signed URL
    // For now, let's just return the public URL if it's a public bucket
    // or the firebase storage link.
    return `https://storage.googleapis.com/${bucket.name}/${file.name}`;
  }
}
