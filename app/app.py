from flask import Flask, render_template, request, jsonify

from collectors.cluster import get_cluster_info
from collectors.pods import get_all_pods
from collectors.metrics import get_node_metrics, get_pod_metrics
from detectors.pod_health import calculate_risk

app = Flask(__name__)

# -----------------------------
# In-memory Falco alert storage
# -----------------------------
falco_events = []


# -----------------------------
# Dashboard
# -----------------------------
@app.route("/")
def dashboard():

    cluster = get_cluster_info()
    pods = get_all_pods()

    for pod in pods:
        result = calculate_risk(pod)
        pod["risk"] = result["risk"]
        pod["reason"] = result["reason"]

    node_metrics = get_node_metrics()
    pod_metrics = get_pod_metrics()

    return render_template(
        "index.html",
        cluster=cluster,
        pods=pods,
        falco_events=falco_events,
        node_metrics=node_metrics,
        pod_metrics=pod_metrics,
    )


# -----------------------------
# Cluster API
# -----------------------------
@app.route("/api/cluster")
def cluster_api():
    return jsonify(get_cluster_info())


# -----------------------------
# Pods API
# -----------------------------
@app.route("/api/pods")
def pods_api():

    pods = get_all_pods()

    for pod in pods:
        result = calculate_risk(pod)
        pod["risk"] = result["risk"]
        pod["reason"] = result["reason"]

    return jsonify(pods)


# -----------------------------
# Node Metrics API
# -----------------------------
@app.route("/api/metrics/node")
def node_metrics_api():
    return jsonify(get_node_metrics())


# -----------------------------
# Pod Metrics API
# -----------------------------
@app.route("/api/metrics/pods")
def pod_metrics_api():
    return jsonify(get_pod_metrics())


# -----------------------------
# Dashboard Summary API
# -----------------------------
@app.route("/api/dashboard")
def dashboard_api():

    cluster = get_cluster_info()

    node_metrics = get_node_metrics()
    pod_metrics = get_pod_metrics()

    cpu = 0
    memory = 0

    if node_metrics:
        cpu = round(sum(n["cpu"] for n in node_metrics), 2)
        memory = round(sum(n["memory"] for n in node_metrics), 2)

    return jsonify(
        {
            "cluster": cluster,
            "node_metrics": node_metrics,
            "pod_metrics": pod_metrics,
            "top_cpu_pods": sorted(
                pod_metrics,
                key=lambda x: x["cpu"],
                reverse=True,
            )[:5],
            "top_memory_pods": sorted(
                pod_metrics,
                key=lambda x: x["memory"],
                reverse=True,
            )[:5],
            "summary": {
                "cpu": cpu,
                "memory": memory,
                "alerts": len(falco_events),
            },
        }
    )


# -----------------------------
# Receive Falco Events
# -----------------------------
@app.route("/api/falco/events", methods=["POST"])
def receive_falco_events():

    global falco_events

    event = request.get_json()

    if event:

        falco_events.insert(0, event)

        # keep latest 50
        falco_events = falco_events[:50]

        print("\n========== FALCO ALERT ==========")
        print(event)
        print("=================================\n")

    return jsonify({"status": "received"})


# -----------------------------
# Falco Alerts API
# -----------------------------
@app.route("/api/falco")
def falco_api():
    return jsonify(falco_events)


# -----------------------------
# Health Check
# -----------------------------
@app.route("/health")
def health():
    return jsonify({"status": "healthy"})


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True,
    )
