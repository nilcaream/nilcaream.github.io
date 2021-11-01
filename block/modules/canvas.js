import {Animation} from "./animation.js";

class Canvas {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.canvas.setAttribute("width", window.innerWidth + "");
        this.canvas.setAttribute("height", window.innerHeight + "");

        this.ctx = this.canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;
    }

    startAnimation(fps) {
        this.animation = new Animation(fps);
        this.animation.start((timestamp, diff) => {
            this.frame(timestamp, diff);
        });
    }

    frame(timestamp, diff) {
        throw "Frame method is missing";
    }
}

export {Canvas};
