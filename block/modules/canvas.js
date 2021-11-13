import {Animation} from "./animation.js";

class Canvas {
    constructor(canvasId, width = window.innerWidth, height = window.innerHeight) {
        this.canvas = document.getElementById(canvasId);
        this.canvas.setAttribute("width", width + "");
        this.canvas.setAttribute("height", height + "");

        this.ctx = this.canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;
    }

    startAnimation(fps, onBeforeFrame = Canvas.noop, onAfterFrame = Canvas.noop) {
        this.animation = new Animation(fps);
        this.animation.start((timestamp, diff) => {
            onBeforeFrame(timestamp, diff);
            this.frame(timestamp, diff);
            onAfterFrame(timestamp, diff);
        });
    }

    stop() {
        this.animation.stop();
    }

    frame(timestamp, diff) {
        throw "Frame method is missing";
    }

    static noop = _ => {
    };
}

export {Canvas};
