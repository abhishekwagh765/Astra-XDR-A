from core.kubernetes_client import KubernetesClient


def get_all_pods():

    v1 = KubernetesClient.get_core_client()

    pods = []

    for pod in v1.list_pod_for_all_namespaces().items:

        pods.append({
            "name": pod.metadata.name,
            "namespace": pod.metadata.namespace,
            "status": pod.status.phase,
            "node": pod.spec.node_name,
            "ip": pod.status.pod_ip,
            "restarts": sum(
                cs.restart_count
                for cs in (pod.status.container_statuses or [])
            )
        })

    return pods
