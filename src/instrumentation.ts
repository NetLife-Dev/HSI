export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { runMigrations } = await import('./db/migrate')
      await runMigrations()
    } catch (error) {
      console.warn('⚠️ [Boot] Ignorando falha de migração. Banco offline ou inacessível. O sistema rodará em Modo Mock de UI.')
    }
  }
}
