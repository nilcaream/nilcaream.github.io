class Storage {
    static name() {
        return "nc.snake.v03";
    }

    static load() {
        const stored = window.localStorage.getItem(Storage.name()) || "[]";
        return JSON.parse(stored);
    }

    static save(results) {
        window.localStorage.setItem(Storage.name(), JSON.stringify(results));
    }

    static add(results = [], maxSize = 128) {
        const loadedResults = Storage.load();
        const idToResult = [];
        loadedResults.forEach(r => idToResult[r.id] = r);

        results.forEach(result => {
            const loadedResult = idToResult[result.id];
            if (loadedResult) {
                if (loadedResult.score < result.score) {
                    idToResult[result.id] = result;
                }
            } else {
                idToResult[result.id] = result;
            }
        });

        const newResults = Object.keys(idToResult).map(id => idToResult[id]);
        newResults.sort((a, b) => b.score - a.score);
        Storage.save(newResults.slice(0, maxSize));
    }
}
