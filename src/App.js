import * as THREE from 'three'
import React, { Suspense, useEffect, useState, useRef, forwardRef, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Reflector, Text, useTexture, useGLTF } from '@react-three/drei'
import Overlay from './Overlay'

const isSafari = () => {
  const ua = navigator.userAgent.toLowerCase()
  return ua.indexOf('safari') > -1 && ua.indexOf('chrome') < 0
}

function Carla(props) {
  const { scene } = useGLTF('carla-draco.glb')
  return <primitive object={scene} {...props} />
}
function useMuteWithRefCallback() {
  const ref = useRef(null)
  const setRef = useCallback((node) => {
    // Save a reference to the node
    ref.current = node

    if (isSafari() && ref.current) {
      // obtain reference to the video element
      const player = ref.current.image
      // if the reference to video player has been obtained
      if (player) {
        console.log(player)
        // set the video attributes using javascript as per the
        // webkit Policy
        player.controls = false
        player.playsinline = true
        player.muted = true
        player.setAttribute('muted', '') // leave no stones unturned :)
        player.autoplay = true

        // Let's wait for an event loop tick and be async.
        setTimeout(() => {
          // player.play() might return a promise but it's not guaranteed crossbrowser.
          const promise = player.play()
          // let's play safe to ensure that if we do have a promise
          if (promise.then) {
            promise
              .then(() => {})
              .catch(() => {
                // if promise fails, hide the video and fallback to <img> tag
                ref.current.style.display = 'none'
                setShouldUseImage(true)
              })
          }
        }, 0)
      }
    }
  }, [])

  return [setRef]
}

const VideoText = forwardRef(({ clicked, ...props }, ref) => {
  const [video] = useState(() => Object.assign(document.createElement('video'), { src: 'eddie.mp4', crossOrigin: 'Anonymous', loop: false }))
  useEffect(() => void (clicked && video.play()), [video, clicked])
  return (
    <Text font="/Inter-Bold.woff" fontSize={3} letterSpacing={-0.06} {...props}>
      eddie
      <meshBasicMaterial toneMapped={false}>
        <videoTexture attach="map" args={[video]} ref={ref} encoding={THREE.sRGBEncoding} />
      </meshBasicMaterial>
    </Text>
  )
})

function Ground() {
  const [floor, normal] = useTexture(['SurfaceImperfections003_1K_var1.jpg', 'SurfaceImperfections003_1K_Normal.jpg'])
  return (
    <Reflector blur={[400, 100]} resolution={512} args={[10, 10]} mirror={0.5} mixBlur={6} mixStrength={1.5} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
      {(Material, props) => <Material color="#a0a0a0" metalness={0.4} roughnessMap={floor} normalMap={normal} normalScale={[2, 2]} {...props} />}
    </Reflector>
  )
}

export default function App() {
  const [clicked, setClicked] = useState(false)
  const [ready, setReady] = useState(false)
  const [ref] = useMuteWithRefCallback()
  const store = { clicked, setClicked, ready, setReady }
  return (
    <>
      <Canvas concurrent gl={{ alpha: false }} pixelRatio={[1, 1.5]} camera={{ position: [0, 3, 100], fov: 15 }}>
        <color attach="background" args={['black']} />
        <fog attach="fog" args={['black', 15, 20]} />
        <Suspense fallback={null}>
          <group position={[0, -1, 0]}>
            <Carla rotation={[0, Math.PI - 0.4, 0]} position={[-1.2, 0, 0.6]} scale={[0.26, 0.26, 0.26]} />
            <VideoText {...store} ref={ref} position={[0, 1.3, -2]} />
            <Ground />
          </group>
          <ambientLight intensity={0.5} />
          <spotLight position={[0, 10, 0]} intensity={0.3} />
          <directionalLight position={[-20, 0, -10]} intensity={0.7} />
          <Intro start={ready && clicked} set={setReady} />
        </Suspense>
      </Canvas>
      <Overlay {...store} />
    </>
  )
}

function Intro({ start, set }) {
  const [vec] = useState(() => new THREE.Vector3())
  useEffect(() => setTimeout(() => set(true), 500), [])
  return useFrame((state) => {
    if (start) {
      state.camera.position.lerp(vec.set(state.mouse.x * 5, 3 + state.mouse.y * 2, 14), 0.05)
      state.camera.lookAt(0, 0, 0)
    }
  })
}
