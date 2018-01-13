export enum EdgeFeature {
  Road,
  City,
  Farm,
}

export enum TileFeature {
  None,
  Monastery,
  Garden,
}

let oppositeEdges4 = [
  [-1, 0, 2],
  [ 0, 1, 3],
  [ 1, 0, 0],
  [ 0,-1, 1],
];

let oppositeEdges8 = [
  [-1, 0, 5],
  [-1, 0, 4],
  [ 0, 1, 7],
  [ 0, 1, 6],
  [ 1, 0, 1],
  [ 1, 0, 0],
  [ 0,-1, 3],
  [ 0,-1, 2],
];

function numEdgesForFeature(feature:EdgeFeature): number {
  switch(feature) {
    case EdgeFeature.City:
    case EdgeFeature.Road:
      return 4;
    case EdgeFeature.Farm:
      return 8;
  }
  throw Error("Unsupported edge feature: " + feature);
}

function rotateEdge(feature:EdgeFeature, edge:number, rot:number) {
  while (rot<0) {
    rot += 4;
  }
  
  let totalEdges = numEdgesForFeature(feature);
  return edge + totalEdges / 4 * rot; 
}

export abstract class EdgeSpec {
  constructor(feature:EdgeFeature) {
    this.feature = feature;
    this.edges = []; 
  }
  
  abstract validate(): void;
  totalEdges(): number {
    return numEdgesForFeature(this.feature);
  }
  
  *getEdges(rot:number): IterableIterator<number> {
    while (rot<0) {
      rot += 4;
    }
    let numEdges = this.totalEdges();
    for (let edge of this.edges) {
      yield (edge + rot * numEdges / 2) % numEdges;
    }
  }
  
  oppositeEdge(edge:number):[number, number, number] {
    if (this.totalEdges() == 4) {
      return oppositeEdges4[edge] as [number, number, number];
    } else if (this.totalEdges() == 8) {
      return oppositeEdges8[edge] as [number, number, number];
    }
    
    throw Error("Unsupported number of edges = " + this.totalEdges());
  }
  
  feature: EdgeFeature;
  edges: number[];
}

export class CitySpec extends EdgeSpec {
  constructor(hasShield: boolean) {
    super(EdgeFeature.City);
    this.hasShield = hasShield;
    this.validate();
  }
  
  validate(): void {
    for (let edge of this.edges) {
      if (edge < 0 || edge >= 4) {
        throw new Error("Invalid city edge");
      }
    }
  }
  
  hasShield: boolean;
}

export class RoadSpec extends EdgeSpec {
  constructor() {
    super(EdgeFeature.Road);
    this.validate();
  }
  
  validate(): void {
    for (let edge of this.edges) {
      if (edge < 0 || edge >= 4) {
        throw new Error("Invalid road edge");
      }
    }
  }
}

export class FarmSpec extends EdgeSpec {
  constructor() {
    super(EdgeFeature.Farm);
    this.validate();
  }
  
  validate(): void {
    for (let edge of this.edges) {
      if (edge < 0 || edge >= 8) {
        throw new Error("Invalid road edge");
      }
    }
  }
}

export class TileSpec
{
  constructor(feature: TileFeature, cities:number[], shields:Set<number>|null, roads:number[], farms:number[], imgId:string) {
    this.imgId = imgId;
    this.tileFeature = feature;
    this.allEdgeSpecs = new Map();
    
    if (cities.length != 4) {
      throw new Error("Invalid cities length: " + cities);
    }
    this.cityForEdge = 
      this.addEdgeFeatures(cities, function(cityId:number) {return new CitySpec(shields !== null && shields.has(cityId));}) as Array<CitySpec|null>;
    
    if (roads.length != 4) {
      throw new Error("Invalid roads length: " + roads)
    }
    this.roadForEdge = 
      this.addEdgeFeatures(roads, function(roadId:number) {return new RoadSpec();}) as Array<RoadSpec|null>;
    
    if (farms.length != 8) {
      throw new Error("Invalid roads length: " + farms)
    }
    this.farmForEdge = 
      this.addEdgeFeatures(farms, function(farmId:number) {return new FarmSpec();}) as Array<FarmSpec|null>;
    
    this.validate();
  }
  
  addEdgeFeatures(edges:number[], edgeSpecFactory:(id: number) => EdgeSpec): Array<EdgeSpec|null> {
    let featureForEdge = Array<EdgeSpec|null>();
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
  
  validate(): void {
    for (let edgeFeature of this.allEdgeSpecs.values()) {
      edgeFeature.validate();
    }
    
    for (let edge = 0; edge < 4; ++edge) {
      let city = this.cityForEdge[edge];
      let road = this.roadForEdge[edge];
      let farm1 = this.farmForEdge[edge*2];
      let farm2 = this.farmForEdge[edge*2+1];
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
  
  edgeSpecForEdge(feature:EdgeFeature, edge:number, rot:number) {
    let unRotatedEdge = rotateEdge(feature, edge, -rot);
    let edgeSpecs = this.edgeSpecsForEdge(feature);
    
    return edgeSpecs[unRotatedEdge];
  }
  
  edgeSpecsForEdge(feature:EdgeFeature): Array<EdgeSpec|null> {
    switch(feature) {
      case EdgeFeature.City:
        return this.cityForEdge;
      case EdgeFeature.Road:
        return this.roadForEdge;
      case EdgeFeature.Farm:
        return this.farmForEdge;
    }
    throw "Unknown feature + " + feature;
  }
  
  *edgeSpecsForFeature(feature:EdgeFeature): IterableIterator<EdgeSpec> {
    for (let edgeSpec of this.allEdgeSpecs.values()) {
      if (edgeSpec.feature === feature) {
        yield edgeSpec;
      }
    }
  }
  
  imgUrl(): string {
    return "static/img/tiles/" + this.imgId + ".png";
  }
  
  imgId: string;
  tileFeature: TileFeature;
  allEdgeSpecs: Map<number,EdgeSpec>;
  cityForEdge: Array<CitySpec|null>;
  roadForEdge: Array<RoadSpec|null>;
  farmForEdge: Array<FarmSpec|null>;
}

