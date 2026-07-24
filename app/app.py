from flask import Flask, render_template

from collectors.cluster import get_cluster_info
from collectors.pods import get_all_pods
from detectors.pod_health import calculate_risk

app = Flask(__name__)


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
        pods=pods
    )


@app.route("/api/cluster")
def cluster_api():
    return get_cluster_info()


@app.route("/api/pods")
def pods_api():

    pods = get_all_pods()

    for pod in pods:
        result = calculate_risk(pod)
        pod["risk"] = result["risk"]
        pod["reason"] = result["reason"]

    return pods


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
