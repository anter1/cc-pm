System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var Feature, CitySpec, RoadSpec, FarmSpec, TileSpec;
    return {
        setters: [],
        execute: function () {
            (function (Feature) {
                Feature[Feature["None"] = 0] = "None";
                Feature[Feature["Monastery"] = 1] = "Monastery";
                Feature[Feature["Garden"] = 2] = "Garden";
            })(Feature || (Feature = {}));
            exports_1("Feature", Feature);
            CitySpec = class CitySpec {
                constructor(hasShield, edges) {
                    this.hasShield = hasShield;
                    this.edges = edges;
                    this.validate();
                }
                validate() {
                    for (let edge of this.edges) {
                        if (edge < 0 || edge >= 4) {
                            throw new Error("Invalid city edge");
                        }
                    }
                }
            };
            exports_1("CitySpec", CitySpec);
            RoadSpec = class RoadSpec {
                constructor(edges) {
                    this.edges = edges;
                    this.validate();
                }
                validate() {
                    for (let edge of this.edges) {
                        if (edge < 0 || edge >= 4) {
                            throw new Error("Invalid road edge");
                        }
                    }
                }
            };
            exports_1("RoadSpec", RoadSpec);
            FarmSpec = class FarmSpec {
                constructor(edges) {
                    this.edges = edges;
                    this.validate();
                }
                validate() {
                    for (let edge of this.edges) {
                        if (edge < 0 || edge >= 8) {
                            throw new Error("Invalid road edge");
                        }
                    }
                }
            };
            exports_1("FarmSpec", FarmSpec);
            TileSpec = class TileSpec {
                constructor(feature, cities, shields, roads, farms) {
                    this.feature = feature;
                    this.cities = new Map();
                    this.cityForEdge = [];
                    if (cities.length != 4) {
                        throw new Error("Invalid cities length: " + cities);
                    }
                    for (let edge = 0; edge < 4; ++edge) {
                        let cityId = cities[edge];
                        if (cityId < 0) {
                            this.cityForEdge.push(null);
                            continue;
                        }
                        if (!this.cities.has(cityId)) {
                            this.cities.set(cityId, new CitySpec(shields && shields.has(cityId), [edge]));
                        }
                        else {
                            this.cities.get(cityId).edges.push(edge);
                        }
                        this.cityForEdge.push(this.cities.get(cityId));
                    }
                    this.roads = new Map();
                    this.roadForEdge = [];
                    if (roads.length != 4) {
                        throw new Error("Invalid roads length: " + roads);
                    }
                    for (let edge = 0; edge < 4; ++edge) {
                        let roadId = roads[edge];
                        if (roadId < 0) {
                            this.roadForEdge.push(null);
                            continue;
                        }
                        if (!this.roads.has(roadId)) {
                            this.roads.set(roadId, new RoadSpec([edge]));
                        }
                        else {
                            this.roads.get(roadId).edges.push(edge);
                        }
                        this.roadForEdge.push(this.roads.get(roadId));
                    }
                    this.farms = new Map();
                    this.farmForEdge = [];
                    if (farms.length != 8) {
                        throw new Error("Invalid roads length: " + farms);
                    }
                    for (let edge = 0; edge < 8; ++edge) {
                        let farmId = farms[edge];
                        if (farmId < 0) {
                            this.farmForEdge.push(null);
                            continue;
                        }
                        if (!this.farms.has(farmId)) {
                            this.farms.set(farmId, new FarmSpec([edge]));
                        }
                        else {
                            this.farms.get(farmId).edges.push(edge);
                        }
                        this.farmForEdge.push(this.farms.get(farmId));
                    }
                    this.validate();
                }
                validate() {
                    for (let edge = 0; edge < 4; ++edge) {
                        let city = this.cityForEdge[edge];
                        let road = this.roadForEdge[edge];
                        let farm1 = this.farmForEdge[edge * 2];
                        let farm2 = this.farmForEdge[edge * 2 + 1];
                        if (city && road) {
                            throw new Error("Invalid Tile. The same edge cannot have city and road. " + this);
                        }
                        if (city && (farm1 || farm2)) {
                            throw new Error("Invalid Tile. The same edge cannot have farm and city. " + this);
                        }
                        if (!city && (!farm1 || !farm2)) {
                            throw new Error("Invalid Tile. There must be a farm on an edge without a city. " + this);
                        }
                        if (!city && !road && (farm1 != farm2)) {
                            throw new Error("Weird Tile. There is no city and no road on an edge but the farms on the edge are different. " + this);
                        }
                    }
                }
            };
            exports_1("TileSpec", TileSpec);
        }
    };
});
