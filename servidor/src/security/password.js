import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback)
const PARAMETERS = Object.freeze({ cost: 16384, blockSize: 8, parallelization: 1 })
const KEY_LENGTH = 64
const SALT_LENGTH = 16
const MAX_MEMORY = 64 * 1024 * 1024

export async function hashPassword(password, { random = randomBytes } = {}) {
  const salt = random(SALT_LENGTH)
  const derivedKey = await scrypt(password, salt, KEY_LENGTH, {
    N: PARAMETERS.cost,
    r: PARAMETERS.blockSize,
    p: PARAMETERS.parallelization,
    maxmem: MAX_MEMORY,
  })
  return [
    'scrypt',
    `N=${PARAMETERS.cost}`,
    `r=${PARAMETERS.blockSize}`,
    `p=${PARAMETERS.parallelization}`,
    salt.toString('base64url'),
    derivedKey.toString('base64url'),
  ].join('$')
}

export async function verifyPassword(password, encodedHash) {
  try {
    const [algorithm, costPart, blockPart, parallelPart, saltPart, hashPart, extra] = encodedHash.split('$')
    if (algorithm !== 'scrypt' || extra !== undefined) return false

    const cost = Number(costPart.replace('N=', ''))
    const blockSize = Number(blockPart.replace('r=', ''))
    const parallelization = Number(parallelPart.replace('p=', ''))
    if (cost !== PARAMETERS.cost || blockSize !== PARAMETERS.blockSize || parallelization !== PARAMETERS.parallelization) {
      return false
    }

    const salt = Buffer.from(saltPart, 'base64url')
    const expected = Buffer.from(hashPart, 'base64url')
    if (salt.length < SALT_LENGTH || expected.length !== KEY_LENGTH) return false

    const actual = await scrypt(password, salt, expected.length, {
      N: cost,
      r: blockSize,
      p: parallelization,
      maxmem: MAX_MEMORY,
    })
    return timingSafeEqual(actual, expected)
  } catch {
    return false
  }
}
