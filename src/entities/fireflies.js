import {
	Geometry,
	PointsMaterial,
	Points,
	Vertex,
	Vector3,
	AdditiveBlending,
	TextureLoader
} from 'three'
import { lightingVertex, lightingFragment } from '../shaders'

const loader = new TextureLoader()
const black = new THREE.Color(0x000000)

export default class Fireflies {
	constructor(size = 3, count = 30, speed = 2, width = 100, height = 50, distance = 50) {
		let pMaterial = new PointsMaterial({
				color: 0xFFFFFF,
				size: size,
				map: loader.load('./textures/FireflyParticle01.png'),
				blending: AdditiveBlending,
				transparent: true,
				wireframe: true,
				vertexColors: THREE.VertexColors
			})

		this.particles = new Geometry()
		this.timer = 0

		for (let p = 0; p < count; p++) {
			let pX = Math.random() * width - height,
				pY = Math.random() * width - height,
				pZ = Math.random() * (height - height * .2) + height * .2,
				particle = new Vector3(pX, pY, pZ)

			particle.direction = new Vector3(1, 1, 1)
			particle.direction.applyEuler(new THREE.Euler(
				Math.random() * (1 - -1) + -1,
				Math.random() * (1 - -1) + -1,
				Math.random() * (1 - -1) + -1
			))
			particle.start = new Vector3(pX, pY, pZ)
			particle.height = Math.random() * (3 - 1) + 1
			particle.speed = Math.random() * (speed - speed * .1) + speed * .1

			this.particles.colors.push(new THREE.Color(0xFFFFFF))
			this.particles.vertices.push(particle)
		}

		this.distance = distance
		this.object = new Points(this.particles, pMaterial)
	}

	draw() {
	
	}

	update(dt) {
		this.timer += dt

		this.particles.vertices.forEach((particle, index) => {
			particle.add(new Vector3(
				(particle.direction.x + Math.sin(this.timer * particle.speed * Math.PI)) * particle.speed * dt,
				(particle.direction.y + Math.sin(this.timer * particle.speed * Math.PI)) * particle.speed * dt,
				(particle.height * Math.cos(this.timer * particle.speed * Math.PI)) * particle.speed * dt
			))

			this.particles.colors[index].lerp(black, this.timer)

			if (particle.distanceTo(particle.start) > this.distance)
				particle.set(
					particle.start.x,
					particle.start.y,
					particle.start.z
				)
		})

		this.particles.verticesNeedUpdate = true;
	}
}
