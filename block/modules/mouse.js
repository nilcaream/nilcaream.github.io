import {Textures} from "./texture.js";

const Mouse = {
    _ready: false,
    map: {},
    x: 0,
    y: 0,
    cursors: {},

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

            Object.keys(this.opts).forEach(key => {
                Textures.load(`mouse.${key}`, 1, 1, 1, this.opts[key], image => this.cursors[key] = image);
            });

            this._ready = true;
        }
    },

    changeCursor(key) {
        Textures.get(`mouse.${key}`, image => {
            Array.prototype.forEach.call(document.querySelectorAll("canvas"), element => {
                console.log(`Set mouse cursor to ${key}`);
                element.style.cursor = `url(${image.src}) ${image.width / 2} ${image.height / 2}, auto`;
            });
        });
    },

    has(code) {
        return this.map[code] || false;
    },

    had(code) {
        const result = this.has(code);
        this.map[code] = false;
        return result;
    },

    opts: {
        plus1: [
            {
                "type": "canvas",
                "width": 16,
                "height": 16
            },
            {
                "type": "fillRect",
                "x0": 6,
                "y0": 1,
                "x1": 10,
                "y1": -1,
                "hue": 0,
                "luminosity": 50,
                "saturation": 0,
                "alpha": 50
            },
            {
                "type": "fillRect",
                "x0": 1,
                "y0": 6,
                "x1": -1,
                "y1": 10,
                "hue": 0,
                "luminosity": 50,
                "saturation": 0,
                "alpha": 50
            },
            {
                "type": "fillRect",
                "x0": 7,
                "y0": 0,
                "x1": 9,
                "y1": 16,
                "hue": 0,
                "luminosity": 10,
                "saturation": 0
            },
            {
                "type": "fillRect",
                "x0": 0,
                "y0": 7,
                "x1": 16,
                "y1": 9,
                "hue": 0,
                "luminosity": 10,
                "saturation": 0
            }
        ],
        plus: [
            {
                "type": "canvas",
                "width": 16,
                "height": 16
            },
            {
                "type": "fillRect",
                "x0": 6,
                "y0": 1,
                "x1": 7,
                "y1": -1,
                "hue": 0,
                "luminosity": 50,
                "saturation": 0,
                "alpha": 50
            },
            {
                "type": "fillRect",
                "x0": 9,
                "y0": 1,
                "x1": 10,
                "y1": -1,
                "hue": 0,
                "luminosity": 50,
                "saturation": 0,
                "alpha": 50
            },
            {
                "type": "fillRect",
                "x0": 1,
                "y0": 6,
                "x1": -1,
                "y1": 7,
                "hue": 0,
                "luminosity": 50,
                "saturation": 0,
                "alpha": 50
            },
            {
                "type": "fillRect",
                "x0": 1,
                "y0": 9,
                "x1": -1,
                "y1": 10,
                "hue": 0,
                "luminosity": 50,
                "saturation": 0,
                "alpha": 50
            },
            {
                "type": "fillRect",
                "x0": 7,
                "y0": 0,
                "x1": 9,
                "y1": 16,
                "hue": 0,
                "luminosity": 10,
                "saturation": 0
            },
            {
                "type": "fillRect",
                "x0": 0,
                "y0": 7,
                "x1": 16,
                "y1": 9,
                "hue": 0,
                "luminosity": 10,
                "saturation": 0
            }
        ]
    }
}

export {Mouse}
