varying vec2 vUv;
varying vec3 vPos;
varying vec3 vNormal;

uniform float delta;
uniform float speed;
uniform sampler2D texture;
uniform sampler2D ripples;
uniform sampler2D specularTex;

struct PointLight {
  vec3 position;
  vec3 color;
	float distance;
};
uniform PointLight pointLights[ NUM_POINT_LIGHTS ];

void main() {
	// Distortion
	vec4 distort = texture2D(ripples, vec2(
		(vUv.x + (speed * .05) * delta),
		(vUv.y + (speed * .05) * delta)
	)) * .3;

	vec4 color = texture2D(texture, vec2(
		(vUv.x * 20.0 + sin(speed * delta) / 5.0) + distort.g,
		(vUv.y * 20.0 + sin(speed * delta) / 5.0) + distort.r
	));

	vec4 specularDistort = texture2D(specularTex, vec2(
		(vUv.x * 20.0 + sin(speed * delta) / 5.0) + distort.g,
		(vUv.y * 20.0 + sin(speed * delta) / 5.0) + distort.r
	));

	// Ambient light
	vec3 ambient = vec3(0.0, 0.5, 0.5) * 0.3;

	// Diffuse light
	vec3 diffuse = vec3(0.0, 0.0, 0.0);

	// Specular light
	vec3 viewDir = normalize(cameraPosition - vPos);
	vec3 specular = vec3(0.0, 0.0, 0.0);

	for(int l = 0; l < NUM_POINT_LIGHTS; l++) {
		vec3 norm = normalize(vNormal);
		vec3 lightDir = normalize(pointLights[l].position - vPos);
		float diff = max(dot(norm, lightDir), 0.0);

		vec3 reflectDir = reflect(-lightDir, norm);
		float spec = pow(max(dot(viewDir, reflectDir), 0.0), 8.0);

		diffuse = 0.3 * diff * pointLights[l].color;

		specular = 1.5 * spec * pointLights[l].color * specularDistort.rgb;
	}

	gl_FragColor = vec4(color.rgb * (ambient + diffuse + specular), 1.0);
	gl_FragColor.a = .7;
}
