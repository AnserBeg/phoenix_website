import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function Trailer3DViewer({ modelPath, width = 400, height = 300, zoom = 1 }) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const animationIdRef = useRef(null);
  const dracoLoaderRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    
    // Clear any existing content
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(5, 3, 5);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      preserveDrawingBuffer: false
    });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Add a subtle fill light from the opposite side
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 2;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI / 2;
    controls.autoRotate = false; // No auto-rotation
    controls.enablePan = false; // No panning
    controlsRef.current = controls;

    // Animation loop function
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      // Update controls
      controls.update();
      
      // Auto-rotate the model - only if model exists
      if (modelRef.current) {
        modelRef.current.rotation.y += 0.01; // Slow, smooth rotation
      }
      
      renderer.render(scene, camera);
    };

    // Load the 3D model - support both GLB and FBX files
    const fileExtension = modelPath.split('.').pop().toLowerCase();
    
    if (fileExtension === 'fbx') {
      // Load FBX file
      const fbxLoader = new FBXLoader();
      fbxLoader.load(
      modelPath,
        (fbx) => {
          const model = fbx;
          
          // Disable any animations that might be in the FBX file
          if (fbx.animations && fbx.animations.length > 0) {
            console.log('FBX file contains animations, but they are disabled for static viewing');
          }
        
        // Enable shadows for the model
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Improve material quality
            if (child.material) {
              child.material.needsUpdate = true;
              // Add some metallic properties for better appearance
              if (child.material.isMeshStandardMaterial) {
                child.material.metalness = 0.1;
                child.material.roughness = 0.8;
              }
            }
          }
        });
        
        // Center and scale the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Center the model at origin
        model.position.sub(center);
        
        // Scale to fit in view with zoom factor
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = (4 / maxDim) * zoom;
        model.scale.setScalar(scale);
        
        // Recalculate bounding box after scaling
        const scaledBox = new THREE.Box3().setFromObject(model);
        const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
        
        // Ensure model is perfectly centered at origin
        model.position.sub(scaledCenter);
        
        // Add the model to the scene
        scene.add(model);
        modelRef.current = model;
        
        // Position camera at balanced distance with zoom adjustment
        const distance = (maxDim * 2.0) / zoom; // Increased distance for better view
        camera.position.set(distance, distance * 0.4, distance); // Lower angle, less top-down
        camera.lookAt(0, 0, 0);
        
        // Set controls target to the center of the model
        controls.target.set(0, 0, 0);
        controls.update();
        
        // Ensure controls are properly configured
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 2;
        controls.maxDistance = 20;
        controls.maxPolarAngle = Math.PI / 2;
        controls.autoRotate = false;
        controls.enablePan = false;
        
        setLoading(false);
        
        // Start animation loop ONLY after model is loaded
        animate();
      },
      (progress) => {
        // Loading progress
        console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
      },
      (error) => {
        console.error('Error loading FBX model:', error);
        setError('Failed to load 3D model');
        setLoading(false);
      }
    );
    } else {
      // Load GLB/GLTF file
      const gltfLoader = new GLTFLoader();
      
      // Configure DRACO loader for compressed models
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
      dracoLoader.setDecoderConfig({ type: 'js' });
      gltfLoader.setDRACOLoader(dracoLoader);
      dracoLoaderRef.current = dracoLoader;
      
      gltfLoader.load(
        modelPath,
        (gltf) => {
          const model = gltf.scene;
          
          // Disable any animations that might be in the GLB file
          if (gltf.animations && gltf.animations.length > 0) {
            console.log('GLB file contains animations, but they are disabled for static viewing');
          }
          
          // Enable shadows for the model
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              
              // Improve material quality
              if (child.material) {
                child.material.needsUpdate = true;
                // Add some metallic properties for better appearance
                if (child.material.isMeshStandardMaterial) {
                  child.material.metalness = 0.1;
                  child.material.roughness = 0.8;
                }
              }
            }
          });
          
          // Center and scale the model
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          
          // Center the model at origin
          model.position.sub(center);
          
          // Scale to fit in view with zoom factor
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = (4 / maxDim) * zoom;
          model.scale.setScalar(scale);
          
          // Recalculate bounding box after scaling
          const scaledBox = new THREE.Box3().setFromObject(model);
          const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
          
          // Ensure model is perfectly centered at origin
          model.position.sub(scaledCenter);
          
          // Add the model to the scene
          scene.add(model);
          modelRef.current = model;
          
          // Position camera at balanced distance with zoom adjustment
          const distance = (maxDim * 2.0) / zoom; // Increased distance for better view
          camera.position.set(distance, distance * 0.4, distance); // Lower angle, less top-down
          camera.lookAt(0, 0, 0);
          
          // Set controls target to the center of the model
          controls.target.set(0, 0, 0);
      controls.update();
      
          // Ensure controls are properly configured
          controls.enableDamping = true;
          controls.dampingFactor = 0.05;
          controls.screenSpacePanning = false;
          controls.minDistance = 2;
          controls.maxDistance = 20;
          controls.maxPolarAngle = Math.PI / 2;
          controls.autoRotate = false;
          controls.enablePan = false;
          
          setLoading(false);
          
          // Start animation loop ONLY after model is loaded
          animate();
        },
        (progress) => {
          // Loading progress
          console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
        },
        (error) => {
          console.error('Error loading GLB model:', error);
          setError('Failed to load 3D model');
          setLoading(false);
        }
      );
    }

    // Resize handler
    const handleResize = () => {
      const { clientWidth: w, clientHeight: h } = container;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    // Cleanup
    return () => {
      // Stop animation loop
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      
      // Dispose controls
      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }
      
      // Dispose renderer
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      
      // Clear model reference
      modelRef.current = null;
      
      // Disconnect resize observer
      ro.disconnect();
      
      // Clear container
      if (container && container.firstChild) {
        container.innerHTML = '';
      }
      
      // Dispose DRACO loader
      if (dracoLoaderRef.current) {
        dracoLoaderRef.current.dispose();
        dracoLoaderRef.current = null;
      }
    };
  }, [modelPath, width, height, zoom]);

  return (
    <div style={{ position: 'relative', width, height }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #ddd'
        }}>
          <div>Loading 3D Model...</div>
        </div>
      )}
      
      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          background: 'rgba(255, 0, 0, 0.1)',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center',
          color: 'red'
        }}>
          {error}
        </div>
      )}
      
             <div
         ref={mountRef}
         style={{
           width: '100%',
           height: '100%',
           overflow: 'hidden'
         }}
       />
    </div>
  );
}
