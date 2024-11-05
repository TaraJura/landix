# app/channels/game_channel.rb
class GameChannel < ApplicationCable::Channel
  def subscribed
    stream_from "game_channel"

    # Send new player info to all clients
    ActionCable.server.broadcast "game_channel", {
      type: 'new_player',
      player_id: player_id,
      x: 0,
      y: 0
    }
  end

  def unsubscribed
    ActionCable.server.broadcast "game_channel", {
      type: 'player_left',
      player_id: player_id
    }
  end

  def request_game_state
    ActionCable.server.broadcast "game_channel", {
      type: 'request_game_state',
      player_id: player_id
    }
  end

  def player_state(data)
    ActionCable.server.broadcast "game_channel", {
      type: 'player_state',
      player_id: player_id,
      requesting_player_id: data['requesting_player_id'],
      x: data['x'],
      y: data['y'],
      resources: data['resources']
    }
  end

  def player_moved(data)
    ActionCable.server.broadcast "game_channel", {
      type: 'player_moved',
      player_id: player_id,
      x: data['x'],
      y: data['y']
    }
  end

  def share_tree_locations(data)
    ActionCable.server.broadcast "game_channel", {
      type: 'tree_locations',
      trees: data['trees']
    }
  end

  def resource_collected(data)
    ActionCable.server.broadcast "game_channel", {
      type: 'resource_collected',
      player_id: player_id,
      tree_id: data['tree_id']
    }
  end
end
