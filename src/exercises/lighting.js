import {
	Color,
	Mesh,
	MeshPhongMaterial,
	MeshBasicMaterial,
	ShaderMaterial,
	BoxGeometry,
	PointLight
} from 'three'
import { lightingVertex, lightingFragment } from '../shaders'

module.exports = function(scene, renderer, camera) {
	let light = new PointLight(0xffffff, 1, 10)
	let cube = new Mesh(
		new BoxGeometry(2, 2, 2),
		new ShaderMaterial({
			vertexShader: lightingVertex,
			fragmentShader: lightingFragment,
			uniforms: THREE.UniformsLib['lights'],
			lights: true
		})
	)

	// Setup light
	light.position.z = 3
	light.position.y = 1

	// Setup camera
	camera.position.z = 5

	// Setup renderer
	scene.background = new Color(0x444444)

	// Add objects
	scene.add(cube)
	scene.add(light)

	return {
		update: dt => {
			cube.rotation.x += 0.01
			cube.rotation.y += 0.01
		},
		draw: () => {
			//
		}
	}
}
