import 'three/examples/js/controls/OrbitControls'
import 'three/examples/js/loaders/OBJLoader'
import { waterVertex, waterFragment } from './shaders'
import {
	Scene,
	PerspectiveCamera,
	WebGLRenderer,
	Mesh,
	ShaderMaterial,
	MeshPhongMaterial,
	PlaneBufferGeometry,
	AmbientLight,
	DirectionalLight,
	TextureLoader,
	MirroredRepeatWrapping,
	RepeatWrapping,
	Vector2,
	PCFSoftShadowMap,
	Fog
} from 'three'

const loader = new TextureLoader()

const app = {
	init() {
		this.scene = new Scene()
		this.scene.fog = new Fog(0x2e684c, 0, 60)
		this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
		this.renderer = new WebGLRenderer({ antialias: 1 })
		this.renderer.shadowMap.enabled = true
		this.renderer.setClearColor(0xe29b81, 1);

		// Load island then render scene
		this.loadModel()
		.then(() => {
			// Resize renderer and append its dom to body
			this.renderer.setSize(window.innerWidth, window.innerHeight)
			document.body.appendChild(this.renderer.domElement)

			// Resize renderer when browser is resized
			window.addEventListener('resize', e => {
				this.renderer.setSize(window.innerWidth, window.innerHeight)
				this.camera.aspect = window.innerWidth / window.innerHeight
				this.camera.updateProjectionMatrix()
			})

			this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement)

			// Setup scene objects
			this.run()

			// Setup game loop
			var loop = () => {
				requestAnimationFrame(loop)
				this.update()
				this.draw()
			}

			// Start game loop
			loop()
		})
	},

	run() {
		let geometry = new PlaneBufferGeometry(500, 500, 300, 50),
			material = new ShaderMaterial({
				uniforms: this.uniforms,
				vertexShader: waterVertex,
				fragmentShader: waterFragment,
				fog: true,
				wireframe: false,
				transparent: true
			})

		this.uniforms.texture.value.wrapS = MirroredRepeatWrapping
		this.uniforms.texture.value.wrapT = MirroredRepeatWrapping
		this.uniforms.ripples.value.wrapS = RepeatWrapping
		this.uniforms.ripples.value.wrapT = RepeatWrapping

		// Directional light
		this.light = new DirectionalLight(0xfff435, 1.2)
		this.light.position.z = 15
		this.light.position.x = 50
		this.light.castShadow = true
		this.light.shadow.mapSize.width = 1024;
		this.light.shadow.mapSize.height = 1024;
		this.scene.add(this.light)

		// Ambient light
		this.ambientLight = new AmbientLight(0x412563, 1.2)
		this.scene.add(this.ambientLight)

		// Camera
		this.camera.position.z = 2
		this.camera.position.y = -10
		this.camera.rotation.x = 1.5
		
		// Sphere
		this.water = new Mesh(geometry, material)

		// Add objects
		this.scene.add(this.water)
	},

	uniforms: {
		texture: {
			type: 't',
			value: loader.load('./textures/ToonWater01.png')
		},
		bump: {
			type: 't',
			value: loader.load('./textures/PaperNormal01.jpg')
		},
		ripples: {
			type: 't',
			value: loader.load('./textures/RipplesNormal01.jpg')
		},
		delta: {
			type: 'f',
			value: 0.0
		},
		speed: {
			type: 'f',
			value: 3.0
		},
		fogColor: {
			type: "c"
		},
		fogNear: {
			type: "f"
		},
		fogFar: {
			type: "f"
		}
	},

	loadModel() {
		var objLoader = new THREE.OBJLoader();

		return new Promise((resolve, reject) => {
			objLoader.load('./models/LittleIsland.obj',
				object => {
					object.traverse(node => {
						let diffuse = loader.load('./textures/IslandDiffuse.png'),
							normal = loader.load('./textures/IslandNormal.png'),
							occlusion = loader.load('./textures/IslandAmbientOcclusion.png')
						
						if (node instanceof Mesh) {
							node.material = new MeshPhongMaterial({
								map: diffuse,
								aoMap: occlusion,
								aoMapIntensity: .2,
								shininess: 100
							})
							node.castShadow = true
							node.receiveShadow = true
						}
					})

					object.position.z = -.4
					this.island = object
					this.scene.add(object);

					return resolve(object)
				}
			)
		})
	},

	update() {
		this.island.rotation.z += 0.0025
		this.uniforms.delta.value += 0.001
	},

	draw() {
		this.renderer.render(this.scene, this.camera)
	}
}

app.init()

export default app
