'use strict';

// this is stupid, I know. temp solution for prototyping.

const configuration = {
    "columns": {
        name: "Columns",
        type: "columns",
        lists: [
            {
                id: "list-a",
                name: "List A",
                size: 1
            },
            {
                id: "list-b",
                name: "List B",
                size: 2
            },
            {
                id: "list-c",
                name: "List C",
                size: 3
            }
        ]
    },
    "rows": {
        name: "Rows",
        type: "rows",
        lists: [
            {
                id: "list-a",
                name: "List A",
                size: 1
            },
            {
                id: "list-b",
                name: "List B",
                size: 2
            },
            {
                id: "list-c",
                name: "List C",
                size: 3
            }
        ]
    },
    "grid": {
        name: "Grid",
        type: "grid",
        cells: [
            [{
                type: "columns",
                lists: [
                    {
                        id: "list-a",
                        name: "List A - Top-Left",
                        size: 1
                    },
                    {
                        id: "list-b",
                        name: "List B - Top-Left",
                        size: 2
                    }
                ]
            }, {
                type: "rows",
                lists: [
                    {
                        id: "list-a",
                        name: "List A - Top-Right",
                        size: 4
                    },
                    {
                        id: "list-b",
                        name: "List B - Top-Right",
                        size: 5
                    },
                    {
                        id: "list-c",
                        name: "List C - Top-Right",
                        size: 6
                    }
                ]
            }],
            [{
                type: "rows",
                lists: [
                    {
                        id: "list-a",
                        name: "List A - Bottom-Left",
                        size: 2
                    },
                    {
                        id: "list-b",
                        name: "List B - Bottom-Left",
                        size: 3
                    }
                ]
            }, {
                type: "columns",
                lists: [
                    {
                        id: "list-a",
                        name: "List A - Bottom-Right",
                        size: 2
                    },
                    {
                        id: "list-b",
                        name: "List B - Bottom-Right",
                        size: 1
                    }
                ]
            }]
        ]
    }
};
