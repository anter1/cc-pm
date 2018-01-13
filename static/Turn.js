System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var TurnResult;
    return {
        setters: [],
        execute: function () {
            TurnResult = class TurnResult {
                static notPlacedResult() {
                    return { tilePlaced: false, y: 0, x: 0, rot: 0 };
                }
            };
            exports_1("TurnResult", TurnResult);
        }
    };
});
