// EventLog — collapsible floating event stream panel
// Usage: EventLog.init(slug) — call after page load

const EventLog = (() => {
  let _slug = null;
  let _open = false;
  let _events = [];

  const EVENT_COLORS = {
    'Rms/OwnerPageCreated': '#7cb342',
    'Rms/OwnerPageUpdated': '#7cb342',
    'Rms/ItemAdded':        '#42a5f5',
    'Rms/ItemEdited':       '#42a5f5',
    'Rms/ItemRemoved':      '#ef5350',
    'Rms/BookingRequested': '#ffa726',
    'Rms/BookingAccepted':  '#7cb342',
    'Rms/BookingDeclined':  '#ef5350',
    'Rms/BookingCancelled': '#9e9e9e',
    'Rms/BookingEdited':    '#ffa726',
    'Rms/ItemReturned':     '#ab47bc',
  };

  const EVENT_LABELS = {
    'Rms/OwnerPageCreated': '🏠 Page created',
    'Rms/OwnerPageUpdated': '✏️ Page updated',
    'Rms/ItemAdded':        '📦 Item added',
    'Rms/ItemEdited':       '✏️ Item edited',
    'Rms/ItemRemoved':      '🗑️ Item removed',
    'Rms/BookingRequested': '📩 Booking requested',
    'Rms/BookingAccepted':  '✅ Booking accepted',
    'Rms/BookingDeclined':  '❌ Booking declined',
    'Rms/BookingCancelled': '↩️ Booking cancelled',
    'Rms/BookingEdited':    '✏️ Booking edited',
    'Rms/ItemReturned':     '🎉 Item returned',
  };

  function _formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString('sv-SE') + ' ' + d.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
  }

  function _renderEvent(evt) {
    const color = EVENT_COLORS[evt.type] || '#9e9e9e';
    const label = EVENT_LABELS[evt.type] || evt.type;
    const payload = JSON.stringify(evt.payload || {}, null, 2);
    return `
      <div class="el-event" data-id="${evt.id}">
        <div class="el-event-header" onclick="EventLog._togglePayload('${evt.id}')">
          <span class="el-dot" style="background:${color}"></span>
          <span class="el-label">${label}</span>
          <span class="el-time">${_formatTime(evt.timestamp)}</span>
          <span class="el-chevron">▶</span>
        </div>
        <pre class="el-payload" id="el-payload-${evt.id}" style="display:none">${payload}</pre>
      </div>`;
  }

  function _render() {
    const list = document.getElementById('el-list');
    if (!list) return;
    if (_events.length === 0) {
      list.innerHTML = '<div class="el-empty">No events yet</div>';
    } else {
      list.innerHTML = _events.map(_renderEvent).join('');
    }
  }

  async function _load() {
    if (!_slug) return;
    try {
      const events = await RMS.getPageEvents(_slug);
      _events = events || [];
      _render();
    } catch (e) {
      console.warn('EventLog: could not load events', e);
    }
  }

  function _togglePayload(id) {
    const el = document.getElementById(`el-payload-${id}`);
    const header = document.querySelector(`[data-id="${id}"] .el-chevron`);
    if (!el) return;
    const open = el.style.display === 'none';
    el.style.display = open ? 'block' : 'none';
    if (header) header.textContent = open ? '▼' : '▶';
  }

  function _toggle() {
    _open = !_open;
    const panel = document.getElementById('el-panel');
    const btn = document.getElementById('el-toggle-btn');
    if (panel) panel.style.display = _open ? 'flex' : 'none';
    if (btn) btn.setAttribute('aria-expanded', _open);
    if (_open) _load();
  }

  function init(slug) {
    _slug = slug;

    // Inject styles
    if (!document.getElementById('el-styles')) {
      const style = document.createElement('style');
      style.id = 'el-styles';
      style.textContent = `
        #el-floater {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 999;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 11px;
        }
        #el-toggle-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #1a1a1a;
          color: #a0a0a0;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 6px 12px;
          cursor: pointer;
          font-family: inherit;
          font-size: 11px;
          margin-left: auto;
          width: fit-content;
          transition: background 0.15s;
        }
        #el-toggle-btn:hover { background: #222; color: #ccc; }
        #el-toggle-btn .el-pulse {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #7cb342;
          animation: el-blink 2s infinite;
        }
        @keyframes el-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        #el-panel {
          display: none;
          flex-direction: column;
          width: 340px;
          max-height: 400px;
          background: #111;
          border: 1px solid #2a2a2a;
          border-radius: 8px;
          margin-bottom: 8px;
          overflow: hidden;
        }
        #el-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: #1a1a1a;
          border-bottom: 1px solid #2a2a2a;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        #el-refresh {
          background: none;
          border: none;
          color: #555;
          cursor: pointer;
          padding: 2px 6px;
          font-size: 12px;
          border-radius: 3px;
        }
        #el-refresh:hover { color: #999; background: #222; }
        #el-list {
          overflow-y: auto;
          flex: 1;
          padding: 4px 0;
        }
        .el-event { border-bottom: 1px solid #1a1a1a; }
        .el-event-header {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          cursor: pointer;
          transition: background 0.1s;
        }
        .el-event-header:hover { background: #1a1a1a; }
        .el-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .el-label { flex: 1; color: #ccc; }
        .el-time { color: #444; white-space: nowrap; }
        .el-chevron { color: #444; font-size: 9px; }
        .el-payload {
          margin: 0;
          padding: 8px 12px 8px 26px;
          background: #0d0d0d;
          color: #666;
          font-size: 10px;
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-all;
          border-top: 1px solid #1a1a1a;
        }
        .el-empty { padding: 16px 12px; color: #444; text-align: center; }
      `;
      document.head.appendChild(style);
    }

    // Inject HTML
    if (!document.getElementById('el-floater')) {
      const floater = document.createElement('div');
      floater.id = 'el-floater';
      floater.innerHTML = `
        <div id="el-panel">
          <div id="el-header">
            <span>Event log</span>
            <button id="el-refresh" onclick="EventLog._load()" title="Refresh">↺</button>
          </div>
          <div id="el-list"><div class="el-empty">Loading…</div></div>
        </div>
        <button id="el-toggle-btn" onclick="EventLog._toggle()" aria-expanded="false">
          <span class="el-pulse"></span>
          Event log
        </button>
      `;
      document.body.appendChild(floater);
    }
  }

  return { init, _toggle, _togglePayload, _load };
})();

window.EventLog = EventLog;
