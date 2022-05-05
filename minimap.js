import { fogDistance } from "./settingsUpdate.js";

let miniMap = document.getElementById("miniMap"),
    miniCtx = miniMap.getContext("2d"),
    miniMapRender = (objects) => {
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

miniMap.width = 400;
miniMap.height = 400;
export { miniMapRender }