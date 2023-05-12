import React, { Suspense } from "react";
import * as THREE from "three";
import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  Text,
  Decal,
  Edges,
  Caustics,
  Environment,
  OrbitControls,
  RenderTexture,
  RandomizedLight,
  PerspectiveCamera,
  AccumulativeShadows,
  MeshTransmissionMaterial,
  Float,
} from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Geometry, Base, Subtraction } from "@react-three/csg";
import coral from "./coral_blender.glb";
import coral2 from "./coral_blender2.glb";

export default function App() {
  return (
    <Canvas shadows camera={{ position: [-4.5, 0, 12], fov: 35 }}>
      <Suspense fallback={null}>
        <color attach="background" args={["Goldenrod"]} />
        <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/industrial_workshop_foundry_1k.hdr" />

        <group position={[0.5, -1.5, 0]}>
          <Bunny color={"Lime"} scale={2} position={[0, -0.075, 0]} />
          <AccumulativeShadows temporal frames={100} scale={20} alphaTest={0.85} color="hotpink" colorBlend={2}>
            <RandomizedLight amount={8} radius={5} ambient={0.5} position={[5, 5, -10]} bias={0.001} />
          </AccumulativeShadows>
          {/* <Caustics color="hotpink" lightSource={[5, 5, -10]} worldRadius={0.01} ior={1.1} intensity={0.01}>
            <mesh castShadow position={[2, 0.5, 2]}>
              <sphereGeometry args={[0.5, 64, 64]} />
              <MeshTransmissionMaterial resolution={768} thickness={0.3} anisotropy={1} chromaticAberration={0.1} />
            </mesh>
          </Caustics> */}
        </group>
        <Coral color={""} url={coral} scale={25} rotation={[Math.PI / 2, 0, 0]} position={[2, 0, -5]} />
        <Coral color={""} url={coral2} scale={25} rotation={[0, 0, 0]} position={[-5, 4, -2]} />

        <EffectComposer>
          <Bloom luminanceThreshold={1} intensity={10} levels={9} mipmapBlur />
        </EffectComposer>
        <OrbitControls enablePan={false} autoRotate autoRotateSpeed={0.75} />
      </Suspense>
    </Canvas>
  );
}

function Coral(props) {
  const { nodes } = useGLTF(props.url);
  return (
    <Caustics lightSource={[2.5, 5, -2.5]} intensity={0.1}>
      {/* // <Caustics debug color="hot" lightSource={[2.5, 5, -1]} worldRadius={0.01} ior={1.1} intensity={0.1}> */}
      <group transform scale={props.scale} rotation={props.rotation} position={props.position}>
        <mesh geometry={nodes.Mesh_0.geometry} material={nodes.Mesh_0.material}>
          {/* <meshStandardMaterial attach="material" wireframe={false} color={"#f3b64d"} flatShading={true} roughness={0.3} metalness={0.95} /> */}
          <MeshTransmissionMaterial color={props.color} resolution={768} thickness={0.1} anisotropy={1} chromaticAberration={0.1} />
        </mesh>
      </group>
    </Caustics>
  );
}

function Bunny({ cutterScale = 0.85, cutterPos = [-1.5, 2, 0.5], ...props }) {
  const cutter = useRef();
  const { nodes } = useGLTF("https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/bunny/model.gltf");
  useFrame((state, delta) => {
    cutter.current.rotation.x = Math.sin(state.clock.elapsedTime / 10);
    cutter.current.rotation.z = Math.cos(state.clock.elapsedTime / 10);
  });
  return (
    <Caustics color="hotpink" lightSource={[5, 5, -10]} worldRadius={0.6} ior={1.2} intensity={0.2}>
      <mesh castShadow receiveShadow {...props} dispose={null}>
        <mesh ref={cutter} scale={cutterScale * 0.95} position={cutterPos}>
          <sphereGeometry />
          <meshBasicMaterial transparent opacity={0} />
          <Edges scale={0.95} threshold={11.2}>
            <lineBasicMaterial color={[20, 0.5, 20]} toneMapped={false} />
          </Edges>
        </mesh>
        <Geometry>
          <Base geometry={nodes.bunny.geometry} />
          <Subtraction scale={cutterScale} position={cutterPos}>
            <sphereGeometry />
          </Subtraction>
        </Geometry>
        <MeshTransmissionMaterial
          color={props.color}
          resolution={128}
          thickness={0.5}
          anisotropy={2}
          temporalDistortion={0.1}
          distortion={10}
        />
        <Decal position={[0, 1.3, 0.7]} rotation={0} scale={1.25}>
          <meshBasicMaterial
            transparent
            polygonOffset
            polygonOffsetFactor={-100}
            color={[2, 0.5, 10]}
            side={THREE.DoubleSide}
            toneMapped={false}
          >
            <TickerTexture />
          </meshBasicMaterial>
        </Decal>
      </mesh>
    </Caustics>
  );
}

function TickerTexture() {
  const textRef = useRef();
  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      if (++count > 99) count = 0;
      // textRef.current.text = `${count}%`;
      textRef.current.text = `coral`;

      textRef.current.sync();
    }, 100);
    return () => clearInterval(interval);
  });
  return (
    <RenderTexture attach="map" anisotropy={16}>
      <PerspectiveCamera makeDefault manual aspect={1 / 1} position={[1.5, 0, 5]} />
      <Text anchorX="right" rotation={[0, Math.PI, 0]} ref={textRef} fontSize={1.5} />
    </RenderTexture>
  );
}
