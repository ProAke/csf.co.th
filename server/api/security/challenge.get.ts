import { getJwtSecretRuntime } from '../../utils/auth'
import { createMathChallenge } from '../../utils/security'

export default defineEventHandler((event) => {
  return createMathChallenge(getJwtSecretRuntime(event))
})
