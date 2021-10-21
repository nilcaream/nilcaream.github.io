// https://newbedev.com/seeding-the-random-number-generator-in-javascript
// https://github.com/bryc/code/blob/master/jshash/PRNGs.md
// http://www.roguebasin.com/index.php/Random_number_generator

function sfc32(a, b, c, d) {
    return function () {
        a >>>= 0;
        b >>>= 0;
        c >>>= 0;
        d >>>= 0;
        let t = (a + b) | 0;
        a = b ^ b >>> 9;
        b = c + (c << 3) | 0;
        c = (c << 21 | c >>> 11);
        d = d + 1 | 0;
        t = t + d | 0;
        c = c + t | 0;
        return (t >>> 0) / 4294967296;
    }
}

function random(seed, id) {
    const rand = sfc32(0x9E3779B9 + id * id, 0x243F6A88, id ^ 0xB7E15162, seed ^ 0xDEADBEEF);
    for (let i = 0; i < 19 + id % 7; i++) {
        rand();
    }
    return (min, max, inclusive = false) => {
        if (min || max) {
            return min + Math.floor(rand() * (max - min + inclusive));
        } else {
            return rand();
        }
    };
}

export {random as Random};
