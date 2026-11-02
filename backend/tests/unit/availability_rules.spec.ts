import { test } from '@japa/runner'
import { DateTime, Settings } from 'luxon'
import { assertAvailabilityWindow } from '#services/availability_rules'
import { PANAMA_ZONE, todayInPanama } from '#services/panama_time'

const futureDate = DateTime.now().setZone(PANAMA_ZONE).plus({ days: 3 }).toISODate()!

function freezePanamaClock(time: string) {
  const at = DateTime.fromISO(`${todayInPanama()}T${time}`, { zone: PANAMA_ZONE }).toMillis()
  Settings.now = () => at
}

test.group('availability rules', (group) => {
  group.each.teardown(() => {
    Settings.now = () => Date.now()
  })

  test('sin horario no lanza error, hoy ni en una fecha futura', ({ assert }) => {
    freezePanamaClock('21:00')
    assert.doesNotThrow(() => assertAvailabilityWindow(todayInPanama(), null, null))
    assert.doesNotThrow(() => assertAvailabilityWindow(futureDate, null, null))
  })

  test('hoy sin medias horas restantes no se puede guardar, aunque no tenga horario', ({
    assert,
  }) => {
    freezePanamaClock('23:45')
    assert.throws(
      () => assertAvailabilityWindow(todayInPanama(), null, null),
      'Por hoy ya no puede haber disponibilidad, elige otro día'
    )
  })

  test('indicar solo uno de desde y hasta lanza error', ({ assert }) => {
    assert.throws(
      () => assertAvailabilityWindow(futureDate, '17:00', null),
      'Indica desde y hasta, o deja la disponibilidad sin horario'
    )
    assert.throws(
      () => assertAvailabilityWindow(futureDate, null, '21:00'),
      'Indica desde y hasta, o deja la disponibilidad sin horario'
    )
  })

  test('con horario, hasta igual o antes de desde lanza error', ({ assert }) => {
    const message = 'La hora de fin debe ser después de la de inicio'
    assert.throws(() => assertAvailabilityWindow(futureDate, '17:00', '17:00'), message)
    assert.throws(() => assertAvailabilityWindow(futureDate, '17:00', '16:30'), message)
  })

  test('con horario válido en fecha futura no lanza error', ({ assert }) => {
    assert.doesNotThrow(() => assertAvailabilityWindow(futureDate, '17:00', '21:00'))
  })
})
