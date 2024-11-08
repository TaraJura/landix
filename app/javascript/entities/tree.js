// app/javascript/entities/tree.js
export class Tree {
  constructor(id, x, y) {
    this.id = id;
    this.position = { x, y };
    this.size = { width: 40, height: 40 };
    this.resources = 100;
    this.miningCooldown = false;
    
    // Create tree element with a simpler structure
    this.element = document.createElement('div');
    this.element.id = `tree-${id}`;
    
    // Make it a simple colored square for now to test visibility
    this.element.className = 'absolute w-10 h-10 bg-green-800 z-10';
    
    // Update position and add to container
    this.updatePosition();
    document.getElementById('players-container')?.appendChild(this.element);
  }

  updatePosition() {
    this.element.style.left = `${this.position.x}px`;
    this.element.style.top = `${this.position.y}px`;
  }

  remove() {
    this.element.remove();
  }

  startMiningCooldown() {
    this.miningCooldown = true;
    this.element.style.opacity = '0.5';
    setTimeout(() => {
      this.miningCooldown = false;
      this.element.style.opacity = '1';
    }, 2000);
  }
}