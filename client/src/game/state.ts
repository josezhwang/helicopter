export interface GameState {
  ammo: number
  maxAmmo: number
  reloading: boolean
  inHelicopter: boolean
  nearHelicopter: boolean
  carryingFlag: boolean
  score: number
  message: string
  /** Rotor RPM while piloting (0–1000, viewer-style x10 readout). */
  rotorRpm: number
}

type Listener = (s: GameState) => void

export const gameState: GameState = {
  ammo: 30,
  maxAmmo: 30,
  reloading: false,
  inHelicopter: false,
  nearHelicopter: false,
  carryingFlag: false,
  score: 0,
  rotorRpm: 0,
  message: 'Steal the RED flag from the enemy base and bring it to your BLUE base. [E] to board the helicopter.',
}

const listeners = new Set<Listener>()

export function subscribeGameState(fn: Listener): () => void {
  listeners.add(fn)
  fn(gameState)
  return () => {
    listeners.delete(fn)
  }
}

export function setGameState(patch: Partial<GameState>) {
  Object.assign(gameState, patch)
  listeners.forEach((fn) => fn(gameState))
}
