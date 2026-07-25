let refreshInterval = 2000;

async function loadDashboard() {

    try {

        const response = await fetch("/api/dashboard");
        const data = await response.json();

        // ============================
        // Summary Cards
        // ============================

        document.getElementById("cpuValue").innerText =
            data.summary.cpu.toFixed(2);

        document.getElementById("memoryValue").innerText =
            data.summary.memory.toFixed(2);

        document.getElementById("alertCount").innerText =
            data.summary.alerts;

        // ============================
        // Top CPU Pods
        // ============================

        let cpuHTML = "";

        data.top_cpu_pods.forEach(pod => {

            cpuHTML += `
                <tr>
                    <td>${pod.name}</td>
                    <td>${pod.cpu} m</td>
                </tr>
            `;

        });

        document.getElementById("cpuPods").innerHTML = cpuHTML;

        // ============================
        // Top Memory Pods
        // ============================

        let memHTML = "";

        data.top_memory_pods.forEach(pod => {

            memHTML += `
                <tr>
                    <td>${pod.name}</td>
                    <td>${pod.memory} Mi</td>
                </tr>
            `;

        });

        document.getElementById("memoryPods").innerHTML = memHTML;

        // ============================
        // Update Charts
        // ============================

        if (typeof updateCharts === "function") {

            updateCharts(
                data.summary.cpu,
                data.summary.memory
            );

        }

    }

    catch (err) {

        console.error("Dashboard Error:", err);

    }

}

async function loadFalcoAlerts() {

    try {

        const response = await fetch("/api/falco");

        const alerts = await response.json();

        const div = document.getElementById("falcoAlerts");

        // Show only Critical, High and Error alerts
        const filteredAlerts = alerts.filter(alert =>
            ["Critical", "High", "Error"].includes(alert.priority)
        );

        // Update alert counter
        document.getElementById("alertCount").innerText = filteredAlerts.length;

        if (filteredAlerts.length === 0) {

            div.innerHTML = `
                <div class="alert alert-success text-center p-4">
                    <h5>✅ No Critical / High / Error Alerts</h5>
                    <small>Your Kubernetes cluster looks secure.</small>
                </div>
            `;

            return;
        }

        let html = "";

        filteredAlerts
            .slice(-10)      // Show only latest 10 alerts
            .reverse()
            .forEach(alert => {

                const fields = alert.output_fields || {};

                const namespace = fields["k8s.ns.name"] || "-";
                const pod = fields["k8s.pod.name"] || "-";
                const container = fields["container.name"] || "-";

                let color = "card-danger";
                let badge = "bg-danger";

                if (alert.priority === "High") {

                    color = "card-warning";
                    badge = "bg-warning text-dark";

                }

                if (alert.priority === "Error") {

                    color = "card-info";
                    badge = "bg-info";

                }

                html += `

                <div class="alert-item ${color}">

                    <div class="d-flex justify-content-between align-items-center">

                        <h5 class="mb-0">
                            🚨 ${alert.rule}
                        </h5>

                        <span class="badge ${badge}">
                            ${alert.priority}
                        </span>

                    </div>

                    <small class="text-secondary">

                        ${alert.time ? new Date(alert.time).toLocaleString() : ""}

                    </small>

                    <hr>

                    <p>
                        <b>📦 Namespace :</b> ${namespace}
                    </p>

                    <p>
                        <b>☸ Pod :</b> ${pod}
                    </p>

                    <p>
                        <b>🐳 Container :</b> ${container}
                    </p>

                    <pre>

${alert.output}

                    </pre>

                </div>

                `;

            });

        div.innerHTML = html;

    }

    catch (err) {

        console.error("Falco Error:", err);

    }

}

loadDashboard();
loadFalcoAlerts();

setInterval(() => {

    loadDashboard();
    loadFalcoAlerts();

}, refreshInterval);
