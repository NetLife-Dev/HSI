const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { properties, propertyImages, propertyServices, users } = require('../db/schema');
const { MOCK_PROPERTIES } = require('../lib/mock-data');

const DATABASE_URL = 'postgres://gabriel:ggs32126090@easy.devnetlife.com:5438/hostsemimpostodb?sslmode=disable';

// Valid UUIDs for seeding
const ADMIN_ID = '00000000-0000-0000-0000-000000000001';
const PROP_IDS = [
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000103',
  '00000000-0000-0000-0000-000000000104',
  '00000000-0000-0000-0000-000000000105',
];

async function seed() {
  const queryClient = postgres(DATABASE_URL);
  const db = drizzle(queryClient);

  console.log('--- Starting Seed (UUID Fixed) ---');

  try {
    // 1. Create Admin User if not exists
    console.log('Ensuring admin user...');
    await db.insert(users).values({
      id: ADMIN_ID,
      email: 'admin@hsi.com',
      name: 'Gabriel (Host)',
      role: 'owner',
    }).onConflictDoUpdate({
        target: users.id,
        set: { name: 'Gabriel (Host)' }
    });

    // 2. Insert MOCK_PROPERTIES
    console.log(`Inserting ${MOCK_PROPERTIES.length} properties...`);
    for (let index = 0; index < MOCK_PROPERTIES.length; index++) {
      const mock = MOCK_PROPERTIES[index];
      const propId = PROP_IDS[index] || undefined;
      
      console.log(`- ${mock.name} (${propId})`);
      
      const [prop] = await db.insert(properties).values({
        id: propId,
        ownerId: ADMIN_ID,
        name: mock.name,
        slug: mock.slug,
        description: mock.description,
        locationAddress: mock.locationAddress,
        maxGuests: mock.maxGuests,
        bedrooms: mock.bedrooms,
        bathrooms: mock.bathrooms,
        beds: mock.beds,
        basePrice: mock.basePrice,
        status: mock.status,
        featured: mock.featured,
        createdAt: mock.createdAt,
      }).onConflictDoUpdate({
        target: properties.id,
        set: { 
            basePrice: mock.basePrice,
            name: mock.name,
            slug: mock.slug,
            description: mock.description,
            ownerId: ADMIN_ID
        }
      }).returning();

      // Clear existing images/services to avoid duplicates on re-run
      await db.delete(propertyImages).where(eq(propertyImages.propertyId, prop.id));
      await db.delete(propertyServices).where(eq(propertyServices.propertyId, prop.id));

      // 4. Insert Images
      if (mock.images && mock.images.length > 0) {
        console.log(`  Inserting ${mock.images.length} images...`);
        for (let i = 0; i < mock.images.length; i++) {
          const img = mock.images[i];
          await db.insert(propertyImages).values({
            propertyId: prop.id,
            url: img.url,
            publicId: `seed-${prop.slug}-${i}`,
            order: i,
            isCover: i === 0,
          });
        }
      }

      // 5. Insert Services
      if (mock.services && mock.services.length > 0) {
        console.log(`  Inserting ${mock.services.length} services...`);
        for (const s of mock.services) {
            await db.insert(propertyServices).values({
                propertyId: prop.id,
                name: s.name,
                description: s.description,
                price: s.price,
                unit: s.unit
            });
        }
      }
    }

    console.log('--- Seed Completed Successfully ---');
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    await queryClient.end();
  }
}

// Minimal eq helper
function eq(column, value) {
    const { eq } = require('drizzle-orm');
    return eq(column, value);
}

seed();
