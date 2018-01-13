import {TileSpec} from "./Tile"

export enum TileType {
  Empty,
  Real,
}

export interface Tile {
  tileType(): TileType;
}

export class EmptyTile implements Tile {
  tileType(): TileType {
    return TileType.Empty;
  }
}

export class RealTile implements Tile {
  constructor(tileSpec: TileSpec, rot:number) {
    this.tileSpec = tileSpec;
    this.rot = rot;
  }
  
  tileType(): TileType {
    return TileType.Real;
  }
  
  tileSpec: TileSpec;
  rot: number;
}

export class Board {
  constructor(initialTile: RealTile) {
    this.tiles = [
      [new EmptyTile(), new EmptyTile(), new EmptyTile()],
      [new EmptyTile(), initialTile, new EmptyTile()],
      [new EmptyTile(), new EmptyTile(), new EmptyTile()]
    ];
    this.width = 3;
    this.height = 3;
    
    this.tempTileY = -1;
    this.tempTileX = -1;
    this.tempTile = null;
    this.tempTileValid = null;
  }
  
  tryPlaceTemporaryTile(y: number, x: number, tileSpec: TileSpec, rot:number): boolean {
    if (y<0 || x<0 || x>=this.width || y>=this.height) {
      return false;
    }
    
    if (this.tiles[y][x].tileType() !== TileType.Empty && !(this.tempTile && this.tempTileY === y && this.tempTileX === x)) {
      return false;
    }
    
    if (this.tempTile) {
      this.tiles[this.tempTileY][this.tempTileX] = new EmptyTile();
    }
    
    this.tempTileY = y;
    this.tempTileX = x;
    this.tiles[y][x] = this.tempTile = new RealTile(tileSpec, rot);
    this.tempTileValid = this.isTempTileValid();
    
    this.onDirty();
    
    return true;
  }
  
  updateTemporaryRot(rot: number): boolean {
    if (!this.tempTile) {
      return false;
    }
    
    return this.tryPlaceTemporaryTile(this.tempTileY, this.tempTileX, this.tempTile.tileSpec, rot);
  }
  
  isTemporary(y:number, x:number) {
    return y==this.tempTileY && x==this.tempTileX;
  }
  
  isTempTileValid(): boolean {
    let tile = this.tempTile;
    
    let foundNeighbor = false;
    for (let edgeSpec of tile.tileSpec.allEdgeSpecs.values()) {
      for (let tileEdge of edgeSpec.getEdges(tile.rot)) {
        let [dy,dx,nedge] = edgeSpec.oppositeEdge(tileEdge);
        let ny = this.tempTileY + dy;
        let nx = this.tempTileX + dx;
        if (ny>=0&&nx>=0&&ny<this.height&&nx<this.width) {
          let nTile = this.tiles[ny][nx];
          if (nTile.tileType() == TileType.Real) {
            foundNeighbor = true;
            let nTileReal = nTile as RealTile;
            let nFeature = nTileReal.tileSpec.edgeSpecForEdge(edgeSpec.feature, nedge, nTileReal.rot);
            if (!nFeature) {
              return false;
            }
          }
        }
      }
    }
    
    return foundNeighbor;
  }
  
  width: number;
  height: number;
  tiles: Tile[][];
  
  tempTileY: number;
  tempTileX: number;
  tempTile: RealTile;
  tempTileValid: boolean;
  
  onDirty: ()=>void;
}

export abstract class TileRenderer {
  constructor(tile:Tile) {
    this.tile = tile;
  }
  
  abstract render(): HTMLElement;
  
  tile: Tile;
  
  onClick: ()=>void;
}

export class EmptyTileRenderer extends TileRenderer {
  constructor(tile:EmptyTile) {
    super(tile);
    this.container = document.createElement("div");
    this.container.style.border = "1px solid grey";
    
    this.container.addEventListener("click", ()=>{
      if (this.onClick) {
        this.onClick();
      }
    });
  }
  
  render(): HTMLElement {
    return this.container;
  }
  
  container: HTMLElement;
}

export class RealTileRenderer extends TileRenderer {
  constructor(tile:RealTile) {
    super(tile);
    this.container = document.createElement("div");
    this.container.style.border = "1px solid grey";
    
    let img = document.createElement("img");
    img.src = tile.tileSpec.imgUrl();arguments
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.transform = "rotate(" + (tile.rot * 90) + "deg)";
    
    this.container.appendChild(img);
  
    this.container.addEventListener("click", ()=>{
      if (this.onClick) {
        this.onClick();
      }
    });
  }
  
