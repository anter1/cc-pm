import {TileSpec, allEdgesAndFeature, oppositeEdge} from "./Tile"

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
    this.tempTileValid = false;
  }
  
  placeTile(y: number, x: number, tileSpec: TileSpec, rot: number): boolean {
    let result = this.placeTileInternal(y,x,tileSpec,rot);
    
    if (result) {
      this.ensureBorder();
    }
    
    this.onDirty();
    return result;
  }
  
  ensureBorder() {
    let okTop = true;
    let okBottom = true;
    for (let i = 0; i < this.width; ++i) {
      if (this.tiles[0][i].tileType() !== TileType.Empty) {
        okTop = false;
      }
      if (this.tiles[this.height - 1][i].tileType() !== TileType.Empty) {
        okBottom = false;
      }
    }
    
    if (!okTop) {
      let newRow = Array<Tile>();
      for (let i = 0; i  < this.width; ++i) {
        newRow.push(new EmptyTile());
      }
      this.tiles.splice(0, 0, newRow);
      ++this.height;
    }
  
    if (!okBottom) {
      let newRow = Array<Tile>();
      for (let i = 0; i  < this.width; ++i) {
        newRow.push(new EmptyTile());
      }
      this.tiles.splice(this.height, 0, newRow);
      ++this.height;
    }
    
    let okLeft = true;
    let okRight = true;
    for (let i = 0; i < this.height; ++i) {
      if (this.tiles[i][0].tileType() !== TileType.Empty) {
        okLeft = false;
      }
      if (this.tiles[i][this.width - 1].tileType() !== TileType.Empty) {
        okRight = false;
      }
    }
    
    if (!okLeft) {
      for (let i = 0; i < this.height; ++i) {
        this.tiles[i].splice(0, 0, new EmptyTile());
      }
      ++this.width;
    }
    
    if (!okRight) {
      for (let i = 0; i < this.height; ++i) {
        this.tiles[i].splice(this.width, 0, new EmptyTile());
      }
      ++this.width;
    }
  }
  
  placeTileInternal(y: number, x: number, tileSpec: TileSpec, rot: number): boolean {
    if (this.tempTile) {
      this.tryPlaceTemporaryTile(this.tempTileY, this.tempTileX, null, 0);
    }
    
    if (y<0 || x<0 || x>=this.width || y>=this.height) {
      return false;
    }
    
    if (this.tiles[y][x].tileType() !== TileType.Empty) {
      return false;
    }
    
    this.tiles[y][x] = new RealTile(tileSpec, rot);
    if (!this.isTileValid(y,x)) {
      this.tiles[y][x] = new EmptyTile();
      return false;
    }
    
    return true;
  }
  
  clearTemporaryTile() {
    if (this.tempTile) {
      this.tiles[this.tempTileY][this.tempTileX] = new EmptyTile();
    }
    
    this.tempTileY = -1;
    this.tempTileX = -1;
    this.tempTile = null;
    this.tempTileValid = false;
  }
  
  tryPlaceTemporaryTile(y: number, x: number, tileSpec: TileSpec|null, rot:number): boolean {
    if (!tileSpec) {
      this.clearTemporaryTile();
      this.onDirty();
      return true;
    }
    
    if (y<0 || x<0 || x>=this.width || y>=this.height) {
      return false;
    }
    
    if (this.tiles[y][x].tileType() !== TileType.Empty && !(this.tempTile && this.tempTileY === y && this.tempTileX === x)) {
      return false;
    }
    
    this.clearTemporaryTile();
    
    this.tempTileY = y;
    this.tempTileX = x;
    this.tiles[y][x] = this.tempTile = new RealTile(tileSpec, rot);
    this.tempTileValid = this.isTileValid(this.tempTileY, this.tempTileX);
    
    this.onDirty();
    return true;
  }
  
  isTemporary(y:number, x:number) {
    return y==this.tempTileY && x==this.tempTileX;
  }
  
  isTileValid(y: number, x: number): boolean {
    let someTile = this.tiles[y][x];
    if (!someTile || someTile.tileType() !== TileType.Real) {
      return false;
    }
    
    let tile = someTile as RealTile;
    
    let foundNeighbor = false;
    for (let [feature, edge] of allEdgesAndFeature()) {
      let edgeSpec = tile.tileSpec.edgeSpecForEdge(feature, edge, tile.rot);
      let [dy,dx,nedge] = oppositeEdge(feature, edge);
      let ny = y + dy;
      let nx = x + dx;
      if (ny>=0&&nx>=0&&ny<this.height&&nx<this.width) {
        let nTile = this.tiles[ny][nx];
        if (nTile.tileType() == TileType.Real) {
          foundNeighbor = true;
          let nTileReal = nTile as RealTile;
          let nFeature = nTileReal.tileSpec.edgeSpecForEdge(feature, nedge, nTileReal.rot);
          if (edgeSpec && !nFeature || !edgeSpec && nFeature) {
            return false;
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
  tempTile: RealTile|null;
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
            tempTileOverlay.style.border = "5px solid blue";
          } else {
            tempTileOverlay.style.border = "5px solid red";
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