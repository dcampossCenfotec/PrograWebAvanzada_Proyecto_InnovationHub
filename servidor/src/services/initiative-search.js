export function normalizeInitiativeSearch(value) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('es')
}

export function initiativeSearchFields(input) {
  return {
    titleNormalized: normalizeInitiativeSearch(input.title),
    publicSearchText: normalizeInitiativeSearch([input.title, input.summary].join(' ')),
    searchText: normalizeInitiativeSearch([input.title, input.summary, ...input.tags].join(' ')),
  }
}
