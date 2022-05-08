import { scene, THREE, ambientLight, renderer } from './script.js'
let fogDistance, pixality, brightness;
let settingsUpdate = () => {
    pixality = document.getElementById('pixelationRange').value;
    brightness = document.getElementById("brightnessRange").value / 100;
    fogDistance = document.getElementById("fogDistanceRange").value;
    scene.fog = new THREE.Fog(0x000000, 0, fogDistance / 10)
    scene.remove(ambientLight.light);
    ambientLight.light = new THREE.AmbientLight(0xfcba03, brightness);
    scene.add(ambientLight.light)
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth / pixality, window.innerHeight / pixality);

}
export { settingsUpdate, fogDistance, pixality, brightness }