import React, {Component} from 'react';
import * as THREE from 'three';
import {TweenMax, Power3} from 'gsap';
import _ForEach from 'lodash/forEach'

import {toRAD, shadeBlend, d3threeD} from './helpers';
import Shaders from './Shaders';
import * as Shapes from './Shapes';

import bg_universe from '../../static/img/bg_universe.jpg';
import ring_explosion from '../../static/img/bubble.jpg';
import ironManAudio from '../../static/audio/ironman.mp3';

const style = {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    zIndex: '-1'
};

class IronScene extends Component {
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
        scene.fog = new THREE.Fog(0, 0, 400);

        const camera = new THREE.PerspectiveCamera(45, width / height, 1, 2e3);
        camera.position.x = 0;
        camera.position.y = 0;
        camera.position.z = 250;
        const renderer = new THREE.WebGLRenderer({antialias: true, alpha: false});
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;


        // colors
        const colorBase = new THREE.Color('#33CCFF');
        const colorBase75 = new THREE.Color(shadeBlend(.75, '#33CCFF', '#000000'));
        const colorBase85 = new THREE.Color(shadeBlend(.85, '#33CCFF', '#000000'));
        // const colorHighlight = new THREE.Color('#FF1313');

        // objects group
        const univerceObject = new THREE.Group();
        const rotationObject = new THREE.Group();
        const ringsObject = new THREE.Group();
        const spikesObject = new THREE.Group();
        const ringPulseObject = new THREE.Group();
        const figureMain = new THREE.Group();
        const gyroscopeObject = new THREE.Object3D();

        const createGroup = () => {
            scene.add(univerceObject);
            scene.add(rotationObject);
            scene.add(gyroscopeObject);
            scene.add(figureMain);
        };
        createGroup();

        const createLight = () => {
            const lightShield1 = new THREE.PointLight(colorBase, 1.25, 400, 2);
            lightShield1.position.x = -50;
            lightShield1.position.y = 150;
            lightShield1.position.z = 75;
            lightShield1.name = "lightShield1";
            scene.add(lightShield1);
            const lightShield2 = new THREE.PointLight(colorBase, 1.25, 400, 2);
            lightShield2.position.x = 100;
            lightShield2.position.y = 50;
            lightShield2.position.z = 50;
            lightShield2.name = "lightShield2";
            scene.add(lightShield2);
            const lightShield3 = new THREE.PointLight(colorBase, 1.25, 400, 2);
            lightShield3.position.x = 0;
            lightShield3.position.y = -300;
            lightShield3.position.z = 50;
            lightShield3.name = "lightShield3";
            scene.add(lightShield3);
        };
        createLight();

        const createUniverse = () => {
            const TextureLoader = new THREE.TextureLoader();
            const universeBgTexture = TextureLoader.load(bg_universe);
            universeBgTexture.anisotropy = 16;
            const universeBgGeometry = new THREE.PlaneGeometry(1500, 750, 1, 1);
            const universeBgMaterial = new THREE.MeshBasicMaterial({
                map: universeBgTexture,
                blending: THREE.AdditiveBlending,
                color: colorBase,
                transparent: true,
                opacity: 1,
                fog: false,
                side: THREE.DoubleSide,
                depthWrite: false,
                depthTest: false
            });

            const universeBgMesh = new THREE.Mesh(universeBgGeometry, universeBgMaterial);
            universeBgMesh.position.z = -400;
            universeBgMesh.name = "universeBgMesh";
            univerceObject.add(universeBgMesh);
        };
        createUniverse();

