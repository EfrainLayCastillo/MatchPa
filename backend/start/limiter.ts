import limiter from '@adonisjs/limiter/services/main'

/** Login and sign-up attempts per client IP. Stops password guessing and account spam. */
export const authThrottle = limiter.define('auth', () => {
  return limiter.allowRequests(10).every('1 minute')
})
