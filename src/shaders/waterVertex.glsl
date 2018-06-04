varying vec3 vWorldPosition;
varying vec2 vUv;
uniform float speed;
uniform float delta;

void main() {
	vUv = uv;
	vec3 vertex = position;

	vertex.z += sin(delta * speed + position.x * position.y * 20.0) * 1.0;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(vertex, 1.0);
}
