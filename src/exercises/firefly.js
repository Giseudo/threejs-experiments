import Fireflies from '../entities/fireflies'

module.exports = function(scene, renderer, camera) {
	let fireflies = new Fireflies(1, 600, .5, 90, 3, 20)

	renderer.setClearColor(0x000000)
	camera.position.set(30, -10, 5)
	camera.rotation.x = 45 / Math.PI
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
