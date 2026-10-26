import type Availability from '#models/availability'

export function serializeAvailability(availability: Availability) {
  return {
    date: availability.date.toISODate(),
    fromTime: availability.fromTime,
    toTime: availability.toTime,
    companyId: availability.companyId,
  }
}

export function serializePlayerAvailability(availability: Availability) {
  const { user } = availability
  return {
    id: user.id,
    fullName: user.fullName,
    category: user.category,
    gender: user.gender,
    avatarUrl: user.avatarUrl,
    availability: serializeAvailability(availability),
  }
}
