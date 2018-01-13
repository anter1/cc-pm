System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function sleep(ms) {
        return new Promise(resolve => window.setTimeout(resolve, ms));
    }
    exports_1("sleep", sleep);
    return {
        setters: [],
        execute: function () {
        }
    };
});
