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
importScripts("scripts/learn-proxy.js");

const logger = (text) => postMessage({ method: "logger", arguments: [text] });
const onEnd = () => postMessage({ method: "onEnd", arguments: [] });
const learn = new Learn(100, 1000, [], logger, onEnd);

onmessage = (event) => {
    //console.log("worker.js onmessage");
    //console.log(event.data);
    if (event.data.property) {
        learn[event.data.property] = event.data.value;
    } else if (event.data.method) {
        learn[event.data.method](...event.data.arguments);
    }
}

setInterval(() => {
    const properties = Object.keys(learn)
        .filter(k => typeof learn[k] !== 'function')
        .filter(k => Array.isArray(learn[k]) || typeof learn[k] !== 'object');
    properties.forEach(property => postMessage({
        property: property,
        value: learn[property]
    }))
}, 1000);
