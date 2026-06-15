import crypto from "crypto";

export type SignatureRecord = {
  algorithm: string;
  value: string;
};

export interface CryptoProvider {
  hashSha256(data: Buffer): string;
  createVerificationToken(): string;
  signMetadata(data: Record<string, unknown>): SignatureRecord;
  verifyMetadata(data: Record<string, unknown>, signature: SignatureRecord): boolean;
}

export class ClassicalCryptoProvider implements CryptoProvider {
  hashSha256(data: Buffer) {
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  createVerificationToken() {
    return crypto.randomBytes(32).toString("base64url");
  }

  signMetadata(data: Record<string, unknown>) {
    const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "development-only-secret";
    const value = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(data))
      .digest("hex");

    return { algorithm: "HMAC-SHA256", value };
  }

  verifyMetadata(data: Record<string, unknown>, signature: SignatureRecord) {
    const expected = this.signMetadata(data);
    return signature.algorithm === expected.algorithm && signature.value === expected.value;
  }
}

export const cryptoProvider: CryptoProvider = new ClassicalCryptoProvider();
