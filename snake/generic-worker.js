importScripts("scripts/neural.js");
importScripts("scripts/computer.js");
importScripts("scripts/game-ui.js");
importScripts("scripts/game.js");
importScripts("scripts/genetic.js");
importScripts("scripts/human.js");
importScripts("scripts/learn.js");
importScripts("scripts/net.js");
importScripts("scripts/snake.js");
importScripts("scripts/storage.js");

let target;

function initialize(targetClassName) {
    target = eval(`new ${targetClassName.replace(/[^A-Za-z0-9]/g, "")}()`);

    console.log("Initialized");
    setInterval(() => {
        const properties = Object.keys(target)
            .filter(k => k.charAt(0) !== "_")
            .filter(k => typeof target[k] !== 'function')
            .filter(k => Array.isArray(target[k]) || typeof target[k] !== 'object');
        properties.forEach(property => postMessage({
            property: property,
            value: target[property]
        }))
    }, 1000);
}

onmessage = (event) => {
    console.log("worker.js onmessage");
    console.log(event.data);
    if (target === undefined && event.data.initialize) {
        initialize(event.data.initialize);
    } else if (target && event.data.override) {
        target[event.data.override] = (...value) => postMessage({
            method: event.data.override,
            arguments: value
        });
    } else if (target && event.data.property) {
        target[event.data.property] = event.data.value;
    } else if (target && event.data.method) {
        target[event.data.method](...event.data.arguments);
    } else {
        console.log("Not initialized");
    }
}
