// StatusBadge component
// Usage: StatusBadge.render('available') => HTML string

window.StatusBadge = {
  render(status) {
    const map = {
      available: { cls: 'badge-available', label: 'Available' },
      booked: { cls: 'badge-booked', label: 'Booked' },
      pending: { cls: 'badge-pending', label: 'Pending' },
      confirmed: { cls: 'badge-available', label: 'Confirmed' },
      declined: { cls: 'badge-booked', label: 'Declined' },
      cancelled: { cls: 'badge-booked', label: 'Cancelled' },
      returned: { cls: 'badge-available', label: 'Returned' },
    };
    const info = map[status] || { cls: '', label: status };
    return `<span class="badge ${info.cls}">${info.label}</span>`;
  },
};
