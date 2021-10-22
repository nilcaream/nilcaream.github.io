const Keyboard = {
    _ready: false,

    init() {
        if (!this._ready) {
            console.log("Initializing keyboard");
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
