import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { heightAt } from './terrain'

/** Seat offset where the player camera sits while piloting. */
export const HELI_SEAT_OFFSET = new THREE.Vector3(0.0, 1.6, 0.4)

export interface Helicopter {
  object: THREE.Group
  update: (dt: number, time: number) => void
<<<<<<< HEAD
=======
  /** Space = spool up, Shift = spool down (viewer-style RPM control). */
  updateRotorInput: (spoolUp: boolean, spoolDown: boolean, dt: number) => void
>>>>>>> dd8169b (OK)
  setParked: (parked: boolean) => void
  parked: boolean
  /** 0..100, matches the classic RPM HUD readout (x10 => up to 1000). */
  getRotorSpeed: () => number
}

/**
<<<<<<< HEAD
 * Loads the animated helicopter GLB, normalizes scale, and plays its built-in
 * animations via AnimationMixer: an idle clip when parked, a faster flight
 * clip while piloted. If the model ships no usable clips, a synthesized
 * 4-blade main rotor + tail rotor are spun procedurally instead.
=======
 * Loads the animated helicopter GLB and drives its rotors manually exactly
 * like the standalone viewer: Space ramps target RPM, Shift ramps it down,
 * the main rotor spins on its local Z and the rear rotor on its local X
 * (correct for this model's baked transforms).
 *
 * Node names in this GLB: "main_rotor__0" and "rear_rotor_1" (rear, NOT tail —
 * which is why name searches for "tail rotor" used to fail).
>>>>>>> dd8169b (OK)
 */
export function createHelicopter(padWorldPos: THREE.Vector3, onLoaded?: (h: Helicopter) => void): Helicopter {
  const object = new THREE.Group()
  object.position.copy(padWorldPos)

<<<<<<< HEAD
  const state = {
    velocity: new THREE.Vector3(),
    parked: true,
    // Rotor RPM state machine: idle at 20%, spool to 100% when piloted
    rotorSpeed: 0,
    targetRotorSpeed: 20,
  }

  // --- Synthesized fallback rotors (only used if GLB has no animations) ---
  let fallbackMainRotor: THREE.Object3D | null = null
  let fallbackTailRotor: THREE.Object3D | null = null

  let mixer: THREE.AnimationMixer | null = null
  let idleAction: THREE.AnimationAction | null = null
  let flightAction: THREE.AnimationAction | null = null

=======
  // --- Viewer-style rotor state ---
  const state = {
    rotorSpeed: 0,
    targetRotorSpeed: 0,
    maxRotorSpeed: 100,
    parked: true,
  }

  // Rotor nodes found by name in the GLB
  let mainRotor: THREE.Object3D | null = null
  let tailRotor: THREE.Object3D | null = null

  // Synthesized rotors, only if the model ever ships without named ones
  let fallbackMainRotor: THREE.Object3D | null = null
  let fallbackTailRotor: THREE.Object3D | null = null

>>>>>>> dd8169b (OK)
  const heli: Helicopter = {
    object,
    parked: true,
    getRotorSpeed: () => state.rotorSpeed,
<<<<<<< HEAD
    setParked(p: boolean) {
      state.parked = p
      heli.parked = p
      state.targetRotorSpeed = p ? 20 : 100
      if (p) {
        state.velocity.set(0, 0, 0)
      }
      if (idleAction && flightAction) {
        if (p) {
          flightAction.fadeOut(0.5)
          idleAction.reset().fadeIn(0.5).play()
        } else {
          idleAction.fadeOut(0.5)
          flightAction.reset().fadeIn(0.5).play()
        }
      }
    },
    update(dt: number, time: number) {
      // Smooth rotor acceleration (lerp toward target RPM)
      state.rotorSpeed = THREE.MathUtils.lerp(
        state.rotorSpeed,
        state.targetRotorSpeed,
        (state.parked ? 1.5 : 0.9) * dt,
      )

      if (mixer) {
        // Clips animate the rotors: scale their speed with RPM
        const maxScale = state.parked ? 1.2 : 3.5
        mixer.timeScale = (state.rotorSpeed / 100) * maxScale
        mixer.update(dt)
      } else {
        if (fallbackMainRotor) fallbackMainRotor.rotation.y += (state.rotorSpeed / 100) * 40 * dt
        if (fallbackTailRotor) fallbackTailRotor.rotation.x += (state.rotorSpeed / 100) * 56 * dt
      }
=======

    updateRotorInput(spoolUp: boolean, spoolDown: boolean, dt: number) {
      if (spoolUp) state.targetRotorSpeed += 25 * dt
      if (spoolDown) state.targetRotorSpeed -= 35 * dt
      state.targetRotorSpeed = THREE.MathUtils.clamp(
        state.targetRotorSpeed,
        0,
        state.maxRotorSpeed,
      )
    },

    setParked(p: boolean) {
      state.parked = p
      heli.parked = p
      // Engines cut when parked: propeller winds down to a stop
      if (p) {
        state.targetRotorSpeed = 0
      }
    },

    update(dt: number, time: number) {
      // Smooth rotor acceleration toward target — runs ALWAYS so the
      // propeller winds down after dismount, not just while piloted.
      // (Same lerp factor as the viewer: 4 * delta)
      state.rotorSpeed = THREE.MathUtils.lerp(
        state.rotorSpeed,
        state.targetRotorSpeed,
        4 * dt,
      )

      // Main rotor spins about its LOCAL Z, rear rotor about its LOCAL X —
      // exactly the viewer's formulas (correct for this model's bakes).
      const spin = state.rotorSpeed
      if (mainRotor) mainRotor.rotation.z += spin * dt
      if (tailRotor) tailRotor.rotation.x += spin * 1.5 * dt
      if (fallbackMainRotor) fallbackMainRotor.rotation.y += (spin / 100) * 40 * dt
      if (fallbackTailRotor) fallbackTailRotor.rotation.x += (spin / 100) * 56 * dt
>>>>>>> dd8169b (OK)

      if (state.parked) {
        object.position.y = padWorldPos.y + Math.sin(time * 1.2) * 0.05
      }
<<<<<<< HEAD
      // While flying, the flight controller owns position.y entirely
=======
      // While piloted, the flight controller owns position.y entirely
>>>>>>> dd8169b (OK)
    },
  }

  const loader = new GLTFLoader()
  loader.load(
    '/animated_helicopter.glb',
    (gltf) => {
      const model = gltf.scene
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })

      // Normalize size: longest dimension ~ 16 units
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = 16 / maxDim
      model.scale.setScalar(scale)
      model.position.y -= box.min.y * scale // sit on ground

      object.add(model)

<<<<<<< HEAD
      // Play built-in animations
      const clips = gltf.animations ?? []
      if (clips.length > 0) {
        mixer = new THREE.AnimationMixer(model)
        // Heuristic: rotor/idle-ish clip for parked, the longest clip for flight
        const idleClip =
          clips.find((c) => /idle|hover|rotor|spin/i.test(c.name)) ??
          clips.reduce((a, b) => (a.duration <= b.duration ? a : b))
        idleAction = mixer.clipAction(idleClip)
        idleAction.play()

        if (clips.length > 1) {
          const flightClip =
            clips.find((c) => /fly|flight|move|fast/i.test(c.name)) ??
            clips.filter((c) => c !== idleClip)[0]
          if (flightClip) {
            flightAction = mixer.clipAction(flightClip)
          }
        }
      } else {
        // No clips: build procedural rotor blades
=======
      // Find rotors by name: main_rotor__0 / rear_rotor_1 (also accept tail_*)
      model.traverse((node) => {
        const name = node.name.toLowerCase()
        if (name.includes('rotor') || name.includes('propeller')) {
          if (name.includes('main')) mainRotor = node
          else if (name.includes('rear') || name.includes('tail')) tailRotor = node
        }
      })

      if (!mainRotor || !tailRotor) {
        console.warn(
          '[helicopter] rotor nodes missing — main:',
          mainRotor?.name ?? null,
          'rear/tail:',
          tailRotor?.name ?? null,
        )
      }

      // Fallback: synthesized blades if the model ever loses its named nodes
      if (!mainRotor) {
>>>>>>> dd8169b (OK)
        const rotorGroup = new THREE.Group()
        const bladeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6, metalness: 0.4 })
        for (let i = 0; i < 4; i++) {
          const blade = new THREE.Mesh(new THREE.BoxGeometry(9, 0.08, 0.7), bladeMat)
          blade.rotation.y = (i / 4) * Math.PI
          rotorGroup.add(blade)
        }
<<<<<<< HEAD
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.5, 8), bladeMat)
        rotorGroup.add(hub)
