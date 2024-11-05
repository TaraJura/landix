// app/javascript/game.js
import { config } from './config';
import { Tree } from './entities/tree';
import { Player } from './entities/player';
import { NotificationManager } from './ui/notifications';
import { GameConnection } from './channels/game_channel';

export class Game {
  constructor() {
    this.players = new Map();
    this.trees = new Map();
    this.treesContainer = document.getElementById('trees-container');
    this.playersContainer = document.getElementById('players-container');
    this.treeLocations = new Map(); // Store tree positions for synchronization
    this.connection = new GameConnection(this);
    this.setupControls();
    this.setupResizeHandler();
    this.startGameLoop();
  }

  initializeGame(isFirstPlayer = false) {
    if (isFirstPlayer) {
      this.generateTrees();
    }
  }

  addPlayer(playerId, initialX = 0, initialY = 0) {
    if (!this.players.has(playerId)) {
      const isLocal = !this.localPlayer;
      const player = new Player(playerId, isLocal);
      player.position = { x: initialX, y: initialY };
      player.updatePosition();
      this.players.set(playerId, player);
      
      if (isLocal) {
        this.localPlayer = player;
        console.log('Local player initialized:', playerId);
        // Request game state from other players
        this.connection.requestGameState();
      } else {
        console.log('Remote player joined:', playerId);
      }
    }
  }

  removePlayer(playerId) {
    const player = this.players.get(playerId);
    if (player) {
      player.element.remove();
      this.players.delete(playerId);
      console.log('Player left:', playerId);
    }
  }

  updatePlayerPosition(playerId, x, y) {
    const player = this.players.get(playerId);
    if (player && !player.isLocal) {
      player.position = { x, y };
      player.updatePosition();
    }
  }

  generateTrees() {
    this.treesContainer.innerHTML = '';
    this.trees.clear();
    this.treeLocations.clear();
  
    for (let i = 0; i < config.numberOfTrees; i++) {
      const treeId = `tree-${i}`;
      const x = Math.random() * (window.innerWidth - 40);
      const y = Math.random() * (window.innerHeight - 60);
      
      this.treeLocations.set(treeId, { x, y });
      const tree = new Tree(treeId, x, y);
      this.trees.set(treeId, tree);
      this.treesContainer.appendChild(tree.element);
    }

    // Share tree positions with other players
    this.shareTreeLocations();
  }

  shareTreeLocations() {
    const treeData = Array.from(this.treeLocations.entries()).map(([id, pos]) => ({
      id,
      x: pos.x,
      y: pos.y,
      resources: this.trees.get(id)?.resources || config.woodPerTree
    }));
    this.connection.shareTreeLocations(treeData);
  }

  syncTrees(treeData) {
    this.treesContainer.innerHTML = '';
    this.trees.clear();
    this.treeLocations.clear();

    treeData.forEach(({ id, x, y, resources }) => {
      this.treeLocations.set(id, { x, y });
      const tree = new Tree(id, x, y);
      tree.resources = resources;
      tree.updateTreeDisplay();
      this.trees.set(id, tree);
      this.treesContainer.appendChild(tree.element);
    });
  }

  startGameLoop() {
    const gameLoop = () => {
      if (this.localPlayer) {
        const oldX = this.localPlayer.position.x;
        const oldY = this.localPlayer.position.y;
        
        this.localPlayer.move();
        
        // Only send update if position changed
        if (oldX !== this.localPlayer.position.x || oldY !== this.localPlayer.position.y) {
          this.connection.sendPlayerMove(
            this.localPlayer.position.x,
            this.localPlayer.position.y
          );
        }
      }
      requestAnimationFrame(gameLoop);
    };
    requestAnimationFrame(gameLoop);
  }

  setupControls() {
    document.addEventListener('keydown', (event) => {
      if (this.localPlayer) {
        const key = event.key.toLowerCase();
        if (['w', 's', 'a', 'd'].includes(key)) {
          event.preventDefault();
          this.localPlayer.startMoving(key);
        }
      }
    });

    document.addEventListener('keyup', (event) => {
      if (this.localPlayer) {
        const key = event.key.toLowerCase();
        if (['w', 's', 'a', 'd'].includes(key)) {
          event.preventDefault();
          this.localPlayer.stopMoving(key);
        }
      }
    });

    document.addEventListener('keypress', (event) => {
      if (event.code === 'Space' && this.localPlayer) {
        event.preventDefault();
        this.collectResources();
      }
    });
  }

  collectResources() {
    if (!this.localPlayer) return;

    this.trees.forEach((tree, treeId) => {
      const distance = Math.sqrt(
        Math.pow(tree.x - this.localPlayer.position.x, 2) + 
        Math.pow(tree.y - this.localPlayer.position.y, 2)
      );

      if (distance < config.collectionRadius && tree.resources > 0) {
        this.connection.sendResourceCollected(treeId);
      }
    });
  }

  handleResourceCollection(playerId, treeId) {
    const tree = this.trees.get(treeId);
    const player = this.players.get(playerId);
    
    if (tree && tree.resources > 0) {
      const collected = tree.collectResource();
      if (player?.isLocal) {
        player.addResource('wood', collected);
        NotificationManager.show(`Collected ${collected} wood!`);
      }
    }
  }

  setupResizeHandler() {
    window.addEventListener('resize', () => {
      this.players.forEach(player => {
        player.fieldBoundary = {
          width: window.innerWidth,
          height: window.innerHeight
        };
      });
      if (this.localPlayer) {
        this.generateTrees();
      }
    });
  }
}