varying vec2 vUv;

uniform float delta;
uniform float speed;
uniform sampler2D texture;
uniform sampler2D ripples;

void main() {
	vec4 distort = texture2D(ripples, vec2(
		(vUv.x * 3.0 + sin(speed / 5.0 * delta)),
		(vUv.y * 3.0 + sin(speed / 5.0 * delta))
	)) * .3;

	// vec4 distort = texture2D(ripples, vUv * 3.0) * .3;

	gl_FragColor = texture2D(texture, vec2(
		(vUv.x * 10.0 + sin(speed * delta) / 5.0) + distort.g,
		(vUv.y * 10.0 + sin(speed * delta) / 5.0) + distort.r
	));
}
