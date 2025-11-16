// src/controls/headTrackerSocketControls.js
// (same as your existing socket tracker, with added debug logs on incoming messages)

export function createHeadTrackerSocket(camera, {
  url = 'ws://localhost:8765',
  smoothing = 0.12,
  maxAllowedPitch = Math.PI / 2 - 0.05,
  reconnectDelay = 1500,
  autoStart = false
} = {}) {
  let ws = null;
  let enabled = false;
  let disposed = false;
  let connecting = false;
  let baseYaw = camera.rotation.y;
  let basePitch = camera.rotation.x;
  let targetYaw = baseYaw;
  let targetPitch = basePitch;
  let smoothedYaw = baseYaw;
  let smoothedPitch = basePitch;

  let ui = null;
  let urlInput = null;
  let connectBtn = null;
  let statusEl = null;
  let yawEl = null;
  let pitchEl = null;
  let recenterBtn = null;

  let reconnectTimer = null;

  function ensureUI() {
    if (ui) return;
    ui = document.createElement('div');
    ui.style.position = 'fixed';
    ui.style.left = '12px';
    ui.style.bottom = '12px';
    ui.style.zIndex = 99999;
    ui.style.padding = '8px';
    ui.style.background = 'rgba(0,0,0,0.6)';
    ui.style.color = '#fff';
    ui.style.fontFamily = 'system-ui, Arial';
    ui.style.fontSize = '12px';
    ui.style.borderRadius = '8px';
    ui.style.display = 'flex';
    ui.style.flexDirection = 'column';
    ui.style.gap = '6px';
    ui.style.minWidth = '220px';

    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '6px';
    urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.value = url;
    urlInput.style.flex = '1';
    urlInput.style.padding = '6px';
    urlInput.style.borderRadius = '6px';
    urlInput.style.border = 'none';
    urlInput.style.outline = 'none';
    urlInput.style.background = 'rgba(255,255,255,0.06)';
    urlInput.style.color = '#fff';
    row.appendChild(urlInput);

    connectBtn = document.createElement('button');
    connectBtn.textContent = 'Connect';
    connectBtn.style.padding = '6px 8px';
    connectBtn.style.border = 'none';
    connectBtn.style.borderRadius = '6px';
    connectBtn.style.background = '#1e90ff';
    connectBtn.style.color = '#fff';
    connectBtn.style.cursor = 'pointer';
    connectBtn.onclick = () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        stop();
      } else {
        url = urlInput.value.trim() || url;
        start().catch(err => console.error('Start error:', err));
      }
    };
    row.appendChild(connectBtn);

    ui.appendChild(row);

    statusEl = document.createElement('div');
    statusEl.textContent = 'Head socket: disconnected';
    statusEl.style.opacity = '0.9';
    ui.appendChild(statusEl);

    const rp = document.createElement('div');
    rp.style.display = 'flex';
    rp.style.justifyContent = 'space-between';
    rp.style.gap = '12px';

    yawEl = document.createElement('div');
    yawEl.textContent = 'yaw: 0.000';
    pitchEl = document.createElement('div');
    pitchEl.textContent = 'pitch: 0.000';
    rp.appendChild(yawEl);
    rp.appendChild(pitchEl);
    ui.appendChild(rp);

    recenterBtn = document.createElement('button');
    recenterBtn.textContent = 'Recenter';
    recenterBtn.style.padding = '6px 8px';
    recenterBtn.style.border = 'none';
    recenterBtn.style.borderRadius = '6px';
    recenterBtn.style.background = '#ff8c00';
    recenterBtn.style.color = '#fff';
    recenterBtn.style.cursor = 'pointer';
    recenterBtn.onclick = () => {
      baseYaw = camera.rotation.y;
      basePitch = camera.rotation.x;
      targetYaw = baseYaw;
      targetPitch = basePitch;
      smoothedYaw = baseYaw;
      smoothedPitch = basePitch;
      updateUIStatus('Recentered');
    };
    ui.appendChild(recenterBtn);

    document.body.appendChild(ui);
  }

  function updateUIStatus(text) {
    ensureUI();
    statusEl.textContent = text;
    if (ws && ws.readyState === WebSocket.OPEN) {
      connectBtn.textContent = 'Disconnect';
      connectBtn.style.background = '#ff4d4f';
    } else {
      connectBtn.textContent = 'Connect';
      connectBtn.style.background = '#1e90ff';
    }
  }

  function setUIYawPitch(yaw, pitch) {
    ensureUI();
    yawEl.textContent = `yaw: ${yaw.toFixed(3)}`;
    pitchEl.textContent = `pitch: ${pitch.toFixed(3)}`;
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function scheduleReconnect() {
    if (disposed) return;
    if (reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect().catch(() => {});
    }, reconnectDelay);
  }

  async function connect() {
    if (connecting || disposed) return;
    connecting = true;
    updateUIStatus('Connecting...');
    try {
      ws = new WebSocket(url);
    } catch (err) {
      connecting = false;
      updateUIStatus('Invalid URL');
      console.error('[head-socket] websocket create error', err);
      scheduleReconnect();
      return;
    }

    ws.addEventListener('open', () => {
      console.log('[head-socket] connected to', url);
      enabled = true;
      connecting = false;
      baseYaw = camera.rotation.y;
      basePitch = camera.rotation.x;
      targetYaw = baseYaw;
      targetPitch = basePitch;
      smoothedYaw = baseYaw;
      smoothedPitch = basePitch;
      updateUIStatus('Connected');
    });

    ws.addEventListener('message', (ev) => {
      // DEBUG: show raw message in console
      console.debug('[head-socket] raw message:', ev.data);
      try {
        const data = JSON.parse(ev.data);
        // DEBUG: show parsed data
        console.debug('[head-socket] parsed:', data);
        if (typeof data.yaw === 'number') {
          targetYaw = baseYaw + data.yaw;
        }
        if (typeof data.pitch === 'number') {
          targetPitch = basePitch + data.pitch;
        }
        setUIYawPitch((targetYaw - baseYaw), (targetPitch - basePitch));
        update();
      } catch (err) {
        console.warn('[head-socket] parse error', err);
      }
    });

    ws.addEventListener('close', (ev) => {
      console.log('[head-socket] closed', ev.code, ev.reason);
      enabled = false;
      ws = null;
      connecting = false;
      updateUIStatus('Disconnected');
      scheduleReconnect();
    });

    ws.addEventListener('error', (e) => {
      console.error('[head-socket] error', e);
      enabled = false;
      try { ws.close(); } catch (e) {}
      ws = null;
      connecting = false;
      updateUIStatus('Error');
      scheduleReconnect();
    });
  }

  async function start() {
    if (disposed) throw new Error('disposed');
    ensureUI();
    if (ws && ws.readyState === WebSocket.OPEN) {
      enabled = true;
      updateUIStatus('Connected');
      return;
    }
    await connect();
  }

  async function stop() {
    if (ws) {
      try { ws.close(); } catch (e) { /* ignore */ }
      ws = null;
    }
    enabled = false;
    updateUIStatus('Stopped');
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  }

  function update() {
    smoothedYaw = lerp(smoothedYaw, targetYaw, smoothing);
    smoothedPitch = lerp(smoothedPitch, targetPitch, smoothing);
    const clampedPitch = Math.max(-maxAllowedPitch, Math.min(maxAllowedPitch, smoothedPitch));
    camera.rotation.y = smoothedYaw;
    camera.rotation.x = clampedPitch;
  }

  function dispose() {
    disposed = true;
    stop();
    if (ui && ui.parentElement) ui.parentElement.removeChild(ui);
    ui = null;
  }

  ensureUI();
  updateUIStatus('Disconnected');

  if (autoStart) {
    setTimeout(() => start().catch(()=>{}), 0);
  }

  return {
    start,
    stop,
    update,
    dispose,
    get enabled() { return enabled; },
    recenter() {
      baseYaw = camera.rotation.y;
      basePitch = camera.rotation.x;
      targetYaw = baseYaw;
      targetPitch = basePitch;
      smoothedYaw = baseYaw;
      smoothedPitch = basePitch;
      updateUIStatus('Recentered');
    }
  };
}