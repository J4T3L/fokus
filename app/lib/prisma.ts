import { PrismaClient } from "../generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL is not defined in environment variables. Please check your .env file.");
  }
  const url = new URL(dbUrl);
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: parseInt(url.port || "3306"),
    user: url.username,
    password: url.password || undefined,
    database: url.pathname.slice(1),
  });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
