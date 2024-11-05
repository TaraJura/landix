module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :player_id

    def connect
      self.player_id = SecureRandom.uuid
    end
  end
end
