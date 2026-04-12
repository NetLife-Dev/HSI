import * as dotenv from 'dotenv'
dotenv.config()

async function testApi() {
  const url = 'https://hsi.devnetlife.com/api/properties/featured'
  console.log('Testing App API:', url)
  try {
    const res = await fetch(url)
    const data = await res.json()
    console.log('API Response:', JSON.stringify(data, null, 2))
  } catch (e: any) {
    console.error('Fetch failed:', e.message)
  }
}

testApi()
