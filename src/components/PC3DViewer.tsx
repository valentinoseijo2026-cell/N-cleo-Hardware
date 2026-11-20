import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { PCComponent, ComponentCategory } from '../types';
import { COMPONENTS_DATABASE } from '../data/componentsData';
import { checkClearance } from '../utils/builderUtils';
import {
  Eye,
  Sliders,
  Shield,
  Layers,
  Sparkles,
  RotateCcw,
  Maximize2,
  Box,
  Cpu,
  Info,
  Volume2,
  VolumeX,
  Gauge,
  Camera,
  Check,
  Wind,
  Flame
} from 'lucide-react';

interface PC3DViewerProps {
  build: Partial<Record<ComponentCategory, PCComponent>>;
  buildName: string;
  onSelectCase?: (caseComponent: PCComponent) => void;
  profileRgbMode?: 'rainbow' | 'breathing' | 'static' | 'pulse' | 'off';
  profileSoundEnabled?: boolean;
  profileThemeAccent?: 'red' | 'cyberpunk' | 'stealth' | 'white' | 'emerald';
}

function mapProfileLighting(
  rgbMode?: 'rainbow' | 'breathing' | 'static' | 'pulse' | 'off',
  accent?: 'red' | 'cyberpunk' | 'stealth' | 'white' | 'emerald'
): 'red' | 'rgb' | 'cyberpunk' | 'white' | 'stealth' {
  if (rgbMode === 'off') return 'stealth';
  if (rgbMode === 'rainbow') return 'rgb';
  if (accent === 'cyberpunk') return 'cyberpunk';
  if (accent === 'white') return 'white';
  if (accent === 'stealth') return 'stealth';
  return 'red';
}

