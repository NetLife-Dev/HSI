const { Client } = require('pg');

const connectionString = 'postgres://gabriel:ggs32126090@easy.devnetlife.com:5438/hostsemimpostodb?sslmode=disable';

const client = new Client({
  connectionString: connectionString,
});

async function test() {
  try {
    console.log('Connecting to:', connectionString.replace(/:[^:]*@/, ':****@'));
    await client.connect();
    console.log('✅ Connection Successful!');
    const res = await client.query('SELECT NOW()');
    console.log('Database Time:', res.rows[0].now);
    await client.end();
  } catch (err) {
    console.error('❌ Connection Failed:');
    console.error('Message:', err.message);
    console.error('Code:', err.code);
    console.error('Stack:', err.stack);
  }
}

test();
