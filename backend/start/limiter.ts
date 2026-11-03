import limiter from '@adonisjs/limiter/services/main'

/** Login and sign-up attempts per client IP. Stops password guessing and account spam. */
export const authThrottle = limiter.define('auth', () => {
  return limiter.allowRequests(10).every('1 minute')
})

export const resendCooldown = limiter.define('emailResendCooldown', ({ auth }) => {
  return limiter.allowRequests(1).every('1 minute').usingKey(`user_${auth.user!.id}`)
})

export const resendHourly = limiter.define('emailResendHourly', ({ auth }) => {
  return limiter.allowRequests(5).every('1 hour').usingKey(`user_${auth.user!.id}`)
})

const perUser = (name: string, requests: number, duration: string) =>
  limiter.define(name, ({ auth }) =>
    limiter.allowRequests(requests).every(duration).usingKey(`${name}_${auth.user!.id}`)
  )

export const publishThrottle = perUser('publish', 10, '1 hour')
export const socialThrottle = perUser('social', 30, '1 hour')
export const writeThrottle = perUser('write', 120, '1 hour')
