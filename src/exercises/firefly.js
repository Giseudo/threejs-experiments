import Fireflies from '../entities/fireflies'

module.exports = function(scene, renderer, camera) {
	let fireflies = new Fireflies(100, 1000, 500)

	renderer.setClearColor(0x000000)
	camera.position.z = 500
	scene.add(fireflies.object)

	return {
		update: dt => {
			fireflies.update(dt)
		},
		draw: () => {
			fireflies.draw()
		}
	}
}
