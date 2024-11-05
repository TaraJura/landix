// app/javascript/entities/tree.js
import { config } from '../config';

export class Tree {
  constructor(id, x, y) {
    this.id = id;
    this.element = document.createElement('div');
    this.element.id = `tree-${id}`;
    this.element.className = 'absolute';
    this.resources = config.woodPerTree;
    this.x = x;
    this.y = y;
    this.updateTreeDisplay();
  }

  updateTreeDisplay() {
    if (this.resources <= 0) {
      this.element.style.display = 'none';
      return;
    }

    this.element.style.display = 'block';
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
    this.element.innerHTML = `
      <div class="relative">
        <div class="absolute w-4 h-8 bg-yellow-800 left-1/2 -translate-x-1/2"></div>
        <div class="absolute w-0 h-0 
                    border-l-[16px] border-r-[16px] border-b-[24px] 
                    border-l-transparent border-r-transparent border-b-green-700 
                    -top-6 left-1/2 -translate-x-1/2"></div>
        <div class="absolute w-0 h-0 
                    border-l-[20px] border-r-[20px] border-b-[30px] 
                    border-l-transparent border-r-transparent border-b-green-800 
                    -top-12 left-1/2 -translate-x-1/2"></div>
      </div>
    `;
  }

  collectResource() {
    if (this.resources > 0) {
      const collected = this.resources;
      this.resources = 0;
      this.updateTreeDisplay();
      return collected;
    }
    return 0;
  }
}