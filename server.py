"""
EduGenie - Python 3 Zero-Dependency Backend Server
Google Gemini Powered Learning Assistant

Runs with standard Python 3.10+ (no pip install required!)
"""

import http.server
import socketserver
import json
import os
import sys
import urllib.request
import urllib.error

# Resolve directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def load_env():
    """Load key-value pairs from .env file if it exists."""
    env_vars = {}
    env_file = os.path.join(BASE_DIR, ".env")
    if os.path.exists(env_file):
        try:
            with open(env_file, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        env_vars[k.strip()] = v.strip().strip('"').strip("'")
        except Exception as e:
            print(f"[Env] Note: Error reading .env: {e}")
    return env_vars

ENV = load_env()
API_KEY = os.environ.get("GEMINI_API_KEY", ENV.get("GEMINI_API_KEY", ""))
DEFAULT_MODEL = os.environ.get("GEMINI_MODEL", ENV.get("GEMINI_MODEL", "gemini-2.0-flash"))
PORT = int(os.environ.get("PORT", ENV.get("PORT", 5000)))

class EduGenieHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-goog-api-key")

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def _send_json(self, status_code, payload):
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path == "/api/status" or self.path == "/api/status/":
            has_key = bool(API_KEY and API_KEY.strip())
            masked_key = (API_KEY[:6] + "..." + API_KEY[-4:]) if has_key and len(API_KEY) > 10 else ("Configured" if has_key else "Missing")
            return self._send_json(200, {
                "status": "online",
                "service": "EduGenie Backend (Python)",
                "model": DEFAULT_MODEL,
                "hasKey": has_key,
                "maskedKey": masked_key,
                "port": PORT
            })
        return super().do_GET()

    def do_POST(self):
        if self.path in ("/api/generate", "/api/generate/", "/api/chat", "/api/chat/"):
            content_len = int(self.headers.get("Content-Length", 0))
            if content_len == 0:
                return self._send_json(400, {"error": "Empty request body"})
            
            try:
                body = json.loads(self.rfile.read(content_len).decode("utf-8"))
            except Exception as e:
                return self._send_json(400, {"error": f"Invalid JSON body: {str(e)}"})

            # Determine API Key: from client header, client body, or server .env
            client_key = (self.headers.get("x-goog-api-key") or body.get("apiKey") or API_KEY or "").strip()
            if not client_key:
                return self._send_json(400, {
                    "error": "No Gemini API key configured. Please enter your API key in Settings (⚙️) or in .env."
                })
            if client_key.startswith("AQ.") or not client_key.startswith("AIzaSy"):
                return self._send_json(400, {
                    "error": "Invalid API key format. Google Gemini API keys start with 'AIzaSy...'. Obtain a free key at https://aistudio.google.com/app/apikey"
                })

            model = body.get("model") or DEFAULT_MODEL
            system_prompt = body.get("systemInstruction", "You are EduGenie, an expert, enthusiastic learning assistant.")
            temperature = float(body.get("temperature", 0.7))
            response_mime = body.get("responseMimeType")

            # Prepare Gemini payload
            if self.path.startswith("/api/chat"):
                contents = body.get("contents", [])
                if not contents and body.get("message"):
                    contents = [{"role": "user", "parts": [{"text": body.get("message")}]}]
            else:
                prompt_text = body.get("prompt", "")
                contents = [{"role": "user", "parts": [{"text": prompt_text}]}]

            gemini_payload = {
                "systemInstruction": {"parts": [{"text": system_prompt}]},
                "contents": contents,
                "generationConfig": {
                    "temperature": temperature
                }
            }
            if response_mime:
                gemini_payload["generationConfig"]["responseMimeType"] = response_mime

            # Call Google Generative Language API
            api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={client_key}"
            req_data = json.dumps(gemini_payload).encode("utf-8")
            
            req = urllib.request.Request(
                api_url,
                data=req_data,
                headers={
                    "Content-Type": "application/json",
                    "x-goog-api-key": client_key
                },
                method="POST"
            )

            try:
                with urllib.request.urlopen(req, timeout=45) as resp:
                    resp_data = json.loads(resp.read().decode("utf-8"))
                    text = ""
                    try:
                        text = resp_data["candidates"][0]["content"]["parts"][0]["text"]
                    except (KeyError, IndexError):
                        text = json.dumps(resp_data)
                    
                    return self._send_json(200, {
                        "text": text,
                        "raw": resp_data,
                        "model": model
                    })
            except urllib.error.HTTPError as e:
                err_content = e.read().decode("utf-8")
                try:
                    err_json = json.loads(err_content)
                except Exception:
                    err_json = {"raw": err_content}
                return self._send_json(e.code, {
                    "error": f"Gemini API Error ({e.code}): {err_json.get('error', {}).get('message', err_content)}",
                    "details": err_json
                })
            except Exception as e:
                return self._send_json(500, {
                    "error": f"Server request failed: {str(e)}"
                })

        return self._send_json(404, {"error": "Endpoint not found"})

def run_server():
    server_address = ("", PORT)
    with socketserver.TCPServer(server_address, EduGenieHandler) as httpd:
        print("=" * 60)
        print(f" ✨ EduGenie: Google Gemini Learning Assistant Server")
        print(f" 🌐 Running on: http://localhost:{PORT}")
        print(f" 🤖 Model: {DEFAULT_MODEL}")
        print(f" 🔑 API Key: {'Configured in .env' if API_KEY else 'Not found'}")
        print(f" 📂 Serving files from: {BASE_DIR}")
        print("=" * 60)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server gracefully...")
            httpd.server_close()

if __name__ == "__main__":
    run_server()
