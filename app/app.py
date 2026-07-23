from flask import Flask, jsonify

app = Flask(__name__)


@app.route("/")
def home():
    return jsonify({
        "application": "ASTRA-XDR",
        "status": "Running",
        "message": "Welcome to ASTRA-XDR DevSecOps Platform"
    })


@app.route("/health")
def health():
    return jsonify({
        "status": "Healthy"
    })


@app.route("/about")
def about():
    return jsonify({
        "project": "ASTRA-XDR",
        "version": "1.0.0",
        "framework": "Flask"
    })


if __name__ == "__main__":
    app.run()