export const PC3DViewer: React.FC<PC3DViewerProps> = ({
  build,
  buildName,
  onSelectCase,
  profileRgbMode,
  profileSoundEnabled,
  profileThemeAccent
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // User Interactive States
  const [glassRemoved, setGlassRemoved] = useState(false);
  const [explodedFactor, setExplodedFactor] = useState(0); // 0 (assembled) to 1 (fully exploded)
  const [lightingMode, setLightingMode] = useState<'red' | 'rgb' | 'cyberpunk' | 'white' | 'stealth'>(() =>
    mapProfileLighting(profileRgbMode, profileThemeAccent)
  );
  const [chassisTheme, setChassisTheme] = useState<'stealth' | 'snow'>('stealth');
  const [activeCameraPreset, setActiveCameraPreset] = useState<'iso' | 'interior' | 'front' | 'side' | 'gpu'>('iso');
  const [fanSpeed, setFanSpeed] = useState<'normal' | 'fast' | 'stopped'>('normal');
  const [showAirflow, setShowAirflow] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(profileSoundEnabled ?? false);
  const [snapshotSuccess, setSnapshotSuccess] = useState(false);

  useEffect(() => {
    if (profileRgbMode || profileThemeAccent) {
      setLightingMode(mapProfileLighting(profileRgbMode, profileThemeAccent));
    }
  }, [profileRgbMode, profileThemeAccent]);

  useEffect(() => {
    if (typeof profileSoundEnabled === 'boolean') {
      setSoundEnabled(profileSoundEnabled);
    }
  }, [profileSoundEnabled]);
  const [showClearanceModal, setShowClearanceModal] = useState(false);
  const [inspectedComponent, setInspectedComponent] = useState<{
    name: string;
    category: string;
    desc: string;
    price?: string;
  } | null>(null);

  // References to dynamic 3D elements for animations & updates
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const glassMeshRef = useRef<THREE.Mesh | null>(null);
  const frontGlassMeshRef = useRef<THREE.Mesh | null>(null);
  const fanBladesRef = useRef<THREE.Mesh[]>([]);
  const ledMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const pointLightsRef = useRef<THREE.PointLight[]>([]);

  // Exploded View dynamic meshes
  const explodedGlassRef = useRef<THREE.Mesh | null>(null);
  const explodedRightPanelRef = useRef<THREE.Mesh | null>(null);
  const explodedFrontRef = useRef<THREE.Group | null>(null);
  const explodedTopRef = useRef<THREE.Mesh | null>(null);
  const explodedGpuRef = useRef<THREE.Group | null>(null);
  const airflowGroupRef = useRef<THREE.Group | null>(null);
  const airflowParticlesRef = useRef<{
    positions: Float32Array;
    velocities: Float32Array;
    types: ('intake' | 'exhaust')[];
    geometry: THREE.BufferGeometry;
  } | null>(null);

  // Smooth camera targets
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(3.2, 1.8, 3.8));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.9, 0));

  // Web Audio Context for procedural click & airflow sounds
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      // Audio fallback silent
    }
  };

  // Determine active case ID & available cases
  const activeCaseId = build.case?.id || 'case-fractal-north';
  const availableCases = COMPONENTS_DATABASE.filter(c => c.category === 'case');
  const clearanceData = checkClearance(build);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 560;

    // Detect software WebGL safely
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x06080d);
    scene.fog = new THREE.FogExp2(0x06080d, 0.075);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(3.2, 1.8, 3.8);
    cameraRef.current = camera;

    // 2. Renderer with PBR color space and tone mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Studio Environment Map (PMREM + RoomEnvironment) for realistic metal/glass reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.02; // Prevent going under the studio floor
    controls.minDistance = 1.6;
    controls.maxDistance = 7.0;
    controls.target.set(0, 0.9, 0);
    controlsRef.current = controls;

    // 4. Studio Lighting Rig (Warm key, cool rim, high aesthetic)
    const hemiLight = new THREE.HemisphereLight(0x1e293b, 0x05070c, 1.3);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.4);
    keyLight.position.set(4.5, 6, 3.5);
    keyLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0004;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xd93838, 2.0);
    rimLight.position.set(-4, 3, -3.5);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    fillLight.position.set(3, 1, -3);
    scene.add(fillLight);

    // Dynamic Interior Glow Lights
    const interiorPointLight1 = new THREE.PointLight(0xef4444, 2.6, 3.5);
    interiorPointLight1.position.set(0, 1.25, 0.1);
    scene.add(interiorPointLight1);

    const interiorPointLight2 = new THREE.PointLight(0xff2222, 1.6, 2.8);
    interiorPointLight2.position.set(0.1, 0.65, 0.4);
    scene.add(interiorPointLight2);

    pointLightsRef.current = [interiorPointLight1, interiorPointLight2];

    // 5. Studio Ground & Soft Circular Contact Shadow
    const groundGeo = new THREE.PlaneGeometry(18, 18);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x080a10,
      roughness: 0.85,
      metalness: 0.15
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Procedural Contact Shadow Canvas
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d')!;
    const sGrad = sCtx.createRadialGradient(128, 128, 15, 128, 128, 122);
    sGrad.addColorStop(0, 'rgba(0, 0, 0, 0.92)');
    sGrad.addColorStop(0.45, 'rgba(0, 0, 0, 0.45)');
    sGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 256, 256);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    shadowTex.colorSpace = THREE.SRGBColorSpace;
    const shadowMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 2.6),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.8
      })
    );
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, 0.005, 0);
    scene.add(shadowMesh);

    // =========================================================================
    // 6. PROCEDURAL PROCEDURAL TEXTURES & MATERIALS (ZERO EXTERNAL 404s)
    // =========================================================================
    const pcGroup = new THREE.Group();
    scene.add(pcGroup);

    // =========================================================================
    // AIRFLOW SIMULATION PARTICLE SYSTEM (COLD INTAKE + HOT EXHAUST)
    // =========================================================================
    const airflowGroup = new THREE.Group();
    airflowGroup.visible = showAirflow;
    airflowGroupRef.current = airflowGroup;
    scene.add(airflowGroup);

    const PARTICLE_COUNT = 180;
    const posArray = new Float32Array(PARTICLE_COUNT * 3);
    const colArray = new Float32Array(PARTICLE_COUNT * 3);
    const velArray = new Float32Array(PARTICLE_COUNT * 3);
    const particleTypes: ('intake' | 'exhaust')[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const isIntake = i < PARTICLE_COUNT * 0.55;
      particleTypes.push(isIntake ? 'intake' : 'exhaust');

      if (isIntake) {
        // Cold intake entering from front panel
        posArray[i * 3] = (Math.random() - 0.5) * 0.45;
        posArray[i * 3 + 1] = 0.4 + Math.random() * 0.9;
        posArray[i * 3 + 2] = 0.5 + Math.random() * 0.7;

        velArray[i * 3] = (Math.random() - 0.5) * 0.12;
        velArray[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
        velArray[i * 3 + 2] = -0.7 - Math.random() * 0.35; // Pushing into chassis

        // Cyan / Cold Ice Blue
        colArray[i * 3] = 0.22;
        colArray[i * 3 + 1] = 0.74;
        colArray[i * 3 + 2] = 0.98;
      } else {
        // Hot exhaust rising or pushed out through rear
        const isRear = Math.random() > 0.45;
        posArray[i * 3] = (Math.random() - 0.5) * 0.4;
        posArray[i * 3 + 1] = 0.75 + Math.random() * 0.45;
        posArray[i * 3 + 2] = -0.2 + (Math.random() - 0.5) * 0.4;

        if (isRear) {
          velArray[i * 3] = -0.15 - Math.random() * 0.15;
          velArray[i * 3 + 1] = 0.2 + Math.random() * 0.2;
          velArray[i * 3 + 2] = -0.75 - Math.random() * 0.35; // Exhaust back
        } else {
          velArray[i * 3] = (Math.random() - 0.5) * 0.18;
          velArray[i * 3 + 1] = 0.7 + Math.random() * 0.4; // Exhaust top
          velArray[i * 3 + 2] = (Math.random() - 0.5) * 0.25;
        }

        // Orange / Red Hot Exhaust
        colArray[i * 3] = 0.96;
        colArray[i * 3 + 1] = 0.3 + Math.random() * 0.25;
        colArray[i * 3 + 2] = 0.15;
      }
    }

    const airflowGeo = new THREE.BufferGeometry();
    airflowGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    airflowGeo.setAttribute('color', new THREE.BufferAttribute(colArray, 3));

    const airflowMat = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const airflowPoints = new THREE.Points(airflowGeo, airflowMat);
    airflowGroup.add(airflowPoints);

    airflowParticlesRef.current = {
      positions: posArray,
      velocities: velArray,
      types: particleTypes,
      geometry: airflowGeo
    };

    // (1) Procedural Wood Texture Canvas for Fractal North
    const woodCanvas = document.createElement('canvas');
    woodCanvas.width = 256;
    woodCanvas.height = 512;
    const wCtx = woodCanvas.getContext('2d')!;
    wCtx.fillStyle = '#653717'; // rich walnut
    wCtx.fillRect(0, 0, 256, 512);
    for (let i = 0; i < 45; i++) {
      const x = Math.random() * 256;
      wCtx.fillStyle = i % 2 === 0 ? '#4a250e' : '#7b441f';
      wCtx.fillRect(x, 0, Math.random() * 5 + 2, 512);
    }
    const woodTexture = new THREE.CanvasTexture(woodCanvas);
    woodTexture.colorSpace = THREE.SRGBColorSpace;

    // (2) Procedural Motherboard Circuit Trace Texture
    const pcbCanvas = document.createElement('canvas');
    pcbCanvas.width = 256;
    pcbCanvas.height = 256;
    const pCtx = pcbCanvas.getContext('2d')!;
    pCtx.fillStyle = '#0a0f15';
    pCtx.fillRect(0, 0, 256, 256);
    pCtx.strokeStyle = '#1e2d3d';
    pCtx.lineWidth = 1.5;
    for (let i = 0; i < 20; i++) {
      pCtx.beginPath();
      pCtx.moveTo(Math.random() * 256, Math.random() * 256);
      pCtx.lineTo(Math.random() * 256, Math.random() * 256);
      pCtx.stroke();
    }
    // Golden traces
    pCtx.strokeStyle = '#d4af37';
    pCtx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      pCtx.beginPath();
      const startX = 20 + i * 25;
      pCtx.moveTo(startX, 10);
      pCtx.lineTo(startX, 120);
      pCtx.lineTo(startX + 15, 135);
      pCtx.stroke();
    }
    const pcbTexture = new THREE.CanvasTexture(pcbCanvas);
    pcbTexture.colorSpace = THREE.SRGBColorSpace;

    // (3) Triangular Cutout Pattern for Corsair 4000D
    const meshCanvas = document.createElement('canvas');
    meshCanvas.width = 128;
    meshCanvas.height = 128;
    const mCtx = meshCanvas.getContext('2d')!;
    mCtx.fillStyle = '#141820';
    mCtx.fillRect(0, 0, 128, 128);
    mCtx.fillStyle = '#090c10';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cx = c * 16 + 8;
        const cy = r * 16 + 8;
        mCtx.beginPath();
        mCtx.moveTo(cx, cy - 5);
        mCtx.lineTo(cx + 5, cy + 5);
        mCtx.lineTo(cx - 5, cy + 5);
        mCtx.closePath();
        mCtx.fill();
      }
    }
    const meshTexture = new THREE.CanvasTexture(meshCanvas);
    meshTexture.wrapS = THREE.RepeatWrapping;
    meshTexture.wrapT = THREE.RepeatWrapping;
    meshTexture.repeat.set(4, 8);

    // Shared High-Fidelity PBR Materials
    const isSnow = chassisTheme === 'snow';
    const darkSteelMat = new THREE.MeshStandardMaterial({
      color: isSnow ? 0xf3f4f6 : 0x11141a,
      roughness: isSnow ? 0.35 : 0.45,
      metalness: isSnow ? 0.35 : 0.82
    });
    const anodizedBlackMat = new THREE.MeshStandardMaterial({
      color: isSnow ? 0xe5e7eb : 0x090b0f,
      roughness: 0.32,
      metalness: isSnow ? 0.45 : 0.92
    });
    const motherboardMat = new THREE.MeshStandardMaterial({
      map: pcbTexture,
      roughness: 0.6,
      metalness: 0.35
    });
    const brushedSilverMat = new THREE.MeshStandardMaterial({
      color: 0xd0d8e2,
      roughness: 0.2,
      metalness: 0.95
    });
    const copperHeatpipeMat = new THREE.MeshStandardMaterial({
      color: 0xb85d2d,
      roughness: 0.28,
      metalness: 0.96
    });
    const walnutWoodMat = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.72,
      metalness: 0.05
    });
    const nordicBrassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // Nordic brushed brass
      roughness: 0.25,
      metalness: 0.92
    });
    const corsairYellowMat = new THREE.MeshStandardMaterial({
      color: 0xf5d130, // Corsair signature yellow
      roughness: 0.4,
      metalness: 0.2
    });

    // Dynamic LED illumination material
    const ledMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 2.0,
      roughness: 0.2
    });
    ledMaterialsRef.current = [ledMat];

    // Determine dimensions by case ID
    const isMicroAtx = activeCaseId === 'case-montech-air-100';
    const isDualChamber = activeCaseId === 'case-lian-li-o11-dynamic-evo';
    const isFractal = activeCaseId === 'case-fractal-north';
    const isCorsair = activeCaseId === 'case-corsair-4000d-airflow';
    const isLancool = activeCaseId === 'case-lianli-lancool-216';
    const isMontech903 = activeCaseId === 'case-montech-air-903-max';

    const caseHeight = isMicroAtx ? 1.52 : 1.88;
    const caseWidth = isDualChamber ? 1.15 : 0.84;
    const caseDepth = isMicroAtx ? 1.55 : 1.86;

    // =========================================================================
    // 7. HOLLOW STRUCTURAL CHASSIS FRAMEWORK (INTERIOR 100% VISIBLE)
    // =========================================================================
    const chassisFrameGroup = new THREE.Group();
    pcGroup.add(chassisFrameGroup);

    // (A) Structural Corner Pillars
    // For O11 EVO, front-left pillar is omitted for panoramic aquarium glass!
    const pillarPositions: [number, number, boolean][] = [
      [caseWidth / 2 - 0.02, caseDepth / 2 - 0.02, !isDualChamber], // Front-Left (omitted in O11)
      [-caseWidth / 2 + 0.02, caseDepth / 2 - 0.02, true],           // Front-Right
      [caseWidth / 2 - 0.02, -caseDepth / 2 + 0.02, true],          // Rear-Left
      [-caseWidth / 2 + 0.02, -caseDepth / 2 + 0.02, true]          // Rear-Right
    ];

    pillarPositions.forEach(([px, pz, shouldRender]) => {
      if (!shouldRender) return;
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, caseHeight, 0.04),
        darkSteelMat
      );
      pillar.position.set(px, caseHeight / 2 + 0.04, pz);
      chassisFrameGroup.add(pillar);
    });

    // (B) Right Steel Panel (Motherboard back side)
    const rightPanelGeo = new THREE.BoxGeometry(0.02, caseHeight - 0.06, caseDepth - 0.06);
    const rightPanel = new THREE.Mesh(rightPanelGeo, darkSteelMat);
    rightPanel.position.set(-caseWidth / 2 + 0.01, caseHeight / 2 + 0.04, 0);
    chassisFrameGroup.add(rightPanel);
    explodedRightPanelRef.current = rightPanel;

    // (C) Rear Chassis Panel (with I/O cutout, 120mm fan cutout, and PCIe slots)
    const rearPanelGroup = new THREE.Group();
    rearPanelGroup.position.set(0, caseHeight / 2 + 0.04, -caseDepth / 2 + 0.01);
    chassisFrameGroup.add(rearPanelGroup);

    // Rear metal frame
    const rearOuter = new THREE.Mesh(
      new THREE.BoxGeometry(caseWidth - 0.04, caseHeight, 0.02),
      darkSteelMat
    );
    rearPanelGroup.add(rearOuter);

    // PCIe Expansion Slot Brackets (horizontal silver vented slots)
    for (let slot = 0; slot < 7; slot++) {
      const pcieBracket = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.025, 0.022),
        brushedSilverMat
      );
      pcieBracket.position.set(0.12, -0.15 - slot * 0.035, 0.005);
      rearPanelGroup.add(pcieBracket);
    }

    // (D) Top Chassis Panel with Magnetic Dust Filter
    const topPanelGeo = new THREE.BoxGeometry(caseWidth - 0.04, 0.03, caseDepth - 0.04);
    const topPanel = new THREE.Mesh(topPanelGeo, darkSteelMat);
    topPanel.position.set(0, caseHeight + 0.03, 0);
    chassisFrameGroup.add(topPanel);
    explodedTopRef.current = topPanel;

    // (E) Chassis Feet
    for (const [fx, fz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const foot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 0.05, 16),
        anodizedBlackMat
      );
      foot.position.set(
        fx * (caseWidth / 2 - 0.08),
        0.025,
        fz * (caseDepth / 2 - 0.1)
      );
      chassisFrameGroup.add(foot);
    }

    // (F) PSU Shroud / Lower Basement
    const shroudHeight = isDualChamber ? 0.06 : 0.38;
    const psuShroud = new THREE.Mesh(
      new THREE.BoxGeometry(caseWidth - 0.06, shroudHeight, caseDepth - 0.1),
      darkSteelMat
    );
    psuShroud.position.set(0, shroudHeight / 2 + 0.04, 0);
    chassisFrameGroup.add(psuShroud);

    // PSU Accent Line
    const psuAccent = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, 0.025, caseDepth - 0.35),
      ledMat
    );
    psuAccent.position.set(caseWidth / 2 - 0.03, shroudHeight - 0.04, 0);
    chassisFrameGroup.add(psuAccent);

    // =========================================================================
    // 8. INTERIOR COMPONENTS (MOTHERBOARD, VRMS, GPU, COOLER, RAM)
    // =========================================================================

    // Motherboard Tray & PCB
    const mbOffsetX = isDualChamber ? -0.22 : -0.24;
    const mbHeight = isMicroAtx ? 0.9 : 1.1;
    const mbGeo = new THREE.BoxGeometry(0.02, mbHeight, isMicroAtx ? 0.9 : 1.1);
    const mbMesh = new THREE.Mesh(mbGeo, motherboardMat);
    mbMesh.position.set(mbOffsetX, shroudHeight + (isMicroAtx ? 0.6 : 0.72), 0.06);
    pcGroup.add(mbMesh);

    // VRM Heatsinks & Rear I/O Shield Cover
    const vrm1 = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.28, 0.12), brushedSilverMat);
    vrm1.position.set(mbOffsetX + 0.04, mbMesh.position.y + 0.36, -0.22);
    pcGroup.add(vrm1);

    const vrm2 = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.12, 0.3), brushedSilverMat);
    vrm2.position.set(mbOffsetX + 0.04, mbMesh.position.y + 0.44, 0.05);
    pcGroup.add(vrm2);

    const ioShield = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.14), anodizedBlackMat);
    ioShield.position.set(mbOffsetX + 0.03, mbMesh.position.y + 0.25, -0.42);
    pcGroup.add(ioShield);

    // Dual M.2 PCIe 5.0 SSD Heatsink Plates
    const m2Plate1 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.22), brushedSilverMat);
    m2Plate1.position.set(mbOffsetX + 0.02, mbMesh.position.y - 0.08, -0.05);
    pcGroup.add(m2Plate1);

    // RAM Memory Sticks (2x with top diffused ARGB lightbars)
    for (let r = 0; r < 2; r++) {
      const ramStick = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.16, 0.38), anodizedBlackMat);
      ramStick.position.set(mbOffsetX + 0.08 + r * 0.035, mbMesh.position.y + 0.2, 0.22);
      pcGroup.add(ramStick);

      const ramLed = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.02, 0.36), ledMat);
      ramLed.position.set(mbOffsetX + 0.08 + r * 0.035, mbMesh.position.y + 0.29, 0.22);
      pcGroup.add(ramLed);
    }

    // CPU Cooler (Liquid AIO vs Dual Tower Air Cooler)
    const isAio = build.cooler?.name.toLowerCase().includes('liquid') ||
                  build.cooler?.name.toLowerCase().includes('kraken') ||
                  build.cooler?.name.toLowerCase().includes('frozen');

    const coolerGroup = new THREE.Group();
    coolerGroup.position.set(mbOffsetX + 0.07, mbMesh.position.y + 0.2, -0.06);

    if (isAio) {
      // Liquid AIO Pump Head with Infinity Mirror Ring
      const pump = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 0.08, 32),
        anodizedBlackMat
      );
      pump.rotation.z = Math.PI / 2;
      coolerGroup.add(pump);

      const pumpRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.1, 0.015, 16, 32),
        ledMat
      );
      pumpRing.rotation.y = Math.PI / 2;
      pumpRing.position.x = 0.045;
      coolerGroup.add(pumpRing);

      // Curved Braided Coolant Tubes leading to top radiator
      const tubeCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.03, 0.05, 0.02),
        new THREE.Vector3(0.14, 0.35, 0.08),
        new THREE.Vector3(0.02, 0.58, 0.25)
      ]);
      const tubeGeo = new THREE.TubeGeometry(tubeCurve, 20, 0.024, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({ color: 0x1b2028, roughness: 0.8 });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      coolerGroup.add(tubeMesh);

      // Top 360mm Radiator with Fans
      const radMesh = new THREE.Mesh(
        new THREE.BoxGeometry(caseWidth - 0.2, 0.08, 1.25),
        darkSteelMat
      );
      radMesh.position.set(0, caseHeight - 0.06, 0.08);
      pcGroup.add(radMesh);
    } else {
      // Dual-Tower Air Cooler with Copper Heatpipes
      const tower1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.36, 0.3), brushedSilverMat);
      tower1.position.set(0.06, 0, -0.09);
      coolerGroup.add(tower1);

      const tower2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.36, 0.3), brushedSilverMat);
      tower2.position.set(0.06, 0, 0.11);
      coolerGroup.add(tower2);

      // 6 Copper Heatpipes
      const pipeGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.34, 8);
      for (let p = -2; p <= 2; p++) {
        const pipe = new THREE.Mesh(pipeGeo, copperHeatpipeMat);
        pipe.rotation.x = Math.PI / 2;
        pipe.position.set(-0.01, p * 0.038, 0.01);
        coolerGroup.add(pipe);
      }
    }
    pcGroup.add(coolerGroup);

    // DEDICATED GRAPHICS CARD (GPU)
    const gpuGroup = new THREE.Group();
    const gpuPosY = mbMesh.position.y - 0.22;
    gpuGroup.position.set(-0.04, gpuPosY, 0.1);
    explodedGpuRef.current = gpuGroup;

    const isHeavyGpu = build.gpu?.tier === 'Gama Alta' || build.gpu?.tier === 'Entusiasta';
    const gpuLen = isHeavyGpu ? 1.08 : 0.84;
    const gpuThick = isHeavyGpu ? 0.22 : 0.15;

    // GPU Backplate
    const gpuBackplate = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.02, gpuLen),
      anodizedBlackMat
    );
    gpuGroup.add(gpuBackplate);

    // Aluminum Fin Stack Heatsink
    const gpuSink = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, gpuThick, gpuLen - 0.04),
      brushedSilverMat
    );
    gpuSink.position.set(0, -gpuThick / 2, 0);
    gpuGroup.add(gpuSink);

    // GPU Shroud
    const gpuShroud = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, gpuThick + 0.02, gpuLen),
      darkSteelMat
    );
    gpuShroud.position.set(0, -gpuThick / 2 - 0.01, 0);
    gpuGroup.add(gpuShroud);

    // GPU Side Illumination Line
    const gpuLed = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.035, 0.55), ledMat);
    gpuLed.position.set(0.235, -0.04, 0);
    gpuGroup.add(gpuLed);

    // GPU Spinning Fans
    const gpuFans: THREE.Mesh[] = [];
    const numGpuFans = isHeavyGpu ? 3 : 2;
    for (let f = 0; f < numGpuFans; f++) {
      const zOffset = (f - (numGpuFans - 1) / 2) * (isHeavyGpu ? 0.28 : 0.32);
      const fanGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16);
      const fan = new THREE.Mesh(fanGeo, anodizedBlackMat);
      fan.rotation.z = Math.PI / 2;
      fan.position.set(0.02, -gpuThick - 0.02, zOffset);
      gpuGroup.add(fan);
      gpuFans.push(fan);
    }

    // Braided 12V-2x6 Power Cable with Cable Combs
    const cableCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.23, -0.06, 0.2),
      new THREE.Vector3(0.28, -0.25, 0.2),
      new THREE.Vector3(0.15, -0.42, 0.1)
    ]);
    const cableMesh = new THREE.Mesh(
      new THREE.TubeGeometry(cableCurve, 12, 0.02, 8, false),
      new THREE.MeshStandardMaterial({ color: 0x05070a, roughness: 0.9 })
    );
    gpuGroup.add(cableMesh);

    pcGroup.add(gpuGroup);

    // =========================================================================
    // 9. CASE SPECIFIC FRONT DESIGNS & DISTINCTIVE PANELS
    // =========================================================================
    const frontGroup = new THREE.Group();
    frontGroup.position.set(0, caseHeight / 2 + 0.04, caseDepth / 2 + 0.02);
    explodedFrontRef.current = frontGroup;
    pcGroup.add(frontGroup);

    const activeFans: THREE.Mesh[] = [...gpuFans];

    if (isFractal) {
      // 1. FRACTAL DESIGN NORTH: 10 Real Walnut Wood Vertical Slats & Nordic Brass
      const slatCount = 10;
      const slatWidth = 0.038;
      const slatDepth = 0.04;
      const slatHeight = caseHeight - 0.14;
      const spacing = (caseWidth - 0.12) / slatCount;

      for (let s = 0; s < slatCount; s++) {
        const xPos = -caseWidth / 2 + 0.06 + s * spacing;
        const slat = new THREE.Mesh(
          new THREE.BoxGeometry(slatWidth, slatHeight, slatDepth),
          walnutWoodMat
        );
        slat.position.set(xPos, 0, 0.02);
        frontGroup.add(slat);
      }

      // Nordic Brushed Brass Power Button & Port Accents
      const brassPower = new THREE.Mesh(
        new THREE.CylinderGeometry(0.028, 0.028, 0.02, 24),
        nordicBrassMat
      );
      brassPower.position.set(0, caseHeight / 2 - 0.04, 0.02);
      frontGroup.add(brassPower);

      // 2x 140mm intake fans behind the wood slats
      for (let i = 0; i < 2; i++) {
        const fY = (i === 0 ? -0.25 : 0.25) * caseHeight * 0.45;
        const fanLed = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.015, 16, 24), ledMat);
        fanLed.position.set(0, fY, -0.06);
        frontGroup.add(fanLed);

        const fanBlade = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.02, 16), darkSteelMat);
        fanBlade.rotation.x = Math.PI / 2;
        fanBlade.position.set(0, fY, -0.07);
        frontGroup.add(fanBlade);
        activeFans.push(fanBlade);
      }
    } else if (isDualChamber) {
      // 2. LIAN LI O11 DYNAMIC EVO: Seamless Pillarless Dual Glass + Side Intake Fans
      const frontGlassGeo = new THREE.BoxGeometry(caseWidth - 0.04, caseHeight - 0.08, 0.02);
      const frontGlassMat = new THREE.MeshPhysicalMaterial({
        color: 0x141a24,
        transparent: true,
        opacity: isSoftwareGl ? 0.25 : 0.35,
        roughness: 0.08,
        metalness: 0.1,
        transmission: isSoftwareGl ? 0 : 0.9,
        ior: 1.52,
        depthWrite: false
      });
      const frontGlass = new THREE.Mesh(frontGlassGeo, frontGlassMat);
      frontGlass.position.set(0, 0, 0);
      frontGroup.add(frontGlass);
      frontGlassMeshRef.current = frontGlass;

      // Vertical 3x 120mm Side-Intake Fans on the interior divider wall
      for (let s = -1; s <= 1; s++) {
        const fY = s * 0.35 + 0.95;
        const sideFanLed = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.015, 16, 24), ledMat);
        sideFanLed.rotation.y = Math.PI / 2;
        sideFanLed.position.set(caseWidth / 2 - 0.15, fY, -0.15);
        pcGroup.add(sideFanLed);

        const fanBlade = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16), darkSteelMat);
        fanBlade.rotation.z = Math.PI / 2;
        fanBlade.position.set(caseWidth / 2 - 0.15, fY, -0.15);
        pcGroup.add(fanBlade);
        activeFans.push(fanBlade);
      }
    } else if (isLancool) {
      // 3. LIAN LI LANCOOL 216: TWO COLOSSAL 160mm GIANT ARGB FANS
      const frontBezel = new THREE.Mesh(
        new THREE.BoxGeometry(caseWidth - 0.04, caseHeight - 0.06, 0.04),
        darkSteelMat
      );
      frontGroup.add(frontBezel);

      for (let i = 0; i < 2; i++) {
        const fY = (i === 0 ? -0.32 : 0.28) * caseHeight * 0.45;
        const bigFanLed = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.02, 16, 32), ledMat);
        bigFanLed.position.set(0, fY, 0.03);
        frontGroup.add(bigFanLed);

        const fanBlade = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.025, 20), darkSteelMat);
        fanBlade.rotation.x = Math.PI / 2;
        fanBlade.position.set(0, fY, 0.02);
        frontGroup.add(fanBlade);
        activeFans.push(fanBlade);
      }
    } else if (isCorsair) {
      // 4. CORSAIR 4000D AIRFLOW: Triangular Cutout Metal Grille & Yellow Pull Tabs
      const frontGrilleMat = new THREE.MeshStandardMaterial({
        map: meshTexture,
        roughness: 0.6,
        metalness: 0.75
      });
      const frontGrille = new THREE.Mesh(
        new THREE.BoxGeometry(caseWidth - 0.08, caseHeight - 0.12, 0.02),
        frontGrilleMat
      );
      frontGroup.add(frontGrille);

      // Yellow pull tab
      const yellowTab = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.025, 0.035),
        corsairYellowMat
      );
      yellowTab.position.set(0, caseHeight / 2 - 0.08, 0.02);
      frontGroup.add(yellowTab);

      for (let i = -1; i <= 1; i++) {
        const fY = i * 0.38;
        const fanLed = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.015, 16, 24), ledMat);
        fanLed.position.set(0, fY, -0.04);
        frontGroup.add(fanLed);

        const fanBlade = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16), darkSteelMat);
        fanBlade.rotation.x = Math.PI / 2;
        fanBlade.position.set(0, fY, -0.05);
        frontGroup.add(fanBlade);
        activeFans.push(fanBlade);
      }
    } else if (isMicroAtx) {
      // 5. MONTECH AIR 100: Compact Micro-ATX Bezel (2x 120mm Fans)
      const frontBezel = new THREE.Mesh(
        new THREE.BoxGeometry(caseWidth - 0.06, caseHeight - 0.08, 0.03),
        darkSteelMat
      );
      frontGroup.add(frontBezel);

      for (let i = -0.5; i <= 0.5; i += 1) {
        const fY = i * 0.42;
        const fanLed = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.015, 16, 24), ledMat);
        fanLed.position.set(0, fY, 0.02);
        frontGroup.add(fanLed);

        const fanBlade = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16), darkSteelMat);
        fanBlade.rotation.x = Math.PI / 2;
        fanBlade.position.set(0, fY, 0.01);
        frontGroup.add(fanBlade);
        activeFans.push(fanBlade);
      }
    } else {
      // 6. MONTECH AIR 903 MAX: 3x 140mm High-Flow ARGB Stack
      const frontBezel = new THREE.Mesh(
        new THREE.BoxGeometry(caseWidth - 0.06, caseHeight - 0.08, 0.03),
        darkSteelMat
      );
      frontGroup.add(frontBezel);

      for (let i = -1; i <= 1; i++) {
        const fY = i * 0.42;
        const fanLed = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.015, 16, 24), ledMat);
        fanLed.position.set(0, fY, 0.02);
        frontGroup.add(fanLed);

        const fanBlade = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 16), darkSteelMat);
        fanBlade.rotation.x = Math.PI / 2;
        fanBlade.position.set(0, fY, 0.01);
        frontGroup.add(fanBlade);
        activeFans.push(fanBlade);
      }
    }

    // Rear 120mm exhaust fan
    const rearFanPos = new THREE.Vector3(mbOffsetX + 0.02, mbMesh.position.y + 0.28, -caseDepth / 2 + 0.06);
    const rearFanLed = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.015, 16, 24), ledMat);
    rearFanLed.position.copy(rearFanPos);
    pcGroup.add(rearFanLed);

    const rearFanBlade = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16), darkSteelMat);
    rearFanBlade.rotation.x = Math.PI / 2;
    rearFanBlade.position.copy(rearFanPos);
    rearFanBlade.position.z -= 0.02;
    pcGroup.add(rearFanBlade);
    activeFans.push(rearFanBlade);

    fanBladesRef.current = activeFans;

    // (H) TEMPERED GLASS SIDE PANEL
    const glassGeo = new THREE.BoxGeometry(0.02, caseHeight - 0.08, caseDepth - 0.08);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x111622,
      transparent: true,
      opacity: isSoftwareGl ? 0.28 : 0.38,
      roughness: 0.08,
      metalness: 0.1,
      transmission: isSoftwareGl ? 0 : 0.88,
      ior: 1.52,
      depthWrite: false
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.set(caseWidth / 2 + 0.01, caseHeight / 2 + 0.04, 0);
    pcGroup.add(glassMesh);
    glassMeshRef.current = glassMesh;
    explodedGlassRef.current = glassMesh;

    // Corner thumbscrews
    const screwGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.03, 16);
    const screwPositions = [
      [caseWidth / 2 + 0.025, caseHeight - 0.06, caseDepth / 2 - 0.1],
      [caseWidth / 2 + 0.025, caseHeight - 0.06, -caseDepth / 2 + 0.1],
      [caseWidth / 2 + 0.025, 0.15, caseDepth / 2 - 0.1],
      [caseWidth / 2 + 0.025, 0.15, -caseDepth / 2 + 0.1]
    ];
    screwPositions.forEach(([x, y, z]) => {
      const screw = new THREE.Mesh(screwGeo, brushedSilverMat);
      screw.rotation.z = Math.PI / 2;
      screw.position.set(x, y, z);
      pcGroup.add(screw);
    });

    // =========================================================================
    // 10. INTERACTIVE RAYCASTING FOR COMPONENT INSPECTION
    // =========================================================================
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(pcGroup.children, true);

      if (intersects.length > 0) {
        playClickSound();
        const hit = intersects[0].object;
        if (hit.parent === gpuGroup || hit === gpuGroup) {
          setInspectedComponent({
            name: build.gpu?.name || 'Tarjeta Gráfica Dedicada',
            category: 'Tarjeta Gráfica (GPU)',
            desc: build.gpu?.shortDesc || 'Procesador gráfico principal para juegos y renderizado.',
            price: build.gpu ? `$${build.gpu.priceMinUSD} - $${build.gpu.priceMaxUSD} USD` : undefined
          });
        } else if (hit.parent === coolerGroup || hit === coolerGroup) {
          setInspectedComponent({
            name: build.cooler?.name || 'Refrigeración de CPU',
            category: 'Disipador / Cooler',
            desc: build.cooler?.shortDesc || 'Sistema térmico para mantener el procesador en temperaturas óptimas.',
            price: build.cooler ? `$${build.cooler.priceMinUSD} - $${build.cooler.priceMaxUSD} USD` : undefined
          });
        } else if (hit.parent === frontGroup || hit.parent === chassisFrameGroup) {
          setInspectedComponent({
            name: build.case?.name || 'Gabinete ATX / Chasis',
            category: 'Gabinete (Case)',
            desc: build.case?.shortDesc || 'Estructura con flujo de aire optimizado y paneles de vidrio.',
            price: build.case ? `$${build.case.priceMinUSD} - $${build.case.priceMaxUSD} USD` : undefined
          });
        } else if (hit === mbMesh || hit === vrm1 || hit === vrm2) {
          setInspectedComponent({
            name: build.motherboard?.name || 'Placa Madre (Motherboard)',
            category: 'Placa Base',
            desc: build.motherboard?.shortDesc || 'Plataforma de interconexión con PCIe 5.0 y slots DDR5.',
            price: build.motherboard ? `$${build.motherboard.priceMinUSD} - $${build.motherboard.priceMaxUSD} USD` : undefined
          });
        }
      }
    };

    renderer.domElement.addEventListener('click', handlePointerDown);

    // =========================================================================
    // 11. ANIMATION LOOP (Delta timing, smooth lerping, fan speed, lighting modes)
    // =========================================================================
    const clock = new THREE.Clock();
    let animId = 0;
    let lastRenderTime = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Low power mode throttling to preserve battery on laptops and mobile devices
      const isLowPower = typeof document !== 'undefined' && document.documentElement.classList.contains('low-power-mode');
      const now = performance.now();
      if (isLowPower && now - lastRenderTime < 45) { // Capped at ~22 FPS in eco mode
        return;
      }
      lastRenderTime = now;

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth camera position & target lerping
      camera.position.lerp(targetCamPos.current, 0.045);
      controls.target.lerp(targetLookAt.current, 0.045);
      controls.update();

      // Rotate fan blades based on user setting (paused in low power mode)
      if (fanSpeed !== 'stopped' && !isLowPower) {
        const speedMultiplier = fanSpeed === 'fast' ? 26 : 14;
        fanBladesRef.current.forEach(f => {
          f.rotation.x += delta * speedMultiplier;
        });
      }

      // Animate Thermal Airflow particles if active
      if (airflowGroupRef.current && airflowGroupRef.current.visible && airflowParticlesRef.current) {
        const { positions, velocities, types, geometry } = airflowParticlesRef.current;
        for (let i = 0; i < types.length; i++) {
          positions[i * 3] += velocities[i * 3] * delta;
          positions[i * 3 + 1] += velocities[i * 3 + 1] * delta;
          positions[i * 3 + 2] += velocities[i * 3 + 2] * delta;

          if (types[i] === 'intake') {
            if (positions[i * 3 + 2] < -0.3) {
              positions[i * 3] = (Math.random() - 0.5) * 0.45;
              positions[i * 3 + 1] = 0.4 + Math.random() * 0.9;
              positions[i * 3 + 2] = 1.1 + Math.random() * 0.2;
            }
          } else {
            if (positions[i * 3 + 1] > 1.9 || positions[i * 3 + 2] < -1.1) {
              positions[i * 3] = (Math.random() - 0.5) * 0.35;
              positions[i * 3 + 1] = 0.75 + Math.random() * 0.4;
              positions[i * 3 + 2] = -0.2 + (Math.random() - 0.5) * 0.3;
            }
          }
        }
        geometry.attributes.position.needsUpdate = true;
      }

      // Lighting pulses according to selected mode
      if (lightingMode === 'red') {
        const pulse = 1.4 + Math.sin(elapsed * 2.8) * 0.6;
        ledMat.color.setHex(0xef4444);
        ledMat.emissive.setHex(0xef4444);
        ledMat.emissiveIntensity = pulse;
        pointLightsRef.current.forEach(p => {
          p.color.setHex(0xef4444);
          p.intensity = pulse * 1.5;
        });
      } else if (lightingMode === 'rgb') {
        const r = (Math.sin(elapsed * 1.5) + 1) / 2;
        const g = (Math.sin(elapsed * 1.5 + 2.09) + 1) / 2;
        const b = (Math.sin(elapsed * 1.5 + 4.18) + 1) / 2;
        ledMat.color.setRGB(r, g, b);
        ledMat.emissive.setRGB(r, g, b);
        ledMat.emissiveIntensity = 2.0;
        pointLightsRef.current.forEach(p => {
          p.color.setRGB(r, g, b);
          p.intensity = 2.2;
        });
      } else if (lightingMode === 'cyberpunk') {
        const wave = (Math.sin(elapsed * 3) + 1) / 2;
        ledMat.color.setRGB(0.1 + wave * 0.8, 0.2, 0.95 - wave * 0.4);
        ledMat.emissive.setRGB(0.1 + wave * 0.8, 0.2, 0.95 - wave * 0.4);
        ledMat.emissiveIntensity = 2.2;
        pointLightsRef.current[0].color.setHex(0x06b6d4); // Cyan
        pointLightsRef.current[1].color.setHex(0xec4899); // Pink
      } else if (lightingMode === 'white') {
        ledMat.color.setHex(0xffffff);
        ledMat.emissive.setHex(0xffffff);
        ledMat.emissiveIntensity = 1.6;
        pointLightsRef.current.forEach(p => {
          p.color.setHex(0xffffff);
          p.intensity = 1.8;
        });
      } else {
        ledMat.emissiveIntensity = 0.02;
        pointLightsRef.current.forEach(p => {
          p.intensity = 0.15;
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 560;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handlePointerDown);
      cancelAnimationFrame(animId);
      controls.dispose();
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [activeCaseId, build.cooler, build.gpu, chassisTheme]);

  // Handle Glass Panel Removal
  useEffect(() => {
    if (glassMeshRef.current) {
      glassMeshRef.current.visible = !glassRemoved;
    }
    if (frontGlassMeshRef.current) {
      frontGlassMeshRef.current.visible = !glassRemoved;
    }
  }, [glassRemoved]);

  // Handle Airflow Simulation Visibility
  useEffect(() => {
    if (airflowGroupRef.current) {
      airflowGroupRef.current.visible = showAirflow;
    }
  }, [showAirflow]);

  // Handle Exploded View Slider (Smooth Separation)
  useEffect(() => {
    const isDualChamber = activeCaseId === 'case-lian-li-o11-dynamic-evo';
    const baseGlassX = isDualChamber ? 0.58 : 0.43;

    if (explodedGlassRef.current) {
      explodedGlassRef.current.position.x = baseGlassX + explodedFactor * 0.85;
    }
    if (explodedRightPanelRef.current) {
      explodedRightPanelRef.current.position.x = -baseGlassX - explodedFactor * 0.65;
    }
    if (explodedFrontRef.current) {
      explodedFrontRef.current.position.z = 0.95 + explodedFactor * 0.8;
    }
    if (explodedTopRef.current) {
      explodedTopRef.current.position.y = 1.88 + explodedFactor * 0.6;
    }
    if (explodedGpuRef.current) {
      explodedGpuRef.current.position.x = -0.04 + explodedFactor * 0.35;
    }
  }, [explodedFactor, activeCaseId]);

  // Handle Camera Presets
  const handleCameraPreset = (preset: 'iso' | 'interior' | 'front' | 'side' | 'gpu') => {
    playClickSound();
    setActiveCameraPreset(preset);
    if (preset === 'iso') {
      targetCamPos.current.set(3.2, 1.8, 3.8);
      targetLookAt.current.set(0, 0.9, 0);
    } else if (preset === 'interior') {
      targetCamPos.current.set(1.35, 1.15, 0.25);
      targetLookAt.current.set(-0.15, 1.05, 0.1);
      setGlassRemoved(true); // Auto-open glass to view interior clearly
    } else if (preset === 'front') {
      targetCamPos.current.set(0.05, 1.05, 4.2);
      targetLookAt.current.set(0, 0.95, 0);
    } else if (preset === 'side') {
      targetCamPos.current.set(3.8, 1.0, 0);
      targetLookAt.current.set(0, 0.95, 0);
    } else if (preset === 'gpu') {
      targetCamPos.current.set(1.4, 0.85, 0.95);
      targetLookAt.current.set(0, 0.8, 0.15);
      setGlassRemoved(true);
    }
  };

  const handleTakeSnapshot = () => {
    playClickSound();
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    try {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
      const a = document.createElement('a');
      const cleanName = (buildName || 'ensamble-nucleo').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      a.href = dataUrl;
      a.download = `nucleo-pc-${cleanName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setSnapshotSuccess(true);
      setTimeout(() => setSnapshotSuccess(false), 2500);
    } catch (err) {
      console.error('Snapshot error:', err);
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-red-950/60 bg-slate-950 shadow-2xl">
      {/* 3D Canvas Mount Container */}
      <div
        ref={mountRef}
        className="w-full h-[520px] sm:h-[640px] cursor-grab active:cursor-grabbing relative"
      />

      {/* Top Left: Title Badge & Active Case */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-red-500/30 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="font-bold text-white tracking-wide">
            Visor 3D Interactivo: {buildName}
          </span>
        </div>
        <div className="text-[11px] font-mono text-red-400 bg-slate-950/85 px-2.5 py-1 rounded-lg border border-red-950/80 flex items-center gap-1.5">
          <span>Gabinete:</span>
          <strong className="text-white">{build.case?.name || 'Fractal Design North'}</strong>
        </div>
      </div>

      {/* Top Right: Component Inspector Card (on click/hover) */}
      {inspectedComponent && (
        <div className="absolute top-4 right-4 z-20 max-w-xs bg-slate-900/95 backdrop-blur-md border border-red-500/40 rounded-xl p-3 shadow-2xl text-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="text-[10px] uppercase font-mono tracking-wider text-red-400 font-bold">
              {inspectedComponent.category}
            </span>
            <button
              onClick={() => setInspectedComponent(null)}
              className="text-slate-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>
          <p className="font-bold text-white text-sm mt-1">{inspectedComponent.name}</p>
          <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
            {inspectedComponent.desc}
          </p>
          {inspectedComponent.price && (
            <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Precio Ref:</span>
              <span className="font-mono font-bold text-red-400 text-xs">
                {inspectedComponent.price}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Mid Left: Quick Case Switcher Bar (Directly swaps the 3D model) */}
      <div className="absolute left-4 top-24 z-20 flex flex-col gap-1 bg-slate-950/85 backdrop-blur-md p-2 rounded-xl border border-slate-800/80 max-w-[210px] hidden sm:flex">
        <span className="text-[9px] font-mono uppercase text-slate-400 font-bold px-1 mb-0.5 flex items-center gap-1">
          <Box className="w-3 h-3 text-red-400" />
          Cambiar Gabinete 3D:
        </span>
        {availableCases.map(c => {
          const isSelected = c.id === activeCaseId;
          return (
            <button
              key={c.id}
              onClick={() => {
                playClickSound();
                onSelectCase?.(c);
              }}
              className={`text-left px-2 py-1 rounded text-[11px] transition-all flex items-center justify-between gap-1 ${
                isSelected
                  ? 'bg-red-600 text-white font-bold shadow-md'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <span className="truncate">{c.name.split('(')[0]}</span>
              {isSelected && <span className="text-[9px] opacity-80 shrink-0">Activo</span>}
            </button>
          );
        })}

        {/* Clearance Diagnostics Button */}
        <button
          onClick={() => setShowClearanceModal(!showClearanceModal)}
          className="mt-1 pt-1 border-t border-slate-800 text-[10px] text-red-400 hover:text-white flex items-center gap-1 px-1"
        >
          <Gauge className="w-3 h-3" />
          <span>Verificar Holgura GPU/Cooler</span>
        </button>
      </div>

      {/* Clearance Popover Modal */}
      {showClearanceModal && (
        <div className="absolute left-4 top-72 z-30 w-72 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl text-xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-red-400" />
              Diagnóstico de Espacio Físico
            </span>
            <button
              onClick={() => setShowClearanceModal(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
          <div className="mt-2 space-y-2">
            <div>
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Largo GPU:</span>
                <span className="font-mono text-white">{clearanceData.gpuClearance.gpuLengthMm} mm / {clearanceData.gpuClearance.caseMaxGpuMm} mm max</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{clearanceData.gpuClearance.text}</p>
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Refrigeración:</span>
                <span className="font-mono text-white">{clearanceData.coolerClearance.type.toUpperCase()}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{clearanceData.coolerClearance.text}</p>
            </div>
          </div>
        </div>
      )}

      {/* Airflow Simulation Floating HUD Overlay */}
      {showAirflow && (
        <div className="absolute top-16 left-4 z-20 pointer-events-none bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 p-3 rounded-xl shadow-xl max-w-xs space-y-1.5 animate-in fade-in">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
            <span className="text-[11px] font-mono font-bold text-cyan-400 flex items-center gap-1">
              <Wind className="w-3.5 h-3.5" />
              SIMULACIÓN TÉRMICA EN VIVO
            </span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Presión Positiva (+)
            </span>
          </div>
          <div className="space-y-1 text-[10px] font-mono">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                Entrada Fría Frontal:
              </span>
              <span className="text-cyan-400 font-bold">~22°C (Intake 3x)</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                Escape Superior / Trasero:
              </span>
              <span className="text-red-400 font-bold">~54°C (Exhaust AIO)</span>
            </div>
            <div className="flex items-center justify-between text-slate-300 border-t border-slate-800/80 pt-1">
              <span>Temp. Estimada Silicio:</span>
              <span className="text-amber-400 font-bold">34°C Idle / 64°C Carga</span>
            </div>
          </div>
        </div>
      )}

      {/* Unified Bottom Control Dock (Skilled Three.js Ergonomics) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[96%] max-w-4xl bg-slate-900/95 backdrop-blur-md border border-red-950/60 rounded-xl p-3 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-slate-200">
        {/* Camera Views Pill Group */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] font-mono text-slate-400 uppercase mr-1 hidden md:inline">
            Vistas:
          </span>
          <button
            onClick={() => handleCameraPreset('iso')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              activeCameraPreset === 'iso'
                ? 'bg-red-600 text-white font-bold'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            Isométrica
          </button>
          <button
            onClick={() => handleCameraPreset('front')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              activeCameraPreset === 'front'
                ? 'bg-red-600 text-white font-bold'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
            title="Apreciar frontal del gabinete (Madera Fractal, 160mm Fans o Mesh)"
          >
            Frontal
          </button>
          <button
            onClick={() => handleCameraPreset('interior')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              activeCameraPreset === 'interior'
                ? 'bg-red-600 text-white font-bold'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            Interior
          </button>
          <button
            onClick={() => handleCameraPreset('gpu')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              activeCameraPreset === 'gpu'
                ? 'bg-red-600 text-white font-bold'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            GPU
          </button>
        </div>

        {/* Exploded View Slider (Desensamble) */}
        <div className="flex items-center gap-2 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800">
          <Layers className="w-3.5 h-3.5 text-red-400" />
          <span className="text-[11px] font-mono text-slate-300">Explosión:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={explodedFactor}
            onChange={e => {
              playClickSound();
              setExplodedFactor(parseFloat(e.target.value));
            }}
            className="w-20 accent-red-600 cursor-pointer h-1.5 bg-slate-800 rounded"
          />
          <span className="text-[10px] font-mono text-slate-400 w-7 text-right">
            {Math.round(explodedFactor * 100)}%
          </span>
        </div>

        {/* Panel Glass Toggle */}
        <button
          onClick={() => {
            playClickSound();
            setGlassRemoved(!glassRemoved);
          }}
          className={`px-2.5 py-1 rounded-lg font-medium border transition-all flex items-center gap-1.5 ${
            glassRemoved
              ? 'border-red-500 bg-red-950/40 text-red-400 font-bold'
              : 'border-slate-700 hover:bg-slate-800 text-slate-300'
          }`}
          title="Alternar panel de vidrio templado"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>{glassRemoved ? 'Poner Vidrio' : 'Quitar Vidrio'}</span>
        </button>

        {/* Fan Speed Toggle */}
        <button
          onClick={() => {
            playClickSound();
            if (fanSpeed === 'normal') setFanSpeed('fast');
            else if (fanSpeed === 'fast') setFanSpeed('stopped');
            else setFanSpeed('normal');
          }}
          className="px-2.5 py-1 rounded-lg font-medium border border-slate-700 hover:bg-slate-800 text-slate-300 flex items-center gap-1 text-[11px]"
          title="Controlar velocidad de ventiladores"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${fanSpeed !== 'stopped' ? 'text-red-400' : 'text-slate-500'}`} />
          <span>Fans: {fanSpeed === 'normal' ? 'Normal' : fanSpeed === 'fast' ? 'Turbo' : 'Stop'}</span>
        </button>

        {/* Airflow Simulation Toggle */}
        <button
          onClick={() => {
            playClickSound();
            setShowAirflow(!showAirflow);
          }}
          className={`px-2.5 py-1 rounded-lg font-medium border text-[11px] transition-all flex items-center gap-1.5 ${
            showAirflow
              ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300 font-bold shadow-md shadow-cyan-500/20'
              : 'border-slate-700 hover:bg-slate-800 text-slate-300'
          }`}
          title="Simular flujo de aire térmico y presión interna en 3D"
        >
          <Wind className={`w-3.5 h-3.5 ${showAirflow ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
          <span>{showAirflow ? 'Flujo ON' : 'Flujo Térmico'}</span>
        </button>

        {/* Audio Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-1.5 rounded-lg border transition-all ${
            soundEnabled
              ? 'border-red-500/50 bg-red-950/30 text-red-400'
              : 'border-slate-800 text-slate-400 hover:text-white'
          }`}
          title={soundEnabled ? 'Sonido activado' : 'Activar efectos de sonido'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* Chassis Material Variant Toggle (Snow White vs Stealth Black) */}
        <button
          onClick={() => {
            playClickSound();
            setChassisTheme(prev => (prev === 'stealth' ? 'snow' : 'stealth'));
          }}
          className={`px-2.5 py-1 rounded-lg font-medium border text-[11px] transition-all flex items-center gap-1.5 ${
            chassisTheme === 'snow'
              ? 'border-white bg-white/20 text-white font-bold'
              : 'border-slate-700 hover:bg-slate-800 text-slate-300'
          }`}
          title="Alternar Chasis Blanco Nieve o Stealth Negro"
        >
          <span className={`w-2.5 h-2.5 rounded-full ${chassisTheme === 'snow' ? 'bg-white' : 'bg-slate-700 border border-slate-500'}`} />
          <span>{chassisTheme === 'snow' ? 'Blanco Nieve' : 'Stealth Negro'}</span>
        </button>

        {/* Snapshot Capture Button */}
        <button
          onClick={handleTakeSnapshot}
          className="px-2.5 py-1 rounded-lg font-medium bg-red-600/90 hover:bg-red-500 text-white flex items-center gap-1.5 text-[11px] transition-all shadow-sm active:scale-95"
          title="Capturar foto en alta resolución de tu PC 3D"
        >
          {snapshotSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              <span>¡Guardado!</span>
            </>
          ) : (
            <>
              <Camera className="w-3.5 h-3.5" />
              <span>Foto HD</span>
            </>
          )}
        </button>

        {/* LED Lighting Mode Selector */}
        <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => {
              playClickSound();
              setLightingMode('red');
            }}
            className={`w-5 h-5 rounded-md bg-red-600 transition-transform ${
              lightingMode === 'red' ? 'ring-2 ring-white scale-110' : 'opacity-60'
            }`}
            title="Rojo Núcleo (Pulsante)"
          />
          <button
            onClick={() => {
              playClickSound();
              setLightingMode('rgb');
            }}
            className={`w-5 h-5 rounded-md bg-gradient-to-tr from-cyan-400 via-rose-500 to-amber-400 transition-transform ${
              lightingMode === 'rgb' ? 'ring-2 ring-white scale-110' : 'opacity-60'
            }`}
            title="RGB Spectrum"
          />
          <button
            onClick={() => {
              playClickSound();
              setLightingMode('cyberpunk');
            }}
            className={`w-5 h-5 rounded-md bg-gradient-to-r from-cyan-400 to-pink-500 transition-transform ${
              lightingMode === 'cyberpunk' ? 'ring-2 ring-white scale-110' : 'opacity-60'
            }`}
            title="Cyberpunk Neón"
          />
          <button
            onClick={() => {
              playClickSound();
              setLightingMode('white');
            }}
            className={`w-5 h-5 rounded-md bg-white transition-transform ${
              lightingMode === 'white' ? 'ring-2 ring-red-500 scale-110' : 'opacity-60'
            }`}
            title="Estudio Blanco"
          />
          <button
            onClick={() => {
              playClickSound();
              setLightingMode('stealth');
            }}
            className={`w-5 h-5 rounded-md bg-slate-800 transition-transform ${
              lightingMode === 'stealth' ? 'ring-2 ring-white scale-110' : 'opacity-60'
            }`}
            title="Stealth (Sin luces)"
          />
        </div>
      </div>
    </div>
  );
};
