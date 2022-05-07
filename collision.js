import { THREE, cube, wallBlock, camera, noseBox } from "./script.js";
let notCollidePoint = [0, 0, 0];
let collisionUpdate = () => {
    try {
        let cubeBox = new THREE.Box3();
        let playArea = new THREE.Box3();
        let noseBox3 = new THREE.Box3();
        cubeBox.setFromObject(cube);
        playArea.setFromObject(wallBlock);
        noseBox3.setFromObject(noseBox);
        if (cubeBox.containsPoint(new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z)) == false &&
            noseBox3.containsPoint(new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z)) == false &&
            playArea.containsPoint(new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z))) {
            notCollidePoint = [camera.position.x, camera.position.y, camera.position.z];
        }
        if (cubeBox.containsPoint(new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z)) ||
            !cubeBox.containsPoint(new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z))) {
            camera.position.set(notCollidePoint[0], notCollidePoint[1], notCollidePoint[2])
        }
    } catch { null }
}
export { collisionUpdate }