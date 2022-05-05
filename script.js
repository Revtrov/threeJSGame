import * as THREE from './three.module.js';
import { PointerLockControls } from './PointerLockControls.js';
import { EffectComposer } from './EffectComposer.js';
import { RenderPass } from './RenderPass.js';
import { GlitchPass } from './GlitchPass.js';
import { UnrealBloomPass } from './UnrealBloomPass.js';
import { miniMapRender } from './minimap.js';

let fogDistance = document.getElementById("fogDistanceRange").value;
let defaultFov = 90;
let zoomFov = 30;
let pixality = document.getElementById('pixelationRange').value;
let inMenu;
let brightness = document.getElementById("brightnessRange").value;
miniMap.width = 400;
miniMap.height = 400;

let keyboard = new THREEx.KeyboardState();

const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(defaultFov, window.innerWidth / window.innerHeight, 0.0001, 30),
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById("canvas"),
    }),
    controls = new PointerLockControls(camera, document.body);
controls.connect();

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth / pixality, window.innerHeight / pixality);


camera.position.set(0, .04, 2);

// lighting + helpers
let ambientLight = new THREE.AmbientLight(0xfcba03, brightness);
const cubeLight = new THREE.PointLight(0x00ff00, 10, 7, 20),
    pointLight = new THREE.PointLight(0xfcba03, 0.5, 1, 1),
    lightHelper = new THREE.PointLightHelper(cubeLight),
    gridHelper = new THREE.GridHelper(800, 50);

pointLight.position.set(1, 0.03, 1)
scene.add(pointLight, ambientLight, /*lightHelper, gridHelper*/ );
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
    floorGeometry = new THREE.CircleGeometry(10, 32),
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
    // movement noises
let footsteps = new Audio('Footsteps.wav');
if (typeof footsteps.loop == 'boolean') {
    footsteps.loop = true;
} else {
    footsteps.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    }, false);
}
// user input
let map = [];
onkeydown = onkeyup = function(e) {
    e = e || event;
    map[e.keyCode] = e.type == 'keydown';

};
let toggleSettings = () => {
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
    // TODO: change to map
document.addEventListener("keydown", (e) => {
    if (e.key == "w" || e.key == "a" || e.key == "s" || e.key == "d" || e.key == "w" && e.key == "shift") {
        footsteps.volume = 1;
        footsteps.play();
    }
    if (e.key == "p") {
        toggleSettings();
    }

});
document.addEventListener("keyup", (e) => {
    function fade() {
        if (footsteps.volume > 0.1) {
            footsteps.volume -= 0.05;
            setTimeout(fade, 2);
        } else {
            footsteps.pause();
        }
    }
    fade()
});

// post process effects
const composer = new EffectComposer(renderer),
    renderPass = new RenderPass(scene, camera);

const glitchPass = new GlitchPass();
glitchPass.goWild = true;

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0;
bloomPass.strength = 0.1;
bloomPass.radius = 0;
composer.addPass(renderPass);
composer.addPass(glitchPass);
composer.addPass(bloomPass);

// location before 
let notCollidePoint = [camera.position.x, camera.position.y, camera.position.z];

let direction = controls.getDirection(new THREE.Vector3().copy(camera.position));

function animate() {
    requestAnimationFrame(animate);
    pixality = document.getElementById('pixelationRange').value;
    brightness = document.getElementById("brightnessRange").value / 100;
    scene.fog = new THREE.Fog(0x000000, 0, fogDistance)
    scene.remove(ambientLight);

    ambientLight = new THREE.AmbientLight(0xfcba03, brightness);
    scene.add(ambientLight)
    if (keyboard.pressed("w") == true) {
        controls.moveForward(speed)
    }
    if (keyboard.pressed("w") == true && keyboard.pressed("shift") == true) {
        controls.moveForward(speed * 1.25)
    }
    if (keyboard.pressed("s") == true) {
        controls.moveForward(speed * -1)
    }
    if (keyboard.pressed("a") == true) {
        controls.moveRight(speed * -1)
    }
    if (keyboard.pressed("d") == true) {
        controls.moveRight(speed)
    }
    if (keyboard.pressed("z") == true) {
        camera.fov = zoomFov;
    } else {
        camera.fov = defaultFov
    }
    // cube collision
    miniMapRender([camera, cube], [notCollidePoint, [camera.position.x, camera.position.y, camera.position.z]])
    fogDistance = document.getElementById("fogDistanceRange").value;
    let cubeBox = new THREE.Box3();
    let playArea = new THREE.Box3();
    cubeBox.setFromObject(cube);
    playArea.setFromObject(wallBlock);
    if (cubeBox.containsPoint(new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z)) == false && playArea.containsPoint(new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z))) {
        notCollidePoint = [camera.position.x, camera.position.y, camera.position.z];
    }
    if (cubeBox.containsPoint(new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z)) || !cubeBox.containsPoint(new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z))) {
        camera.position.set(notCollidePoint[0], notCollidePoint[1], notCollidePoint[2])
    }
    // bind player light
    pointLight.position.set(camera.position.x, 0.04, camera.position.z);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(1);
    renderer.setRenderTarget(firstRenderTarget);
    cube.material = new THREE.MeshBasicMaterial({ map: cubeTexture, color: 0xffffff, transparent: true, wireframe: true, })

    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.clear();
    cube.material = new THREE.MeshBasicMaterial({ map: firstRenderTarget.texture, color: 0xffffff, transparent: true, wireframe: false, })
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth / pixality, window.innerHeight / pixality);

    renderer.render(scene, camera);
}

animate()
export { fogDistance }