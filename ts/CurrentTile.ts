import {TileSpec} from "./Tile";
import {TurnResult} from "./Turn"

export class CurrentTileRenderer {
  constructor(container: HTMLElement) {
    this.container = container;
    let currentTileElement = this.container.getElementsByClassName("currentTile")[0] as HTMLElement;
    this.leftRotateElement = this.container.getElementsByClassName("leftTurn")[0] as HTMLElement;
    this.rightRotateElement = this.container.getElementsByClassName("rightTurn")[0] as HTMLElement;
    
    if (!currentTileElement || !this.leftRotateElement || !this.rightRotateElement) {
      throw new Error("Invalid container for CurrentTileRenderer");
    }
    
    currentTileElement.style.backgroundColor = "lightGray";
    
    this.currentTileImgElement = container.ownerDocument.createElement("img");
    this.currentTileImgElement.style.width = "100%";
    this.currentTileImgElement.style.height = "100%";
    currentTileElement.appendChild(this.currentTileImgElement);
    
    this.leftRotateElement.addEventListener("click",
      ()=>{
        if (this.onLeftRotateClick) { 
          this.onLeftRotateClick();
        }
      });
    
    this.rightRotateElement.addEventListener("click",
      ()=>{
        if (this.onRightRotateClick) { 
          this.onRightRotateClick();
        }
      });
    
    this.render();
  }
  
  render(): void {
    if (!this.tileSpec) {
      this.currentTileImgElement.style.display = "none";
    } else {
      this.currentTileImgElement.src = this.tileSpec.imgUrl();
      this.currentTileImgElement.style.transform = "rotate(" + (this.rot * 90) + "deg)";
      this.currentTileImgElement.style.display = "block";
    }
  }
  
  setTileSpec(tileSpec: TileSpec|null, rot:number): void {
    this.tileSpec = tileSpec;
    this.rot = rot;
    this.render();
  }
  
  container: HTMLElement;
  leftRotateElement: HTMLElement;
  rightRotateElement: HTMLElement;
  currentTileImgElement: HTMLImageElement;
  
  tileSpec: TileSpec|null;
  rot: number;
  
  onLeftRotateClick: ()=>void;
  onRightRotateClick: ()=>void;
}