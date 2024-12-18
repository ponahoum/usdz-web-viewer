import { Component, Ref, Vue } from "vue-property-decorator";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { DataTexture } from "three";
import { USDZInstance } from "three-usdz-loader/lib/USDZInstance";
import { USDZLoader } from "three-usdz-loader";

@Component
export default class Home extends Vue {
  @Ref("three-container") threeContainer!: HTMLElement;
  @Ref("file") fileInput!: HTMLInputElement;

  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  currentFileName!: string;
  controls!: OrbitControls;

  // Tells if a model is currently visible
  modelIsVisible = false;

  // Tells if a file is loading currently
  modelIsLoading = false;

  // Dialog open or closed
  dialog = false;

  // Loaded models
  loadedModels: USDZInstance[] = [];

  // USDZ loader instance. Only one should be instantiated in the DOM scope
  loader!: USDZLoader;

  // Simple error handling
  error: string | null = null;

  // Tells if the loader has loaded with success
  loaderReady: boolean | null = null;

  async mounted(): Promise<void> {
    // Setup camera
    this.camera = new THREE.PerspectiveCamera(
      27,
      window.innerWidth / window.innerHeight,
      1,
      3500
    );
    this.camera.position.z = 7;
    this.camera.position.y = 7;
    this.camera.position.x = 0;

    // Setup scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    // Setup light
    const ambiantLight = new THREE.AmbientLight(0x111111);
    ambiantLight.intensity = 1;
    this.scene.add(ambiantLight);

    // Setup main scene
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.shadowMap.enabled = false;
    this.renderer.shadowMap.type = THREE.VSMShadowMap;

    // Setup cubemap for reflection
    await new Promise((resolve) => {
      const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
      pmremGenerator.compileCubemapShader();
      new RGBELoader().load(
        "studio_country_hall_1k.hdr",
        (texture: DataTexture) => {
          const hdrRenderTarget = pmremGenerator.fromEquirectangular(texture);

          texture.mapping = THREE.EquirectangularReflectionMapping;
          texture.needsUpdate = true;
          window.envMap = hdrRenderTarget.texture;
          hdrRenderTarget.texture.colorSpace = THREE.LinearSRGBColorSpace;
          resolve(true);
        }
      );
    });

    //Add the canvas to the document
    this.threeContainer.appendChild(this.renderer.domElement);

    // Setup navigation
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.update();

    // Setup main animation update loop
    this.animate();

    // Setup the USDZ loader
    this.loader = new USDZLoader("/wasm");

    // Setup windows events
    window.addEventListener("resize", this.onWindowResize);

    // Load file from URL after the window has fully loaded
    this.loadFileFromUrl();
  }

  async loadFileFromUrl(): Promise<void> {
    const urlParams = new URLSearchParams(window.location.search);
    const fileUrl = urlParams.get('url');
    if (fileUrl) {
        const decodedUrl = decodeURIComponent(fileUrl); // Decode the URL
        try {
            const response = await fetch(decodedUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const fileBlob = await response.blob();
            // Specify the correct MIME type for USDZ files
            const file = new File([fileBlob], 'loadedFile.usdz', { type: 'model/vnd.usdz+zip' }); // Use the correct MIME type
            await this.loadFile(file);
        } catch (error) {
            console.error("Failed to load the file from URL:", error);
            this.error = error instanceof Error ? error.message : "An unknown error occurred."; // Set error message for user feedback
        }
    }
  }

  /**
   * Main update loop
   */
  async animate(): Promise<void> {
    const secs = new Date().getTime() / 1000;
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Update all models animations (in our exemple there is only one model at a time)
    for (const loadedModel of this.loadedModels) {
      loadedModel.update(secs);
    }

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate.bind(null));
  }

  /**
   * Load a USDZ file in the scene
   * @param file
   * @returns
   */
  async loadFile(file: File): Promise<void> {
    // Prevents multiple loadings in parallel
    if (this.modelIsLoading) {
        return;
    }

    // Notice model is now loading
    this.modelIsLoading = true;

    // Reset any previous error
    this.error = null;

    // Log the file details for debugging
    console.log("Loading file:", file.name, "Type:", file.type, "Size:", file.size);

    // Clear up any previously loaded model
    for (const el of this.loadedModels) {
        el.clear();
    }
    this.loadedModels = [];

    // Create the ThreeJs Group in which the loaded USDZ model will be placed
    const group = new THREE.Group();
    this.scene.add(group);

    // Load file and catch any error to show the user
    try {
        const loadedModel = await this.loader.loadFile(file, group);
        this.loadedModels.push(loadedModel);
    } catch (e) {
        this.error = e as string;
        console.error("An error occurred when trying to load the model:", e);
        this.modelIsLoading = false;
        return;
    }

    // Fits the camera to match the loaded model
    const allContainers = this.loadedModels.map((el: USDZInstance) => {
        return el.getGroup();
    });
    this.fitCamera(this.camera, this.controls, allContainers);

    // Notice end
    this.modelIsLoading = false;
    this.modelIsVisible = true;
  }

  /**
   * Fits the camera view to the imported objects
   */
  fitCamera(
    camera: THREE.PerspectiveCamera,
    controls: OrbitControls,
    selection: THREE.Group[],
    fitOffset = 1.5
  ): void {
    const cam = camera as THREE.PerspectiveCamera;
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    const box = new THREE.Box3();

    box.makeEmpty();
    for (const object of selection) {
      box.expandByObject(object);
    }

    box.getSize(size);
    box.getCenter(center);

    const maxSize = Math.max(size.x, size.y, size.z);
    const fitHeightDistance =
      maxSize / (2 * Math.atan((Math.PI * cam.fov) / 360));
    const fitWidthDistance = fitHeightDistance / cam.aspect;
    const distance = fitOffset * Math.max(fitHeightDistance, fitWidthDistance);

    const direction = controls.target
      .clone()
      .sub(cam.position)
      .normalize()
      .multiplyScalar(distance);

    controls.maxDistance = distance * 10;
    controls.target.copy(center);

    cam.near = distance / 100;
    cam.far = distance * 100;
    cam.updateProjectionMatrix();

    camera.position.copy(controls.target).sub(direction);

    controls.update();
  }

  onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  onChange(): void {
    if (this.fileInput.files != null) {
      this.handleFilesUpload(this.fileInput.files);
    }
  }
  onClickDragZone(): void {
    this.fileInput.click();
  }
  dragover(event: DragEvent): void {
    event.preventDefault();
  }
  drop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer == null) {
      console.error("Files are null");
      return;
    }
    this.handleFilesUpload(event.dataTransfer.files);
  }
  handleFilesUpload(files: FileList): void {
    this.loadFile(files[0]);
  }
}
