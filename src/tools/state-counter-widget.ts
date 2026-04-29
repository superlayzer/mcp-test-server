export const STATE_COUNTER_WIDGET_HTML = `<!DOCTYPE html>
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
  .count { font-size: 64px; font-weight: 700; margin: 16px 0; font-variant-numeric: tabular-nums; }
  .row { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 12px; }
  button {
    padding: 10px 16px;
    border-radius: 8px;
    border: 1px solid currentColor;
    background: transparent;
    color: inherit;
    font-size: 14px;
    cursor: pointer;
    min-width: 64px;
    min-height: 44px;
  }
  button:hover { opacity: 0.8; }
  button.danger { border-color: #ef4444; color: #ef4444; }
  .label { opacity: 0.6; font-size: 12px; margin-bottom: 8px; }
  .status { font-size: 13px; margin-top: 12px; min-height: 20px; }
  .status.ok { color: #22c55e; }
  .status.error { color: #ef4444; }
</style>
</head>
<body>
  <div id="loading" class="label">Loading…</div>
  <div id="content" style="display:none">
    <div class="label">playground state counter</div>
    <div class="count" id="count">0</div>
    <div class="row">
      <button id="dec">−1</button>
      <button id="inc">+1</button>
      <button id="reset">reset</button>
    </div>
    <div class="row">
      <button id="overflow" class="danger">try 9 kB (should fail)</button>
    </div>
    <div class="status" id="status"></div>
  </div>
<script>
(function () {
  var nextId = 100;
  var pending = {};
  var state = { count: 0 };

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
  });

  function setStatus(text, kind) {
    var el = document.getElementById("status");
    el.textContent = text || "";
    el.className = "status" + (kind ? " " + kind : "");
  }

  function render() {
    document.getElementById("count").textContent = String(state.count);
  }

  function save() {
    setStatus("Saving…");
    call("ui/state/set", { state: state }).then(
      function () { setStatus("Saved.", "ok"); },
      function (err) { setStatus("Save failed: " + (err.message || JSON.stringify(err)), "error"); }
    );
  }

  function bump(delta) { state.count += delta; render(); save(); }
  function reset() { state = { count: 0 }; render(); save(); }

  // Init: handshake, then read existing state.
  setTimeout(function () {
    call("ui/initialize", {
      protocolVersion: "2026-01-26",
      capabilities: {},
      clientInfo: { name: "state-counter", version: "1.0.0" }
    }).then(function (result) {
      if (result && result.hostContext && result.hostContext.theme) {
        document.body.className = result.hostContext.theme;
      }
      return call("ui/state/get", {});
    }).then(function (r) {
      if (r && r.state && typeof r.state.count === "number") {
        state = r.state;
      }
      render();
      document.getElementById("loading").style.display = "none";
      document.getElementById("content").style.display = "block";
    }).catch(function (err) {
      document.getElementById("loading").textContent = "Init failed: " + (err.message || JSON.stringify(err));
    });
  }, 50);

  document.getElementById("inc").addEventListener("click", function () { bump(1); });
  document.getElementById("dec").addEventListener("click", function () { bump(-1); });
  document.getElementById("reset").addEventListener("click", reset);

  // 9 kB > the 8192-byte cap, so the host should reject with code -32002.
  document.getElementById("overflow").addEventListener("click", function () {
    setStatus("Trying 9 kB payload…");
    var oversized = { count: state.count, payload: new Array(9001).join("x") };
    call("ui/state/set", { state: oversized }).then(
      function () { setStatus("Unexpected: 9 kB accepted!", "error"); },
      function (err) {
        if (err && err.code === -32002) {
          setStatus("Cap rejected the payload (code -32002 StateTooLarge) ✓", "ok");
        } else {
          setStatus("Failed for a different reason: " + (err.message || JSON.stringify(err)), "error");
        }
      }
    );
  });

  new ResizeObserver(notifySize).observe(document.body);
})();
</script>
</body>
</html>`;
