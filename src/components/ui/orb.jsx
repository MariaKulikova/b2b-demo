import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';

// Компонент для анимированного орба
const AnimatedOrb = ({ color = '#2563eb', isActive = false, isSpeaking = false }) => {
  const meshRef = useRef();
  const materialRef = useRef();

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;

    // Вращение орба
    meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;

    // Пульсация при активности
    if (isActive || isSpeaking) {
      const scale = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
      meshRef.current.scale.setScalar(scale);
    } else {
      meshRef.current.scale.setScalar(1);
    }

    // Изменение distort при речи
    if (isSpeaking) {
      materialRef.current.distort = 0.4 + Math.sin(state.clock.getElapsedTime() * 3) * 0.2;
    } else if (isActive) {
      materialRef.current.distort = 0.2;
    } else {
      materialRef.current.distort = 0.1;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]}>
      <MeshDistortMaterial
        ref={materialRef}
        color={color}
        attach="material"
        distort={0.1}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
};

// Основной компонент Orb
export const Orb = ({
  className = '',
  isActive = false,
  isSpeaking = false,
  color = '#2563eb',
  size = 200
}) => {
  return (
    <div
      className={`orb-container ${className}`}
      style={{ width: size, height: size }}
    >
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* eslint-disable-next-line react/no-unknown-property */}
        <ambientLight intensity={0.5} />
        {/* eslint-disable-next-line react/no-unknown-property */}
        <pointLight position={[10, 10, 10]} intensity={1} />
        {/* eslint-disable-next-line react/no-unknown-property */}
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#60a5fa" />
        <AnimatedOrb color={color} isActive={isActive} isSpeaking={isSpeaking} />
      </Canvas>
    </div>
  );
};
