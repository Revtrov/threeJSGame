import { camera, keyboard, defaultFov, controls, speed, zoomFov } from "./script.js";
let map = [];
let footsteps = new Audio('Footsteps.wav');
if (typeof footsteps.loop == 'boolean') {
    footsteps.loop = true;
} else {
    footsteps.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    }, false);
}
let runningFootsteps = new Audio('running.wav');
if (typeof footsteps.loop == 'boolean') {
    footsteps.loop = true;
} else {
    footsteps.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    }, false);
}
onkeydown = onkeyup = function(e) {
    e = e || event;
    map[e.keyCode] = e.type == 'keydown';
    if (map[87] == true && map[16] == true) {
        footsteps.pause();
        runningFootsteps.volume = 1;
        runningFootsteps.play();
    } else {
        if (map[87] == true || map[65] == true || map[83] == true || map[68] == true) {
            footsteps.volume = 1;
            footsteps.play();
        }
    }

};
let movementUpdate = () => {

    function fade() {
        if (map[87] == false) {
            if (footsteps.volume > 0.1) {
                footsteps.volume -= 0.05;
                setTimeout(fade, 2);
            } else {
                footsteps.pause();
            }
            if (runningFootsteps.volume > 0.1) {
                runningFootsteps.volume -= 0.05;
                setTimeout(fade, 2);
            } else {
                runningFootsteps.pause();
            }
        } else {
            if (map[87] == true && map[16] == false) {
                if (runningFootsteps.volume > 0.1) {
                    runningFootsteps.volume -= 0.05;
                    setTimeout(fade, 2);
                } else {
                    runningFootsteps.pause();
                }
            }
        }
    }
    fade()

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
}
export { movementUpdate }