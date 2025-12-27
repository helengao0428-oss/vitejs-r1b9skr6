import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Experience } from './Experience';
import * as THREE from 'three';

export default function App() {
  const [isChaos, setIsChaos] = useState(false);
  const [handPos, setHandPos] = useState({ x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const smoothedDistRef = useRef(0.15);

  useEffect(() => {
    // --- 關鍵修正：在 useEffect 內重新抓取變量，確保 CDN 已載入 ---
    const Hands = (window as any).Hands;
    const CameraConstructor = (window as any).Camera;

    if (!Hands || !CameraConstructor) {
      console.error("❌ MediaPipe 腳本尚未載入。請嘗試重新整理頁面。");
      return;
    }

    const hands = new Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results: any) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        // 計算食指尖(8)與大拇指尖(4)的距離
        const dx = landmarks[8].x - landmarks[4].x;
        const dy = landmarks[8].y - landmarks[4].y;
        const rawDistance = Math.sqrt(dx * dx + dy * dy);

        // 📝 調試輸出：你可以透過這個數字來調整下面的 0.25 和 0.10
        // console.log("Current Distance:", rawDistance.toFixed(3));

        smoothedDistRef.current = THREE.MathUtils.lerp(smoothedDistRef.current, rawDistance, 0.1);

        // 狀態鎖定邏輯
        if (smoothedDistRef.current > 0.25) { 
          setIsChaos(true); 
        } else if (smoothedDistRef.current < 0.10) { 
          setIsChaos(false); 
        }

        setHandPos(prev => ({
          x: THREE.MathUtils.lerp(prev.x, (landmarks[9].x - 0.5) * 2, 0.05),
          y: THREE.MathUtils.lerp(prev.y, (landmarks[9].y - 0.5) * -2, 0.05),
        }));
      }
    });

    if (videoRef.current) {
      const camera = new CameraConstructor(videoRef.current, {
        onFrame: async () => {
          await hands.send({ image: videoRef.current! });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }

    return () => hands.close();
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#000', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: '40px', width: '100%', textAlign: 'center', zIndex: 10, pointerEvents: 'none'
      }}>
        <h1 style={{
          color: '#FABC02', margin: 0, fontSize: '2.8rem', letterSpacing: '2px', fontWeight: 'bold',
          fontFamily: 'serif', textShadow: '0 0 15px rgba(250, 188, 2, 0.6)'
        }}>
          Merry Christmas, Vandy
        </h1>
      </div>

      <video
        ref={videoRef}
        style={{
          position: 'absolute', bottom: '20px', right: '20px', width: '160px', height: '120px',
          zIndex: 20, borderRadius: '10px', border: '2px solid #FABC02', transform: 'scaleX(-1)',
          objectFit: 'cover', opacity: 0.8
        }}
      />

      <Canvas shadows camera={{ position: [0, 4, 22], fov: 45 }}>
        <Experience isChaos={isChaos} handPos={handPos} />
      </Canvas>
    </div>
  );
}