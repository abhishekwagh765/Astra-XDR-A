def calculate_risk(pod):
    status = pod["status"]

    if status == "Running":
        return {
            "risk": "LOW",
            "reason": "Pod is healthy."
        }

    elif status == "Pending":
        return {
            "risk": "MEDIUM",
            "reason": "Pod is waiting for scheduling or resources."
        }

    elif status == "Succeeded":
        return {
            "risk": "INFO",
            "reason": "Completed job."
        }

    elif status == "Failed":
        return {
            "risk": "HIGH",
            "reason": "Pod execution failed."
        }

    else:
        return {
            "risk": "CRITICAL",
            "reason": f"Unexpected pod status: {status}"
        }
