import React, { Component } from 'react';
import * as THREE from 'three';
import * as Shader from './Shaders'

const style = {
    width: '100%',
    height: '100%',
    position:'absolute',
    top:0,
    right:0,
    left:0,
    bottom:0,
    zIndex: '-1'
};

class Scene extends Component {
  constructor(props) {
    super(props);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.animate = this.animate.bind(this);
  }

  componentDidMount() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const startTime = Date.now();
    const renderer = new THREE.WebGLRenderer();
    camera.position.z = 1;
    renderer.setSize(width, height);

    const geometry = new THREE.PlaneBufferGeometry(2, 2);
    const uniforms = {
      iGlobalTime: { type: "f", value: 1.0 },
      iResolution: { type: "v1", value: new THREE.Vector2(), }
    };

    const material = new THREE.ShaderMaterial( {
      uniforms: uniforms,
      vertexShader: Shader.vertexShader,
      fragmentShader: Shader.fragmentShader
    });
 
    const mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    this.onWindowResize = ( event ) => {
      uniforms.iResolution.value.x = window.innerWidth;
      uniforms.iResolution.value.y = window.innerHeight;
      renderer.setSize( window.innerWidth, window.innerHeight );
    }
    this.onWindowResize();
    window.addEventListener( 'resize', this.onWindowResize, false );

    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.material = material;
    this.mesh = mesh;
    this.startTime = startTime;
    this.uniforms = uniforms;
    
    this.mount.appendChild(this.renderer.domElement);
    this.start();
  }

  componentWillUnmount() {
    this.stop();
    this.mount.removeChild(this.renderer.domElement);
  }

  start() {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate);
    }
  }

  stop() {
    cancelAnimationFrame(this.frameId);
  }

  animate() {
    const currentTime = Date.now();
    this.uniforms.iGlobalTime.value = (currentTime - this.startTime) * 0.001;

    this.frameId = window.requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  }

  render() {
    return (
      <div
        style={style}
        ref={(mount) => { this.mount = mount }}
      />
    )
  }

}

export default Scene;