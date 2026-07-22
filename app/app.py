from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    return jsonify({
        "project": "ASTRA-XDR",
        "status": "Running",
        "phase": 1
    })

@app.route("/health")
def health():
    return jsonify({
        "status": "Healthy"
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
