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
	MirroredRepeatWrapping
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
		this.uniforms.texture.value.repeat.set(5, 5)

		var ambientLight = new AmbientLight(0xffff00, .2)
		var geometrySphere = new SphereGeometry(3, 32, 32)
		var materialSphere = new MeshPhongMaterial({ color: 0x0ffff0, shininess: 300 })

		this.light = new DirectionalLight(0x00ffff, 1)
		this.light.position.x = 30
		this.light.position.z = 20

		this.sphere = new Mesh(geometrySphere, materialSphere)
		this.scene.add(this.light)
		this.scene.add(this.sphere)
		this.scene.add(ambientLight)

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
