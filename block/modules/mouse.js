const Mouse = {
    _ready: false,
    map: {},
    x: 0,
    y: 0,

    bindings: {
        attack: 0,
        place: 2
    },

    init() {
        if (!this._ready) {
            console.log("Initializing mouse");

            document.addEventListener("mousemove", e => {
                this.x = e.x;
                this.y = e.y;
            });

            document.addEventListener("contextmenu", e => e.preventDefault());

            document.addEventListener("mousedown", (e) => {
                this.map[e.button] = true;
                e.preventDefault();
                e.stopPropagation();
                return false;
            }, false);

            document.addEventListener("mouseup", (e) => {
                this.map[e.button] = false;
                e.preventDefault();
                e.stopPropagation();
                return false;
            }, false);
            this._ready = true;
        }
    },

    has(code) {
        return this.map[code] || false;
    },

    had(code) {
        const result = this.has(code);
        this.map[code] = false;
        return result;
    }
}

export {Mouse}
