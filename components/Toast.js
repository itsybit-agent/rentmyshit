// Toast notification component
// Usage: Toast.show('Message here')

window.Toast = {
  _el: null,

  _getEl() {
    if (!this._el) {
      this._el = document.getElementById('toast');
      if (!this._el) {
        this._el = document.createElement('div');
        this._el.className = 'toast';
        this._el.id = 'toast';
        document.body.appendChild(this._el);
      }
    }
    return this._el;
  },

  show(msg, duration = 2800) {
    const el = this._getEl();
    el.textContent = msg;
    el.classList.add('visible');
    clearTimeout(this._timer);
    this._timer = setTimeout(() => el.classList.remove('visible'), duration);
  },
};
