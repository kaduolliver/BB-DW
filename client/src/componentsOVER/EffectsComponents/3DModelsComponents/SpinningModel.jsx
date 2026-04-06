import { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three-stdlib";
import { DRACOLoader } from "three-stdlib";

export default function SpinningModel({ inView, position = [0, 0, 0] }) {
  const meshRef = useRef();

  // Configure DRACO Loader
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/"); 

  const gltf = useLoader(GLTFLoader, "/models/Infinity-CreditCard-3D-DRACO.glb", (loader) => {
    loader.setDRACOLoader(dracoLoader);
  });

  useFrame(() => {
    if (inView && meshRef.current) {
      //meshRef.current.rotation.y += 0.003;
      //meshRef.current.rotation.x += 0.002;
      meshRef.current.rotation.z += 0.08;
    }
  });

  return (
    <primitive
      ref={meshRef}
      object={gltf.scene}
      position={position}
      scale={0.04}
      rotation={[(3 * Math.PI) / 2, Math.PI, Math.PI]}
    //rotation={[0, Math.PI / 2, Math.PI / 2]} 
    />

  );
}
