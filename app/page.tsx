import Image from "next/image";
import Navbar from "@/components/Navbar";
import { LoginForm } from "@/components/login-form";
import prisma from "@/lib/prisma";

export default async function Home() {
  let dbStatus = "Checking...";
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "Database connected successfully";
    console.log('\x1b[32m%s\x1b[0m', `--- [DB STATUS] ${dbStatus} ---`);
  } catch (error) {
    dbStatus = "Database connection failed";
    console.error('\x1b[31m%s\x1b[0m', `--- [DB STATUS] ERROR: ${dbStatus} ---`);
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <script
        dangerouslySetInnerHTML={{
          __html: `console.log("--- [DB STATUS] ${dbStatus} ---");`,
        }}
      />
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm />
      </div>
    </div>
  );
}
