import type Availability from '#models/availability'

export function serializeAvailability(availability: Availability) {
  return {
    date: availability.date.toISODate(),
    fromTime: availability.fromTime,
    toTime: availability.toTime,
    branchId: availability.branchId,
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
