System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function numEdgesForFeature(feature) {
        switch (feature) {
            case EdgeFeature.City:
            case EdgeFeature.Road:
                return 4;
            case EdgeFeature.Farm:
                return 8;
        }
        throw Error("Unsupported edge feature: " + feature);
    }
    function rotateEdge(feature, edge, rot) {
        while (rot < 0) {
            rot += 4;
        }
        let totalEdges = numEdgesForFeature(feature);
        return edge + totalEdges / 4 * rot;
    }
    var EdgeFeature, TileFeature, oppositeEdges4, oppositeEdges8, EdgeSpec, CitySpec, RoadSpec, FarmSpec, TileSpec;
    return {
        setters: [],
        execute: function () {
            (function (EdgeFeature) {
                EdgeFeature[EdgeFeature["Road"] = 0] = "Road";
                EdgeFeature[EdgeFeature["City"] = 1] = "City";
                EdgeFeature[EdgeFeature["Farm"] = 2] = "Farm";
            })(EdgeFeature || (EdgeFeature = {}));
            exports_1("EdgeFeature", EdgeFeature);
            (function (TileFeature) {
                TileFeature[TileFeature["None"] = 0] = "None";
                TileFeature[TileFeature["Monastery"] = 1] = "Monastery";
                TileFeature[TileFeature["Garden"] = 2] = "Garden";
            })(TileFeature || (TileFeature = {}));
            exports_1("TileFeature", TileFeature);
            oppositeEdges4 = [
                [-1, 0, 2],
                [0, 1, 3],
                [1, 0, 0],
                [0, -1, 1],
            ];
            oppositeEdges8 = [
                [-1, 0, 5],
                [-1, 0, 4],
                [0, 1, 7],
                [0, 1, 6],
                [1, 0, 1],
                [1, 0, 0],
                [0, -1, 3],
                [0, -1, 2],
            ];
            EdgeSpec = class EdgeSpec {
                constructor(feature) {
                    this.feature = feature;
                    this.edges = [];
                }
                totalEdges() {
                    return numEdgesForFeature(this.feature);
                }
                *getEdges(rot) {
                    while (rot < 0) {
                        rot += 4;
                    }
                    let numEdges = this.totalEdges();
                    for (let edge of this.edges) {
                        yield (edge + rot * numEdges / 2) % numEdges;
                    }
                }
                oppositeEdge(edge) {
                    if (this.totalEdges() == 4) {
                        return oppositeEdges4[edge];
                    }
                    else if (this.totalEdges() == 8) {
                        return oppositeEdges8[edge];
                    }
                    throw Error("Unsupported number of edges = " + this.totalEdges());
                }
            };
            exports_1("EdgeSpec", EdgeSpec);
            CitySpec = class CitySpec extends EdgeSpec {
                constructor(hasShield) {
                    super(EdgeFeature.City);
                    this.hasShield = hasShield;
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
            RoadSpec = class RoadSpec extends EdgeSpec {
                constructor() {
                    super(EdgeFeature.Road);
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
            FarmSpec = class FarmSpec extends EdgeSpec {
                constructor() {
                    super(EdgeFeature.Farm);
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
                constructor(feature, cities, shields, roads, farms, imgId) {
                    this.imgId = imgId;
                    this.tileFeature = feature;
                    this.allEdgeSpecs = new Map();
                    if (cities.length != 4) {
                        throw new Error("Invalid cities length: " + cities);
                    }
                    this.cityForEdge =
                        this.addEdgeFeatures(cities, function (cityId) { return new CitySpec(shields !== null && shields.has(cityId)); });
                    if (roads.length != 4) {
                        throw new Error("Invalid roads length: " + roads);
                    }
                    this.roadForEdge =
                        this.addEdgeFeatures(roads, function (roadId) { return new RoadSpec(); });
                    if (farms.length != 8) {
                        throw new Error("Invalid roads length: " + farms);
                    }
                    this.farmForEdge =
                        this.addEdgeFeatures(farms, function (farmId) { return new FarmSpec(); });
                    this.validate();
                }
                addEdgeFeatures(edges, edgeSpecFactory) {
                    let featureForEdge = Array();
                    let offset = this.allEdgeSpecs.size;
                    for (let edge = 0; edge < edges.length; ++edge) {
                        let featureId = edges[edge];
                        if (featureId < 0) {
                            featureForEdge.push(null);
                            continue;
                        }
                        featureId += offset;
                        let edgeFeature = this.allEdgeSpecs.get(featureId);
                        if (!edgeFeature) {
                            edgeFeature = edgeSpecFactory(featureId - offset);
                            this.allEdgeSpecs.set(featureId, edgeFeature);
                        }
                        edgeFeature.edges.push(edge);
                        featureForEdge.push(edgeFeature);
                    }
                    return featureForEdge;
                }
                validate() {
                    for (let edgeFeature of this.allEdgeSpecs.values()) {
                        edgeFeature.validate();
                    }
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
                        let corner1 = edge * 2 + 1;
                        let corner2 = (edge * 2 + 2) % 8;
                        let cornerFarm1 = this.farmForEdge[corner1];
                        let cornerFarm2 = this.farmForEdge[corner2];
                        if (cornerFarm1 && cornerFarm2 && cornerFarm1 != cornerFarm2) {
                            throw new Error("Weird Tile. A tile corner has different farms");
                        }
                    }
                }
                edgeSpecForEdge(feature, edge, rot) {
                    let unRotatedEdge = rotateEdge(feature, edge, -rot);
                    let edgeSpecs = this.edgeSpecsForEdge(feature);
                    return edgeSpecs[unRotatedEdge];
                }
                edgeSpecsForEdge(feature) {
                    switch (feature) {
                        case EdgeFeature.City:
                            return this.cityForEdge;
                        case EdgeFeature.Road:
                            return this.roadForEdge;
                        case EdgeFeature.Farm:
                            return this.farmForEdge;
                    }
                    throw "Unknown feature + " + feature;
                }
                *edgeSpecsForFeature(feature) {
                    for (let edgeSpec of this.allEdgeSpecs.values()) {
                        if (edgeSpec.feature === feature) {
                            yield edgeSpec;
                        }
                    }
                }
                imgUrl() {
                    return "static/img/tiles/" + this.imgId + ".png";
                }
            };
            exports_1("TileSpec", TileSpec);
        }
    };
});
