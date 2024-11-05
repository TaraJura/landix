export class NotificationManager {
  static show(message) {
    const notifications = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = 'bg-white/90 p-3 rounded-lg shadow-lg mb-2';
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        <div>
          <h4 class="font-bold">Resource Collected</h4>
          <p>${message}</p>
        </div>
      </div>
    `;
    
    notifications.prepend(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}
