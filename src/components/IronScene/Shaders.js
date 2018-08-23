class Shaders {
    static ringPulse = () => {
        const shaders = {};

        shaders.vertexShader = `
		attribute float alpha;
		varying float vAlpha;
	
		void main() {
        	vAlpha = alpha;
			vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
			gl_Position = projectionMatrix * mvPosition;
		}
	`;
        shaders.fragmentShader = `
		uniform vec3 color;
    	varying float vAlpha;
 		uniform vec3 fogColor;
		uniform float fogNear;
		uniform float fogFar;
		void main() {
			gl_FragColor = vec4( color, 1.0 );
			gl_FragColor = vec4(  color, vAlpha );
			
			#ifdef USE_FOG
				#ifdef USE_LOGDEPTHBUF_EXT
					float depth = gl_FragDepthEXT / gl_FragCoord.w;
				#else
					float depth = gl_FragCoord.z / gl_FragCoord.w;
				#endif
				float fogFactor = smoothstep( fogNear, fogFar, depth );
				gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
			#endif
		}`;


        return shaders;
    };
    static Tour = () => {
        const shaders = {};

        shaders.vertexShader = `
		uniform vec3 viewVector;
        varying float intensity;
        void main() {
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
            vec3 actual_normal = vec3(modelMatrix * vec4(normal, 0.0));
            intensity = pow( dot(normalize(viewVector), actual_normal), 6.0 );
	    }`;
        shaders.fragmentShader = `
        varying float intensity;
        void main() {
	        vec3 glow = vec3(0.2, 0.8, 1) * intensity;
            gl_FragColor = vec4( glow, 0.5 );
        }`;


        return shaders;
    }

}

export default Shaders;
