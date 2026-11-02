import BusinessRuleError from '#exceptions/business_rule_error'
import { earliestSlotToday, todayInPanama } from '#services/panama_time'

export function assertAvailabilityWindow(
  date: string,
  fromTime: string | null,
  toTime: string | null
): void {
  if (date === todayInPanama() && earliestSlotToday() === null) {
    throw new BusinessRuleError('Por hoy ya no puede haber disponibilidad, elige otro día')
  }
  if (fromTime === null && toTime === null) return
  if (fromTime === null || toTime === null) {
    throw new BusinessRuleError('Indica desde y hasta, o deja la disponibilidad sin horario')
  }
  if (toTime <= fromTime) {
    throw new BusinessRuleError('La hora de fin debe ser después de la de inicio')
  }
  assertNotPast(date, fromTime)
}

/** Same-day slots can't start before the next half hour. */
function assertNotPast(date: string, fromTime: string): void {
  if (date !== todayInPanama()) return
  const earliest = earliestSlotToday()!
  if (fromTime < earliest) {
    throw new BusinessRuleError('Esa hora ya pasó, elige una hora posterior')
  }
}
