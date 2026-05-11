// The multi-byte glyphs below are deliberate: mojibake on the rendered
// page means the host decoded base64 byte-by-byte (atob) instead of as
// UTF-8.
export const BLOB_WIDGET_HTML = `<!DOCTYPE html>
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
  .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; border: 1px solid currentColor; font-size: 12px; opacity: 0.7; margin-bottom: 16px; }
  h1 { font-size: 22px; font-weight: 600; margin-bottom: 12px; }
  .glyphs { font-size: 32px; margin: 16px 0; letter-spacing: 0.02em; }
  p { font-size: 14px; opacity: 0.7; max-width: 380px; margin: 0 auto; line-height: 1.5; }
</style>
</head>
<body>
  <div class="badge">SEP-1865 · base64 blob</div>
  <h1>Decoded via <code>blob</code> ✅</h1>
  <div class="glyphs">🎉 café — naïve — 日本語</div>
  <p>If the glyphs above render correctly, the host decoded the resource's base64 <code>blob</code> as UTF-8. Mojibake here indicates a byte-level (atob-style) decode.</p>
<script>
  (function () {
    var nextId = 1;
    var pending = {};
    function postToHost(msg) { window.parent.postMessage(msg, "*"); }
    function call(method, params) {
      return new Promise(function (resolve, reject) {
        var id = nextId++;
        pending[id] = { resolve: resolve, reject: reject };
        postToHost({ jsonrpc: "2.0", id: id, method: method, params: params });
      });
    }
    function applyTheme(theme) {
      if (theme === "dark" || theme === "light") document.body.className = theme;
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
      if (data.method === "ui/notifications/host-context-changed" && data.params) {
        applyTheme(data.params.theme);
      }
    });
    function notifySize() {
      postToHost({
        jsonrpc: "2.0",
        method: "ui/notifications/size-changed",
        params: { height: document.body.scrollHeight }
      });
    }
    setTimeout(function () {
      call("ui/initialize", {
        protocolVersion: "2026-01-26",
        appCapabilities: {},
        appInfo: { name: "blob-widget", version: "1.0.0" }
      }).then(function (result) {
        if (result && result.hostContext) applyTheme(result.hostContext.theme);
        postToHost({ jsonrpc: "2.0", method: "ui/notifications/initialized" });
        // Doubles as the host's handshake signal — without it the renderer's
        // timeout fires and replaces the iframe with "Widget failed to load".
        notifySize();
      });
    }, 0);
  })();
</script>
</body>
</html>`;
