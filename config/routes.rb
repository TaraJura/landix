Rails.application.routes.draw do
  mount ActionCable.server => '/cable'
  get "up" => "rails/health#show", as: :rails_health_check
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest

  root 'game#index'

  get "game/index"
end
