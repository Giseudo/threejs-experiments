varying vec2 vUv;

uniform float delta;
uniform float speed;
uniform sampler2D texture;

void main() {
	gl_FragColor = texture2D(texture, vec2(
		vUv.x + sin(speed * delta) / 5.0,
		vUv.y + sin(speed * delta) / 5.0
	));
}
