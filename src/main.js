import 'three/examples/js/controls/OrbitControls'
import { waterVertex, waterFragment } from './shaders'
import {
	Scene,
	PerspectiveCamera,
	WebGLRenderer,
	Mesh,
	ShaderMaterial,
	PlaneBufferGeometry,
	MeshPhongMaterial,
	SphereGeometry,
	AmbientLight,
	DirectionalLight,
	TextureLoader,
	MirroredRepeatWrapping,
	RepeatWrapping
} from 'three'

const app = {
	init() {
		this.scene = new Scene()
		this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
		this.renderer = new WebGLRenderer({ antialias: 2 })

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

		// Start game loop
		var loop = () => {
			requestAnimationFrame(loop)
			this.update()
			this.draw()
		}

		loop()
	},

	run() {
		let geometry = new PlaneBufferGeometry(50, 50, 10, 10),
			material = new ShaderMaterial({
				uniforms: this.uniforms,
				vertexShader: waterVertex,
				fragmentShader: waterFragment
			})

		this.uniforms.texture.value.wrapS = MirroredRepeatWrapping
		this.uniforms.texture.value.wrapT = MirroredRepeatWrapping
		this.uniforms.ripples.value.wrapS = RepeatWrapping
		this.uniforms.ripples.value.wrapT = RepeatWrapping
		this.uniforms.bump.value.repeat.set(500, 500)

		var ambientLight = new AmbientLight(0xffffff, .1)
		var geometrySphere = new SphereGeometry(8, 9, 9)
		var materialSphere = new MeshPhongMaterial({
			color: 0xffffff,
			normalMap: this.uniforms.bump.value,
			specularMap: this.uniforms.texture.value,
			specular: 0xffff00,
			shininess: 20
		})

		this.light = new DirectionalLight(0xffffff, .8)
		this.light.position.x = 50
		this.light.position.z = 100

		this.sphere = new Mesh(geometrySphere, materialSphere)
		this.sphere.position.z = -4
		this.scene.add(this.light)
		this.scene.add(this.sphere)
		this.scene.add(ambientLight)

		// Change background
		this.renderer.setClearColor(0xf9f7ec, 1);

		// Camera
		this.camera.position.z = 5
		this.camera.rotation.x = 45
		this.camera.position.y = -20
		
		// Sphere
		this.water = new Mesh(geometry, material)

		// Add objects
		this.scene.add(this.water)
	},

	uniforms: {
		texture: {
			type: 't',
			value: new TextureLoader().load('./textures/ToonWater01.png')
		},
		bump: {
			type: 't',
			value: new TextureLoader().load('./textures/PaperNormal01.jpg')
		},
		ripples: {
			type: 't',
			value: new TextureLoader().load('./textures/RipplesNormal01.jpg')
		},
		delta: {
			type: 'f',
			value: 0.0
		},
		speed: {
			type: 'f',
			value: 7.0
		}
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
