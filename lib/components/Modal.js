// Modal component
// Usage: Modal.open('modalId'), Modal.close('modalId')

window.Modal = {
  open(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  },

  close(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  },

  // Auto-bind overlay click-to-close for all modals on the page
  init() {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', function (e) {
        if (e.target === this) Modal.close(this.id);
      });
    });
  },
};
