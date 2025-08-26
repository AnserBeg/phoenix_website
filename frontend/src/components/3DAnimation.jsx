import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function ThreeDBackground() {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const { clientWidth: w, clientHeight: h } = container;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x06030a, 0.03);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(58, w / h, 0.1, 200);
    camera.position.set(0, 0, 10);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true, 
      powerPreference: 'high-performance' 
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create simple particles
    const particleCount = 5000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Random positions in a box
      positions[i3 + 0] = (Math.random() - 0.5) * 20; // x
      positions[i3 + 1] = (Math.random() - 0.5) * 12; // y
      positions[i3 + 2] = (Math.random() - 0.5) * 20; // z

      // Colors: violet to magenta
      if (Math.random() < 0.3) {
        colors[i3 + 0] = 0.98; // pink
        colors[i3 + 1] = 0.55;
        colors[i3 + 2] = 0.91;
      } else {
        colors[i3 + 0] = 0.62; // magenta
        colors[i3 + 1] = 0.21;
        colors[i3 + 2] = 0.92;
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Add some lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    // Mouse parallax
    const parallax = new THREE.Vector2();
    const onMove = (e) => {
      const rect = container.getBoundingClientRect();
      parallax.x = (e.clientX - rect.left) / rect.width * 2 - 1;
      parallax.y = -((e.clientY - rect.top) / rect.height * 2 - 1);
    };
    window.addEventListener('mousemove', onMove);

    // Resize handler
    const handleResize = () => {
      const { clientWidth: nw, clientHeight: nh } = container;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);
    window.addEventListener('resize', handleResize);

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();

      // Rotate particles
      points.rotation.y = t * 0.1;
      points.rotation.x = t * 0.05;

      // Camera parallax
      camera.position.x += (parallax.x * 0.8 - camera.position.x) * 0.05;
      camera.position.y += (parallax.y * 0.5 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      animationIdRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', handleResize);
      ro.disconnect();
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);

      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    />
  );
}
