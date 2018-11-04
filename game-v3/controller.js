function Controller(width, height) {
    this.width = width;
    this.height = height;
}

Controller.prototype = {
    constructor: Controller,

    types: ["keyboard", "gamepad", "mobile"],
    type: "keyboard",
    left: 0,
    right: 0,
    up: 0,
    down: 0,
    fire: false,
    select: false,
    start: false,
    keyPressed: {},
    touches: [],
    angle: 0,

    gamepad: function () {
        if (navigator.getGamepads() && navigator.getGamepads().length > 0 && navigator.getGamepads()[0] !== null) {
            return navigator.getGamepads()[0];
        } else {
            return null;
        }
    },

    toggle: function () {
        var next = (this.types.indexOf(this.type) + 1) % this.types.length;
        this.type = this.types[next];
        return this.type;
    },

    update: function () {
        if (this.type === "mobile") {
            this._updateTouches();
        } else if (this.type === "keyboard") {
            this._updateKeyboard();
        } else if (this.type === "gamepad") {
            this._updateGamepad();
        } else {
            console.log("Unknown controller type " + this.type);
        }
    },

    _updateKeyboard: function () {
        this.fire = this.keyPressed[32] === true;
        this.left = this.keyPressed[74] || this.keyPressed[37] ? 1 : 0; // left 37; j 74
        this.right = this.keyPressed[76] || this.keyPressed[39] ? 1 : 0; // right 39; l 76
        this.up = this.keyPressed[73] || this.keyPressed[38] ? 1 : 0; // up 38; i 73
        this.down = this.keyPressed[75] || this.keyPressed[40] ? 1 : 0; // down 40; k 75
    },

    /*
        0 1up RanalUp
        1 2right RanalRight
        2 3down RanalDown
        3 4left RanalLeft
        4 L1
        5 R1
        6 L2
        7 R2
        8 select
        9 start
       10 LanalClick
       11 RanalClick

        0 LanalRight=1 LanalLeft=-1
        1 LanaDown=1 LanalUp=-1
    */
    _updateGamepad: function () {
        var pad = this.gamepad();
        if (pad === null) {
            return;
        }

        if (pad.buttons[0].pressed) {
            this.up = 1;
            this.down = 0;
        } else if (pad.buttons[2].pressed) {
            this.up = 0;
            this.down = 1;
        } else if (pad.axes[1] > 0.2) {
            this.up = 0;
            this.down = pad.axes[1];
        } else if (pad.axes[1] < -0.2) {
            this.up = -pad.axes[1];
            this.down = 0;
        } else {
            this.up = 0;
            this.down = 0;
        }

        if (pad.buttons[1].pressed) {
            this.right = 1;
            this.left = 0;
        } else if (pad.buttons[3].pressed) {
            this.right = 0;
            this.left = 1;
        } else if (pad.axes[0] > 0.2) {
            this.right = pad.axes[0];
            this.left = 0;
        } else if (pad.axes[0] < -0.2) {
            this.right = 0;
            this.left = -pad.axes[0];
        } else {
            this.right = 0;
            this.left = 0;
        }

        this.select = pad.buttons[8].pressed;
        this.start = pad.buttons[9].pressed;

        this.fire = pad.buttons[4].pressed || pad.buttons[5].pressed || pad.buttons[6].pressed || pad.buttons[7].pressed;
        this.fire = this.fire || pad.buttons[10].pressed || pad.buttons[11].pressed;
    },

    _updateTouches: function () {
        var controller = this;
        controller.fire = false;
        controller.up = 0;
        controller.down = 0;
        controller.left = 0;
        controller.right = 0;

        var origin = {
            x: controller.width - 192,
            y: controller.height / 2
        };

        for (var i = 0; i < this.touches.length; i++) {
            var touch = this.touches[i];
            // console.log(touch);
            if (touch.clientX < controller.width / 3) {
                controller.fire = true;
            } else if (touch.clientX > controller.width / 2) {
                var angle = 90 + Math.atan2(touch.clientY - origin.y, touch.clientX - origin.x) * 180 / Math.PI;
                angle = angle > 0 ? angle : 360 + angle;
                // console.log(angle);

                controller.angle = angle;

                if (angle > 0 && angle < 90) {
                    controller.up = (90 - angle) / 90;
                    controller.right = angle / 90;
                } else if (angle > 90 && angle < 180) {
                    controller.down = (angle - 90) / 90;
                    controller.right = (180 - angle) / 90;
                } else if (angle > 180 && angle < 270) {
                    controller.down = (270 - angle) / 90;
                    controller.left = (angle - 180) / 90;
                } else if (angle > 270 && angle < 360) {
                    controller.up = (angle - 270) / 90;
                    controller.left = (360 - angle) / 90;
                }
            }
        }
    }
};