  render(): HTMLElement {
    return this.container;
  }
  
  container: HTMLElement;
  tile: RealTile;
}

function createTileRenderer(tile:Tile): TileRenderer {
  switch(tile.tileType()) {
    case TileType.Empty:
      return new EmptyTileRenderer(tile as EmptyTile);
    case TileType.Real:
      return new RealTileRenderer(tile as RealTile);
  }
  
  throw new Error("Unsupported tileType: " + tile.tileType);
}

export class BoardRenderer {
  constructor(board: Board, container: HTMLElement) {
    this.board = board;
    this.container = container;
    this.rendererCache = new Map<Tile, TileRenderer>();
    
    this.board.onDirty = this.onBoardDirtied;
    
    this.render();
    document.defaultView.addEventListener("resize", this.onresize);
  }
  
  onresize = () => {
    if (this.lastRenderedWidth != this.container.offsetWidth ||
        this.lastRenderedHeight != this.container.offsetHeight) {
      this.render();
    }
  }
  
  onBoardDirtied = () => {
    this.render();
  }
  
  render(): void {
    let newRendererCache = new Map<Tile,TileRenderer>();
    
    let totalWidth = this.container.offsetWidth;
    let totalHeight = this.container.offsetHeight;
    
    this.lastRenderedHeight = totalHeight;
    this.lastRenderedWidth = totalWidth;
    
    let itemWidth = totalWidth / this.board.width;
    let itemHeight = totalHeight / this.board.height;
     
    let itemSize = Math.min(itemWidth, itemHeight);
    
    let offsetX = (totalWidth - itemSize * this.board.width) / 2;
    let offsetY = (totalHeight - itemSize * this.board.height) / 2;
    
    let tempTileOverlay = this.getTempTileOverlay();
    tempTileOverlay.style.display = "none";
    
    let y = 0;
    for (let row of this.board.tiles) {
      let x = 0;
      for (let tile of row) {
        let renderer = this.rendererForTile(tile);
        newRendererCache.set(tile, renderer);
        
        let cy = y;
        let cx = x;
        renderer.onClick = ()=>{if (this.onClick) {this.onClick(cy,cx)}};
        
        let tileElement = renderer.render();
        tileElement.style.width = itemSize + "px";
        tileElement.style.height = itemSize + "px";
        tileElement.style.left = x * itemSize + offsetX + "px";
        tileElement.style.top = y * itemSize + offsetY + "px";
        tileElement.style.position = "absolute";
        
        if (this.board.isTemporary(y,x)) {
          tempTileOverlay.style.display = "block";
          tempTileOverlay.style.width = itemSize + "px";
          tempTileOverlay.style.height = itemSize + "px";
          tempTileOverlay.style.left = x * itemSize + offsetX + "px";
          tempTileOverlay.style.top = y * itemSize + offsetY + "px";
          if (this.board.tempTileValid) {
            tempTileOverlay.style.border = "10px solid blue";
          } else {
            tempTileOverlay.style.border = "10px solid red";
          }
        }
        
        this.container.appendChild(tileElement);
        ++x;
      }
      ++y;
    }
    
    let oldRendererCache = this.rendererCache;
    this.rendererCache = newRendererCache;
    
    for (let [tile, tileRenderer] of oldRendererCache) {
      if (!newRendererCache.get(tile)) {
        tileRenderer.render().remove();
      }
    }
  }
  
  rendererForTile(tile:Tile): TileRenderer {
    let tileRenderer = this.rendererCache.get(tile);
    if (!tileRenderer) {
      tileRenderer = createTileRenderer(tile);
    }
    
    return tileRenderer;
  }
  
  getTempTileOverlay(): HTMLElement {
    if (this.tempTileOverlay) {
      return this.tempTileOverlay;
    }
    
    this.tempTileOverlay = this.container.ownerDocument.createElement("div");
    this.tempTileOverlay.style.backgroundColor = "#A0A000";
    this.tempTileOverlay.style.opacity = "0.5";
    this.tempTileOverlay.style.position = "absolute";
    this.tempTileOverlay.style.zIndex = "1";
    
    this.container.appendChild(this.tempTileOverlay);
    
    return this.tempTileOverlay;
  }
  
  container: HTMLElement;
  board: Board;
  rendererCache: Map<Tile, TileRenderer>;
  
  tempTileOverlay: HTMLElement;
  
  lastRenderedWidth: number;
  lastRenderedHeight: number;
  
  onClick: (y: number, x: number) => void;
}