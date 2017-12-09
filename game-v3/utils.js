function Utils() {
}

Utils.prototype = {
    constructor: Utils,

    distance: function (a, b) {
        return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
    },

    leadingZero: function (value, start) {
        return (value + start).toString().substring(1);
    },

    generateDistantPoint: function (distance, randomFactor) {
        var angle = Math.random() * Math.PI * 2;
        var factor = 1 + randomFactor * (Math.random() - 0.5) * 2;
        return {
            x: Math.sin(angle) * distance * factor,
            y: Math.cos(angle) * distance * factor,
            angle: angle,
            r: distance
        };
    },

    mod: function (n, m) {
        return ((n % m) + m) % m;
    }
};
