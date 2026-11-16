/**
 * CropSense AI – Toast Notification System
 * Accessible, lightweight toast notifications for mobile and desktop.
 */

export function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'alert');
  toast.textContent = message;

  container.appendChild(toast);

  const timeoutId = setTimeout(() => {
    toast.classList.add('is-hiding');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, duration);

  toast.addEventListener('click', () => {
    clearTimeout(timeoutId);
    toast.remove();
  });
}
