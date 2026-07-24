from core.kubernetes_client import KubernetesClient


def get_cluster_info():

    v1 = KubernetesClient.get_core_client()

    nodes = v1.list_node().items
    namespaces = v1.list_namespace().items
    pods = v1.list_pod_for_all_namespaces().items
    services = v1.list_service_for_all_namespaces().items

    return {
        "status": "Healthy",
        "nodes": len(nodes),
        "namespaces": len(namespaces),
        "pods": len(pods),
        "services": len(services)
    }
