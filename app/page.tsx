export const dynamic = "force-dynamic";

import { LoginForm } from "@/components/login-form";
import prisma from "@/lib/prisma";
import redis from "@/lib/redis";

export default async function Home() {
  let dbStatus = "Checking...";
  let redisStatus = "Checking...";

  // Check Database
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "Database connected successfully";
    console.log('\x1b[32m%s\x1b[0m', `--- [DB STATUS] ${dbStatus} ---`);
  } catch (error) {
    dbStatus = "Database connection failed";
    console.error('\x1b[31m%s\x1b[0m', `--- [DB STATUS] ERROR: ${dbStatus} ---`);
  }

  // Check Redis
  try {
    await redis.ping();
    redisStatus = "Redis connected successfully";
    console.log('\x1b[32m%s\x1b[0m', `--- [REDIS STATUS] ${redisStatus} ---`);
  } catch (error) {
    redisStatus = "Redis connection failed";
    console.error('\x1b[31m%s\x1b[0m', `--- [REDIS STATUS] ERROR: ${redisStatus} ---`);
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10 isolation-auto">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: 'url("/home-page.webp")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `console.log("--- [DB STATUS] ${dbStatus} ---");`,
        }}
      />
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
