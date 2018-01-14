export class Menu {
  constructor(container: HTMLElement) {
    this.container = container;
    
    this.endTurnButton = this.container.ownerDocument.getElementById("endTurnButton") as HTMLButtonElement;
    this.endTurnButton.disabled = true;
    this.endTurnButton.addEventListener("click", () => {
      if (this.onEndTurnButtonClicked) {
        this.onEndTurnButtonClicked();
      }
    });
  }
  
  setEndTurnEnabled = (enabled: boolean) => {
    this.endTurnButton.disabled = !enabled;
  }
  
  container: HTMLElement;
  endTurnButton: HTMLButtonElement;
  
  onEndTurnButtonClicked: ()=>void;
}