function Images() {
    this.available = {};
}

Images.prototype = {
    constructor: Images,

    load: function (id, source) {
        var image = new Image();
        image.onload = function () {
            image.ctrReady = true;
        };
        image.src = source;
        image.ctrReady = false;
        this.available[id] = image;
    },

    get: function (id) {
        return this.available[id];
    },

    onInitialized: function (callback) {
        var ready = true;
        for (var id in this.available) {
            if (this.available.hasOwnProperty(id) && this.available[id] instanceof Image) {
                var image = this.available[id];
                console.log(image.src + ".ctrReady=" + image.ctrReady);
                ready &= image.ctrReady;
            }
        }
        if (ready) {
            callback();
        } else {
            var caller = this;
            setTimeout(function () {
                caller.onInitialized(callback);
            }, 500);
        }
    }
};
