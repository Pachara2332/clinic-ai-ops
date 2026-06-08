import dotenv from 'dotenv'

dotenv.config()

export const env = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? 'clinic-ai-ops-dev-secret',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  databaseUrl: process.env.DATABASE_URL ?? '',
  openAiApiKey: process.env.OPENAI_API_KEY ?? '',
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
}
