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

        updateList(index, key, value) {
            const lists = [];

            Object.values(this.data).forEach(container => {
                container.cells.forEach(row => row.forEach(cell => cell.lists.forEach(list => lists.push(list))));
            });

            lists[index][key] = value;
            console.log(`Updated property index:${index} ${key}:${value}`);
            this.save();
        }
    };

    const items = {

        data: [],

        modified: false,

        localKey: "nc.items.2",

        startAutoSave() {
            setInterval(() => {
                if (this.modified) {
                    this.save();
                }
            }, 2000);
        },

        load() {
            this.data = JSON.parse(window.localStorage.getItem(this.localKey) || "[]");
            this.modified = false;
            console.log(`Loaded ${this.data.length} items`);
        },

        save() {
            window.localStorage.setItem(this.localKey, JSON.stringify(this.data));
            this.modified = false;
            console.log(`Saved ${this.data.length} items`);
        },

        addToHistory(itemOrId, message) {
            const item = itemOrId.history === undefined ? this.data.filter(i => i.id === itemOrId)[0] : itemOrId;
            item.history[new Date().getTime().toString()] = message;
            this.modified = true;
        },

        createItem() {
            const item = {
                id: new Date().getTime().toString(36) + Math.random().toString(36).substr(-4),
                history: {},
                lists: {},
                content: "New item"
            }
            this.addToHistory(item, "created");
            this.data.push(item);
            console.log(`Created item ${item.id}`);
            this.modified = true;
            return item;
        },

        updateItem(item) {
            console.log(`Updated item ${item.id}`);
            this.modified = true;
        },

        updateLists(listId, itemIds) {
            // set list index on each item present on the list
            itemIds.map(id => this.data.filter(item => item.id === id)[0]).forEach((item, index) => {
                item.lists[listId] = index + 100;
                console.log(`Updated list ${listId}: item ${item.id} index ${item.lists[listId]}`);
            });
            // remove list index on items not present on the list
            this.data.filter(item => itemIds.indexOf(item.id) === -1).filter(item => item.lists[listId]).forEach(item => {
                delete item.lists[listId];
                console.log(`Updated list ${listId}: item ${item.id} index (removed)`);
            });
            this.modified = true;
        }
    };

    const colorPicker = {

        picker: undefined,

        visible: false,

        container: undefined,

        onFinish: undefined,

        initialize(onFinish) {
            const size = Math.round(0.5 * Math.min(window.innerWidth, window.innerHeight));
            this.onFinish = onFinish;
            this.picker = new iro.ColorPicker("#picker", {
                width: size
            });
            this.picker.on("color:change", color => this.update(color.hexString));
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

    const view = {

        // OK
        createTabs(configurationData) {
            const root = $("#items");
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

        // OK
        createItemList(containerDiv) {
            const ul = $("<ul></ul>").addClass("items");
            const menu = $("<div></div>").addClass("menu");
            const addMenu = $("<div></div>").text("+").addClass("add");
            const title = $("<div></div>").text(containerDiv.attr("data-list-name")).addClass("title");
            const widthUp = $("<div></div>").text("W").addClass("plus").attr("data-change-key", "width").attr("data-change-value", "+1");
            const widthDown = $("<div></div>").text("w").addClass("minus").attr("data-change-key", "width").attr("data-change-value", "-1");
            const heightUp = $("<div></div>").text("H").addClass("plus").attr("data-change-key", "height").attr("data-change-value", "+1");
            const heightDown = $("<div></div>").text("h").addClass("minus").attr("data-change-key", "height").attr("data-change-value", "-1");
            const picker = $("<div></div>").text("RGB").addClass(["plus", "rgb"]);

            const ulWrapper = $("<div></div>").addClass("wrapper").append(ul);
            menu.append([addMenu, title, widthUp, widthDown, heightUp, heightDown, picker]);

            containerDiv.append([menu, ulWrapper]);
        },

        // OK
        createItemLists() {
            $("#items > div.tab").each((_, e) => {
                const tabDiv = $(e);
                tabDiv.find("div.cell").each((_, e) => {
                    const containerDiv = $(e);
                    this.createItemList(containerDiv);
                });
            });
        },

        // OK
        updateContent(item, contentDiv, onUpdate) {
            contentDiv.closest("li.item").removeClass("editing");
            contentDiv.attr("contenteditable", "false");
            const content = contentDiv.text().trim();
            if (content !== item.content) {
                item.content = content;
                $(`li[data-item-id=${item.id}] div.content`).text(item.content);
                onUpdate(item);
            }
        },

        // OK
        createItem(item, onUpdate) {
            const li = $("<li></li>").addClass("item").attr("data-item-id", item.id);
            const contentDiv = $("<div></div>").addClass("content")
                .text(item.content)
                .focusout(() => this.updateContent(item, contentDiv, onUpdate))
                .on("keydown", e => e.code === "Enter" ? this.updateContent(item, contentDiv, onUpdate) : undefined);
            const infoDiv = $("<div></div>").addClass("info");
            const ordersDiv = $("<div></div>").addClass("orders");
            const editDiv = $("<div></div>").addClass("edit").text("e").click(_ => {
                if (contentDiv.attr("contenteditable") === "true") {
                    this.updateContent(item, contentDiv, onUpdate);
                } else {
                    contentDiv.closest("li.item").addClass("editing");
                    contentDiv.attr("contenteditable", "true");
                    contentDiv.focus();
                }
            });

            Object.keys(item.lists).sort().forEach(o => ordersDiv.append($("<div></div>").text(o)));

            infoDiv.append(ordersDiv).append(editDiv);
            li.append(contentDiv).append(infoDiv);
            return li;
        },

        // OK
        renderItem(item, onUpdate) {
            const listIds = Object.keys(item.lists);
            $("div.cell").each((_, e) => {
                const cell = $(e);
                const listId = cell.attr("data-list-id");
                const backgroundColor = cell.attr("data-background-color");
                const excludes = (cell.attr("data-list-excludes") || "").split(",");
                if (listIds.indexOf(listId) >= 0 && !excludes.some(e => listIds.indexOf(e) >= 0)) {
                    const ul = cell.find("ul.items");
                    const li = this.createItem(item, onUpdate);
                    li.css("background-color", backgroundColor);
                    ul.append(li);
                }
            });
        }
    };

    const ui = {

        view: undefined,

        configuration: undefined,

        items: undefined,

        colorPicker: undefined,

        initialize(view, configuration, items, colorPicker) {
            this.view = view;
            this.configuration = configuration;
            this.items = items;
            this.colorPicker = colorPicker;
        },

        initializeSortable() {
            const resolve = (event, ui) => {
                const ul = $(event.target);
                const li = ui.item.first();
                const cell = ul.closest("div.cell");
                return {
                    ul: ul,
                    li: li,
                    cell: cell,
                    listId: cell.attr("data-list-id"),
                    itemId: li.attr("data-item-id")
                }
            };

            const that = this;

            $(".items").sortable({
                connectWith: ".items",
                dropOnEmpty: true,
                placeholder: "placeholder",
                containment: "#items",
                cursor: "move",
                tolerance: "pointer",
                remove: (event, ui) => {
                    const change = resolve(event, ui);
                    console.log(`Removed ${change.itemId} from ${change.listId}`);
                    that.data.addToHistory(change.itemId, `Removed from ${change.listId}`);
                },
                receive: (event, ui) => {
                    const change = resolve(event, ui);
                    console.log(`Added ${change.itemId} to ${change.listId}`);
                    that.data.addToHistory(change.itemId, `Added to ${change.listId}`);
                },
                start: (event, ui) => {
                    resolve(event, ui).li.toggleClass("moved");
                },
                update(event, ui) {
                    const change = resolve(event, ui);
                    const itemIds = change.ul.find("li.item").toArray().map(x => x.getAttribute("data-item-id"));
                    console.log(`Updated ${change.itemId} on ${change.listId} [${itemIds}]`);
                    that.items.updateLists(change.listId, itemIds);
                    that.renderItems(change.listId);
                },
                stop: (event, ui) => {
                    resolve(event, ui).li.toggleClass("moved");
                }
            });//.disableSelection();
        },

        renderItems(listId) {
            if (listId) {
                $(`div.cell[data-list-id=${listId}] ul.items`).empty();
                this.items.data
                    .filter(item => item.lists[listId])
                    .sort((i1, i2) => i1.lists[listId] - i2.lists[listId])
                    .forEach(item => this.view.renderItem(item, i => this.items.updateItem(i)));
            } else {
                // set of list ids
                Array.from(new Set(this.items.data.map(item => Object.keys(item.lists)))).forEach(listId => this.renderItems(listId));
            }
        },

        start() {
            this.configuration.load();

            this.items.load();
            this.items.startAutoSave();

            this.colorPicker.initialize(cell => {
                const index = parseInt(cell.attr("data-index"));
                const value = cell.attr("data-background-color");
                this.configuration.updateList(index, "backgroundColor", value);
            });

            this.view.createTabs(this.configuration.data);
            this.view.createItemLists();
            this.renderItems();

            this.initializeSortable();

            $("div.menu > div.add").click(e => {
                const button = $(e.target);
                const cell = button.closest("div.cell");
                const listId = cell.attr("data-list-id");
                const item = this.items.createItem();
                item.lists[listId] = 1024;
                this.view.renderItem(item, i => this.items.updateItem(i));
            });

            $("div.menu > div.rgb").click(e => {
                const button = $(e.target);
                const cell = button.closest("div.cell");
                this.colorPicker.select(cell);
            });

            $("div.menu > div[data-change-key]").click(e => {
                const button = $(e.target);
                const changeKey = button.attr("data-change-key");
                const changeValue = button.attr("data-change-value");
                const cell = button.closest("div.cell");
                const listId = cell.attr("data-list-id");
                const index = parseInt(cell.attr("data-index"));

                const clsPrefix = changeKey + "-";
                const classes = cell.attr("class").split(" ").filter(c => c.indexOf(clsPrefix) === 0);
                const current = parseInt(classes.map(c => c.replace(clsPrefix, ""))[0] || "1");
                const updated = Math.max(1, Math.min(5, current + parseInt(changeValue)));
                cell.removeClass(classes).addClass(clsPrefix + updated);

                this.configuration.updateList(index, changeKey, updated);
            });
        },
    };

    // ---------------------

    ui.initialize(view, configuration, items, colorPicker);
    ui.start();

});