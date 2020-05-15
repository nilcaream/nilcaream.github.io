$(() => {
    const now = () => { let d = new Date(); return new Date(d.getTime() - 60 * 1000 * d.getTimezoneOffset()).toISOString().replace(/[TZ]/g, " ").trim(); };
    const log = (text) => $("#results").prepend($("<div></div>").text(`${now()} ${text}`));
    const loadWeights = (amount) => Storage.load().slice(0, amount).map(x => x.weights)
    const addButton = (text, action) => $("#controlls").append($("<a></a>").addClass("pr05").attr("href", "#").text(text).click(action));

    window.addEventListener("error", (e) => log(`Error ${e.message} at ${e.filename}:${e.lineno}:${e.colno}`));

    const worker = new Worker("generic-worker.js");
    worker.postMessage({ initialize: "Learn" });
    worker.postMessage({ override: "logger" });

    const learn = {
        start: () => {
            worker.postMessage({ "method": "start", arguments: [] });
        },
        stop: () => {
            worker.postMessage({ "method": "stop", arguments: [] });
        },
        reset: (populationSize, generations, weights) => {
            worker.postMessage({ "method": "reset", arguments: [populationSize, generations, weights] });
        },
        logger: (text) => {
            log(text);
        }
    };
    learn.reset(100, 1000, loadWeights(10));

    worker.onmessage = (event) => {
        console.log("learn-generic-worker-main.js onmessage");
        console.log(event.data);
        if (event.data.property) {
            learn[event.data.property] = event.data.value;
        } else if (event.data.method) {
            learn[event.data.method](...event.data.arguments);
        } else {
            console.log("Unknown event");
        }
    };

    const updateStatus = () => {
        const score = ((learn.best || [])[0] || { score: 0 }).score.toFixed(2);
        const movesPerMs = (learn.movesPerMs || 0).toPrecision(3);
        $("#status").empty()
            .text(`${now()} generation:${learn.generation}/${learn.generations}, populationSize:${learn.populationSize}, movesPerMs:${movesPerMs}, score:${score}, running:${learn.running}`);
    };

    addButton("P:50", () => learn.reset(50, 0, loadWeights(5)));
    addButton("P:100", () => learn.reset(100, 0, loadWeights(10)));
    addButton("P:500", () => learn.reset(500, 0, loadWeights(50)));
    addButton("P:1000", () => learn.reset(1000, 0, loadWeights(100)));
    addButton("P:5000", () => learn.reset(5000, 0, loadWeights(500)));
    addButton("P:10000", () => learn.reset(10000, 0, loadWeights(1000)));
    $("#controlls").append($("<span></span>").addClass("pr05").text("|"));
    addButton("G:100", () => learn.reset(0, 100, loadWeights(0.1 * learn.populationSize)));
    addButton("G:1000", () => learn.reset(0, 1000, loadWeights(0.1 * learn.populationSize)));
    addButton("G:10000", () => learn.reset(0, 10000, loadWeights(0.1 * learn.populationSize)));
    addButton("G:100000", () => learn.reset(0, 100000, loadWeights(0.1 * learn.populationSize)));
    $("#controlls").append($("<span></span>").addClass("pr05").text("|"));
    addButton("Clear", () => $("#results").empty());
    addButton("Restart", () => learn.reset(0, 0, loadWeights(0.1 * learn.populationSize)));
    addButton("Start", () => {
        if (learn.running) {
            log("Already running");
        } else {
            learn.start();
        }
    });
    addButton("Stop", () => learn.stop());
    addButton("Reset", () => learn.reset(0, 0, []));
    addButton("Delete", () => { learn.reset(0, 0, []); Storage.save([]); });

    setInterval(() => updateStatus(), 1000);
    setInterval(() => Storage.add(learn.best), 5000);

    // ----------

    const outputTexts = (output) => {
        const results = [];
        const max = output.indexOf(Math.max(...output));
        const labels = ["RIGHT", "LEFT", "DOWN", "UP"];
        output.forEach((o, i) => {
            results.push({
                color: `rgb(${i !== max ? 255 : 0},${i === max ? 255 : 0},0)`,
                label: i === max ? labels[i] : "-"
            });
        });
        return results;
    }

    const scale = 0.3;
    const ui = new GameUi({ width: 20, height: 20, unit: scale * window.innerWidth / 20, pad: 1 }, "board");
    const computer = new Computer(ui.game);
    let net;

    GameUi.animate(() => {
        const result = (learn.best || [])[0] || {};
        if (result.weights) {
            if (net === undefined) {
                net = new Net(scale * window.innerWidth, scale * window.innerWidth, "net", result.weights, outputTexts);
            }
            const input = computer.calculateInput();
            const layers = computer.step(result.weights);
            ui.draw();
            net.draw(input, result.weights, layers);
            if (ui.game.lives <= 0) {
                ui.game.reset();
            }
        }
    }, 100);
});
