export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { runMigrations } = await import('./db/migrate')
      await runMigrations()
      
      // Phase 4: iCal Scheduler
      const cron = await import('node-cron')
      const { syncAllIcalFeeds } = await import('./lib/ical')
      
      // Sync every 30 minutes
      cron.schedule('*/30 * * * *', async () => {
        try {
          await syncAllIcalFeeds()
        } catch (err) {
          console.error('[Scheduler] iCal sync failed:', err)
        }
      })
      
      console.log('✅ [Boot] Migrations finalizadas e Scheduler iCal iniciado.')
    } catch (error) {
      console.warn('⚠️ [Boot] Ignorando falha de migração ou scheduler. Banco offline ou inacessível. O sistema rodará em Modo Mock de UI.')
    }
  }
}
