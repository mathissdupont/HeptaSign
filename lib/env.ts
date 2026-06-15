export function getEnv(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getAppUrl() {
  return getEnv("APP_URL", "http://localhost:3000").replace(/\/$/, "");
}

export function getStoragePath() {
  return getEnv("STORAGE_PATH", "./storage");
}

export function getMaxUploadBytes() {
  const mb = Number(process.env.MAX_UPLOAD_MB || "10");
  return Math.max(1, mb) * 1024 * 1024;
}
