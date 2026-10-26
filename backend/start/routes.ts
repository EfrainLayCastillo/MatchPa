import router from '@adonisjs/core/services/router'
import transmit from '@adonisjs/transmit/services/main'
import { middleware } from '#start/kernel'
import { authThrottle } from '#start/limiter'

const AuthController = () => import('#controllers/auth_controller')
const MeController = () => import('#controllers/me_controller')
const CompaniesController = () => import('#controllers/companies_controller')
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
    router.get('companies', [CompaniesController, 'index'])
    router.post('auth/register', [AuthController, 'register']).use(authThrottle)
    router.post('auth/login', [AuthController, 'login']).use(authThrottle)
    router.get('auth/google/redirect', [AuthController, 'googleRedirect'])
    router.get('auth/google/callback', [AuthController, 'googleCallback'])
    router.get('matches/:code', [MatchesController, 'show'])

    router
      .group(() => {
        router.post('auth/logout', [AuthController, 'logout'])
        router.get('me', [MeController, 'show'])
        router.patch('me', [MeController, 'update'])
        router.get('me/availabilities', [AvailabilitiesController, 'index'])
        router.put('me/availabilities/:date', [AvailabilitiesController, 'upsert'])
        router.delete('me/availabilities/:date', [AvailabilitiesController, 'destroy'])
        router.get('me/matches', [MyMatchesController, 'index'])
        router.get('me/match-requests', [MatchRequestsController, 'index'])

        router.get('players', [PlayersController, 'index'])

        router.get('matches', [MatchesController, 'index'])
        router.post('matches', [MatchesController, 'store'])
        router.patch('matches/:code', [MatchesController, 'update'])
        router.post('matches/:code/close', [MatchesController, 'close'])
        router.post('matches/:code/join-requests', [JoinRequestsController, 'store'])
        router.post('matches/:code/invitations', [InvitationsController, 'store'])
        router.patch('match-requests/:id', [MatchRequestsController, 'update'])

        router.post('push-subscriptions', [PushSubscriptionsController, 'store'])
        router.delete('push-subscriptions', [PushSubscriptionsController, 'destroy'])
      })
      .use(middleware.auth())
  })
  .prefix('api')
