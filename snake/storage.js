class Storage {

    static load() {
        const stored = window.localStorage.getItem("snake-results") || "[]";
        return JSON.parse(stored);
    }

    static save(results) {
        window.localStorage.setItem("snake-results", JSON.stringify(results));
    }

    static add(results, maxSize = 1024) {
        const stored = Storage.load();
        results.filter(result => !Storage.contains(result, stored)).forEach(result => stored.push(result));
        stored.sort((a, b) => b.score - a.score);
        Storage.save(stored.slice(0, maxSize));
    }

    static contains(needle, haystack) {
        for (let i = 0; i < haystack.length; i++) {
            const hay = haystack[i];
            if (needle.score === hay.score && needle.points === hay.points && needle.age === hay.age) {
                return true;
            }
        }
        return false;
    }
}
