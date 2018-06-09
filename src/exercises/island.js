import 'three/examples/js/loaders/OBJLoader'
import { waterVertex, waterFragment } from '../shaders'
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

module.exports = function(scene, renderer, camera) {
	this.uniforms = {
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
	}

	this.init = () => {
		this.uniforms = Object.assign({}, THREE.UniformsLib['lights'], this.uniforms)

		this.uniforms.texture.value.wrapS = MirroredRepeatWrapping
		this.uniforms.texture.value.wrapT = MirroredRepeatWrapping
		this.uniforms.ripples.value.wrapS = RepeatWrapping
		this.uniforms.ripples.value.wrapT = RepeatWrapping

		// Directional light
		this.light = new PointLight(0xf99543, 1.5, 100)
		this.light.position.z = 25
		this.light.position.y = -30
		scene.add(this.light)

		// Ambient light
		this.ambientLight = new AmbientLight(0x412563, 1.4)
		scene.add(this.ambientLight)

		// Camera
		this.focus = new Object3D()
		this.focus.add(camera)
		this.focus.position.set(0, 0, 1)
		this.focus.rotation.z = 2.0
		camera.position.set(0, -7, 2)
		camera.lookAt(this.focus.position)
		
		// Sky
		this.sky = new Mesh(new SphereGeometry(70, 16, 16), new MeshPhongMaterial({
			map: loader.load('./textures/Skybox.jpg'),
			side: THREE.BackSide,
			shininess: 100,
			fog: false
		}))
		this.sky.position.z = 20
		this.sky.rotation.x = -.2

		let geometry = new PlaneBufferGeometry(80, 80, 15, 15),
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
		scene.add(this.water)
		scene.add(this.focus)
		scene.add(this.sky)

		this.water.material.needsUpdate = true
	}

	// Process user controls
	this.process = () => {
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
				let updatedPosition = camera.position.y + e.deltaX * .5 * this.uniforms.delta.value

				if (updatedPosition <= -5 && updatedPosition >= -10)
					camera.position.y = updatedPosition
			}

			e.preventDefault()
		})
	}

	this.loadIsland = () => {
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

					return resolve(object)
				}
			)
		})
	}

	this.process()

	// Load island model
	this.loadIsland()
		.then(island => {
			island.position.z = .8
			scene.add(island);

			this.init()
		})

	return {
		update: dt => {
			this.uniforms.delta.value = dt
		},

		draw: () => {
		
		}
	}
}
