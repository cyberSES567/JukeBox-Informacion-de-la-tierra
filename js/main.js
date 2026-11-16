import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const EARTH_RADIUS = 4;
const MARKER_COLOR = 0xff3030;
const MARKER_ACTIVE = 0x00f0ff;

// =====================================================
// CONVERSIÓN GEOGRÁFICA
// =====================================================

function latLonToVector3(lat, lon, radius) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;

  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

// =====================================================
// EARTH SCENE
// =====================================================

export class EarthScene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;

    this.earth = null;
    this.clouds = null;
    this.atmosphere = null;
    this.moonOrbit = null;
    this.sunLight = null;
    this.markerGroup = null;
    this.selectionRing = null;
    this.stars = null;
    this.earthUniforms = null;

    this.animationId = null;
    this.isRunning = false;
    this.isInitialized = false;
    this.cameraTween = null;

    // Simulación de hora (ms que se suman a la hora real)
    this.timeOffsetMs = 0;

    // Callbacks de carga (los asigna la app)
    this.onProgress = null;
    this.onLoaded = null;
    this.onError = null;

    this.clock = new THREE.Clock();

    this.loadingManager = new THREE.LoadingManager();
    this.loadingManager.onProgress = (url, loaded, total) => {
      if (this.onProgress) this.onProgress(loaded / total);
    };
    this.loadingManager.onLoad = () => {
      if (this.onLoaded) this.onLoaded();
    };
    this.loadingManager.onError = (url) => {
      console.error("Error cargando textura:", url);
      if (this.onError) this.onError(url);
    };
    this.textureLoader = new THREE.TextureLoader(this.loadingManager);

    this.zones = [
      {
        id: "amazonas",
        name: "Selva del Amazonas",
        lat: -3.4653,
        lon: -62.2159,
        impactKey: "impact_amazon",
      },
      {
        id: "tokyo",
        name: "Tokio, Japón",
        lat: 35.6762,
        lon: 139.6503,
        impactKey: "impact_tokyo",
      },
      {
        id: "sahara",
        name: "Desierto del Sahara",
        lat: 23.4162,
        lon: 25.6628,
        impactKey: "impact_sahara",
      },
      {
        id: "lima",
        name: "Perú, Lima",
        lat: -12.1371,
        lon: -76.9214,
        impactKey: "impact_lima",
      },
      {
        id: "greenland",
        name: "Groenlandia",
        lat: 72.5798,
        lon: -38.459,
        impactKey: "impact_greenland",
      },
      {
        id: "antarctica",
        name: "Antártida (Base McMurdo)",
        lat: -77.8419,
        lon: 166.6863,
        impactKey: "impact_antarctica",
      },
      {
        id: "death_valley",
        name: "Valle de la Muerte",
        lat: 36.5323,
        lon: -116.9325,
        impactKey: "impact_death",
      },
      {
        id: "coral_reef",
        name: "Gran Barrera de Coral",
        lat: -18.2871,
        lon: 147.6992,
        impactKey: "impact_coral",
      },
      {
        id: "siberia",
        name: "Siberia",
        lat: 66.4238,
        lon: 112.4281,
        impactKey: "impact_siberia",
      },
    ];
  }

  // =====================================================
  // INICIALIZACIÓN
  // =====================================================

  init() {
    if (this.isInitialized) return;

    if (!this.container) throw new Error("No se encontró canvas-container");
    if (!window.WebGLRenderingContext) throw new Error("WebGL no soportado");

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      45,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000,
    );
    this.camera.position.set(0, 0, 50);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enablePan = false;
    this.controls.minDistance = 4.8;
    this.controls.maxDistance = 40;
    this.controls.enabled = false;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.5;

    this.createEarth();
    this.createAtmosphere();
    this.createMoon();
    this.createClouds();
    this.createMarkers();
    this.createLighting();
    this.createStars();

    this.handleResize();

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.container);

    // Pausa el render cuando la pestaña no está visible (ahorra batería/GPU)
    this.visibilityHandler = () => {
      if (document.hidden) this.stopAnimation();
      else this.startAnimation();
    };
    document.addEventListener("visibilitychange", this.visibilityHandler);

    this.isInitialized = true;
    this.startAnimation();
  }

  loadTexture(url) {
    const texture = this.textureLoader.load(url);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    return texture;
  }

  // =====================================================
  // TIEMPO SIMULADO
  // =====================================================

  getNow() {
    return new Date(Date.now() + this.timeOffsetMs);
  }

  setTimeOffset(ms) {
    this.timeOffsetMs = ms;
    this.updateSunPosition();
  }

  // Dirección del Sol según fecha/hora UTC y época del año
  getSunDirection(date = this.getNow()) {
    const utcHours =
      date.getUTCHours() +
      date.getUTCMinutes() / 60 +
      date.getUTCSeconds() / 3600;

    // Longitud subsolar (12:00 UTC => 0°)
    const subsolarLon = THREE.MathUtils.degToRad((12 - utcHours) * 15);

    // Declinación solar (aprox. -23.44° en solsticio de diciembre)
    const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 0);
    const dayOfYear = (date.getTime() - startOfYear) / 86400000;
    const decl = THREE.MathUtils.degToRad(
      -23.44 * Math.cos(((2 * Math.PI) / 365) * (dayOfYear + 10)),
    );

    // Misma convención que latLonToVector3()
    return new THREE.Vector3(
      Math.cos(decl) * Math.cos(subsolarLon),
      Math.sin(decl),
      -Math.cos(decl) * Math.sin(subsolarLon),
    ).normalize();
  }

  updateSunPosition() {
    const dir = this.getSunDirection();
    if (this.sunLight) this.sunLight.position.copy(dir).multiplyScalar(40);
    if (this.earthUniforms) this.earthUniforms.sunDirection.value.copy(dir);
  }

  // ¿Es de día en esta zona ahora mismo?
  isDaylight(zone) {
    const normal = latLonToVector3(zone.lat, zone.lon, 1);
    return normal.dot(this.getSunDirection()) > 0;
  }

  // =====================================================
  // TIERRA (shader día/noche con crepúsculo)
  // =====================================================

  createEarth() {
    this.earthUniforms = {
      dayMap: {
        value: this.loadTexture(
          "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
        ),
      },
      nightMap: {
        value: this.loadTexture(
          "https://unpkg.com/three-globe/example/img/earth-night.jpg",
        ),
      },
      sunDirection: { value: this.getSunDirection() },
    };

    const material = new THREE.ShaderMaterial({
      uniforms: this.earthUniforms,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        void main() {
          vUv = uv;
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D dayMap;
        uniform sampler2D nightMap;
        uniform vec3 sunDirection;
        varying vec2 vUv;
        varying vec3 vWorldNormal;

        void main() {
          float d = dot(normalize(vWorldNormal), normalize(sunDirection));

          vec3 day   = texture2D(dayMap, vUv).rgb;
          vec3 night = texture2D(nightMap, vUv).rgb;

          vec3 dayCol   = day * (0.35 + 0.75 * clamp(d, 0.0, 1.0));
          vec3 nightCol = night * 1.3 + day * 0.03;

          float blend = smoothstep(-0.12, 0.22, d);
          vec3 color = mix(nightCol, dayCol, blend);

          float twilight = smoothstep(-0.05, 0.1, d) * (1.0 - smoothstep(0.1, 0.35, d));
          color += vec3(1.0, 0.45, 0.15) * twilight * 0.12;

          gl_FragColor = vec4(color, 1.0);
          #include <colorspace_fragment>
        }
      `,
    });

    this.earth = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_RADIUS, 64, 64),
      material,
    );
    this.scene.add(this.earth);
  }

  // =====================================================
  // ATMÓSFERA (brillo en el borde, más intenso en el lado iluminado)
  // =====================================================

  createAtmosphere() {
    const material = new THREE.ShaderMaterial({
      uniforms: { sunDirection: this.earthUniforms.sunDirection },
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying vec3 vWorldNormal;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vViewDir = normalize(-mv.xyz);
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 sunDirection;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying vec3 vWorldNormal;
        void main() {
          float d = -dot(normalize(vNormal), normalize(vViewDir));
          float rim = pow(smoothstep(0.0, 0.5, d), 2.0);
          float lit = smoothstep(-0.35, 0.45, dot(normalize(vWorldNormal), normalize(sunDirection)));
          vec3 col = mix(vec3(0.05, 0.12, 0.35), vec3(0.25, 0.6, 1.0), lit);
          gl_FragColor = vec4(col, rim * (0.3 + 0.9 * lit));
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_RADIUS * 1.12, 64, 64),
      material,
    );
    this.scene.add(this.atmosphere);
  }

  // =====================================================
  // LUNA
  // =====================================================

  createMoon() {
    this.moonOrbit = new THREE.Group();
    this.scene.add(this.moonOrbit);

    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(1.365, 48, 48),
      new THREE.MeshPhongMaterial({
        map: this.loadTexture(
          "https://threejs.org/examples/textures/planets/moon_1024.jpg",
        ),
        shininess: 0,
      }),
    );
    moon.position.set(25, 0, -10);

    this.moonOrbit.add(moon);
  }

  // =====================================================
  // NUBES
  // =====================================================

  createClouds() {
    this.clouds = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_RADIUS * 1.05, 64, 64),
      new THREE.MeshPhongMaterial({
        map: this.loadTexture(
          "https://threejs.org/examples/textures/planets/earth_clouds_1024.png",
        ),
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.scene.add(this.clouds);
  }

  // =====================================================
  // MARCADORES + ANILLO DE SELECCIÓN
  // =====================================================

  createMarkers() {
    this.markerGroup = new THREE.Group();
    this.scene.add(this.markerGroup);

    const geometry = new THREE.SphereGeometry(0.25, 16, 16);

    this.zones.forEach((zone) => {
      const marker = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({ color: MARKER_COLOR }),
      );
      marker.position.copy(latLonToVector3(zone.lat, zone.lon, 4.15));
      marker.userData = zone;
      this.markerGroup.add(marker);
    });

    // Anillo pulsante (no forma parte del grupo, así que no recibe clics)
    this.selectionRing = new THREE.Mesh(
      new THREE.RingGeometry(0.34, 0.4, 48),
      new THREE.MeshBasicMaterial({
        color: MARKER_ACTIVE,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    this.selectionRing.visible = false;
    this.scene.add(this.selectionRing);
  }

  // =====================================================
  // ILUMINACIÓN
  // =====================================================

  createLighting() {
    this.sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    this.scene.add(this.sunLight);
    this.scene.add(new THREE.AmbientLight(0x111122, 0.4));

    this.updateSunPosition();
    this.sunInterval = setInterval(() => this.updateSunPosition(), 1000);
  }

  // =====================================================
  // ESTRELLAS
  // =====================================================

  createStars() {
    const positions = new Float32Array(5000 * 3);
    for (let i = 0; i < positions.length; i++) {
      positions[i] = (Math.random() - 0.5) * 300;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    this.stars = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.3,
        sizeAttenuation: true,
      }),
    );
    this.scene.add(this.stars);
  }

  // =====================================================
  // REDIMENSIONAMIENTO
  // =====================================================

  handleResize() {
    if (!this.camera || !this.renderer) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (!width || !height) return;

    this.camera.aspect = width / height;
    // En pantallas verticales se abre el campo de visión para que el globo no se corte
    this.camera.fov = this.camera.aspect < 1 ? Math.min(78, 45 / Math.max(this.camera.aspect, 0.58)) : 45;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height);
  }

  // =====================================================
  // ANIMACIÓN
  // =====================================================

  startAnimation() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.clock.getDelta(); // evita un salto grande al reanudar
    this.animate();
  }

  stopAnimation() {
    this.isRunning = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  animate() {
    if (!this.isRunning) return;
    this.animationId = requestAnimationFrame(() => this.animate());

    const dt = Math.min(this.clock.getDelta(), 0.1);
    const elapsed = this.clock.elapsedTime;

    if (this.clouds) this.clouds.rotation.y += 0.03 * dt;
    if (this.moonOrbit) this.moonOrbit.rotation.y += 0.012 * dt;

    if (this.selectionRing && this.selectionRing.visible) {
      const phase = (elapsed * 0.8) % 1;
      this.selectionRing.scale.setScalar(1 + phase * 1.5);
      this.selectionRing.material.opacity = 0.9 * (1 - phase);
    }

    if (this.controls) {
      // Rotación más fina cuando estamos cerca de la superficie
      const dist = this.camera.position.length();
      this.controls.rotateSpeed = THREE.MathUtils.clamp(dist / 15, 0.35, 1);
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }

  // =====================================================
  // CÁMARA
  // =====================================================

  zoomIn() {
    const gsap = window.gsap;

    if (!gsap) {
      this.camera.position.set(0, 0, 15);
      this.controls.enabled = true;
      return;
    }

    gsap.to(this.camera.position, {
      z: 15,
      duration: 2,
      ease: "power2.out",
      onComplete: () => {
        this.controls.enabled = true;
      },
    });
  }

  clearSelection() {
    this.markerGroup.children.forEach((m) => {
      m.scale.setScalar(1);
      m.material.color.setHex(MARKER_COLOR);
    });
    this.selectionRing.visible = false;
  }

  focusOnZone(zone) {
    if (!this.camera || !this.controls) return;

    const marker = this.markerGroup.children.find(
      (m) => m.userData.id === zone.id,
    );
    if (!marker) return;

    this.clearSelection();
    marker.scale.setScalar(1.5);
    marker.material.color.setHex(MARKER_ACTIVE);

    this.selectionRing.position.copy(marker.position);
    this.selectionRing.lookAt(marker.position.clone().multiplyScalar(2));
    this.selectionRing.visible = true;

    this.controls.autoRotate = false;
    this.controls.target.set(0, 0, 0);

    const targetDir = marker.position.clone().normalize();
    const endDist = 9;

    if (!window.gsap) {
      this.camera.position.copy(targetDir).multiplyScalar(endDist);
      return;
    }

    this.animateCameraTo(targetDir, endDist, false);
  }

  resetView() {
    if (!this.camera || !this.controls) return;

    this.clearSelection();

    const dir = this.camera.position.clone().normalize();

    if (!window.gsap) {
      this.camera.position.copy(dir).multiplyScalar(15);
      this.controls.autoRotate = true;
      return;
    }

    this.animateCameraTo(dir, 15, true);
  }

  // Movimiento en arco alrededor de la Tierra (nunca la atraviesa)
  animateCameraTo(targetDir, endDist, resumeAutoRotate) {
    const gsap = window.gsap;

    if (this.cameraTween) this.cameraTween.kill();
    gsap.killTweensOf(this.camera.position);

    const startDir = this.camera.position.clone().normalize();
    const startDist = this.camera.position.length();

    const q = new THREE.Quaternion().setFromUnitVectors(startDir, targetDir);
    const qIdentity = new THREE.Quaternion();
    const qt = new THREE.Quaternion();
    const state = { t: 0 };

    this.controls.enabled = false;

    this.cameraTween = gsap.to(state, {
      t: 1,
      duration: 1.8,
      ease: "power3.inOut",
      onUpdate: () => {
        qt.copy(qIdentity).slerp(q, state.t);
        const dir = startDir.clone().applyQuaternion(qt);
        const dist = THREE.MathUtils.lerp(startDist, endDist, state.t);
        this.camera.position.copy(dir.multiplyScalar(dist));
        this.camera.lookAt(0, 0, 0);
      },
      onComplete: () => {
        this.controls.enabled = true;
        this.controls.autoRotate = resumeAutoRotate;
        this.controls.update();
      },
    });
  }

  // =====================================================
  // DESTRUIR ESCENA
  // =====================================================

  dispose() {
    this.stopAnimation();

    if (this.cameraTween) this.cameraTween.kill();
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.visibilityHandler) {
      document.removeEventListener("visibilitychange", this.visibilityHandler);
    }
    if (this.sunInterval) clearInterval(this.sunInterval);
    if (this.controls) this.controls.dispose();

    if (this.scene) {
      this.scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();

        if (object.material) {
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];

          materials.forEach((material) => {
            Object.values(material.uniforms || {}).forEach((u) => {
              if (u.value && u.value.isTexture) u.value.dispose();
            });
            Object.values(material).forEach((value) => {
              if (value && value.isTexture) value.dispose();
            });
            material.dispose();
          });
        }
      });
    }

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.domElement.remove();
    }

    this.isInitialized = false;
  }
}
