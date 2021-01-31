'use strict';

$(() => {
    const configuration = {
        data: {
            columns: {
                name: "Columns 1x1",
                cells: [[{
                    type: "columns",
                    lists: [
                        {
                            id: "list-a",
                            name: "List A",
                            excludes: ["list-d"]
                        }, {
                            id: "list-b",
                            name: "List B"
                        }
                    ]
                }]]
            },
            rows: {
                name: "Rows 1x1",
                cells: [[{
                    type: "rows",
                    lists: [
                        {
                            id: "list-c",
                            name: "List C",
                            excludes: ["list-d"]
                        }, {
                            id: "list-d",
                            name: "List D"
                        }
                    ]
                }]]
            },
            grid: {
                name: "Grid",
                cells: [
                    [
                        {
                            type: "columns",
                            lists: [
                                {
                                    id: "list-a",
                                    name: "List A - Top-Left",
                                }, {
                                    id: "list-b",
                                    name: "List B - Top-Left",
                                }
                            ]
                        },
                        {
                            type: "rows",
                            lists: [
                                {
                                    id: "list-a",
                                    name: "List A - Top-Right",
                                }, {
                                    id: "list-b",
                                    name: "List B - Top-Right",
                                }, {
                                    id: "list-c",
                                    name: "List C - Top-Right",
                                }
                            ]
                        }
                    ], [
                        {
                            type: "rows",
                            lists: [
                                {
                                    id: "list-a",
                                    name: "List A - Bottom-Left",
                                }, {
                                    id: "list-b",
                                    name: "List B - Bottom-Left",
                                }
                            ]
                        }, {
                            type: "columns",
                            lists: [
                                {
                                    id: "list-a",
                                    name: "List A - Bottom-Right",
                                }, {
                                    id: "list-b",
                                    name: "List B - Bottom-Right",
                                }
                            ]
                        }
                    ]
                ]
            }
        },

        localKey: "nc.configuration.2",

        load() {
            this.data = JSON.parse(window.localStorage.getItem(this.localKey)) || this.data;
            console.log(`Loaded ${Object.keys(this.data).length} configuration tabs`);
            return this.data;
        },

        save() {
            window.localStorage.setItem(this.localKey, JSON.stringify(this.data));
            console.log(`Saved ${Object.keys(this.data).length} configuration tabs`);
        },

        get(key) {
            return this.data[key];
        },

        updateList(index, key, value) {
            const lists = [];

            Object.values(this.data).forEach(container => {
                container.cells.forEach(row => row.forEach(cell => cell.lists.forEach(list => lists.push(list))));
            });

            lists[index][key] = value;
            this.save();
        }
    };

    const items = {
        data: {},

        modified: false,

        localKey: "nc.items.2",

        startAutoSave() {
            const that = this;
            setInterval(() => {
                if (that.modified) {
                    that.save();
                }
            }, 2000);
        },

        load() {
            this.data = JSON.parse(window.localStorage.getItem(this.localKey) || "{}");
            this.modified = false;
            console.log(`Loaded ${Object.keys(this.data).length} items`);
        },

        save() {
            window.localStorage.setItem(this.localKey, JSON.stringify(this.data));
            this.modified = false;
            console.log(`Saved ${Object.keys(this.data).length} items`);
        },

        addToHistory(item, message) {
            item.history[new Date().getTime().toString()] = message;
            this.modified = true;
        },

        createItem() {
            const item = {
                id: new Date().getTime().toString(36) + Math.random().toString(36).substr(-4),
                history: {},
                order: {},
                content: "New item"
            }
            this.addToHistory(item, "created");
            this.data[item.id] = item;
            console.log(`Created item ${item.id}`);
            this.modified = true;
            return item;
        },

        getItems(listId, excludes = []) {
            return Object.values(this.data)
                .filter(item => item.order[listId] > 0)
                .filter(item => !Object.keys(item.order).some(o => excludes.includes(o)))
                .sort((i0, i1) => i0.order[listId] - i1.order[listId]);
        },

        setOrder(itemId, listId, order) {
            this.data[itemId].order[listId] = order;
            this.modified = true;
        },

        removeOrder(itemId, listId) {
            delete this.data[itemId].order[listId];
            this.modified = true;
        }
    };

    const colorPicker = {
        picker: undefined,

        visible: false,

        container: undefined,

        onFinish: undefined,

        initialize(onFinish) {
            const that = this;
            const size = Math.round(0.5 * Math.min(window.innerWidth, window.innerHeight));
            this.onFinish = onFinish;
            this.picker = new iro.ColorPicker("#picker", {
                width: size
            });
            this.picker.on("color:change", color => that.update(color.hexString));
            this.picker.on("input:end", () => this.hide());
        },

        update(color) {
            this.container.attr("data-background-color", color);
            this.container.find("li.item").css("background-color", color);
        },

        hide(container) {
            this.visible = false;
            $("#picker").hide();
            this.onFinish(container || this.container);
        },

        select(container) {
            if (this.container && container.attr("data-index") !== this.container.attr("data-index") && this.visible) {
                // change container
            } else if (!this.visible) {
                // show
                this.visible = true;
                $("#picker").show();
            } else {
                // hide
                this.hide(container);
            }
            this.container = container;
            this.picker.color.set(container.attr("data-background-color"));
        }
    };

    const listUi = {

        createTabs(root, configurationData) {
            const ul = $("<ul></ul>");
            root.append(ul);

            let index = 0;

            const addTabButton = (id, name) => ul.append($("<li></li>").append($("<a></a>").attr("href", "#" + id).text(name)));

            const addItemContainer = (parent, list) => {
                const div = $("<div></div>")
                    .addClass(["cell", "width-" + (list.width || 1), "height-" + (list.height || 1)])
                    .attr("data-list-id", list.id)
                    .attr("data-list-name", list.name)
                    .attr("data-list-excludes", (list.excludes || []).join(","))
                    .attr("data-index", index++)
                    .attr("data-background-color", (list.backgroundColor || "#cedaff"));
                parent.append(div);
            };

            for (const [tabId, tabDefinition] of Object.entries(configurationData)) {
                const div = $("<div></div>").attr("id", tabId).addClass("tab");
                addTabButton(tabId, tabDefinition.name);
                tabDefinition.cells.forEach(row => {
                    const container = $("<div></div>").addClass(["line", `width-${row.length}`]);
                    row.forEach(column => {
                        const cell = $("<div></div>").addClass(column.type);
                        column.lists.forEach(list => addItemContainer(cell, list));
                        container.append(cell);
                    });
                    div.append(container);
                });
                root.append(div);
            }

            root.tabs();
        },

        createItemLists(titleText, updateClass, createItem) {
            const ul = $("<ul></ul>").addClass("items");
            const menu = $("<div></div>").addClass("menu");
            const addMenu = $("<div></div>").text("+").addClass("add").click(() => createItem(ul));
            const title = $("<div></div>").text(titleText).addClass("title");
            const widthUp = $("<div></div>").text("W").addClass("plus").click(() => updateClass("width-", 1, 7, -1));
            const widthDown = $("<div></div>").text("w").addClass("minus").click(() => updateClass("width-", 1, 7, 1));
            const heightUp = $("<div></div>").text("H").addClass("plus").click(() => updateClass("height-", 1, 7, 1));
            const heightDown = $("<div></div>").text("h").addClass("minus").click(() => updateClass("height-", 1, 7, -1));
            const picker = $("<div></div>").text("RGB").addClass("plus"); //.click(() => colorPicker.select(container));

            const ulWrapper = $("<div></div>").addClass("wrapper").append(ul);
            menu.append([addMenu, title, widthUp, widthDown, heightUp, heightDown, picker]);

            return [menu, ulWrapper];
        },

        renderItems(tabId, items) {
            $(`#${tabId} div.items-container`).each((_, e) => {
                const container = $(e).empty();
                const listId = container.attr("data-list-id");
                const excludes = (container.attr("data-list-excludes") || "").split(",");

            });
        },

        create2(updateClass, createItem) {
            const that = this;
            $("#items > div.tab").each((_, e) => {
                const tabDiv = $(e);
                tabDiv.find("div.cell").each((_, e) => {
                    const containerDiv = $(e);
                    const children = that.createItemLists(containerDiv.attr("data-list-name"), updateClass, createItem);
                    containerDiv.append(children);
                });
            });
        }
    };

    // ---------------------

    listUi.createTabs($("#items"), configuration.data);
    listUi.create2(() => {
    }, () => {
    });

});