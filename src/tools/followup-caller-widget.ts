export const FOLLOWUP_CALLER_WIDGET_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; }
  body.dark { background: #0a0a0a; color: #f5f5f5; }
  body.light { background: #fff; color: #111; }
  body:not(.dark):not(.light) { background: #0a0a0a; color: #f5f5f5; }
  .label { opacity: 0.6; font-size: 12px; margin-bottom: 8px; }
  textarea {
    width: 100%;
    min-height: 80px;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid currentColor;
    background: transparent;
    color: inherit;
    font-family: inherit;
    font-size: 14px;
    resize: vertical;
    margin-bottom: 12px;
  }
  button {
    padding: 10px 16px;
    border-radius: 8px;
    border: 1px solid currentColor;
    background: transparent;
    color: inherit;
    font-size: 14px;
    cursor: pointer;
    min-height: 44px;
  }
  button:hover { opacity: 0.8; }
  button:disabled { opacity: 0.4; cursor: not-allowed; }
  .status { font-size: 13px; margin-top: 12px; min-height: 20px; }
  .status.ok { color: #22c55e; }
  .status.error { color: #ef4444; }
  .status.pending { color: #eab308; }
</style>
</head>
<body>
  <div id="loading" class="label">Loading…</div>
  <div id="content" style="display:none">
    <div class="label">playground follow-up caller</div>
    <textarea id="prompt">Summarise our conversation so far.</textarea>
    <button id="send">Send follow-up</button>
    <div class="status" id="status"></div>
  </div>
<script>
(function () {
  var nextId = 100;
  var pending = {};

  function postToHost(msg) { window.parent.postMessage(msg, "*"); }

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

  setTimeout(function () {
    call("ui/initialize", {
      protocolVersion: "2026-01-26",
      appCapabilities: {},
      appInfo: { name: "followup-caller", version: "1.0.0" }
    }).then(function (result) {
      if (result && result.hostContext && result.hostContext.theme) {
        document.body.className = result.hostContext.theme;
      }
      document.getElementById("loading").style.display = "none";
      document.getElementById("content").style.display = "block";
      postToHost({
        jsonrpc: "2.0",
        method: "ui/notifications/size-changed",
        params: { height: document.body.scrollHeight }
      });
    }).catch(function (err) {
      document.getElementById("loading").textContent = "Init failed: " + (err.message || JSON.stringify(err));
    });
  }, 50);

  document.getElementById("send").addEventListener("click", function () {
    var prompt = document.getElementById("prompt").value.trim();
    if (!prompt) {
      setStatus("Prompt is empty.", "error");
      return;
    }
    var btn = document.getElementById("send");
    btn.disabled = true;
    setStatus("Calling ui/request-followup-turn…", "pending");
    var t0 = performance.now();
    call("ui/request-followup-turn", { prompt: prompt }).then(
      function () {
        var ms = Math.round(performance.now() - t0);
        setStatus("Resolved in " + ms + "ms — host accepted the follow-up.", "ok");
        btn.disabled = false;
      },
      function (err) {
        setStatus("Rejected: " + (err.message || JSON.stringify(err)), "error");
        btn.disabled = false;
      }
    );
  });
})();
</script>
</body>
</html>`;
