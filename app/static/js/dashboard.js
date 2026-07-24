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

        if (alerts.length === 0) {

            div.innerHTML =
                "<div class='alert alert-success'>✅ No Security Alerts</div>";

            return;

        }

        let html = "";

        alerts.forEach(alert => {

            let color = "card-info";

            if (alert.priority === "Critical")
                color = "card-danger";

            else if (alert.priority === "Warning")
                color = "card-warning";

            else if (alert.priority === "Notice")
                color = "card-info";

            html += `

            <div class="alert-item ${color}">

                <h5>${alert.rule}</h5>

                <span class="badge bg-danger">

                    ${alert.priority}

                </span>

                <hr>

                <p>

                    <b>Namespace :</b>

                    ${alert.output_fields["k8s.ns.name"] || "-"}

                </p>

                <p>

                    <b>Pod :</b>

                    ${alert.output_fields["k8s.pod.name"] || "-"}

                </p>

                <p>

                    <b>Container :</b>

                    ${alert.output_fields["container.name"] || "-"}

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

        console.error(err);

    }

}

loadDashboard();
loadFalcoAlerts();

setInterval(() => {

    loadDashboard();
    loadFalcoAlerts();

}, refreshInterval);
