import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "./generated/prisma/client";

async function testDatabaseConnection() {
  console.log("🔍 Testing database connection...\n");
  
  console.log("📋 Database Configuration:");
  console.log(`   Host: ${process.env.DATABASE_HOST}`);
  console.log(`   User: ${process.env.DATABASE_USER}`);
  console.log(`   Database: ${process.env.DATABASE_NAME}`);
  console.log(`   Port: ${process.env.DATABASE_PORT}\n`);

  try {
    console.log("⏳ Creating adapter...");
    const adapter = new PrismaMariaDb({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      connectionLimit: 5,
      allowPublicKeyRetrieval: true,
    });

    console.log("⏳ Creating Prisma client...");
    const prisma = new PrismaClient({ adapter });

    console.log("⏳ Testing query...");
    const categories = await prisma.productCategory.findMany();
    
    console.log(`\n✅ Database connection successful!`);
    console.log(`✅ Found ${categories.length} categories in the database`);
    
    if (categories.length > 0) {
      console.log("\n📊 Sample categories:");
      categories.slice(0, 3).forEach((cat, idx) => {
        console.log(`   ${idx + 1}. ${cat.name} (ID: ${cat.id})`);
      });
    }
    
  } catch (error) {
    console.error("\n❌ Database connection failed!");
    console.error("Error details:", error);
    
    if (error instanceof Error) {
      console.error("\nError message:", error.message);
      console.error("\nPossible causes:");
      console.error("  1. MySQL/MariaDB service is not running");
      console.error("  2. Incorrect database credentials");
      console.error("  3. Database 'kasir' does not exist");
      console.error("  4. Network/firewall blocking port 3306");
    }
  }
}

testDatabaseConnection();
