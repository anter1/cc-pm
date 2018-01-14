System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var Menu;
    return {
        setters: [],
        execute: function () {
            Menu = class Menu {
                constructor(container) {
                    this.setEndTurnEnabled = (enabled) => {
                        this.endTurnButton.disabled = !enabled;
                    };
                    this.container = container;
                    this.endTurnButton = this.container.ownerDocument.getElementById("endTurnButton");
                    this.endTurnButton.disabled = true;
                    this.endTurnButton.addEventListener("click", () => {
                        if (this.onEndTurnButtonClicked) {
                            this.onEndTurnButtonClicked();
                        }
                    });
                }
            };
            exports_1("Menu", Menu);
        }
    };
});
