const Keyboard = {
    _ready: false,

    bindings: {
        moveLeft: "KeyA",
        moveRight: "KeyD",
        moveUp: "KeyW",
        moveDown: "KeyS",
        jump: "Space",
        run: "Control",
        sneak: "Shift",
    },

    init() {
        if (!this._ready) {
            console.log("Initializing keyboard");

            document.addEventListener('beforeunload', e => { // prevent ctrl-w // TODO not working
                e.stopPropagation();
                e.preventDefault();
                return false;
            }, true);

            this.map = {};

            document.addEventListener("keydown", (e) => {
                this.map[e.key] = true;
                this.map[e.code] = true;
                e.preventDefault();
                e.stopPropagation();
                return false;
            }, false);
            document.addEventListener("keyup", (e) => {
                this.map[e.key] = false;
                this.map[e.code] = false;
                e.preventDefault();
                e.stopPropagation();
                return false;
            }, false);
            this._ready = true;
        }
    },

    has(code) {
        return this.map[code] || 0;
    }
}

export {Keyboard}
