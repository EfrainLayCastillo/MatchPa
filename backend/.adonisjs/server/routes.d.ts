import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'event_stream': { paramsTuple?: []; params?: {} }
    'subscribe': { paramsTuple?: []; params?: {} }
    'unsubscribe': { paramsTuple?: []; params?: {} }
    'branches.index': { paramsTuple?: []; params?: {} }
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.google_redirect': { paramsTuple?: []; params?: {} }
    'auth.google_callback': { paramsTuple?: []; params?: {} }
    'matches.show': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'me.show': { paramsTuple?: []; params?: {} }
    'me.update': { paramsTuple?: []; params?: {} }
    'availabilities.index': { paramsTuple?: []; params?: {} }
    'availabilities.upsert': { paramsTuple: [ParamValue]; params: {'date': ParamValue} }
    'availabilities.destroy': { paramsTuple: [ParamValue]; params: {'date': ParamValue} }
    'my_matches.index': { paramsTuple?: []; params?: {} }
    'match_requests.index': { paramsTuple?: []; params?: {} }
    'players.index': { paramsTuple?: []; params?: {} }
    'matches.index': { paramsTuple?: []; params?: {} }
    'matches.store': { paramsTuple?: []; params?: {} }
    'matches.update': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'matches.close': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'join_requests.store': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'invitations.store': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'match_requests.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'push_subscriptions.store': { paramsTuple?: []; params?: {} }
    'push_subscriptions.destroy': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'event_stream': { paramsTuple?: []; params?: {} }
    'branches.index': { paramsTuple?: []; params?: {} }
    'auth.google_redirect': { paramsTuple?: []; params?: {} }
    'auth.google_callback': { paramsTuple?: []; params?: {} }
    'matches.show': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'me.show': { paramsTuple?: []; params?: {} }
    'availabilities.index': { paramsTuple?: []; params?: {} }
    'my_matches.index': { paramsTuple?: []; params?: {} }
    'match_requests.index': { paramsTuple?: []; params?: {} }
    'players.index': { paramsTuple?: []; params?: {} }
    'matches.index': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'event_stream': { paramsTuple?: []; params?: {} }
    'branches.index': { paramsTuple?: []; params?: {} }
    'auth.google_redirect': { paramsTuple?: []; params?: {} }
    'auth.google_callback': { paramsTuple?: []; params?: {} }
    'matches.show': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'me.show': { paramsTuple?: []; params?: {} }
    'availabilities.index': { paramsTuple?: []; params?: {} }
    'my_matches.index': { paramsTuple?: []; params?: {} }
    'match_requests.index': { paramsTuple?: []; params?: {} }
    'players.index': { paramsTuple?: []; params?: {} }
    'matches.index': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'subscribe': { paramsTuple?: []; params?: {} }
    'unsubscribe': { paramsTuple?: []; params?: {} }
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'matches.store': { paramsTuple?: []; params?: {} }
    'matches.close': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'join_requests.store': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'invitations.store': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'push_subscriptions.store': { paramsTuple?: []; params?: {} }
  }
  PATCH: {
    'me.update': { paramsTuple?: []; params?: {} }
    'matches.update': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'match_requests.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PUT: {
    'availabilities.upsert': { paramsTuple: [ParamValue]; params: {'date': ParamValue} }
  }
  DELETE: {
    'availabilities.destroy': { paramsTuple: [ParamValue]; params: {'date': ParamValue} }
    'push_subscriptions.destroy': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}