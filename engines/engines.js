'use strict';

class Engines {
    constructor() {
    }

    init() {
        const dis = this;
        return fetch('settings.json')
            .then(function (response) {
                return response.json();
            }).then((json) => {
                dis.settings = json;
                dis.current = new Configuration(dis.settings.configurations[3]);
                console.log(dis.current.name);
            });
    }
}

class Configuration {
    constructor(source) {
        this.name = source.name;
        this.banks = source.banks;
        this.crankshaft = source.crankshaft;
        this.crankpins = source.crankpins;
        this.firingOrder = source.firingOrder;
        this.numbering = source.numbering;
        this.rpm = 5;
    }

    getCrankshaftAngles(timestamp) {
        const result = [];
        this.crankshaft.forEach((element, index) => {
            result.push((720 + element + 360 * timestamp * this.rpm / 60000) % 720);
        });
        return result;
    }
}