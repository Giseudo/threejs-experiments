import 'three/examples/js/loaders/OBJLoader'
import { waterVertex, waterFragment } from './shaders'
import {
	Scene,
	PerspectiveCamera,
	WebGLRenderer,
	Mesh,
	ShaderMaterial,
	MeshBasicMaterial,
	MeshPhongMaterial,
	PlaneBufferGeometry,
	AmbientLight,
	DirectionalLight,
	PointLight,
	TextureLoader,
	MirroredRepeatWrapping,
	RepeatWrapping,
	Vector2,
	Vector3,
	Color,
	PCFSoftShadowMap,
	SphereGeometry,
	Fog,
	Object3D
} from 'three'

const loader = new TextureLoader()

const app = {
	init() {
		this.scene = new Scene()
		this.scene.fog = new Fog(0x7d42a5, 0, 60)
		this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
		this.renderer = new WebGLRenderer({ antialias: 1 })
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
		this.renderer.shadowMap.enabled = true
		this.renderer.setClearColor(0xe29b81, 1);
		this.uniforms.lightColor.value = new Color(0xf99543)

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

			// Setup scene objects
			this.process()
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

	process() {
		// While pressing, rotate camera
		let lastPosition = { x: 0, y: 0 },
			updatePosition = event => {
				let delta = {
					x: lastPosition.x - event.clientX,
					y: lastPosition.y - event.clientY
				}

				// Update last position
				lastPosition = { x: event.clientX, y: event.clientY }

				// Update horizontal rotation
				this.focus.rotateOnWorldAxis(new Vector3(0, 0, 1), delta.x * 0.01 * this.uniforms.delta.value)

				// Update vertical rotation
				this.focus.rotateOnAxis(new Vector3(1, 0, 0), delta.y * 0.01 * this.uniforms.delta.value)
			}

		// Enable controls when mouse down
		document.addEventListener('mousedown', e => {
			// Update last position
			lastPosition = { x: event.clientX, y: event.clientY }

			document.addEventListener('mousemove', updatePosition)
		})

		// Disable controls when mouse up
		document.addEventListener('mouseup', e => {
			document.removeEventListener('mousemove', updatePosition)
		})

		// Zoom in/out when scroll
		document.addEventListener('mousewheel', e => {
			if (e.deltaX != 0) {
				let updatedPosition = this.camera.position.y + e.deltaX * .5 * this.uniforms.delta.value

				if (updatedPosition <= -5 && updatedPosition >= -10)
					this.camera.position.y = updatedPosition
			}

			e.preventDefault()
		})
	},

	run() {
		// this.uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib['lights'], this.uniforms])
		this.uniforms = Object.assign({}, THREE.UniformsLib['lights'], this.uniforms)

		this.uniforms.texture.value.wrapS = MirroredRepeatWrapping
		this.uniforms.texture.value.wrapT = MirroredRepeatWrapping
		this.uniforms.ripples.value.wrapS = RepeatWrapping
		this.uniforms.ripples.value.wrapT = RepeatWrapping

		// Directional light
		this.light = new PointLight(0xf99543, 1.5, 100)
		this.light.position.z = 25
		this.light.position.y = -30
		// this.light.castShadow = true
		// this.light.shadow.bias = 0.00001
		// this.light.shadow.mapSize.width = 1024
		// this.light.shadow.mapSize.height = 1024
		this.scene.add(this.light)

		// Ambient light
		this.ambientLight = new AmbientLight(0x412563, 1.4)
		this.scene.add(this.ambientLight)

		// Camera
		this.focus = new Object3D()
		this.focus.add(this.camera)
		this.focus.position.set(0, 0, 1)
		this.focus.rotation.z = 2.0
		this.camera.position.set(0, -7, 2)
		this.camera.lookAt(this.focus.position)
		
		// Sky
		this.sky = new Mesh(new SphereGeometry(80, 32, 32), new MeshPhongMaterial({
			map: loader.load('./textures/Skybox.jpg'),
			side: THREE.BackSide,
			shininess: 100,
			fog: false
		}))
		this.sky.position.z = 20
		this.sky.rotation.x = -.2

		let geometry = new PlaneBufferGeometry(250, 250, 10, 10),
			material = new ShaderMaterial({
				uniforms: this.uniforms,
				vertexShader: waterVertex,
				fragmentShader: waterFragment,
				fog: false,
				lights: true,
				receiveShadows: true,
				wireframe: false,
				transparent: true
			})

		// Water
		this.water = new Mesh(geometry, material)

		// Add objects
		this.scene.add(this.water)
		this.scene.add(this.focus)
		this.scene.add(this.sky)

		this.water.material.needsUpdate = true
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
		lightColor: {
			type: "c"
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

					object.position.z = .8
					this.island = object
					this.scene.add(object);

					return resolve(object)
				}
			)
		})
	},

	update() {
		this.uniforms.delta.value += 0.001
	},

	draw() {
		this.renderer.render(this.scene, this.camera)
	}
}

app.init()

export default app
