const postgres = require('postgres');

const connectionString = 'postgres://gabriel:ggs32126090@easy.devnetlife.com:5438/hostsemimpostodb?sslmode=disable';

async function test() {
  const sql = postgres(connectionString);
  try {
    console.log('Connecting to (External):', connectionString.replace(/:[^:]*@/, ':****@'));
    const result = await sql`SELECT NOW()`;
    console.log('✅ Connection Successful!');
    console.log('Database Time:', result[0].now);
  } catch (err) {
    console.error('❌ Connection Failed:');
    console.error('Message:', err.message);
    console.error('Code:', err.code);
  } finally {
    await sql.end();
  }
}

test();
