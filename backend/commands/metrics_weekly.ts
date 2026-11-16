import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

const ZONE = 'America/Panama'

const localWeek = (column: string) =>
  `to_char(date_trunc('week', ${column} AT TIME ZONE '${ZONE}'), 'YYYY-MM-DD')`

type WeekCount = { week: string; n: string | number }

export default class MetricsWeekly extends BaseCommand {
  static commandName = 'metrics:weekly'
  static description = 'Print weekly marketplace metrics (read-only, aggregates only, no PII)'
  static options: CommandOptions = { startApp: true }

  @flags.number({ description: 'Number of ISO weeks to show, counting the current one' })
  declare weeks: number

  async run() {
    const weeks = this.weeks > 0 ? Math.floor(this.weeks) : 8
    const keys = weekKeys(weeks)
    const since = keys[keys.length - 1]

    const [signups, deleted, profiles, published, withMatch, requests, approvals, availability] =
      await Promise.all([
        this.countByWeek('users', localWeek('created_at'), since, 'deleted_at is null'),
        this.countByWeek('users', localWeek('created_at'), since, 'deleted_at is not null'),
        this.countByWeek(
          'users',
          localWeek('created_at'),
          since,
          'deleted_at is null and gender is not null'
        ),
        this.countByWeek('matches', localWeek('created_at'), since),
        this.countByWeek('matches', localWeek('starts_at'), since, northStarFilter('matches')),
        this.countByWeek('match_requests', localWeek('created_at'), since, joinRequest()),
        this.countByWeek(
          'match_requests',
          localWeek('created_at'),
          since,
          `${joinRequest()} and status = 'accepted'`
        ),
        this.countByWeek('availabilities', localWeek('created_at'), since, undefined, 'user_id'),
      ])

    this.renderSummary(keys, {
      signups,
      deleted,
      profiles,
      published,
      withMatch,
      requests,
      approvals,
      availability,
    })
    await this.renderBranchBreakdown(keys, since)
  }

  private async countByWeek(
    table: string,
    weekExpr: string,
    since: string,
    where?: string,
    distinct?: string
  ) {
    const count = distinct ? `count(distinct ${distinct})` : 'count(*)'
    const filter = where ? `and ${where}` : ''
    const result = await db.rawQuery(
      `select ${weekExpr} as week, ${count} as n from ${table}
       where ${weekExpr}::date >= '${since}'::date ${filter} group by 1`
    )
    return toMap(result.rows)
  }

  private renderSummary(keys: string[], data: Record<string, Map<string, number>>) {
    const table = this.ui
      .table()
      .head([
        'Week (Mon)',
        'Signups',
        'Deleted',
        'Profiles',
        'Published',
        'Matched',
        'Requests',
        'Approved',
        'Avail. users',
      ])
    for (const week of keys) {
      const cells = [
        data.signups,
        data.deleted,
        data.profiles,
        data.published,
        data.withMatch,
        data.requests,
        data.approvals,
        data.availability,
      ].map((metric) => String(metric.get(week) ?? 0))
      table.row([week, ...cells])
    }
    table.render()
    this.logger.info(
      'Signups/Deleted/Profiles by account creation week; Published/Requests/Approved/Avail. by creation week; ' +
        'Matched (North Star) by starts_at week, status full|closed with at least 1 accepted request (past matches only).'
    )
  }

  private async renderBranchBreakdown(keys: string[], since: string) {
    const week = localWeek('m.starts_at')
    const result = await db.rawQuery(
      `select ${week} as week, b.slug as branch, count(*) as n
       from matches m join branches b on b.id = m.branch_id
       where ${week}::date >= '${since}'::date and ${northStarFilter('m')}
       group by 1, 2 order by 1 desc, 3 desc, 2`
    )
    const rows = (result.rows as { week: string; branch: string; n: string }[]).filter((row) =>
      keys.includes(row.week)
    )
    this.logger.info('Matched matches by branch')
    const table = this.ui.table().head(['Week (Mon)', 'Branch', 'Matched'])
    rows.forEach((row) => table.row([row.week, row.branch, String(row.n)]))
    table.render()
  }
}

function weekKeys(weeks: number) {
  const current = DateTime.now().setZone(ZONE).startOf('week')
  return Array.from({ length: weeks }, (_, i) => current.minus({ weeks: i }).toISODate()!)
}

function toMap(rows: WeekCount[]) {
  return new Map(rows.map((row) => [row.week, Number(row.n)]))
}

function joinRequest() {
  return `kind = 'join_request'`
}

function northStarFilter(alias: string) {
  return `${alias}.starts_at < now() and ${alias}.status in ('full', 'closed')
    and exists (select 1 from match_requests r where r.match_id = ${alias}.id and r.status = 'accepted')`
}
