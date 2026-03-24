// Toast notification component
// Usage: Toast.show('Message') or Toast.show('Message', 'error') or Toast.show('Message', 'success')

window.Toast = {
  _el: null,

  _getEl() {
    if (!this._el) {
      this._el = document.getElementById('toast');
      if (!this._el) {
        this._el = document.createElement('div');
        this._el.id = 'toast';
        document.body.appendChild(this._el);
        // Inject styles if not already present
        if (!document.getElementById('toast-styles')) {
          const style = document.createElement('style');
          style.id = 'toast-styles';
          style.textContent = `
            #toast {
              position: fixed;
              bottom: 80px;
              left: 50%;
              transform: translateX(-50%) translateY(8px);
              background: #1a1a1a;
              color: #f0f0f0;
              padding: 10px 20px;
              border-radius: 6px;
              font-family: sans-serif;
              font-size: 0.875rem;
              opacity: 0;
              pointer-events: none;
              transition: opacity 0.2s, transform 0.2s;
              z-index: 9999;
              max-width: 340px;
              text-align: center;
              border: 1px solid #333;
            }
            #toast.visible {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
            #toast.error {
              background: #3d1a1a;
              border-color: #c0392b;
              color: #ff8a80;
            }
            #toast.success {
              background: #1a3d1a;
              border-color: #27ae60;
              color: #80ff80;
            }
          `;
          document.head.appendChild(style);
        }
      }
    }
    return this._el;
  },

  show(msg, type = 'default', duration = 3200) {
    // Allow Toast.show(msg, 2800) for backward compat
    if (typeof type === 'number') { duration = type; type = 'default'; }
    const el = this._getEl();
    el.textContent = msg;
    el.className = type !== 'default' ? `toast ${type}` : 'toast';
    el.classList.add('visible');
    clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      el.classList.remove('visible');
    }, duration);
  },
};
