import 'three/examples/js/loaders/OBJLoader'
import 'three/examples/js/loaders/FBXLoader'
import { waterVertex, waterFragment, lightingFragment } from '../shaders'
import {
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
	Object3D
} from 'three'
import Fireflies from '../entities/fireflies'

const loader = new TextureLoader()
const cloneFbx = (fbx) => {
	const clone = fbx.clone(true)
	clone.animations = fbx.animations
	clone.skeleton = new THREE.Skeleton()

	const skinnedMeshes = {}

	fbx.traverse(node => {
		if (node.isSkinnedMesh) {
			skinnedMeshes[node.name] = node
		}
	})

	const cloneBones = {}
	const cloneSkinnedMeshes = {}

	clone.traverse(node => {
		if (node.isBone) {
			cloneBones[node.name] = node
		}

		if (node.isSkinnedMesh) {
			cloneSkinnedMeshes[node.name] = node
		}
	})

	for (let name in skinnedMeshes) {
		const skinnedMesh = skinnedMeshes[name]
		const skeleton = skinnedMesh.skeleton
		const cloneSkinnedMesh = cloneSkinnedMeshes[name]

		const orderedCloneBones = []

		for (let i=0; i<skeleton.bones.length; i++) {
			const cloneBone = cloneBones[skeleton.bones[i].name]
			orderedCloneBones.push(cloneBone)
		}

		cloneSkinnedMesh.bind(
			new THREE.Skeleton(orderedCloneBones, skeleton.boneInverses),
			cloneSkinnedMesh.matrixWorld)

		// For animation to work correctly:
		clone.skeleton.bones.push(cloneSkinnedMesh)
		clone.skeleton.bones.push(...orderedCloneBones)
	}

	return clone
}


module.exports = function(scene, renderer, camera) {
	this.delta = 1 / 60
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
			value: loader.load('./textures/RipplesNormal02.jpg')
		},
		specularTex: {
			type: 't',
			value: loader.load('./textures/WaterSpecular01.png')
		},
		delta: {
			type: 'f',
			value: 0.0
		},
		speed: {
			type: 'f',
			value: .2
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
		this.uniforms.specularTex.value.wrapS = MirroredRepeatWrapping
		this.uniforms.specularTex.value.wrapT = MirroredRepeatWrapping

		// Sun light
		this.light = new PointLight(0xf99143, 2.0, 100)
		this.light.position.z = 10
		this.light.position.y = -60
		scene.add(this.light)

		// Ambient light
		this.ambientLight = new AmbientLight(0x9e42f4, .6)
		scene.add(this.ambientLight)

		// Camera
		this.focus = new Object3D()
		this.focus.add(camera)
		this.focus.position.set(0, 0, 1)
		this.focus.rotation.z = 2.3
		camera.position.set(0, -7, 2)
		camera.lookAt(this.focus.position)

		// Fireflies
		this.fireflies = new Fireflies(.2, 40, .2, 5, 3, 5)
		this.fireflies.object.position.set(-1, -1, 1)
		scene.add(this.fireflies.object)
	
		// Sky
		this.sky = new Mesh(new SphereGeometry(70, 16, 16), new MeshPhongMaterial({
			map: loader.load('./textures/Skybox.jpg'),
			side: THREE.BackSide,
			shininess: 200,
			fog: false,
			wireframe: false
		}))
		this.sky.position.z = 10
		this.sky.rotation.x = 0.0

		let geometry = new PlaneBufferGeometry(140, 140, 30, 30),
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
				this.focus.rotateOnWorldAxis(new Vector3(0, 0, 1), delta.x * 0.15 * this.delta)

				// Update vertical rotation
				this.focus.rotateOnAxis(new Vector3(1, 0, 0), delta.y * 0.15 * this.delta)
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
			if (e.deltaY != 0) {
				let updatedPosition = camera.position.y + e.deltaY * .5 * this.delta

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

	this.loadCloud = () => {
		var objLoader = new THREE.OBJLoader();

		return new Promise((resolve, reject) => {
			objLoader.load('./models/Cloud.obj',
			object => {
				return resolve(object)
			})
		})
	}

	this.loadSeagull = () => {
		var fbxLoader = new THREE.FBXLoader();

		return new Promise((resolve, reject) => {
			fbxLoader.load('./models/Seagull.fbx',
			object => {
				return resolve(object)
			})
		})
	}

	this.process()

	// Load island model
	this.loadIsland()
		.then(island => {
			island.position.z = .8
			scene.add(island);

			this.init()

			this.loadCloud()
				.then(cloud => {
					let clouds = new Object3D(),
						max = 30,
						radius = 40,
						angle = 0,
						step = (2 * Math.PI) / max

					for (let i = 1; i < max; i++) {
						let clone = cloud.clone(),
							scale = Math.random() * (6 - 1) + 1

						clone.position.set(
							radius * Math.sin(angle),
							radius * Math.cos(angle),
							Math.random() * (40 - 5) + 5
						)

						clone.lookAt(new Vector3(this.focus.position.x, this.focus.position.y, this.focus.position.z))
						clone.scale.set(scale, scale, scale)
						clone.rotation.x = 0
						clone.rotation.y = 0

						// Add to clouds parent and scene
						clouds.add(clone)

						angle += step
					}

					this.clouds = clouds
					scene.add(this.clouds)
				})

			this.loadSeagull()
				.then(object => {
					let seagulls = new Object3D(),
						max = 3,
						height = 1,
						distance = 2

						// Change material color
						object.traverse(node => {
							if (node.name == 'SeagullMesh')
								node.material.color = new THREE.Color(0x000000)
						})

					for (let i = 0; i < max; i++) {
						let seagull = cloneFbx(object),
							clip = THREE.AnimationClip.findByName(seagull.animations, 'Seagull|Idle')

						seagull.mixer = new THREE.AnimationMixer(seagull)

						// Set position
						seagull.position.x = i * distance
						seagull.position.z = i % 2 == 0 ? height : height * -1

						// Play animation
						let action = seagull.mixer.clipAction(clip)
						action.time = i * 0.1
						action.play()

						// Add to parent
						seagulls.add(seagull)
					}

					this.seagulls = seagulls
					this.seagulls.position.set(-5, -40, 10)
					scene.add(this.seagulls)
				})
		})

	return {
		update: dt => {
			this.uniforms.delta.value += dt

			if (this.seagulls)
				this.seagulls.children.forEach(seagull => {
					seagull.mixer.update(dt * 0.8)
				})

			if (this.clouds)
				this.clouds.rotation.z += dt * .01

			if (this.fireflies)
				this.fireflies.update(dt)
		},

		draw: () => {
			// this.fireflies.draw()
		}
	}
}
