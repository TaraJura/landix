// Game configuration
const config = {
  moveSpeed: 10,
  numberOfTrees: 50,  // Increased for better visibility
  treeSize: {
    min: 20,
    max: 40
  }
};

class Tree {
  constructor(x, y) {
    this.element = document.createElement('div');
    this.element.className = 'absolute';
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
    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
  }
}

class Player {
  constructor() {
    this.element = document.getElementById('player');
    this.position = { x: 0, y: 0 };
    this.size = {
      width: this.element.offsetWidth,
      height: this.element.offsetHeight
    };
    this.fieldBoundary = {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  move(direction) {
    const newPosition = { ...this.position };

    switch (direction) {
      case 'w': newPosition.y -= config.moveSpeed; break;
      case 's': newPosition.y += config.moveSpeed; break;
      case 'a': newPosition.x -= config.moveSpeed; break;
      case 'd': newPosition.x += config.moveSpeed; break;
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
}

class Game {
  constructor() {
    this.player = new Player();
    this.trees = [];
    this.treesContainer = document.getElementById('trees-container');
    this.generateTrees();
    this.setupControls();
    this.setupResizeHandler();
  }

  generateTrees() {
    this.treesContainer.innerHTML = '';
    this.trees = [];
  
    for (let i = 0; i < config.numberOfTrees; i++) {
      const x = Math.random() * (window.innerWidth - 40);
      const y = Math.random() * (window.innerHeight - 60);
      
      const tree = new Tree(x, y);
      this.trees.push(tree);
      this.treesContainer.appendChild(tree.element);
    }
  }

  setupControls() {
    document.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      if (['w', 's', 'a', 'd'].includes(key)) {
        event.preventDefault();
        this.player.move(key);
      }
    });
  }

  setupResizeHandler() {
    window.addEventListener('resize', () => {
      this.player.fieldBoundary = {
        width: window.innerWidth,
        height: window.innerHeight
      };
      this.generateTrees();
    });
  }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new Game();
});