=======
        rotorGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.5, 8), bladeMat))
>>>>>>> dd8169b (OK)
        const bbox = new THREE.Box3().setFromObject(model)
        rotorGroup.position.y = bbox.max.y - object.position.y + 0.05
        object.add(rotorGroup)
        fallbackMainRotor = rotorGroup
<<<<<<< HEAD

        const tailGroup = new THREE.Group()
=======
      }
      if (!tailRotor) {
        const tailGroup = new THREE.Group()
        const bladeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6, metalness: 0.4 })
>>>>>>> dd8169b (OK)
        for (let i = 0; i < 2; i++) {
          const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.4, 0.3), bladeMat)
          blade.rotation.x = (i / 2) * Math.PI
          tailGroup.add(blade)
        }
        const tailBbox = new THREE.Box3().setFromObject(model)
        tailGroup.position.set(tailBbox.max.x - 0.4, tailBbox.max.y - 1.2, 0)
        object.add(tailGroup)
        fallbackTailRotor = tailGroup
      }

      console.log(
<<<<<<< HEAD
        `[helicopter] model loaded, ${clips.length} animation clip(s):`,
        clips.map((c) => c.name),
=======
        '[helicopter] loaded — main rotor:',
        mainRotor ? (mainRotor as THREE.Object3D).name : 'fallback',
        '| rear rotor:',
        tailRotor ? (tailRotor as THREE.Object3D).name : 'fallback',
>>>>>>> dd8169b (OK)
      )
      onLoaded?.(heli)
    },
    undefined,
    (err) => {
      console.error('Failed to load helicopter GLB:', err)
    },
  )

  return heli
}

/** Ground-follow helper used by the flight controller. */
export function heliGroundClearance(x: number, z: number, alt: number): number {
  return alt - heightAt(x, z)
}
