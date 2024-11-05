import { config } from '../config';

export class Player {
  constructor(id, isLocal = false) {
    this.id = id;
    this.isLocal = isLocal;
    this.position = { x: 0, y: 0 };
    this.resources = { wood: 0 };
    this.keysPressed = new Set();
    this.lastMoveTime = 0;
    this.moveThrottleInterval = 16; // Approximately 60fps for smooth movement
    this.movementSize = 3; // Fixed movement increment
    
    // Create player element
    this.element = document.createElement('div');
    this.element.id = `player-${id}`;
    this.element.className = `absolute w-8 h-8 ${isLocal ? 'bg-blue-500' : 'bg-red-500'} rounded-full z-10`;
    document.getElementById('players-container').appendChild(this.element);
    
    this.size = {
      width: 32,
      height: 32
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
    if (this.keysPressed.size === 0) return false;

    const currentTime = Date.now();
    if (currentTime - this.lastMoveTime < this.moveThrottleInterval) {
      return false;
    }

    const newPosition = { ...this.position };
    const diagonalModifier = this.keysPressed.size > 1 ? 0.707 : 1;
    const step = this.movementSize * diagonalModifier;

    if (this.keysPressed.has('w')) {
      newPosition.y -= step;
    }
    if (this.keysPressed.has('s')) {
      newPosition.y += step;
    }
    if (this.keysPressed.has('a')) {
      newPosition.x -= step;
    }
    if (this.keysPressed.has('d')) {
      newPosition.x += step;
    }

    if (this.isValidPosition(newPosition)) {
      // Snap directly to new position without any interpolation
      this.position = {
        x: Math.round(newPosition.x),
        y: Math.round(newPosition.y)
      };
      this.updatePosition();
      this.lastMoveTime = currentTime;
      return true;
    }

    return false;
  }

  isValidPosition(position) {
    return position.x >= 0 && 
           position.x <= this.fieldBoundary.width - this.size.width &&
           position.y >= 0 && 
           position.y <= this.fieldBoundary.height - this.size.height;
  }

  updatePosition() {
    // Snap positioning without any CSS transitions
    this.element.style.transform = `translate3d(${Math.round(this.position.x)}px, ${Math.round(this.position.y)}px, 0)`;
  }

  addResource(type, amount) {
    this.resources[type] = (this.resources[type] || 0) + amount;
    this.updateInventoryDisplay();
  }

  updateInventoryDisplay() {
    const inventory = document.getElementById('inventory');
    if (inventory) {
      inventory.innerHTML = `
        <h2 class="font-bold mb-2">Inventory</h2>
        <p>Wood: ${this.resources.wood}</p>
      `;
    }
  }
}

// Update config.js to remove moveSpeed since we're using fixed movement size
export const config = {
  numberOfTrees: 50,
  collectionRadius: 50,
  woodPerTree: 3,
  treeSize: {
    min: 20,
    max: 40
  }
};