// app/javascript/entities/tree.js
import { config } from '../config';

export class Tree {
  constructor(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.resources = config.woodPerTree;
    this.element = this.createElement();
    this.updateTreeDisplay();
  }

  createElement() {
    const element = document.createElement('div');
    element.id = this.id;
    element.className = 'absolute transition-all duration-300';
    element.style.left = `${this.x}px`;
    element.style.top = `${this.y}px`;
    return element;
  }

  updateTreeDisplay() {
    if (this.resources <= 0) {
      this.element.style.opacity = '0';
      this.element.style.transform = 'scale(0.8)';
      setTimeout(() => {
        this.element.style.display = 'none';
      }, 300);
      return;
    }

    this.element.style.display = 'block';
    this.element.style.opacity = '1';
    this.element.style.transform = 'scale(1)';
    
    // Calculate tree size based on remaining resources
    const healthPercent = this.resources / config.woodPerTree;
    const sizeClass = healthPercent < 0.3 ? 'small' : healthPercent < 0.6 ? 'medium' : 'large';

    this.element.innerHTML = `
      <div class="relative ${sizeClass}">
        <div class="absolute w-4 h-8 bg-yellow-800 left-1/2 -translate-x-1/2"></div>
        <div class="absolute w-0 h-0 
                    border-l-[16px] border-r-[16px] border-b-[24px] 
                    border-l-transparent border-r-transparent border-b-green-700 
                    -top-6 left-1/2 -translate-x-1/2"></div>
        <div class="absolute w-0 h-0 
                    border-l-[20px] border-r-[20px] border-b-[30px] 
                    border-l-transparent border-r-transparent border-b-green-800 
                    -top-12 left-1/2 -translate-x-1/2"></div>
        ${this.resources < config.woodPerTree ? 
          `<div class="absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-900/75 text-white px-2 py-1 rounded text-xs">
            ${this.resources}/${config.woodPerTree}
          </div>` : ''}
      </div>
    `;
  }

  collectResource() {
    if (this.resources > 0) {
      const collected = Math.min(this.resources, 1);
      this.resources -= collected;
      this.updateTreeDisplay();
      return collected;
    }
    return 0;
  }

  setResources(amount) {
    this.resources = amount;
    this.updateTreeDisplay();
  }
}