// app/javascript/managers/tree_state_manager.js
import { config } from '../config';
import { Tree } from '../entities/tree';

export class TreeStateManager {
  constructor(game) {
    this.game = game;
    this.trees = new Map();
    this.treeLocations = new Map();
    this.treeSeed = null;
    this.isHost = false;
    this.initialized = false;
    this.container = document.getElementById('trees-container');
    this.fixedWidth = 1920;  // Fixed game world width
    this.fixedHeight = 1080; // Fixed game world height
  }

  initialize(isHost = false) {
    this.isHost = isHost;
    if (isHost) {
      // Host sets the initial seed - using a fixed seed for testing can help verify consistency
      this.treeSeed = Math.floor(Date.now() / 1000); // Use seconds to make it more manageable
      this.generateTrees();
      this.initialized = true;
      this.shareState();
    }
  }

  generateTrees() {
    // Clear existing trees
    this.container.innerHTML = '';
    this.trees.clear();
    this.treeLocations.clear();

    // Initialize PRG with seed
    const random = this.getSeededPRNG(this.treeSeed);

    // Pre-calculate all tree positions to ensure consistency
    const positions = [];
    const minDistance = 60; // Minimum distance between trees

    for (let i = 0; i < config.numberOfTrees; i++) {
      let x, y, tooClose;
      do {
        x = Math.floor(random() * (this.fixedWidth - 80)) + 40;  // Keep away from edges
        y = Math.floor(random() * (this.fixedHeight - 80)) + 40; // Keep away from edges
        tooClose = positions.some(pos => 
          Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2)) < minDistance
        );
      } while (tooClose);

      positions.push({ x, y });
    }

    // Sort positions to ensure consistent ordering
    positions.sort((a, b) => {
      if (a.y === b.y) return a.x - b.x;
      return a.y - b.y;
    });

    // Create trees using sorted positions
    positions.forEach((pos, index) => {
      const treeId = `tree-${index}`;
      this.treeLocations.set(treeId, { x: pos.x, y: pos.y });
      const tree = new Tree(treeId, pos.x, pos.y);
      this.trees.set(treeId, tree);
      this.container.appendChild(tree.element);
    });

    console.log(`Generated ${this.trees.size} trees with seed ${this.treeSeed}`);
  }

  getSeededPRNG(seed) {
    let value = seed;
    
    // More robust PRNG implementation
    function xmur3(str) {
      for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = h << 13 | h >>> 19;
      }
      return function() {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h ^= h >>> 16) >>> 0;
      }
    }

    function mulberry32(a) {
      return function() {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      }
    }

    const seedStr = seed.toString();
    const hash = xmur3(seedStr);
    return mulberry32(hash());
  }

  shareState() {
    if (!this.isHost) return;
    
    const treeData = {
      seed: this.treeSeed,
      trees: Array.from(this.treeLocations.entries()).map(([id, pos]) => ({
        id,
        x: pos.x,
        y: pos.y,
        resources: this.trees.get(id)?.resources || config.woodPerTree
      }))
    };
    
    console.log('Sharing tree state with seed:', this.treeSeed);
    this.game.connection.shareTreeLocations(treeData);
  }

  syncState(treeData) {
    if (this.isHost || this.initialized) return;

    console.log('Received tree state with seed:', treeData.seed);
    this.treeSeed = treeData.seed;
    this.generateTrees();

    // Update resources
    treeData.trees.forEach(({ id, resources }) => {
      const tree = this.trees.get(id);
      if (tree) {
        tree.setResources(resources);
      }
    });

    this.initialized = true;
  }

  handleResourceCollection(playerId, treeId) {
    const tree = this.trees.get(treeId);
    const player = this.game.players.get(playerId);
    
    if (tree && tree.resources > 0) {
      const collected = tree.collectResource();
      if (player?.isLocal) {
        player.addResource('wood', collected);
        this.game.notifications?.show(`Collected ${collected} wood!`);
      }

      if (this.isHost) {
        this.shareState();
      }
    }
  }

  getTreeInRange(position, radius) {
    for (const [treeId, tree] of this.trees) {
      if (tree.resources <= 0) continue;
      
      const distance = Math.sqrt(
        Math.pow(tree.x - position.x, 2) + 
        Math.pow(tree.y - position.y, 2)
      );

      if (distance < radius) {
        return treeId;
      }
    }
    return null;
  }
}