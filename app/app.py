from flask import Flask, jsonify, request
import subprocess

app = Flask(__name__)

@app.route("/")
def home():
    return jsonify({
        "message": "Welcome to ASTRA-XDR",
        "status": "Running"
    })

@app.route("/health")
def health():
    return jsonify({
        "status": "Healthy"
    })

# -------------------------------
# TEST ENDPOINT (INTENTIONALLY VULNERABLE)
# Used only to verify Semgrep CI
# Remove after testing.
# -------------------------------
@app.route("/test")
def test():
    cmd = request.args.get("cmd")
    subprocess.run(cmd, shell=True)
    return jsonify({
        "message": "Command executed"
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
