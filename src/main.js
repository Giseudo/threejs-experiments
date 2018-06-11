import Exercise from './exercises/island'

import {
	Scene,
	PerspectiveCamera,
	WebGLRenderer
} from 'three'

const app = {
	delta: 0,

	init() {
		let aspect = window.innerWidth / window.innerHeight

		// Create scene
		this.scene = new Scene()

		// Create renderer
		this.renderer = new WebGLRenderer({ antialias: 1 })

		// Create & setup camera
		this.camera = new PerspectiveCamera(75, aspect, 0.1, 1000)

		// Initialize exercise
		this.exercise = new Exercise(this.scene, this.renderer, this.camera)

		// Resize renderer and append its dom to body
		this.renderer.setSize(window.innerWidth, window.innerHeight)
		document.body.appendChild(this.renderer.domElement)

		// Resize renderer when browser is resized
		window.addEventListener('resize', e => {
			this.renderer.setSize(window.innerWidth, window.innerHeight)
			this.camera.aspect = window.innerWidth / window.innerHeight
			this.camera.updateProjectionMatrix()
		})

		// Setup game loop
		var loop = () => {
			requestAnimationFrame(loop)
			this.update()
			this.draw()
		}

		// Start game loop
		loop()
	},

	update() {
		this.exercise.update(this.delta)
		this.delta = 1 / 60
	},

	draw() {
		this.exercise.draw()
		this.renderer.render(this.scene, this.camera)
	}
}

app.init()

export default app
