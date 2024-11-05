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
    // Request game state immediately after connection
    this.requestGameState();
  }

  disconnected() {
    console.log("Disconnected from game channel");
  }

  received(data) {
    console.log("Received:", data);
    switch (data.type) {
      case 'new_player':
        this.game.addPlayer(data.player_id, data.x, data.y);
        // If we're already in game, share our state with the new player
        if (this.game.localPlayer && data.player_id !== this.game.localPlayer.id) {
          console.log('Sharing state with new player:', data.player_id);
          this.sendPlayerState(data.player_id);
        }
        break;

      case 'player_left':
        this.game.removePlayer(data.player_id);
        break;

      case 'player_moved':
        this.game.updatePlayerPosition(data.player_id, data.x, data.y);
        break;

      case 'player_state':
        if (data.requesting_player_id === this.game.localPlayer?.id ||
            !this.game.players.has(data.player_id)) {
          console.log('Received player state:', data);
          this.game.addOrUpdatePlayer(data);
        }
        break;

      case 'request_game_state':
        // When someone requests state, share our state if we're already playing
        if (this.game.localPlayer && data.player_id !== this.game.localPlayer.id) {
          console.log('Sending state to requesting player:', data.player_id);
          this.sendPlayerState(data.player_id);
        }
        // If we're host, also share tree state
        if (this.game.isHost && this.game.trees.size > 0) {
          this.shareTreeLocations(this.game.getTreeData());
        }
        break;

      case 'tree_locations':
        if (!this.game.isHost && !this.game.treesInitialized) {
          this.game.syncTrees(data.trees);
        }
        break;

      case 'resource_collected':
        this.game.handleResourceCollection(data.player_id, data.tree_id);
        break;
    }
  }

  sendPlayerState(requestingPlayerId) {
    this.subscription.perform('player_state', {
      requesting_player_id: requestingPlayerId,
      x: this.game.localPlayer.position.x,
      y: this.game.localPlayer.position.y,
      resources: this.game.localPlayer.resources
    });
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