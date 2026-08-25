import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Fallback ensures `prisma generate` works on Vercel even before DATABASE_URL is set
    // generate only reads schema — it doesn't need a real connection
    url: process.env["DATABASE_URL"] ?? "postgresql://localhost:5432/placeholder",
  },
});
