// app/javascript/channels/states/tree_state.js
export class TreeState {
  constructor(game) {
    this.game = game;
  }

  handleResourceCollected(data) {
    this.game.handleResourceCollection(data.player_id, data.tree_id);
  }

  handleTreeLocations(data) {
    if (!this.game.localPlayer || this.game.trees.size === 0) {
      this.game.syncTrees(data.trees);
    }
  }

  getTreeData() {
    return Array.from(this.game.treeLocations.entries()).map(([id, pos]) => ({
      id,
      x: pos.x,
      y: pos.y,
      resources: this.game.trees.get(id)?.resources || this.game.config.woodPerTree
    }));
  }
}