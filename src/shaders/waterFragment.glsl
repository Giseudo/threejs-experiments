varying vec2 vUv;

uniform float delta;
uniform float speed;
uniform sampler2D texture;
uniform sampler2D ripples;
uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;

void main() {
	vec4 distort = texture2D(ripples, vec2(
		(vUv.x * 3.0 + sin(speed / 10.0 * delta)),
		(vUv.y * 3.0 + sin(speed / 10.0 * delta))
	)) * .3;

	gl_FragColor = texture2D(texture, vec2(
		(vUv.x * 50.0 + sin(speed * delta) / 5.0) + distort.g,
		(vUv.y * 50.0 + sin(speed * delta) / 5.0) + distort.r
	));

	gl_FragColor = gl_FragColor * vec4(.9, .6, .3, 1);
	gl_FragColor.a = 1.0;

	#ifdef USE_LOGDEPTHBUF_EXT
		float depth = gl_FragDepthEXT / gl_FragCoord.w;
	#else
		float depth = gl_FragCoord.z / gl_FragCoord.w;
	#endif

	float fogFactor = smoothstep(fogNear, fogFar, depth);

	gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor);
}
