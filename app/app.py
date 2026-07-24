from flask import Flask, render_template, request, jsonify

from collectors.cluster import get_cluster_info
from collectors.pods import get_all_pods
from detectors.pod_health import calculate_risk

app = Flask(__name__)

# Store latest Falco alerts (in memory)
falco_events = []


@app.route("/")
def dashboard():

    # Get cluster information
    cluster = get_cluster_info()

    # Get all pods
    pods = get_all_pods()

    # Calculate risk for every pod
    for pod in pods:
        result = calculate_risk(pod)
        pod["risk"] = result["risk"]
        pod["reason"] = result["reason"]

    return render_template(
        "index.html",
        cluster=cluster,
        pods=pods,
        falco_events=falco_events
    )


@app.route("/api/cluster")
def cluster_api():
    return jsonify(get_cluster_info())


@app.route("/api/pods")
def pods_api():

    pods = get_all_pods()

    for pod in pods:
        result = calculate_risk(pod)
        pod["risk"] = result["risk"]
        pod["reason"] = result["reason"]

    return jsonify(pods)


# ------------------------------------
# Receive alerts from Falcosidekick
# ------------------------------------
@app.route("/api/falco/events", methods=["POST"])
def receive_falco_events():

    global falco_events

    event = request.get_json()

    if event:
        falco_events.insert(0, event)

        # Keep only latest 50 alerts
        falco_events = falco_events[:50]

        print("\n========== FALCO ALERT ==========")
        print(event)
        print("=================================\n")

    return jsonify({
        "status": "received"
    })


# ------------------------------------
# API to fetch alerts
# ------------------------------------
@app.route("/api/falco")
def get_falco_events():

    return jsonify(falco_events)


@app.route("/health")
def health():
    return jsonify({
        "status": "healthy"
    })


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
