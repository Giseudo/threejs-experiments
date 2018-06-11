varying vec3 vPos;
varying vec3 vNormal;

struct PointLight {
  vec3 position;
  vec3 color;
};

uniform PointLight pointLights[NUM_POINT_LIGHTS];

void main() {
	// Object color
	vec3 color = vec3(1.0, 1.0, 1.0);

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
		float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);

		diffuse = diff * pointLights[l].color;
		specular = 10.0 * spec * pointLights[l].color;
	}

	gl_FragColor = vec4(color * (ambient + diffuse + specular), 1.0);
}
