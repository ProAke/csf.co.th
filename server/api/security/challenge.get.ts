import { createMathChallenge } from '../../utils/security'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  return createMathChallenge(config.adminJwtSecret)
})
