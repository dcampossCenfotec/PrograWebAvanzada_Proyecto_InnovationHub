function nullable(value) {
  return value ?? null
}

export function toAuthUserDto(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    memberType: user.memberType,
    email: user.email,
  }
}

export function toOwnUserDto(user) {
  return {
    ...toAuthUserDto(user),
    career: nullable(user.career),
    avatarUrl: null,
    bio: nullable(user.bio),
    interests: [...(user.interests ?? [])],
    availability: user.availability,
    portfolioUrl: nullable(user.portfolioUrl),
    skills: (user.skills ?? []).map(({ skillId, level }) => ({ skillId, level })),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}
