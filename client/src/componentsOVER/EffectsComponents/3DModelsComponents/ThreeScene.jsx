import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useInView } from "react-intersection-observer";
import SpinningModel from "./SpinningModel"; 

export default function ThreeScene() {
  const { ref, inView } = useInView({
    threshold: 0.4,
    triggerOnce: false,
  });

  return (
    <div ref={ref} className=" h-[500px]">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 2, 1]} />
        <SpinningModel inView={inView} position={[0, -0.5, 0]} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}
