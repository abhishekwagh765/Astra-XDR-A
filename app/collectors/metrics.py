from kubernetes import client, config
from kubernetes.client.rest import ApiException

try:
    config.load_incluster_config()
except Exception:
    config.load_kube_config()


def _parse_cpu(cpu):
    if cpu.endswith("n"):
        return round(int(cpu[:-1]) / 1_000_000, 2)
    if cpu.endswith("u"):
        return round(int(cpu[:-1]) / 1000, 2)
    if cpu.endswith("m"):
        return float(cpu[:-1])
    return float(cpu) * 1000


def _parse_memory(mem):
    units = {
        "Ki": 1 / 1024,
        "Mi": 1,
        "Gi": 1024,
        "Ti": 1024 * 1024,
    }

    for unit in units:
        if mem.endswith(unit):
            return round(float(mem[:-2]) * units[unit], 2)

    return 0


def get_node_metrics():
    api = client.CustomObjectsApi()

    try:
        metrics = api.list_cluster_custom_object(
            "metrics.k8s.io",
            "v1beta1",
            "nodes"
        )

        data = []

        for node in metrics["items"]:

            cpu = _parse_cpu(node["usage"]["cpu"])
            memory = _parse_memory(node["usage"]["memory"])

            data.append({
                "name": node["metadata"]["name"],
                "cpu": cpu,
                "memory": memory
            })

        return data

    except ApiException:
        return []


def get_pod_metrics():
    api = client.CustomObjectsApi()

    try:
        metrics = api.list_cluster_custom_object(
            "metrics.k8s.io",
            "v1beta1",
            "pods"
        )

        pods = []

        for item in metrics["items"]:

            cpu = 0
            memory = 0

            for container in item["containers"]:
                cpu += _parse_cpu(container["usage"]["cpu"])
                memory += _parse_memory(container["usage"]["memory"])

            pods.append({
                "name": item["metadata"]["name"],
                "namespace": item["metadata"]["namespace"],
                "cpu": round(cpu, 2),
                "memory": round(memory, 2)
            })

        return sorted(
            pods,
            key=lambda x: x["cpu"],
            reverse=True
        )

    except ApiException:
        return []