        const createRings = () => {
            ;
            scene.add(ringsObject);
            const ringsOuterGeometry = new THREE.RingGeometry(200, 198, 128);
            const ringsInnerGeometry = new THREE.RingGeometry(100, 98, 128);
            const ringsOuterMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color('#33CCFF'),
                transparent: true,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide,
                fog: true,
                depthWrite: false
            });
            const ringsInnerMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color('#33CCFF'),
                transparent: true,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide,
                opacity: 0.2,
                fog: true,
                depthWrite: false
            });

            const ringsOuterMesh = new THREE.Mesh(ringsOuterGeometry, ringsOuterMaterial);
            ringsOuterMesh.rotation.x = 90 * toRAD;
            const ringsOuterMeshClone = ringsOuterMesh.clone();

            ringsOuterMesh.position.y = 100;
            ringsOuterMeshClone.position.y = -100;
            ringsObject.add(ringsOuterMesh);
            ringsObject.add(ringsOuterMeshClone);

            const ringsInnerMesh = new THREE.Mesh(ringsInnerGeometry, ringsInnerMaterial);
            ringsInnerMesh.rotation.x = 90 * toRAD;
            const ringsInnerMeshClone = ringsInnerMesh.clone();

            ringsInnerMesh.position.y = 90;
            ringsInnerMeshClone.position.y = -90;
            ringsObject.add(ringsInnerMesh);
            ringsObject.add(ringsInnerMeshClone);
        };
        createRings();

        const createSpikes = () => {
            spikesObject.name = "spikesObject";
            rotationObject.add(spikesObject);

            const spikesVerticesArray = [];
            const spikeRadius = 100;

            const spikesGeometry = new THREE.SphereGeometry(spikeRadius, 8, 4);
            spikesGeometry.mergeVertices();

            for (let i = 0; i < spikesGeometry.vertices.length; i++) {
                const vector = new THREE.Vector3();
                vector.x = spikesGeometry.vertices[i].x;
                vector.y = spikesGeometry.vertices[i].y;
                vector.z = spikesGeometry.vertices[i].z;
                vector.normalize();
                vector.multiplyScalar(spikeRadius);

                const vectorClone = vector.clone();
                vectorClone.multiplyScalar(1.03);
                spikesVerticesArray.push(vector);
                spikesVerticesArray.push(vectorClone)
            }

            const angleStep = 2 * Math.PI / 400;

            for (let i = 0; i < 400; i++) {
                const vector = new THREE.Vector3();
                vector.x = spikeRadius * Math.cos(angleStep * i);
                vector.y = 0;
                vector.z = spikeRadius * Math.sin(angleStep * i);
                vector.normalize();
                vector.multiplyScalar(spikeRadius);

                const vectorClone = vector.clone();
                i % 10 === 1 ? vectorClone.multiplyScalar(1.02) : vectorClone.multiplyScalar(1.01);
                spikesVerticesArray.push(vector);
                spikesVerticesArray.push(vectorClone);
            }

            const n = new Float32Array(3 * spikesVerticesArray.length);
            for (let i = 0; i < spikesVerticesArray.length; i++) {
                n[3 * i] = spikesVerticesArray[i].x;
                n[3 * i + 1] = spikesVerticesArray[i].y;
                n[3 * i + 2] = spikesVerticesArray[i].z;
            }

            const spikesMaterial = new THREE.LineBasicMaterial({
                linewidth: 1,
                color: colorBase,
                transparent: true,
                opacity: 0.3,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide,
                fog: true,
                depthWrite: false
            });
            const spikesBufferGeometry = new THREE.BufferGeometry();

            spikesBufferGeometry.addAttribute("position", new THREE.BufferAttribute(n, 3));
            const spikesMesh = new THREE.LineSegments(spikesBufferGeometry, spikesMaterial);

            spikesObject.add(spikesMesh);
        };
        createSpikes();

        const createRingPulse = () => {
            ringPulseObject.name = "ringPulse";

            const ringPulseRadius = 98;
            const ringPulseTotal = 250;
            const ringExplosionSize = 100;
            const ringPointRadius = 92;
            const ringPointTotal = 250;
            const ringPointAngle = 2 * Math.PI / ringPointTotal;
            const ringPointSize = .5;
            const ringPulseTotalHalf = ringPulseTotal / 2;
            const ringPulseVerticesArray = [];

            for (let i = 0; i < ringPulseTotal; i++) {
                const vector = new THREE.Vector3();
                vector.x = ringPulseRadius * Math.cos(2 * Math.PI / 250 * i);
                vector.y = 0;
                vector.z = ringPulseRadius * Math.sin(2 * Math.PI / 250 * i);
                vector.normalize();
                vector.multiplyScalar(ringPulseRadius);
                ringPulseVerticesArray.push(vector);
            }

            const ringPulseBufferGeometry = new THREE.BufferGeometry();
            const ringPulseShaderUniforms = {
                color: {
                    value: colorBase
                },
                fogColor: {
                    type: "c",
                    value: scene.fog.color
                },
                fogNear: {
                    type: "f",
                    value: scene.fog.near
                },
                fogFar: {
                    type: "f",
                    value: scene.fog.far
                }
            };
            const ringPulseShaderMaterial = new THREE.ShaderMaterial({
                uniforms: ringPulseShaderUniforms,
                vertexShader: Shaders.ringPulse().vertexShader,
                fragmentShader: Shaders.ringPulse().fragmentShader,
                blending: THREE.AdditiveBlending,
                depthTest: false,
                fog: true,
                transparent: true
            });

            const points1 = new Float32Array(3 * ringPulseVerticesArray.length);
            const points2 = new Float32Array(ringPulseVerticesArray.length);
            for (let i = 0; i < ringPulseVerticesArray.length; i++) {
                points1[3 * i] = ringPulseVerticesArray[i].x;
                points1[3 * i + 1] = ringPulseVerticesArray[i].y;
                points1[3 * i + 2] = ringPulseVerticesArray[i].z;
                let j;
                const ringPulseTotalHalfHalf = ringPulseTotalHalf / 2;
                i < ringPulseTotalHalf && i < ringPulseTotalHalfHalf ?
                    j = i / ringPulseTotalHalfHalf * .5 : j = 1 - i / ringPulseTotalHalfHalf * .5;
                points2[i] = j;
            }

            ringPulseBufferGeometry.addAttribute("position", new THREE.BufferAttribute(points1, 3));
            ringPulseBufferGeometry.addAttribute("alpha", new THREE.BufferAttribute(points2, 1));

            const ringPulseMesh = new THREE.LineLoop(ringPulseBufferGeometry, ringPulseShaderMaterial);
            ringPulseObject.add(ringPulseMesh);
            rotationObject.add(ringPulseObject);

            const TextureLoader = new THREE.TextureLoader();
            const ringExplosionTexture = TextureLoader.load(ring_explosion);
            const ringExplosionBufferGeometry = new THREE.PlaneBufferGeometry(ringExplosionSize, ringExplosionSize, 1, 1);
            const ringExplosionMaterial = new THREE.MeshBasicMaterial({
                map: ringExplosionTexture,
                color: colorBase85,
                transparent: true,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide,
                depthWrite: false
            });
            const ringExplosionMesh = new THREE.Mesh(ringExplosionBufferGeometry, ringExplosionMaterial);
            ringExplosionMesh.rotation.x = 90 * toRAD;
            ringExplosionMesh.name = "ringExplosionMesh";
            ringExplosionMesh.visible = false;
            rotationObject.add(ringExplosionMesh);
            const ringPointGeometry = new THREE.Geometry();

            for (let i = 0; i < ringPointTotal; i++) {
                const vector = new THREE.Vector3();
                vector.x = ringPointRadius * Math.cos(ringPointAngle * i);
                vector.y = 0;
                vector.z = ringPointRadius * Math.sin(ringPointAngle * i);
                ringPointGeometry.vertices.push(vector)
            }
            const ringPointMaterial = new THREE.PointsMaterial({
                size: ringPointSize,
                color: colorBase75,
                transparent: true,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide,
                depthWrite: false
            });
            const ringPointMesh = new THREE.Points(ringPointGeometry, ringPointMaterial);
            ringPointMesh.sortParticles = true;
            rotationObject.add(ringPointMesh);
        };
        createRingPulse();

        const createGyroscope = () => {
            const gyroscopeRingSize = 90;
            const gyroscopeGeometry1 = new THREE.RingGeometry(gyroscopeRingSize - 1, gyroscopeRingSize - 2, 128, 1, 0, Math.PI / 2);
            const gyroscopeGeometry2 = new THREE.RingGeometry(gyroscopeRingSize - 2, gyroscopeRingSize - 4, 128, 1, 0, Math.PI / 3);
            const gyroscopeGeometry3 = new THREE.RingGeometry(gyroscopeRingSize - 4, gyroscopeRingSize - 7, 128, 1, 0, Math.PI / 4);
            const gyroscopeGeometry4 = new THREE.RingGeometry(gyroscopeRingSize - 7, gyroscopeRingSize - 10, 128, 1, 0, Math.PI / 5);

            const gyroscopeMaterial = new THREE.MeshBasicMaterial({
                color: colorBase,
                opacity: .1,
                transparent: true,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide,
                fog: true,
                depthWrite: false
            });
            const gyroscopeMesh1 = new THREE.Mesh(gyroscopeGeometry1, gyroscopeMaterial);
            const gyroscopeMesh2 = new THREE.Mesh(gyroscopeGeometry2, gyroscopeMaterial);
            const gyroscopeMesh3 = new THREE.Mesh(gyroscopeGeometry3, gyroscopeMaterial);
            const gyroscopeMesh4 = new THREE.Mesh(gyroscopeGeometry4, gyroscopeMaterial);

            const obj1 = new THREE.Object3D();
            const obj2 = new THREE.Object3D();
            const obj3 = new THREE.Object3D();
            const obj4 = new THREE.Object3D();

            obj1.rotation.z = 30 * toRAD;
            obj2.rotation.z = 120 * toRAD;
            obj3.rotation.z = 210 * toRAD;
            obj4.rotation.z = 320 * toRAD;

            obj1.add(gyroscopeMesh1);
            obj2.add(gyroscopeMesh2);
            obj3.add(gyroscopeMesh3);
            obj4.add(gyroscopeMesh4);

            gyroscopeObject.add(obj1);
            gyroscopeObject.add(obj2);
            gyroscopeObject.add(obj3);
            gyroscopeObject.add(obj4);
        };
        createGyroscope();

        const createFigureMain = () => {
            const d3g = {};
            d3threeD(d3g);

            const makeShape = (name, path, color, opacity, x, y, z) => {
                const shapes = path.toShapes(true);
                const shape = new THREE.ShapeBufferGeometry(shapes[0]);
                shape.center();
                const material = new THREE.MeshBasicMaterial({
                    color: color,
                    opacity: opacity,
                    transparent: true,
                    blending: THREE.AdditiveBlending,
                    side: THREE.DoubleSide,
                    fog: true,
                    depthWrite: false
                });
                const mesh = new THREE.Mesh(shape, material);
                mesh.scale.set(.25, .25, .25);
                mesh.rotation.x = Math.PI;
                mesh.position.x = x;
                mesh.position.y = y;
                mesh.position.z = z;
                mesh.name = name;

                figureMain.add(mesh);
            };

            // const makeReactorGrow = () => {
            //     // const glowMaterial = new THREE.ShaderMaterial({
            //     //     uniforms: {
            //     //         viewVector: {
            //     //             type: "v3",
            //     //             value: camera.position
            //     //         },
            //     //     },
            //     //     vertexShader: Shaders.Tour().vertexShader,
            //     //     fragmentShader: Shaders.Tour().fragmentShader,
            //     //     side: THREE.FrontSide,
            //     //     blending: THREE.AdditiveBlending,
            //     //     transparent: true,
            //     //     opacity:.1
            //     // });
            //     // const glowGeometry = new THREE.TorusGeometry( 11, 3, 16, 100 );
            //     // const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
            //     //
            //     // const glowGeometry1 = new THREE.TorusGeometry( 8, 2, 16, 100 );
            //     // const glowMesh1 = new THREE.Mesh(glowGeometry1, glowMaterial);
            //
            //     const overMaterial = new THREE.MeshBasicMaterial({
            //         color: new THREE.Color('#FFFFFF'),
            //         transparent: false,
            //         side: THREE.DoubleSide,
            //         fog: true,
            //         depthWrite: false
            //     });
            //     const overGeometry = new THREE.CircleGeometry(11, 32);
            //     const overMesh = new THREE.Mesh(overGeometry, overMaterial);
            //
            //     overMesh.position.y = -50;
            //     // glowMesh.position.y = -49.5;
            //     // glowMesh1.position.y = -49.5;
            //     // figureMain.add(glowMesh);
            //     figureMain.add(overMesh);
            //     // figureMain.add(glowMesh1);
            //
            // };

            const main = d3g.transformSVGPath(Shapes.main);
            const mask = d3g.transformSVGPath(Shapes.mask);
            const mask2 = d3g.transformSVGPath(Shapes.mask2);
            const mask22 = d3g.transformSVGPath(Shapes.mask22);
            const maskEyeMain = d3g.transformSVGPath(Shapes.maskEyesMain);
            const maskEyeLeft = d3g.transformSVGPath(Shapes.maskEyeLeft);
            const maskEyeRight = d3g.transformSVGPath(Shapes.maskEyeRight);
            const maskBottom = d3g.transformSVGPath(Shapes.maskBottom);
            const maskBottom2 = d3g.transformSVGPath(Shapes.maskBottom2);
            const trapezoidLeft = d3g.transformSVGPath(Shapes.trapezoidLeft);
            const trapezoidRight = d3g.transformSVGPath(Shapes.trapezoidRight);
            const neckLeft = d3g.transformSVGPath(Shapes.neckLeft);
            const neckRight = d3g.transformSVGPath(Shapes.neckRight);
            const chestTopLeft = d3g.transformSVGPath(Shapes.chestTopLeft);
            const chestTopRight = d3g.transformSVGPath(Shapes.chestTopRight);
            const chestMiddleLeft = d3g.transformSVGPath(Shapes.chestMiddleLeft);
            const chestMiddleRight = d3g.transformSVGPath(Shapes.chestMiddleRight);
            const chestCyrcleLeft = d3g.transformSVGPath(Shapes.chestCyrcleLeft);
            const chestCyrcleRight = d3g.transformSVGPath(Shapes.chestCyrcleRight);
            const shoulderLeft = d3g.transformSVGPath(Shapes.shoulderLeft);
            const shoulderRight = d3g.transformSVGPath(Shapes.shoulderRight);
            const shoulderCyrcleBigLeft = d3g.transformSVGPath(Shapes.shoulderCyrcleBigLeft);
            const shoulderCyrcleBigRight = d3g.transformSVGPath(Shapes.shoulderCyrcleBigRight);
            const shoulderCyrcleSmallLeft = d3g.transformSVGPath(Shapes.shoulderCyrcleSmallLeft);
            const shoulderCyrcleSmallRight = d3g.transformSVGPath(Shapes.shoulderCyrcleSmallRight);
            const reactorBack = d3g.transformSVGPath(Shapes.reactorBack);

            makeShape('main', main, colorBase, .15, 0, 0, 0);
            makeShape('mask', mask, colorBase, .3, 0, 36.7, 0);
            makeShape('mask2', mask2, colorBase, .3, 0, 40.7, 0);
            makeShape('mask22', mask22, colorBase, .3, 0, 13, 0);
            makeShape('maskEyeMain', maskEyeMain, colorBase, .3, 0, 39, 0);
            makeShape('maskEyeLeft', maskEyeLeft, new THREE.Color('#FFFFFF'), 1, -10, 39, 0);
            makeShape('maskEyeRight', maskEyeRight, new THREE.Color('#FFFFFF'), 1, 10, 39, 0);
            makeShape('maskBottom', maskBottom, colorBase, .1, 0, 9.45, 0);
            makeShape('maskBottom2', maskBottom2, colorBase, .1, 0, 4.6, 0);
            makeShape('trapezoidLeft', trapezoidLeft, colorBase, .3, -32.5, 2, 0);
            makeShape('trapezoidRight', trapezoidRight, colorBase, .3, 32.5, 2, 0);
            makeShape('neckLeft', neckLeft, colorBase, .3, -10, -2, 0);
            makeShape('neckRight', neckRight, colorBase, .3, 10, -2, 0);
            makeShape('chestTopLeft', chestTopLeft, colorBase, .3, -18.3, -18, 0);
            makeShape('chestTopRight', chestTopRight, colorBase, .3, 18.3, -18, 0);
            makeShape('chestMiddleLeft', chestMiddleLeft, colorBase, .5, -26.5, -39.2, 0);
            makeShape('chestMiddleRight', chestMiddleRight, colorBase, .5, 26.5, -39.2, 0);
            makeShape('chestCyrcleLeft', chestCyrcleLeft, colorBase, .9, -29.1, -16.9, 0);
            makeShape('chestCyrcleRight', chestCyrcleRight, colorBase, .9, 29.1, -16.9, 0);
            makeShape('reactorBack', reactorBack, colorBase, .3, 0, -50, 0);
            makeShape('shoulderLeft', shoulderLeft, colorBase, .3, -59.8, -18.8, 0);
            makeShape('shoulderRight', shoulderRight, colorBase, .3, 59.8, -18.8, 0);
            makeShape('shoulderCyrcleBigLeft', shoulderCyrcleBigLeft, colorBase, .3, -50, -26.2, 0);
            makeShape('shoulderCyrcleBigRight', shoulderCyrcleBigRight, colorBase, .3, 50, -26.2, 0);
            makeShape('shoulderCyrcleSmallLeft', shoulderCyrcleSmallLeft, colorBase, .3, -50, -26.2, 0);
            makeShape('shoulderCyrcleSmallRight', shoulderCyrcleSmallRight, colorBase, .3, 50, -26.2, 0);

            // makeReactorGrow();

        };
        createFigureMain();


        const animationStart = () => {
            const mainTime = 2;
            const mainDelay = 1;
            const media = new Audio(ironManAudio);

            const MaterialAnimation = (param) => {
                const _time = param.time || 0;
                const _delay = param.delay || 0;
                _ForEach(param.item.children, (item) => {
                    TweenMax.fromTo(item.material, _time, {
                        opacity: 0
                    }, {
                        opacity: item.material.opacity,
                        delay: _delay,
                        ease: Power3.easeOut
                    });
                })
            };
            const MeshAnimation = (param) => {
                const _time = param.time || 0;
                const _delay = param.delay || 0;
                _ForEach(figureMain.children, (item) => {
                    if (item.name === param.name) {
                        if (param.xOffset !== 0 || param.yOffset !== 0) {
                            TweenMax.fromTo(item.position, _time, {
                                x: item.position.x + param.xOffset,
                                y: item.position.y + param.yOffset,
                            }, {
                                x: item.position.x,
                                y: item.position.y,
                                delay: _delay,
                                ease: Power3.easeOut
                            });
                        }
                        if (param.scale !== 0) {
                            TweenMax.fromTo(item.scale, _time, {
                                x: param.scale,
                                y: param.scale,
                                z: param.scale,
                            }, {
                                x: item.scale.x,
                                y: item.scale.y,
                                z: item.scale.z,
                                delay: _delay,
                                ease: Power3.easeOut
                            });
                        }
                        TweenMax.fromTo(item.material, _time, {
                            opacity: 0
                        }, {
                            opacity: item.material.opacity,
                            delay: _delay,
                            ease: Power3.easeOut,
                            onComplete: () => {
                                if (item.name === 'mask2') {
                                    media.play();
                                }
                            }
                        });
                    }
                })
            };

            TweenMax.fromTo(figureMain.position, 6, {
                z: -250
            }, {
                z: 0,
                ease: Power3.easeOut
            });
            TweenMax.fromTo(univerceObject.position, 10, {
                z: -250
            }, {
                z: 0,
                ease: Power3.easeOut
            });

            MaterialAnimation({item: univerceObject, time: 5, delay: 0});

            TweenMax.fromTo(ringsObject.position, 5, {
                z: -250
            }, {
                z: 0,
                ease: Power3.easeOut
            });
            MaterialAnimation({item: ringsObject, time: 5, delay: 0});

            TweenMax.fromTo(rotationObject.rotation, 5, {
                x: 90 * toRAD,
                y: 90 * toRAD,
            }, {
                x: 30 * toRAD,
                y: 30 * toRAD,
                ease: Power3.easeOut,
                onComplete: function () {

                }
            });
            TweenMax.fromTo(gyroscopeObject.rotation, 5, {
                x: 90 * toRAD,
                y: 90 * toRAD,
            }, {
                x: 0,
                y: 0,
                ease: Power3.easeOut,
                onComplete: function () {

                }
            });

            // (name, xOffset, yOffset, scale, time, delay);
            // default scale = 0.25;

            MeshAnimation({
                name: 'mask2',
                xOffset: 0,
                yOffset: 10,
                scale: 0,
                time: mainTime,
                delay: mainDelay + 1
            });
            MeshAnimation({
                name: 'maskEyeMain',
                xOffset: 0,
                yOffset: 10,
                scale: 0,
                time: mainTime,
                delay: mainDelay + 1
            });
            MeshAnimation({
                name: 'mask22',
                xOffset: 0,
                yOffset: -4,
                scale: 0,
                time: mainTime,
                delay: mainDelay + 1
            });
            MeshAnimation({
                name: 'mask',
                xOffset: 0,
                yOffset: 0,
                scale: 0,
                time: mainTime,
                delay: mainDelay + 2
            });
            MeshAnimation({
                name: 'maskEyeLeft',
                xOffset: 0,
                yOffset: 0,
                scale: 0,
                time: mainTime,
                delay: mainDelay + 2
            });
            MeshAnimation({
                name: 'maskEyeRight',
                xOffset: 0,
                yOffset: 0,
                scale: 0,
                time: mainTime,
                delay: mainDelay + 2
            });

            MeshAnimation({
                name: 'maskBottom',
                xOffset: 0,
                yOffset: -5,
                scale: 0,
                time: mainTime,
                delay: mainDelay + 2.5
            });
            MeshAnimation({
                name: 'maskBottom2',
                xOffset: 0,
                yOffset: -3,
                scale: 0,
                time: mainTime,
                delay: mainDelay + 3
            });

            MeshAnimation({
                name: 'neckLeft',
                xOffset: 0,
                yOffset: -5,
                scale: 0.2,
                time: mainTime,
                delay: mainDelay + 3
            });
            MeshAnimation({
                name: 'neckRight',
                xOffset: 0,
                yOffset: -5,
                scale: 0.2,
                time: mainTime,
                delay: mainDelay + 3
            });

            MeshAnimation({
                name: 'trapezoidLeft',
                xOffset: -5,
                yOffset: 5,
                scale: 0,
                time: mainTime,
                delay: mainDelay + 3.5
            });
            MeshAnimation({
                name: 'trapezoidRight',
                xOffset: 5,
                yOffset: 5,
                scale: 0,
                time: mainTime,
                delay: mainDelay + 3.5
            });

            MeshAnimation({
                name: 'chestTopLeft',
                xOffset: -2,
                yOffset: -5,
                scale: 0.26,
                time: mainTime - 0.5,
                delay: mainDelay + 3.5
            });
            MeshAnimation({
                name: 'chestTopRight',
                xOffset: 2,
                yOffset: -5,
                scale: 0.26,
                time: mainTime - 0.5,
                delay: mainDelay + 3.5
            });

            MeshAnimation({
                name: 'chestMiddleLeft',
                xOffset: -7,
                yOffset: -1,
                scale: 0.26,
                time: mainTime - 1,
                delay: mainDelay + 4
            });
            MeshAnimation({
                name: 'chestMiddleRight',
                xOffset: 7,
                yOffset: -1,
                scale: 0.26,
                time: mainTime - 1,
                delay: mainDelay + 4
            });
            MeshAnimation({
                name: 'reactorBack',
                xOffset: 0,
                yOffset: -10,
                scale: 0,
                time: mainTime - 1,
                delay: mainDelay + 4
            });

            MeshAnimation({
                name: 'shoulderLeft',
                xOffset: -10,
                yOffset: 2,
                scale: 0.26,
                time: mainTime,
                delay: mainDelay + 4
            });
            MeshAnimation({
                name: 'shoulderRight',
                xOffset: 10,
                yOffset: 2,
                scale: 0.26,
                time: mainTime,
                delay: mainDelay + 4
            });

            MeshAnimation({
                name: 'main',
                xOffset: 0,
                yOffset: 0,
                scale: 0,
                time: mainTime + 2,
                delay: mainDelay + 3
            });

            MeshAnimation({
                name: 'chestCyrcleLeft',
                xOffset: -2,
                yOffset: 1,
                scale: 0.27,
                time: mainTime - 1,
                delay: mainDelay + 4.5
            });
            MeshAnimation({
                name: 'chestCyrcleRight',
                xOffset: 2,
                yOffset: 1,
                scale: 0.27,
                time: mainTime - 1,
                delay: mainDelay + 4.5
            });

            MeshAnimation({
                name: 'shoulderCyrcleBigLeft',
                xOffset: -3,
                yOffset: 0,
                scale: 0.3,
                time: mainTime - 1,
                delay: mainDelay + 4.5
            });
            MeshAnimation({
                name: 'shoulderCyrcleBigRight',
                xOffset: 3,
                yOffset: 0,
                scale: 0.3,
                time: mainTime - 1,
                delay: mainDelay + 4.5
            });

            MeshAnimation({
                name: 'shoulderCyrcleSmallLeft',
                xOffset: 0,
                yOffset: 0,
                scale: 0.3,
                time: mainTime - 0.5,
                delay: mainDelay + 5
            });
            MeshAnimation({
                name: 'shoulderCyrcleSmallRight',
                xOffset: 0,
                yOffset: 0,
                scale: 0.3,
                time: mainTime - 0.5,
                delay: mainDelay + 5
            });

        };
        animationStart();

        const updateOnMouse = (x, y) => {
            let targetTiltY = (x - width) / width * .005;
            let targetTiltX = (y - height) / height * .01;

            ringsObject.rotation.x = ringsObject.rotation.x += .25 * (targetTiltY - ringsObject.rotation.x);
            ringsObject.rotation.z = ringsObject.rotation.z -= .25 * (targetTiltX + ringsObject.rotation.z)
        };
        const update = () => {
            rotationObject.rotation.y = +new Date() / 20000;
            ringPulseObject.rotation.y -= .005;

            gyroscopeObject.children.forEach((item, i) => {
                i & 1 ? item.rotation.z += .001 * (i + 1) : item.rotation.z -= .002 * (i + 1)

            })
        };

        this.onWindowResize = () => {
            let width = window.innerWidth;
            let height = window.innerHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
        window.addEventListener('resize', this.onWindowResize, false);

        this.onWindowMousemove = (e) => {
            updateOnMouse(e.clientY, e.clientX);
        };
        window.addEventListener('mousemove', this.onWindowMousemove, false);

        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.update = update;
        this.mount.appendChild(this.renderer.domElement);
        this.start();
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
        window.requestAnimationFrame(this.animate);
        this.update();
        this.renderer.render(this.scene, this.camera);
    }

    render() {
        return (
            <div
                style={style}
                ref={(mount) => {
                    this.mount = mount
                }}
            />
        );
    }
}

export default IronScene;