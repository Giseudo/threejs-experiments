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

	for(int l = 0; l < NUM_POINT_LIGHTS; l++) {
		vec3 norm = normalize(vNormal);
		vec3 lightDir = normalize(pointLights[l].position - vPos);
		float diff = max(dot(norm, lightDir), 0.0);

		diffuse = diff * pointLights[l].color;
	}

	gl_FragColor = vec4(color * (ambient + diffuse), 1.0);
}
