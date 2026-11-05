import router from '@adonisjs/core/services/router'
import transmit from '@adonisjs/transmit/services/main'
import env from '#start/env'
import { middleware } from '#start/kernel'
import {
  authThrottle,
  publishThrottle,
  resendCooldown,
  resendHourly,
  socialThrottle,
  writeThrottle,
} from '#start/limiter'

const BranchSuggestionsController = () => import('#controllers/branch_suggestions_controller')
const AuthController = () => import('#controllers/auth_controller')
const MeController = () => import('#controllers/me_controller')
const BranchesController = () => import('#controllers/branches_controller')
const PlayersController = () => import('#controllers/players_controller')
const AvailabilitiesController = () => import('#controllers/availabilities_controller')
const MatchesController = () => import('#controllers/matches_controller')
const JoinRequestsController = () => import('#controllers/join_requests_controller')
const InvitationsController = () => import('#controllers/invitations_controller')
const MatchRequestsController = () => import('#controllers/match_requests_controller')
const MyMatchesController = () => import('#controllers/my_matches_controller')
const PushSubscriptionsController = () => import('#controllers/push_subscriptions_controller')

transmit.registerRoutes()

router
  .group(() => {
    router.get('branches', [BranchesController, 'index'])
    router.post('auth/register', [AuthController, 'register']).use(authThrottle)
    router.post('auth/login', [AuthController, 'login']).use(authThrottle)
    router.post('auth/password/forgot', [AuthController, 'forgotPassword']).use(authThrottle)
    router.post('auth/password/reset', [AuthController, 'resetPassword']).use(authThrottle)
    if (env.get('GOOGLE_AUTH_ENABLED', false)) {
      router.get('auth/google/redirect', [AuthController, 'googleRedirect'])
      router.get('auth/google/callback', [AuthController, 'googleCallback'])
    }
    router.get('matches/:code', [MatchesController, 'show'])

    router
      .group(() => {
        router.post('auth/logout', [AuthController, 'logout'])
        router.post('auth/email/verify', [AuthController, 'verifyEmail']).use(authThrottle)
        router
          .post('auth/email/resend', [AuthController, 'resendEmailCode'])
          .use([resendCooldown, resendHourly])
        router.get('me', [MeController, 'show'])
        router.patch('me', [MeController, 'update']).use(writeThrottle)
        router.delete('me', [MeController, 'destroy']).use(writeThrottle)
        router.get('me/availabilities', [AvailabilitiesController, 'index'])
        router
          .put('me/availabilities/:date', [AvailabilitiesController, 'upsert'])
          .use(writeThrottle)
        router
          .delete('me/availabilities/:date', [AvailabilitiesController, 'destroy'])
          .use(writeThrottle)
        router.get('me/matches', [MyMatchesController, 'index'])
        router.get('me/match-requests', [MatchRequestsController, 'index'])

        router.get('players', [PlayersController, 'index'])

        router.get('matches', [MatchesController, 'index'])
        router.post('matches', [MatchesController, 'store']).use(publishThrottle)
        router.patch('matches/:code', [MatchesController, 'update']).use(writeThrottle)
        router.post('matches/:code/close', [MatchesController, 'close']).use(publishThrottle)
        router
          .post('matches/:code/join-requests', [JoinRequestsController, 'store'])
          .use(socialThrottle)
        router
          .post('matches/:code/invitations', [InvitationsController, 'store'])
          .use(socialThrottle)
        router.patch('match-requests/:id', [MatchRequestsController, 'update']).use(writeThrottle)

        router.post('branch-suggestions', [BranchSuggestionsController, 'store']).use(writeThrottle)

        router.post('push-subscriptions', [PushSubscriptionsController, 'store']).use(writeThrottle)
        router
          .delete('push-subscriptions', [PushSubscriptionsController, 'destroy'])
          .use(writeThrottle)
      })
      .use(middleware.auth())
  })
  .prefix('api')
