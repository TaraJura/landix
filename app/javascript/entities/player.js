import { config } from '../config';

export class Player {
  constructor(id, isLocal = false) {
    this.id = id;
    this.isLocal = isLocal;
    this.position = { x: 0, y: 0 };
    this.resources = { wood: 0 };
    this.keysPressed = new Set();
    
    // Create player element
    this.element = document.createElement('div');
    this.element.id = `player-${id}`;
    this.element.className = `absolute w-8 h-8 ${isLocal ? 'bg-blue-500' : 'bg-red-500'} rounded-full transition-all duration-100 z-10`;
    document.getElementById('players-container').appendChild(this.element);
    
    this.size = {
      width: 32,  // w-8 = 32px
      height: 32  // h-8 = 32px
    };
    
    this.fieldBoundary = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    if (isLocal) {
      this.updateInventoryDisplay();
    }
  }

  startMoving(key) {
    this.keysPressed.add(key);
  }

  stopMoving(key) {
    this.keysPressed.delete(key);
  }

  move() {
    if (this.keysPressed.size === 0) return;

    const newPosition = { ...this.position };
    const diagonalModifier = this.keysPressed.size > 1 ? 0.707 : 1;

    if (this.keysPressed.has('w')) {
      newPosition.y -= config.moveSpeed * diagonalModifier;
    }
    if (this.keysPressed.has('s')) {
      newPosition.y += config.moveSpeed * diagonalModifier;
    }
    if (this.keysPressed.has('a')) {
      newPosition.x -= config.moveSpeed * diagonalModifier;
    }
    if (this.keysPressed.has('d')) {
      newPosition.x += config.moveSpeed * diagonalModifier;
    }

    if (this.isValidPosition(newPosition)) {
      this.position = newPosition;
      this.updatePosition();
    }
  }

  isValidPosition(position) {
    return position.x >= 0 && 
           position.x <= this.fieldBoundary.width - this.size.width &&
           position.y >= 0 && 
           position.y <= this.fieldBoundary.height - this.size.height;
  }

  updatePosition() {
    this.element.style.left = `${this.position.x}px`;
    this.element.style.top = `${this.position.y}px`;
  }

  addResource(type, amount) {
    this.resources[type] = (this.resources[type] || 0) + amount;
    this.updateInventoryDisplay();
  }

  updateInventoryDisplay() {
    const inventory = document.getElementById('inventory');
    inventory.innerHTML = `
      <h2 class="font-bold mb-2">Inventory</h2>
      <p>Wood: ${this.resources.wood}</p>
    `;
  }
}
