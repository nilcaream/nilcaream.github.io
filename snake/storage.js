class Storage {

    static load() {
        const stored = window.localStorage.getItem("snake-results") || "[]";
        return JSON.parse(stored);
    }

    static save(results) {
        window.localStorage.setItem("snake-results", JSON.stringify(results));
    }

    static add(results, maxSize = 128) {
        const loadedResults = Storage.load();
        const idToResult = [];
        loadedResults.forEach(r => idToResult[r.id] = r);

        results.forEach(result => {
            result.id = Learn.hash(result.weights);
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
