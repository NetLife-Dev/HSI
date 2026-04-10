const postgres = require('postgres');

const DATABASE_URL = 'postgres://gabriel:ggs32126090@easy.devnetlife.com:5438/hostsemimpostodb?sslmode=disable';

async function checkTables() {
  const sql = postgres(DATABASE_URL);
  try {
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log('--- Tables in DB ---');
    console.log(JSON.stringify(tables, null, 2));
    
    if (tables.some(t => t.table_name === 'properties')) {
        const count = await sql`SELECT COUNT(*) FROM properties`;
        console.log('Properties count:', count[0].count);
    }
  } catch (err) {
    console.error('Error connecting to DB:', err);
  } finally {
    await sql.end();
  }
}

checkTables();
