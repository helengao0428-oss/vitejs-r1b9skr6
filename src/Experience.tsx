import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing';
import * as THREE from 'three';

interface ExperienceProps {
  isChaos: boolean;
  handPos: { x: number; y: number };
}

const colorGold = new THREE.Color('#FABC02');
const colorRed = new THREE.Color('#C30F16');
const dummy = new THREE.Object3D();

export function Experience({ isChaos, handPos }: ExperienceProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const starRef = useRef<THREE.Mesh>(null!); // 新增星星的引用
  const progressRef = useRef(0);
  
  const count = 2000; 

  // --- 1. 初始化樹體數據 ---
  const { chaosPos, targetPos, colors } = useMemo(() => {
    const c = new Float32Array(count * 3);
    const t = new Float32Array(count * 3);
    const colorArray = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Chaos Position
      const r = 18 * Math.pow(Math.random(), 0.5);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      c.set([r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi)], i * 3);

      // Target Position (Dense Tree)
      const h = Math.random() * 14; 
      const radiusAtH = (14 - h) * 0.32 * Math.pow(Math.random(), 0.6); 
      const angle = Math.random() * Math.PI * 2;
      t.set([Math.cos(angle) * radiusAtH, h - 7, Math.sin(angle) * radiusAtH], i * 3);

      const color = Math.random() > 0.4 ? colorGold : colorRed;
      color.toArray(colorArray, i * 3);
    }
    return { chaosPos: c, targetPos: t, colors: colorArray };
  }, []);

  // --- 2. 手繪創建 3D 五角星幾何體 ---
  const starGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const outerRadius = 0.8; // 外圈半徑
    const innerRadius = 0.4; // 內圈半徑
    const points = 5;        // 五個角

    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    // 將 2D 形狀擠壓成 3D，並加上倒角增加反光感
    const extrudeSettings = {
      depth: 0.2,         // 星星厚度
      bevelEnabled: true, // 啟用倒角
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 3,
    };
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center(); // 確保旋轉中心在星星中間
    return geo;
  }, []);


  // --- 3. 核心動畫循環 ---
  useFrame((state) => {
    const targetProgress = isChaos ? 1 : 0;
    progressRef.current = THREE.MathUtils.lerp(progressRef.current, targetProgress, 0.04);

    // 更新彩球 InstancedMesh
    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;
      dummy.position.x = THREE.MathUtils.lerp(targetPos[ix], chaosPos[ix], progressRef.current);
      dummy.position.y = THREE.MathUtils.lerp(targetPos[iy], chaosPos[iy], progressRef.current);
      dummy.position.z = THREE.MathUtils.lerp(targetPos[iz], chaosPos[iz], progressRef.current);
      dummy.rotation.set(state.clock.elapsedTime * 0.1, i, 0);
      const scale = THREE.MathUtils.lerp(1.0, 0.5, progressRef.current);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.rotation.y += 0.0015;

    // --- 控制星星的穩定動態 ---
    if (starRef.current) {
      // 緩慢自轉，展示金色反光
      starRef.current.rotation.y += 0.005; 
      // 極微小的上下浮動，增加生命力，但看起來是穩定的
      starRef.current.position.y = 7.6 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }

    // 相機跟隨
    const camTargetX = handPos.x * 7;
    const camTargetY = 5 + handPos.y * 4;
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, camTargetX, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, camTargetY, 0.05);
    state.camera.lookAt(0, 1, 0);
  });

  return (
    <>
      <color attach="background" args={['#010403']} />
      <PerspectiveCamera makeDefault position={[0, 4, 24]} fov={40} />
      <OrbitControls enableDamping minDistance={10} maxDistance={60} enablePan={false} />

      <Environment preset="city" />
      <ambientLight intensity={0.4} color="#FABC02" />
      <spotLight position={[15, 20, 15]} angle={0.5} penumbra={1} intensity={2} color="#FABC02" />
      <pointLight position={[-10, 5, -10]} intensity={1.5} color="#C30F16" />

      {/* 密集彩球主體 */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <sphereGeometry args={[0.25, 24, 24]}>
          <instancedBufferAttribute attach="attributes-color" args={[colors, 3]} />
        </sphereGeometry>
        <meshStandardMaterial vertexColors metalness={1.0} roughness={0.1} envMapIntensity={2.5} />
      </instancedMesh>

      {/* --- 頂部五角星 --- */}
      {/* 移除了 Float，直接設置位置 */}
      <mesh ref={starRef} position={[0, 7.6, 0]} geometry={starGeometry}>
        <meshStandardMaterial
          color="#FABC02"
          emissive="#FABC02"
          emissiveIntensity={3} // 強烈自發光
          metalness={1.0}       // 完全金屬感
          roughness={0.1}       // 光滑表面
          envMapIntensity={3}   // 強環境反射
        />
      </mesh>

      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={0.8} intensity={1.5} mipmapBlur />
        <ToneMapping />
        <Vignette darkness={1.2} offset={0.2} />
      </EffectComposer>
    </>
  );
}