"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import { Mesh, Group } from "three";
import { OrbitControls, Text } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../styles/Wheel.module.css";

const students = [
  "Merve Şahin", "Berke Öztürk", "Ali Tekin", "Ahmet Bayazıt",
  "Hıraı Meysytskyı", "Mediha Alp", "Evren Çorakoğlu", "Mehmet Erdoğan",
  "Arda Öztan", "Sümeyye Battal", "Merve Demirci", "Mustafa Erkılıç",
  "Muammer Çolakoğlu", "Onur Öktem", "Oğuzhan Çevik", "Ümran Baysal",
  "Mehmet Bodur", "Emrah Güney"
];

const colors = [
  "#E63946", "#F1FAEE", "#A8DADC", "#457B9D", "#7D9EC0",
  "#FFB703", "#FB8500", "#06D6A0", "#118AB2", "#EF476F",
  "#FFD166", "#06A77D", "#70C1B3", "#B5838D", "#6D6875",
  "#3A0CA3", "#4361EE", "#F4A261"
];

const segmentCount = students.length;
const segmentAngle = (2 * Math.PI) / segmentCount;

export default function Wheel3D() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [winnerName, setWinnerName] = useState<string | null>(null);
  const spinData = useRef({ rotation: 0, speed: 0 });
  const nextWinnerIndex = useRef<number | null>(null);

  const [windowWidth, setWindowWidth] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth); 
    }
  }, []);

  useEffect(() => {
  if (isSpinning) {
    setWinnerName(null);
  }
}, [isSpinning]);


  useEffect(() => {
    const updateWidth = () => {
      if (typeof window !== "undefined") {
        setWindowWidth(window.innerWidth);
      }
    };
  
    updateWidth();
  
    window.addEventListener("resize", updateWidth); 
  
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const fontSize = windowWidth < 768 ? 0.12 : 0.2; 
  const textPosition: [number, number, number] = windowWidth < 768 ? [1.1, -0.1, 9] : [1.5, -0.3, 9];

  const handleSpin = (rotateWheel: (winnerIndex: number) => void) => {
    if (students.length === 0) return;

    if (selectedIndices.length >= students.length) {
      setSelectedIndices([]);
    }

    setWinnerName(null);

    let index: number;
    do {
      index = Math.floor(Math.random() * students.length);
    } while (selectedIndices.includes(index));

    nextWinnerIndex.current = index;
    setIsSpinning(true);
    rotateWheel(index);
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        onClick={() =>
          handleSpin(() => {
            spinData.current.speed = 0.3 + Math.random() * 0.1;
          })
        }
        disabled={isSpinning}
        id="spin-button"
      >
        {isSpinning ? "Spinning..." : "Spin the Wheel"}
      </button>

      <div className={styles.canvasWrapper}>
        <div className={styles.canvas}>
          <Canvas orthographic camera={{ zoom: 100, position: [0, 0, 100] }}>
            <Scene
              students={students}
              colors={colors}
              isSpinning={isSpinning}
              setIsSpinning={setIsSpinning}
              setWinnerName={setWinnerName}
              spinData={spinData}
              setSelectedIndices={setSelectedIndices}
              nextWinnerIndex={nextWinnerIndex}
              fontSize={fontSize}
              textPosition={textPosition}
            />
          </Canvas>
        </div>
      </div>

      <AnimatePresence>
        {winnerName && (
          <motion.div
            className={styles.winnerPopup}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <strong>🏆 {winnerName}</strong>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedIndices.length > 0 && (
        <div className={styles.winnerList}>
          <h3>Çıkan İsimler:</h3>
          <ul>
            {selectedIndices.map((i, idx) => (
              <li key={idx}>{students[i]}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Scene({
  students,
  colors,
  isSpinning,
  setIsSpinning,
  setWinnerName,
  spinData,
  setSelectedIndices,
  nextWinnerIndex,
  fontSize,
  textPosition
}: {
  students: string[];
  colors: string[];
  isSpinning: boolean;
  setIsSpinning: (val: boolean) => void;
  setWinnerName: (name: string | null) => void;
  spinData: React.MutableRefObject<{ rotation: number; speed: number }>;
  setSelectedIndices: React.Dispatch<React.SetStateAction<number[]>>;
  nextWinnerIndex: React.MutableRefObject<number | null>;
  fontSize: number;
  textPosition: [number, number, number]; 
}) {
  const wheelRef = useRef<Group>(null);
  const gearRef = useRef<Mesh>(null);

  useFrame(() => {
    if (isSpinning && wheelRef.current) {
      spinData.current.rotation += spinData.current.speed;
      spinData.current.speed *= 0.985;

      if (spinData.current.speed < 0.002) {
        setIsSpinning(false);

        const index = nextWinnerIndex.current;

        if (index !== null) {
          const winner = students[index];
          setWinnerName(winner);
          setSelectedIndices((prev) => [...prev, index]);
          nextWinnerIndex.current = null;
        }
      }

      wheelRef.current.rotation.z = spinData.current.rotation;
    }

    if (gearRef.current) {
      gearRef.current.rotation.z -= 0.05;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={2} castShadow />
      <pointLight position={[-5, -5, 5]} intensity={1} />

      <mesh position={[0, 3.3, 1]}>
        <coneGeometry args={[0.15, 0.4, 32]} />
      </mesh>

      <mesh ref={gearRef} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 32, 1, true]} />
        <meshStandardMaterial
          color="red"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      <group ref={wheelRef}>
        {students.map((name, i) => (
          <group key={i} rotation={[0, 0, i * segmentAngle]}>
            <mesh>
              <torusGeometry args={[2.2, 2, 4, 100, segmentAngle]} />
              <meshStandardMaterial
                color={colors[i % colors.length]}
                emissive={colors[i % colors.length]}
                emissiveIntensity={0.5}
                metalness={1}
                roughness={0.4}
                side={2}
              />
            </mesh>
            <Text
              position={textPosition}
              rotation={[0, 0, -segmentAngle / 2]}
              fontSize={fontSize}
              color="black"
              anchorX="center"
              anchorY="middle"
              font="/fonts/SourceCodePro-VariableFont_wght.ttf"
            >
              {name}
            </Text>
          </group>
        ))}
      </group>

      <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
    </>
  );
}