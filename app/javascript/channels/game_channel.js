// app/javascript/channels/game_channel.js
import consumer from "./consumer";
import { config } from '../config';

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
        // If we're the host, share current tree state with new player
        if (this.game.isHost && this.game.trees.size > 0) {
          this.shareTreeLocations(Array.from(this.game.treeLocations.entries()).map(([id, pos]) => ({
            id,
            x: pos.x,
            y: pos.y,
            resources: this.game.trees.get(id)?.resources || config.woodPerTree,
            seed: this.game.treeSeed
          })));
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
        if (this.game.isHost && this.game.trees.size > 0) {
          const treeData = Array.from(this.game.treeLocations.entries()).map(([id, pos]) => ({
            id,
            x: pos.x,
            y: pos.y,
            resources: this.game.trees.get(id)?.resources || config.woodPerTree,
            seed: this.game.treeSeed
          }));
          this.shareTreeLocations(treeData);
        }
        break;

      case 'tree_locations':
        if (!this.game.isHost && !this.game.treesInitialized) {
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