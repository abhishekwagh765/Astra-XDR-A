from collectors.pods import get_all_pods
from detectors.pod_health import calculate_risk

pods = get_all_pods()

for pod in pods:
    result = calculate_risk(pod)

    print(
        pod["name"],
        pod["status"],
        result["risk"],
        result["reason"]
    )
