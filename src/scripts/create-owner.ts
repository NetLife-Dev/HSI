import { db } from '@/db/index'
import { users } from '@/db/schema'
import bcrypt from 'bcryptjs'

async function createOwner() {
  const name = 'Admin NetLife'
  const email = 'admin@netlife.com'
  const password = 'changeme123'
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    const [user] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role: 'owner',
    }).returning()

    console.log(`✅ Owner criado com sucesso!`)
    console.log(`📧 Email: ${email}`)
    console.log(`🔑 Password: ${password}`)
    console.log(`⚠️ Altere esta senha assim que fizer o primeiro login.`)
    process.exit(0)
  } catch (err) {
    console.error('❌ Erro ao criar owner (verifique se já existe ou se o banco está ok):', err)
    process.exit(1)
  }
}

createOwner()
