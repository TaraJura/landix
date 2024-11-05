// app/javascript/game.js
import { Player } from './entities/player';
import { GameConnection } from './channels/game_channel';

export class Game {
  constructor() {
    this.players = new Map();
    this.playersContainer = document.getElementById('players-container');
    this.connection = new GameConnection(this);
    this.isHost = false;
    this.setupControls();
    this.setupResizeHandler();
    this.startGameLoop();
  }

  initializeGame(isFirstPlayer = false) {
    this.isHost = isFirstPlayer;
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
        ('Local player initialized:', playerId);
        this.connection.requestGameState();
      } else {
        ('Remote player joined:', playerId);
      }
    }
  }

  removePlayer(playerId) {
    const player = this.players.get(playerId);
    if (player) {
      player.element.remove();
      this.players.delete(playerId);
      ('Player left:', playerId);
    }
  }

  updatePlayerPosition(playerId, x, y) {
    const player = this.players.get(playerId);
    if (player && !player.isLocal) {
      player.targetPosition = { x, y };
      player.position = { x, y };
      player.updatePosition();
    }
  }

  seededRandom(seed) {
    let value = seed;
    return function() {
      value = value * 16807 % 2147483647;
      return (value - 1) / 2147483646;
    };
  }

  startGameLoop() {
    let lastTimestamp = 0;

    const gameLoop = (timestamp) => {
      const deltaTime = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (this.localPlayer) {
        const oldX = this.localPlayer.position.x;
        const oldY = this.localPlayer.position.y;
        
        const positionUpdated = this.localPlayer.move();
        
        if (positionUpdated && (oldX !== this.localPlayer.position.x || oldY !== this.localPlayer.position.y)) {
          this.connection.sendPlayerMove(
            this.localPlayer.position.x,
            this.localPlayer.position.y
          );
        }
      }

      // Update other players
      this.players.forEach(player => {
        if (!player.isLocal && player.targetPosition) {
          const interpolationSpeed = 0.2;
          player.position.x += (player.targetPosition.x - player.position.x) * interpolationSpeed;
          player.position.y += (player.targetPosition.y - player.position.y) * interpolationSpeed;
          player.updatePosition();
        }
      });

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

  setupResizeHandler() {
    window.addEventListener('resize', () => {
      this.players.forEach(player => {
        player.fieldBoundary = {
          width: window.innerWidth,
          height: window.innerHeight
        };
      });
    });
  }

  addOrUpdatePlayer(data) {
    const { player_id, x, y, resources } = data;
    let player = this.players.get(player_id);
    
    if (player) {
      // Update existing player
      player.position = { x, y };
      player.resources = resources;
      player.updatePosition();
      if (player.isLocal) {
        player.updateInventoryDisplay();
      }
    } else {
      // Create new player
      ('Adding new player from state:', player_id);
      this.addPlayer(player_id, x, y);
      player = this.players.get(player_id);
      if (player) {
        player.resources = resources;
        if (player.isLocal) {
          player.updateInventoryDisplay();
        }
      }
    }
  }
}