import * as THREE from './three.module.js';
import { PointerLockControls } from './PointerLockControls.js';
import { EffectComposer } from './EffectComposer.js';
import { RenderPass } from './RenderPass.js';
import { GlitchPass } from './GlitchPass.js';
import { UnrealBloomPass } from './UnrealBloomPass.js';
import { miniMapRender } from './minimap.js';
import { movementUpdate } from './movement.js';
import { settingsUpdate } from './settingsUpdate.js';
import { collisionUpdate } from './collision.js';
import { pixality, brightness, fogDistance } from './settingsUpdate.js'
import { STLLoader } from './STLLoader.js'


let
    keyboard = new THREEx.KeyboardState(),
    defaultFov = 90,
    zoomFov = 30,
    inMenu;
const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(defaultFov, window.innerWidth / window.innerHeight, 0.0001, 30),
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById("canvas"),
    }),
    camera2 = new THREE.PerspectiveCamera(defaultFov, window.innerWidth / window.innerHeight, 0.0001, 30),
    controls = new PointerLockControls(camera, document.body);
controls.connect();

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth / pixality, window.innerHeight / pixality);


camera.position.set(0, 0.04, 2);

// lighting + helpers
const ambientLight = { light: new THREE.AmbientLight(0xfcba03, brightness) },
    cubeLight = new THREE.PointLight(0x00ff00, 10, 7, 20),
    pointLight = new THREE.PointLight(0xfcba03, 0.5, 1, 1),
    lightHelper = new THREE.PointLightHelper(cubeLight),
    gridHelper = new THREE.GridHelper(800, 50);

pointLight.position.set(1, 0.03, 1)
scene.add(pointLight, ambientLight.light, /*lightHelper, gridHelper*/ );
// cube
const cubeTexture = new THREE.TextureLoader().load("texture.jpg"),
    geometry = new THREE.BoxGeometry(1, 1, 1, 100, 100, 100),
    material = new THREE.MeshPhongMaterial({ map: cubeTexture, color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: .2, transparent: true, wireframe: true }),
    cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 0.5, 0)
cubeLight.position.copy(cube.position)
scene.add(cube, cubeLight);
let firstRenderTarget = new THREE.WebGLRenderTarget(2000, 2000)
    // floor
const floorTexture = new THREE.TextureLoader().load("floorTexture.png"),
    floorGeometry = new THREE.PlaneGeometry(10, 10),
    floorMaterial = new THREE.MeshStandardMaterial({ map: floorTexture, side: THREE.DoubleSide }),
    floor = new THREE.Mesh(floorGeometry, floorMaterial);
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(100, 100);
floor.position.set(0, 0, 0)
floor.rotateX(90 * (Math.PI / 180));
scene.add(floor);

const wallBlockTexture = new THREE.TextureLoader().load("floorTexture.png"),
    wallBlockGeometry = new THREE.BoxGeometry(10, 10, 10, 1, 1, 1),
    wallBlockMaterial = new THREE.MeshStandardMaterial({ map: wallBlockTexture, side: THREE.DoubleSide }),
    wallBlock = new THREE.Mesh(wallBlockGeometry, wallBlockMaterial);
wallBlockTexture.wrapS = THREE.RepeatWrapping;
wallBlockTexture.wrapT = THREE.RepeatWrapping;
wallBlockTexture.repeat.set(100, 100);
wallBlock.position.set(0, 0.5, 0)
scene.add(wallBlock);

const loader = new STLLoader();
let nose;
let noseBox;
let noseBox3;
loader.load('Among_US.stl', function(geometry) {
    const positionAttribute = geometry.attributes.position;
    const colors = [];
    const color = new THREE.Color();
    for (let i = 0, il = positionAttribute.count; i <= il; i++) {
        color.setHSL(i * Math.random(), 0.4, 0.4);
        colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000, wireframe: false, transparent: true, opacity: 0.8, depthWrite: true, vertexColors: THREE.VertexColors });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, .0, 1);
    mesh.rotation.set((-90 * Math.PI / 180), 0, 0);
    mesh.scale.set(.001, .001, .001);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    nose = mesh;
    scene.add(mesh);
    noseBox3 = new THREE.Box3();
    // noseBox = new THREE.BoxHelper(mesh, 0xff0000);
    // noseBox3.setFromObject(noseBox)
    //scene.add(noseBox);

});

// load a resource

//
let speed = 0.001;
// background noise
let ambientNoise = new Audio('ambientNoise.wav');
if (typeof ambientNoise.loop == 'boolean') {
    ambientNoise.loop = true;
} else {
    ambientNoise.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    }, false);
}
document.addEventListener("click", (e) => {
    if (inMenu !== true) {
        controls.lock()
    }
    ambientNoise.play();
})
document.addEventListener("keydown", (e) => {
    if (e.key == "p") {
        let opacity = parseFloat(getComputedStyle(document.getElementById("settings")).getPropertyValue("opacity"));
        if (opacity == 0) {
            document.getElementById("settings").style.opacity = 1;
            inMenu = true;
            controls.unlock();
        } else {
            inMenu = false;
            document.getElementById("settings").style.opacity = 0;
            controls.lock();

        }
    }

});

// post process effects
const composer = new EffectComposer(renderer),
    renderPass = new RenderPass(scene, camera);

composer.setSize(window.innerWidth, window.innerHeight)
const glitchPass = new GlitchPass();
glitchPass.goWild = true;
glitchPass.renderToScreen = true;

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0;
bloomPass.strength = 0.1;
bloomPass.radius = 0;
composer.addPass(renderPass);
composer.addPass(glitchPass);
composer.addPass(bloomPass);
// location before 
let dist = (x1, y1, x2, y2) => {
    return Math.sqrt(((x2 - x1) ** 2) + ((y2 - y1) ** 2))
}

function animate() {
    requestAnimationFrame(animate);
    try {
        nose.lookAt(camera.position.x, 0, camera.position.z);
        nose.rotateX(-90 * (Math.PI / 180))
        noseBox3.setFromObject(nose);
        collisionUpdate();
        if (dist(camera.position.x, camera.position.z, nose.position.x, nose.position.z) > 0.2) {
            nose.translateY(-0.007 * dist(camera.position.x, camera.position.z, nose.position.x, nose.position.z) / 2);
        }
    } catch (e) {}
    movementUpdate();
    miniMapRender([camera, cube, noseBox3])
    pointLight.position.set(camera.position.x, 0.04, camera.position.z);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(1);
    renderer.setRenderTarget(firstRenderTarget);
    cube.material = new THREE.MeshBasicMaterial({ map: cubeTexture, color: 0xffffff, transparent: true, wireframe: true, })
    renderer.render(scene, camera);
    cube.material = new THREE.MeshBasicMaterial({ map: firstRenderTarget.texture, color: 0xffffff, transparent: true, wireframe: false, })
    renderer.setRenderTarget(null);
    renderer.setRenderTarget(composer.renderTarget1);
    composer.render()
    renderer.clear();
    // keep here
    settingsUpdate()
    renderer.render(scene, camera);
}

animate()
export { keyboard, THREE, camera, defaultFov, controls, speed, scene, ambientLight, renderer, cube, wallBlock, zoomFov, noseBox3 }