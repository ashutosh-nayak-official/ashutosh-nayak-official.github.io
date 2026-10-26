export type Capability = 'full' | 'lite' | 'static'

export function detectCapability(env: {
  reducedMotion: boolean
  webgl: boolean
  cores: number
  memoryGB?: number
  width: number
}): Capability {
  if (env.reducedMotion || !env.webgl) return 'static'
  if (env.cores <= 4 || (env.memoryGB !== undefined && env.memoryGB <= 4) || env.width < 768) {
    return 'lite'
  }
  return 'full'
}
