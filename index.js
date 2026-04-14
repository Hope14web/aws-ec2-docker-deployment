export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. SHOW THE UI (Home or View link)
    if (request.method === "GET" && (path === "/" || path.startsWith("/view/"))) {
      return new Response(HTML_UI, { headers: { "Content-Type": "text/html" } });
    }

    // 2. STORE THE SECRET
    if (request.method === "POST" && path === "/store") {
      const { secret, password } = await request.json();
      const id = crypto.randomUUID();
      await env.VAULT_KV.put(id, JSON.stringify({ secret, password }), { expirationTtl: 86400 });
      return new Response(id);
    }

    // 3. REVEAL THE SECRET
    if (request.method === "POST" && path.startsWith("/view/")) {
      const id = path.split("/")[2];
      const { password: userAttempt } = await request.json();
      const data = await env.VAULT_KV.get(id);
      if (!data) return new Response("Not Found", { status: 404 });

      const { secret, password: correctPassword } = JSON.parse(data);
      if (correctPassword && userAttempt !== correctPassword) return new Response("Wrong", { status: 403 });

      await env.VAULT_KV.delete(id); // BURN
      return new Response(secret);
    }

    return new Response("Not Found", { status: 404 });
  }
};

const HTML_UI = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <title>Vault Ultra</title>
    <style>
        @media print { body { display: none !important; } }
        body { 
            background: #020617; color: #38bdf8; font-family: sans-serif; 
            display: flex; justify-content: center; align-items: center; 
            height: 100vh; margin: 0; user-select: none; -webkit-user-select: none;
        }

        /* CRITICAL: Unlocks the input boxes so you can type */
        input, textarea, .result-box, #linkOut { 
            user-select: text !important; 
            -webkit-user-select: text !important; 
            pointer-events: auto !important; 
        }

        .container { 
            background: #0f172a; padding: 2rem; border-radius: 16px; 
            border: 1px solid #1e293b; width: 90%; max-width: 400px; text-align: center;
        }

        textarea, input { 
            width: 100%; background: #020617; color: white; border: 1px solid #334155; 
            padding: 12px; border-radius: 8px; margin-bottom: 10px; box-sizing: border-box; font-size: 1rem;
        }

        /* THE SECRET BOX: Blurry and Jittery */
        #secretOutput { 
            display: none; font-size: 2.2rem; font-weight: 900; color: #fbbf24 !important; 
            margin-top: 15px; padding: 25px; border: 2px dashed #fbbf24; border-radius: 12px;
            background: #020617; filter: blur(15px); transition: filter 0.1s; cursor: pointer;
            background-image: linear-gradient(45deg, #0f172a 25%, transparent 25%); background-size: 4px 4px;
            animation: jitter 0.05s linear infinite; pointer-events: auto;
        }
        #secretOutput:active { filter: blur(0); border: 2px solid #fbbf24; }

        @keyframes jitter { from { background-position: 0 0; } to { background-position: 4px 4px; } }
        
        #timer { color: #ef4444; font-weight: bold; margin-top: 10px; display: none; }
        button { background: #38bdf8; color: #020617; border: none; padding: 12px; font-weight: bold; width: 100%; border-radius: 8px; cursor: pointer; }
        .result-box { margin-top: 15px; padding: 10px; background: #1e293b; border-radius: 8px; display: none; word-wrap: break-word; }
    </style>
</head>
<body oncontextmenu="return false;">
    <div class="container">
        <h2>🔒 Vault Ultra</h2>
        
        <div id="creator-view">
            <textarea id="secretInput" placeholder="Enter secret..."></textarea>
            <input type="password" id="passInput" placeholder="Password (Optional)">
            <button onclick="lock()">GENERATE LINK</button>
            <div class="result-box" id="resBox">
                <code id="linkOut" style="font-size: 0.7rem; color: #fbbf24;"></code>
                <button onclick="copyLink()" style="margin-top:10px; width: auto; padding: 5px 10px;">COPY</button>
            </div>
        </div>

        <div id="reader-view" style="display:none;">
            <input type="password" id="unlockPass" placeholder="Enter Password">
            <button onclick="unlock()">REVEAL & BURN</button>
        </div>

        <p id="revealHint" style="display:none; color: #94a3b8; font-size: 0.7rem; margin-top: 15px;">👆 HOLD BOX TO REVEAL</p>
        <div id="secretOutput"></div>
        <div id="timer">Burning in: <span id="seconds">60</span>s</div>
        <button id="panicBtn" onclick="window.location.replace('https://google.com')" style="display:none; background: #ef4444; margin-top: 15px; color: white;">🚨 PANIC EXIT</button>
    </div>

    <script>
        const path = window.location.pathname;
        if(path.startsWith('/view/')) {
            document.getElementById('creator-view').style.display = 'none';
            document.getElementById('reader-view').style.display = 'block';
        }

        async function lock() {
            const secret = document.getElementById('secretInput').value;
            const password = document.getElementById('passInput').value;
            const res = await fetch('/store', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ secret, password })
            });
            const id = await res.text();
            document.getElementById('resBox').style.display = 'block';
            document.getElementById('linkOut').innerText = window.location.origin + '/view/' + id;
        }

        async function copyLink() {
            const link = document.getElementById('linkOut').innerText;
            navigator.clipboard.writeText(link).then(() => alert("Copied!"));
        }

        async function unlock() {
            const password = document.getElementById('unlockPass').value;
            const res = await fetch(window.location.pathname, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ password })
            });
            if(res.status === 403) return alert("Wrong Password");
            if(res.status === 404) return alert("Burned!");

            const secret = await res.text();
            document.getElementById('reader-view').style.display = 'none';
            document.getElementById('revealHint').style.display = 'block';
            const out = document.getElementById('secretOutput');
            out.innerText = secret;
            out.style.display = 'block';
            document.getElementById('panicBtn').style.display = 'block';
            startTimer();
        }

        function startTimer() {
            let time = 60;
            document.getElementById('timer').style.display = 'block';
            const itv = setInterval(() => {
                time--;
                document.getElementById('seconds').innerText = time;
                if(time <= 0) { clearInterval(itv); location.href = '/'; }
            }, 1000);
        }
    </script>
</body>
</html>
`;