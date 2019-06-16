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
                dis.current = new Configuration(dis.settings.configurations[0]);
            });
    }
}

class Configuration {
    constructor(source) {
        this.name = source.name;
        this.banks = source.banks;
        this.crankshaft = source.crankshaft;
        this.ignition = source.ignition;
        this.rpm = 60;
    }

    getCrankshaftAngles(timestamp) {
        const result = [];
        this.crankshaft.forEach((element, index) => {
            result.push((element + 360 * timestamp * this.rpm / 60000) % 360);
        });
        return result;
    }
}