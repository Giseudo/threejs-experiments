varying vec2 vUv;
uniform float speed;
uniform float delta;

void main() {
	vUv = uv;
	vec3 vertex = position;

	vertex.z += sin(delta * speed * 5.0 + position.x * position.y) * .3;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(vertex, 1.0);
}
