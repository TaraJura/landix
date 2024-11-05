// app/javascript/entities/tree.js
import { config } from '../config';

export class Tree {
  constructor(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.resources = config.woodPerTree;
    this.element = this.createElement();
  }

  createElement() {
    const element = document.createElement('div');
    element.id = this.id;
    element.className = 'absolute transition-opacity duration-300';
    element.style.width = `${config.treeSize}px`;
    element.style.height = `${config.treeSize}px`;
    element.style.left = `${this.x}px`;
    element.style.top = `${this.y}px`;
    
    // Simple CSS tree fallback
    element.innerHTML = `
      <div class="w-full h-full relative">
        <div class="absolute bottom-0 w-1/3 h-1/3 bg-yellow-800 left-1/2 -translate-x-1/2"></div>
        <div class="absolute bottom-1/3 w-0 h-0 
                    border-l-[24px] border-r-[24px] border-b-[36px] 
                    border-l-transparent border-r-transparent border-b-green-700 
                    left-1/2 -translate-x-1/2"></div>
      </div>
    `;
    
    return element;
  }

  updateTreeDisplay() {
    if (this.resources <= 0) {
      this.element.style.opacity = '0';
      setTimeout(() => this.element.remove(), 300);
    }
  }

  collectResource() {
    if (this.resources > 0) {
      this.resources -= 1;
      this.updateTreeDisplay();
      return 1;
    }
    return 0;
  }

  setResources(amount) {
    this.resources = amount;
    if (amount <= 0) this.updateTreeDisplay();
  }
}