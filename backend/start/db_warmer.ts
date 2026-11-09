import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'
import { isPeakHour } from '#services/peak_hours'

const EVERY_FOUR_MINUTES = 4 * 60_000

if (app.inProduction) {
  const timer = setInterval(() => {
    if (!isPeakHour()) return
    db.rawQuery('select 1').catch((error) => logger.warn({ err: error }, 'db warm-up query failed'))
  }, EVERY_FOUR_MINUTES)
  timer.unref()
  app.terminating(() => clearInterval(timer))
}
