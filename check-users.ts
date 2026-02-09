
import { prisma } from './lib/prisma'

async function main() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Defined' : 'Undefined')
  
  try {
    const result: any[] = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'cafe';`
    console.log('Tables from information_schema:')
    result.forEach(row => {
      console.log(row.table_name || row.TABLE_NAME)
    })
  } catch (e) {
    console.error('Error listing tables:', e)
  }
}

main()
  .catch(async (e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
