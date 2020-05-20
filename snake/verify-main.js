$(() => {
    const now = () => { let d = new Date(); return new Date(d.getTime() - 60 * 1000 * d.getTimezoneOffset()).toISOString().replace(/[TZ]/g, " ").trim(); };
    const log = (text) => $("#results").prepend($("<div></div>").text(`${now()} ${text}`));
    const results = Storage.load().slice(0, 64);
    const iterations = 256;

    window.addEventListener("error", (e) => log(`Error ${e.message} at ${e.filename}:${e.lineno}:${e.colno}`));

    const worker = new Worker("generic-worker.js");
    worker.postMessage({ initialize: "Verify" });
    worker.postMessage({ override: "publish" });

    const verify = {
        go: (iterations, result) => {
            worker.postMessage({ "method": "go", arguments: [iterations, result] });
        },
        publish: (summary) => {
            const points = `points(${summary.input.points}) ${summary.points.avg.toFixed(0)} ${summary.points.min}-${summary.points.max}`;
            const age = `age(${summary.input.age}) ${summary.age.avg.toFixed(0)} ${summary.age.min}-${summary.age.max}`;
            const cods = Object.keys(summary.cod).sort().reduce((a, b) => `${a} ${b}:${(summary.cod[b] * 100).toFixed(0)}`, "");
            log(`${summary.input.id} ${points} ${age} cod: ${cods}`);
            console.log(summary);
            const result = results.pop();
            if (result) {
                worker.postMessage({ "method": "go", arguments: [iterations, result] });
            }
        }
    };

    worker.onmessage = (event) => {
        console.log("learn-generic-worker-main.js onmessage");
        console.log(event.data);
        if (event.data.property) {
            verify[event.data.property] = event.data.value;
        } else if (event.data.method) {
            verify[event.data.method](...event.data.arguments);
        } else {
            console.log("Unknown event");
        }
    };

    verify.go(iterations, results.pop());
});
