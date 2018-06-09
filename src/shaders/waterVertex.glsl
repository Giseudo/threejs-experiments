varying vec2 vUv;
varying vec3 vPos;
varying vec3 vNormal;
uniform float speed;
uniform float delta;

void main() {
	vUv = uv;
  // Since the light is in camera coordinates,
  // I'll need the vertex position in camera coords too
  vPos = (modelViewMatrix * vec4(position, 1.0)).xyz;
  // That's NOT exacly how you should transform your
  // normals but this will work fine, since my model
  // matrix is pretty basic
  vNormal = (modelViewMatrix * vec4(normal, 0.0)).xyz;

	// Wave
	vec3 vertex = position;
	vertex.z += sin(delta * speed * 2.0 + position.x * position.y) * .8;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(vertex, 1.0);
}
