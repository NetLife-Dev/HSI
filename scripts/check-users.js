const postgres = require('postgres');
const sql = postgres('postgres://gabriel:ggs32126090@easy.devnetlife.com:5438/hostsemimpostodb?sslmode=disable');
async function run() {
  try {
    const users = await sql`SELECT id, email, role FROM users`;
    console.log(JSON.stringify(users, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
