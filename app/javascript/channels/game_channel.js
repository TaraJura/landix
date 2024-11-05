// app/javascript/channels/game_channel.js
import consumer from "./consumer"

export class GameConnection {
  constructor(game) {
    this.game = game;
    this.subscription = consumer.subscriptions.create("GameChannel", {
      connected: () => this.connected(),
      disconnected: () => this.disconnected(),
      received: (data) => this.received(data)
    });
  }

  connected() {
    console.log("Connected to game channel");
  }

  disconnected() {
    console.log("Disconnected from game channel");
  }

  received(data) {
    console.log("Received:", data);
    switch (data.type) {
      case 'new_player':
        this.game.addPlayer(data.player_id, data.x, data.y);
        // If we're the first player, initialize the game
        if (this.game.players.size === 1) {
          this.game.initializeGame(true);
        }
        break;

      case 'player_left':
        this.game.removePlayer(data.player_id);
        break;

      case 'player_moved':
        this.game.updatePlayerPosition(data.player_id, data.x, data.y);
        break;

      case 'resource_collected':
        this.game.handleResourceCollection(data.player_id, data.tree_id);
        break;

      case 'request_game_state':
        if (this.game.localPlayer && this.game.trees.size > 0) {
          this.shareTreeLocations(Array.from(this.game.treeLocations.entries()).map(([id, pos]) => ({
            id,
            x: pos.x,
            y: pos.y,
            resources: this.game.trees.get(id)?.resources || config.woodPerTree
          })));
        }
        break;

      case 'tree_locations':
        if (!this.game.localPlayer || this.game.trees.size === 0) {
          this.game.syncTrees(data.trees);
        }
        break;
    }
  }

  requestGameState() {
    this.subscription.perform('request_game_state');
  }

  shareTreeLocations(trees) {
    this.subscription.perform('share_tree_locations', { trees });
  }

  sendPlayerMove(x, y) {
    this.subscription.perform('player_moved', { x, y });
  }

  sendResourceCollected(treeId) {
    this.subscription.perform('resource_collected', { tree_id: treeId });
  }
}