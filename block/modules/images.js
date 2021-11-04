const Images = {
    store: {},

    base: 16, // element size in px
    size: 16, // number of elements in a row

    load: function (id, src) {
        console.log(`Loading image ${src}`);
        this.store[id] = {
            loaded: false
        };
        const image = new Image();
        image.src = src;
        image.onload = () => {
            console.log(`Loaded ${src} as ${id}`);
            this.store[id] = {
                loaded: true,
                image: image
            };
        }
    },

    onLoad: function (onLoad) {
        const timer = setTimeout(() => {
            if (Object.values(this.store).filter(v => !v.loaded).length === 0) {
                console.log(`Finished loading images`);
                clearTimeout(timer);
                onLoad();
            }
        }, 100);
    },

    draw: function (ctx, id, index, x, y, size) {
        if (!this.store[id]) {
            throw `Image ${id} not found`;
        } else if (this.store[id].image) {
            const iX = index % this.size;
            const iY = Math.floor(index / this.size);
            ctx.drawImage(this.store[id].image,
                iX * this.base, iY * this.base,
                this.base, this.base,
                x, y,
                size, size);
        } else {
            console.log(`Waiting for image ${id} to load. Skipping draw`);
        }
    }
};

export {Images};