export const TOOL_CALLER_WIDGET_HTML = `<!DOCTYPE html>
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
  h3 { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
  p { font-size: 13px; opacity: 0.6; margin-bottom: 16px; }
  .row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
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
  button.danger { border-color: #ef4444; color: #ef4444; }
  .status { font-size: 13px; min-height: 18px; margin-bottom: 8px; opacity: 0.7; }
  .status.ok { color: #22c55e; opacity: 1; }
  .status.error { color: #ef4444; opacity: 1; }
  pre {
    background: rgba(127,127,127,0.1);
    padding: 12px;
    border-radius: 6px;
    font-size: 12px;
    white-space: pre-wrap;
    word-break: break-word;
  }
</style>
</head>
<body>
  <div id="loading">Loading…</div>
  <div id="content" style="display:none">
    <h3>Tool caller playground</h3>
    <p>Calls other tools on the same MCP server via ui/request-tool-call.</p>
    <div class="row">
      <button id="ping">Call playground_ping</button>
      <button id="missing" class="danger">Call missing_tool (should fail)</button>
      <button id="destructive" class="danger">Call destructive_action (should prompt)</button>
    </div>
    <div class="status" id="status"></div>
    <pre id="result" style="display:none"></pre>
  </div>
<script>
(function () {
  var nextId = 100;
  var pending = {};

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

  function showResult(value) {
    var el = document.getElementById("result");
    el.textContent = JSON.stringify(value, null, 2);
    el.style.display = "block";
  }

  function hideResult() {
    document.getElementById("result").style.display = "none";
  }

  function callTool(toolName) {
    setStatus("Calling " + toolName + "…");
    hideResult();
    call("ui/request-tool-call", { toolName: toolName, arguments: {} }).then(
      function (result) {
        setStatus("Response from " + toolName, "ok");
        showResult(result);
      },
      function (err) {
        setStatus("Error: code " + err.code + " — " + (err.message || ""), "error");
      }
    );
  }

  setTimeout(function () {
    call("ui/initialize", {
      protocolVersion: "2026-01-26",
      capabilities: {},
      clientInfo: { name: "tool-caller", version: "1.0.0" }
    }).then(function (result) {
      if (result && result.hostContext && result.hostContext.theme) {
        document.body.className = result.hostContext.theme;
      }
      document.getElementById("loading").style.display = "none";
      document.getElementById("content").style.display = "block";
    }).catch(function (err) {
      document.getElementById("loading").textContent = "Init failed: " + (err.message || JSON.stringify(err));
    });
  }, 50);

  document.getElementById("ping").addEventListener("click", function () {
    callTool("playground_ping");
  });
  document.getElementById("missing").addEventListener("click", function () {
    callTool("nonexistent_tool_xyz");
  });
  document.getElementById("destructive").addEventListener("click", function () {
    callTool("destructive_action");
  });

  new ResizeObserver(notifySize).observe(document.body);
})();
</script>
</body>
</html>`;
