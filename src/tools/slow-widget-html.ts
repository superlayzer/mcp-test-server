export const SLOW_WIDGET_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; text-align: center; }
  body.dark { background: #0a0a0a; color: #f5f5f5; }
  body.light { background: #fff; color: #111; }
  body:not(.dark):not(.light) { background: #0a0a0a; color: #f5f5f5; }
  .label { opacity: 0.6; font-size: 12px; margin-bottom: 8px; }
  .countdown { font-size: 64px; font-weight: 700; font-variant-numeric: tabular-nums; margin: 16px 0; }
  .status { font-size: 14px; min-height: 20px; margin-top: 8px; }
  .status.running { color: #3b82f6; }
  .status.cancelled { color: #ef4444; font-weight: 600; }
  .status.done { color: #22c55e; font-weight: 600; }
  .pill {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 12px;
  }
  .pill.running { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
  .pill.cancelled { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
  .pill.done { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
</style>
</head>
<body>
  <div class="label">slow widget</div>
  <div class="countdown" id="countdown">…</div>
  <div class="pill running" id="pill">Running</div>
  <div class="status running" id="status">Tool is sleeping. Click Stop in the chat to cancel.</div>
<script>
(function () {
  var nextId = 100;
  var pending = {};
  var startMs = Date.now();
  var totalMs = 30000;
  var state = "running";
  var rafId = null;
  var receivedToolResult = false;

  function postToHost(msg) { window.parent.postMessage(msg, "*"); }
  function notifySize() {
    postToHost({
      jsonrpc: "2.0",
      method: "ui/notifications/size-changed",
      params: { height: document.body.scrollHeight }
    });
  }
  function call(method, params) {
    return new Promise(function (resolve, reject) {
      var id = nextId++;
      pending[id] = { resolve: resolve, reject: reject };
      postToHost({ jsonrpc: "2.0", id: id, method: method, params: params });
    });
  }

  function setRunning(remaining) {
    var s = Math.max(0, Math.ceil(remaining / 1000));
    document.getElementById("countdown").textContent = s + "s";
    document.getElementById("pill").className = "pill running";
    document.getElementById("pill").textContent = "Running";
    document.getElementById("status").className = "status running";
    document.getElementById("status").textContent = "Tool is sleeping. Click Stop in the chat to cancel.";
  }
  function setCancelled() {
    state = "cancelled";
    if (rafId) cancelAnimationFrame(rafId);
    document.getElementById("countdown").textContent = "✕";
    document.getElementById("pill").className = "pill cancelled";
    document.getElementById("pill").textContent = "Cancelled";
    document.getElementById("status").className = "status cancelled";
    document.getElementById("status").textContent = "Tool was cancelled (received ui/notifications/tool-cancelled).";
    notifySize();
  }
  function setDone() {
    state = "done";
    if (rafId) cancelAnimationFrame(rafId);
    document.getElementById("countdown").textContent = "✓";
    document.getElementById("pill").className = "pill done";
    document.getElementById("pill").textContent = "Done";
    document.getElementById("status").className = "status done";
    document.getElementById("status").textContent = "Tool completed normally.";
    notifySize();
  }

  function tick() {
    if (state !== "running") return;
    var elapsed = Date.now() - startMs;
    var remaining = totalMs - elapsed;
    if (remaining <= 0) { setDone(); return; }
    setRunning(remaining);
    rafId = requestAnimationFrame(tick);
  }

  window.addEventListener("message", function (event) {
    var data = event.data;
    if (!data || data.jsonrpc !== "2.0") return;

    if (data.id !== undefined && pending[data.id]) {
      var h = pending[data.id];
      delete pending[data.id];
      if (data.result !== undefined) h.resolve(data.result);
      else if (data.error) h.reject(data.error);
      return;
    }

    if (data.method === "ui/notifications/host-context-changed" && data.params && data.params.theme) {
      document.body.className = data.params.theme;
    }
    if (data.method === "ui/notifications/tool-input" && data.params && data.params.arguments) {
      var s = Number(data.params.arguments.seconds);
      if (Number.isFinite(s) && s > 0) {
        totalMs = s * 1000;
        startMs = Date.now();
      }
    }
    if (data.method === "ui/notifications/tool-cancelled") {
      setCancelled();
    }
    if (data.method === "ui/notifications/tool-result") {
      receivedToolResult = true;
      if (state === "running") setDone();
    }
  });

  setTimeout(function () {
    call("ui/initialize", {
      protocolVersion: "2026-01-26",
      appCapabilities: {},
      appInfo: { name: "slow-widget", version: "1.0.0" }
    }).then(function (result) {
      if (result && result.hostContext && result.hostContext.theme) {
        document.body.className = result.hostContext.theme;
      }
      // Required for AppRenderer to fire its tool-input/tool-result effects.
      postToHost({ jsonrpc: "2.0", method: "ui/notifications/initialized" });
      tick();
    }).catch(function () {
      tick();
    });
  }, 50);

  new ResizeObserver(notifySize).observe(document.body);
})();
</script>
</body>
</html>`;
