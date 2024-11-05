// app/javascript/entities/player.js
import { config } from '../config';

export class Player {
  constructor(id, isLocal = false) {
    this.id = id;
    this.isLocal = isLocal;
    this.position = { x: 0, y: 0 };
    this.targetPosition = { x: 0, y: 0 };
    this.resources = { wood: 0 };
    this.keysPressed = new Set();
    this.lastMoveTime = 0;
    this.moveThrottleInterval = config.movementThrottle;
    
    // Create player element
    this.element = document.createElement('div');
    this.element.id = `player-${id}`;
    this.element.className = `absolute w-8 h-8 ${isLocal ? 'bg-blue-500' : 'bg-red-500'} rounded-full z-10`;
    document.getElementById('players-container').appendChild(this.element);
    
    this.size = {
      width: config.playerSize,
      height: config.playerSize
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
    const step = config.playerSpeed * diagonalModifier;

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
    // Use left/top for better cross-browser compatibility
    this.element.style.left = `${Math.round(this.position.x)}px`;
    this.element.style.top = `${Math.round(this.position.y)}px`;
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