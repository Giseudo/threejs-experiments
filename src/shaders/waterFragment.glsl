varying vec2 vUv;
varying vec3 vPos;
varying vec3 vNormal;

uniform float delta;
uniform float speed;
uniform sampler2D texture;
uniform sampler2D ripples;

struct PointLight {
  vec3 position;
  vec3 color;
	float distance;
};
uniform PointLight pointLights[ NUM_POINT_LIGHTS ];

void main() {
	// Distortion
	vec4 distort = texture2D(ripples, vec2(
		(vUv.x * 3.0 + sin(speed / 10.0 * delta)),
		(vUv.y * 3.0 + sin(speed / 10.0 * delta))
	)) * .3;

	vec4 diffuse = texture2D(texture, vec2(
		(vUv.x * 25.0 + sin(speed * delta) / 5.0) + distort.g,
		(vUv.y * 25.0 + sin(speed * delta) / 5.0) + distort.r
	));

	// Light
	vec4 addedLights = vec4(0.1, 0.1, 0.1, 1.0);

	for(int l = 0; l < NUM_POINT_LIGHTS; l++) {
      vec3 lightDirection = normalize(vPos
                            - pointLights[l].position);
      addedLights.rgb += clamp(dot(-lightDirection,
                               vNormal), 0.0, 1.0)
                         * pointLights[l].color
                         * 1.0;
	}

	gl_FragColor = diffuse * addedLights;
	gl_FragColor.a = .9;
}
