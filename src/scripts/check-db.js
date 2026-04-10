const postgres = require('postgres');

const DATABASE_URL = 'postgres://gabriel:ggs32126090@easy.devnetlife.com:5438/hostsemimpostodb?sslmode=disable';

async function checkPrices() {
  const sql = postgres(DATABASE_URL);
  try {
    const props = await sql`SELECT id, name, "base_price" as "basePrice", "cleaning_fee" as "cleaningFee", slug FROM properties`;
    console.log('--- Properties in DB ---');
    console.log(JSON.stringify(props, null, 2));
    
    const seasonal = await sql`SELECT * FROM seasonal_pricing`;
    console.log('\n--- Seasonal Pricing ---');
    console.log(JSON.stringify(seasonal, null, 2));
  } catch (err) {
    console.error('Error connecting to DB:', err);
  } finally {
    await sql.end();
  }
}

checkPrices();
