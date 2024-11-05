import "@hotwired/turbo-rails"
import "./controllers"
import "./channels/consumer"
import { Game } from './game'

document.addEventListener('DOMContentLoaded', () => {
  new Game();
});