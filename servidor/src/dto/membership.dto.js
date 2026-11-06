
export function toMembershipDto({ membership, user }) {
  return {
    id: membership.id,
    initiativeId: membership.initiativeId,
    user: {
      id: user.id, firstName: user.firstName, lastName: user.lastName,
    },
    role: membership.role,
    state: membership.state,
    joinedAt: new Date(membership.joinedAt).toISOString(),
    retiredAt: membership.retiredAt ? new Date(membership.retiredAt).toISOString() : null,
  }
}
