function Controller() {
}

Controller.prototype = {
    constructor: Controller,

    type: "keyboard",
    left: 0,
    right: 0,
    up: 0,
    down: 0,
    fire: false,
    select: false,
    start: false,
    keyPressed: {},

    gamepad: function () {
        if (navigator.getGamepads() && navigator.getGamepads().length > 0 && navigator.getGamepads()[0] !== null) {
            return navigator.getGamepads()[0];
        } else {
            return null;
        }
    },

    toggle: function () {
        if (this.type === "keyboard") {
            if (this.gamepad()) {
                this.type = "gamepad";
            } else {
                console.log("Game pad not available");
            }
        } else {
            this.type = "keyboard";
        }
        return this.type;
    },

    update: function () {
        if (this.type === "keyboard") {
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
            console.log("Gamepad not found");
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
    }
};
