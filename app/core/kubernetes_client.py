from kubernetes import client, config


class KubernetesClient:

    _core_client = None
    _apps_client = None

    @classmethod
    def get_core_client(cls):

        if cls._core_client is None:

            try:
                config.load_kube_config()

            except Exception:
                config.load_incluster_config()

            cls._core_client = client.CoreV1Api()

        return cls._core_client

    @classmethod
    def get_apps_client(cls):

        if cls._apps_client is None:

            try:
                config.load_kube_config()

            except Exception:
                config.load_incluster_config()

            cls._apps_client = client.AppsV1Api()

        return cls._apps_client
