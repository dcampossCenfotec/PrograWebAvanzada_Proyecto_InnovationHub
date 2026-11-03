export function createUsersRepository({ User }) {
  if (!User) throw new TypeError('createUsersRepository requiere el modelo User.')

  return Object.freeze({
    listActive({ filter, sort, skip, limit }) {
      return User.find({ active: true, ...filter })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec()
    },

    countActive(filter) {
      return User.countDocuments({ active: true, ...filter }).exec()
    },

    findActiveById(id) {
      return User.findOne({ id, active: true }).exec()
    },

    updateActiveById(id, profile, updatedAt) {
      return User.findOneAndUpdate(
        { id, active: true },
        { $set: { ...profile, updatedAt } },
        { returnDocument: 'after', runValidators: true },
      ).exec()
    },
  })
}
