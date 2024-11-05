// app/javascript/channels/states/player_state.js
export class PlayerState {
  constructor(game) {
    this.game = game;
  }

  handleNewPlayer(data) {
    this.game.addPlayer(data.player_id, data.x, data.y);
    // Initialize game for first player
    if (this.game.players.size === 1) {
      this.game.initializeGame(true);
    }
  }

  handlePlayerLeft(data) {
    this.game.removePlayer(data.player_id);
  }

  handlePlayerMoved(data) {
    this.game.updatePlayerPosition(data.player_id, data.x, data.y);
  }

  handlePlayerState(data) {
    // Update or create player with full state
    const player = this.game.players.get(data.player_id);
    if (player) {
      player.position = { x: data.x, y: data.y };
      player.resources = data.resources;
      player.updatePosition();
      if (player.isLocal) {
        player.updateInventoryDisplay();
      }
    } else {
      this.game.addPlayer(data.player_id, data.x, data.y);
      const newPlayer = this.game.players.get(data.player_id);
      if (newPlayer) {
        newPlayer.resources = data.resources;
        if (newPlayer.isLocal) {
          newPlayer.updateInventoryDisplay();
        }
      }
    }
  }
}