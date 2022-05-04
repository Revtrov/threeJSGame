import * as THREE from './three.module.js';
import { PointerLockControls } from './PointerLockControls.js';
import { EffectComposer } from './EffectComposer.js';
import { RenderPass } from './RenderPass.js';
import { GlitchPass } from './GlitchPass.js';
import { UnrealBloomPass } from './UnrealBloomPass.js';
let miniMap = document.getElementById("miniMap");
let miniCtx = miniMap.getContext("2d");
let fogDistance = 4;
let defaultFov = 90;
let zoomFov = 30;
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
renderer.setSize(window.innerWidth, window.innerHeight);

scene.fog = new THREE.Fog(0x000000, 0, fogDistance)

camera.position.set(0, .03, 2);

// lighting + helpers
const cubeLight = new THREE.PointLight(0x00ff00, 10, 7, 20),
    pointLight = new THREE.PointLight(0xfcba03, 0.5, 1, 1),
    ambientLight = new THREE.AmbientLight(0xfcba03, 0.0),
    lightHelper = new THREE.PointLightHelper(cubeLight),
    gridHelper = new THREE.GridHelper(800, 50);

pointLight.position.set(1, 2, 1)
scene.add(pointLight, ambientLight, /*lightHelper, gridHelper*/ );
// cube
const cubeTexture = new THREE.TextureLoader().load("texture.jpg"),
    geometry = new THREE.BoxGeometry(1, 1, 1, 100, 100, 100),
    material = new THREE.MeshPhongMaterial({ map: cubeTexture, color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: .2, transparent: true, wireframe: true }),
    cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 0.5, 0)
cubeLight.position.copy(cube.position)
scene.add(cube, cubeLight);
let firstRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight)
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
        controls.lock()
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
    controls.lock();

};
// TODO: change to map
document.addEventListener("keydown", (e) => {
    if (e.key == "w" || e.key == "a" || e.key == "s" || e.key == "d") {
        footsteps.volume = 1;
        footsteps.play();
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

// screen



// location before 
let notCollidePoint = [camera.position.x, camera.position.y, camera.position.z],
    dist = (a, b) => {
        return Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2))
    }
let miniMapRender = (objects, dirPoints) => {
    miniCtx.globalCompositeOperation = 'destination-over'
    miniCtx.clearRect(0, 0, miniMap.width, miniMap.height);
    miniCtx.fillStyle = "rgba(0, 125, 0, 0.2)"
    miniCtx.fillRect(10, 10, miniMap.width - 20, miniMap.height - 20)
    miniCtx.fillRect(0, 0, miniMap.width, miniMap.height);
    for (let i = 0; i < objects.length; i++) {
        miniCtx.beginPath();
        if (i == 0) {
            miniCtx.globalCompositeOperation = 'destination-out'
            miniCtx.beginPath();
            miniCtx.arc(
                ((miniMap.width - 20) / 2) + ((((miniMap.width - 40) / 1) / 10) * objects[i].position.x),
                ((miniMap.height - 20) / 2) + ((((miniMap.height - 40) / 1) / 10) * objects[i].position.z),
                ((miniMap.width / 100) * fogDistance), 0, 2 * Math.PI
            );
            miniCtx.fill()
            miniCtx.stroke();

            miniCtx.beginPath();
            miniCtx.fillStyle = "red";
            miniCtx.globalCompositeOperation = 'destination-over'
            miniCtx.arc(
                ((miniMap.width - 20) / 2) + ((((miniMap.width - 40) / 1) / 10) * objects[i].position.x),
                ((miniMap.height - 20) / 2) + ((((miniMap.height - 40) / 1) / 10) * objects[i].position.z),
                ((miniMap.width / 100)) * 1, 0, 2 * Math.PI
            );
            miniCtx.fill()
            miniCtx.stroke();

        } else {
            miniCtx.fillStyle = "green";
            miniCtx.globalCompositeOperation = 'destination-over'
            miniCtx.arc(
                ((miniMap.width - 20) / 2) + ((((miniMap.width - 40) / 1) / 10) * objects[i].position.x),
                ((miniMap.height - 20) / 2) + ((((miniMap.height - 40) / 1) / 10) * objects[i].position.z),
                ((miniMap.width / 100)) * objects[i].geometry.parameters.width * 2, 0, 2 * Math.PI
            );
        }

        miniCtx.fill()
        miniCtx.stroke();
    }

}
let direction = controls.getDirection(new THREE.Vector3().copy(camera.position));

function animate() {
    requestAnimationFrame(animate);
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
    renderer.setRenderTarget(firstRenderTarget);
    cube.material = new THREE.MeshBasicMaterial({ map: firstRenderTarget.texture, color: 0xffffff, transparent: true, wireframe: false, })
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(scene, camera);
}

animate()