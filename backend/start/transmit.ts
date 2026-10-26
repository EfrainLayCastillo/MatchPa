import transmit from '@adonisjs/transmit/services/main'

transmit.authorize<{ id: string }>('users/:id', (ctx, { id }) => {
  return ctx.auth.user?.id === Number(id)
})
