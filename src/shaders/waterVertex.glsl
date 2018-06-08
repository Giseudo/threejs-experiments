varying vec2 vUv;
uniform float speed;
uniform float delta;

void main() {
	vUv = uv;
	vec3 vertex = position;

	vertex.z += sin(delta * speed * 2.0 + position.x * position.y) * .5;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(vertex, 1.0);
}
