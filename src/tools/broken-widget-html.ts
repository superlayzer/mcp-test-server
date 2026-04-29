export const BROKEN_WIDGET_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body {
    margin: 0;
    padding: 24px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #0a0a0a;
    color: #f5f5f5;
    text-align: center;
  }
  h3 { font-size: 16px; margin-bottom: 8px; }
  p { font-size: 13px; opacity: 0.6; }
</style>
</head>
<body>
  <h3>Broken widget</h3>
  <p>This widget never sends ui/initialize. The host should time out after 8s and show the retry card.</p>
</body>
</html>`;
