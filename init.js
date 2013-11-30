document.addEventListener("DOMContentLoaded", function(event) {
    var canvas = document.getElementById("game");
    var go = document.getElementById("go");
    var processing;
    var pauses = 0;
    var err_snd = new Audio("resources/error.wav");
    go.addEventListener("click", function(event) {
        if(go.value === "Start Game"){
            // attach my game to the canvas
            processing = new Processing(canvas, sketchProc);
            canvas.focus(); // so it gets keypresses
            go.value = "Pause";
        }
        else if(go.value === "Pause"){
            if(pauses < 3){
                processing.noLoop();
                go.value = "Resume";
                pauses += 1;
            }
            else{
                err_snd.play();
            }


        }
        else{
            go.value = "Pause";
            processing.loop();
        }
    });

});
