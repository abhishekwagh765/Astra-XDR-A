let cpuChart;
let memoryChart;

const cpuHistory = [];
const memoryHistory = [];
const labels = [];

function createCharts() {

    const cpuCtx = document.getElementById("cpuChart").getContext("2d");

    cpuChart = new Chart(cpuCtx, {

        type: "line",

        data: {

            labels: labels,

            datasets: [{

                label: "CPU (millicores)",

                data: cpuHistory,

                borderColor: "#00d4ff",

                backgroundColor: "rgba(0,212,255,0.15)",

                borderWidth: 3,

                fill: true,

                tension: 0.35,

                pointRadius: 2

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            animation: false,

            plugins: {

                legend: {

                    labels: {

                        color: "white"

                    }

                }

            },

            scales: {

                x: {

                    ticks: {

                        color: "#9ca3af"

                    },

                    grid: {

                        color: "#30363d"

                    }

                },

                y: {

                    beginAtZero: true,

                    ticks: {

                        color: "#9ca3af"

                    },

                    grid: {

                        color: "#30363d"

                    }

                }

            }

        }

    });

    const memCtx = document.getElementById("memoryChart").getContext("2d");

    memoryChart = new Chart(memCtx, {

        type: "line",

        data: {

            labels: labels,

            datasets: [{

                label: "Memory (Mi)",

                data: memoryHistory,

                borderColor: "#00e676",

                backgroundColor: "rgba(0,230,118,.15)",

                borderWidth: 3,

                fill: true,

                tension: 0.35,

                pointRadius: 2

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            animation: false,

            plugins: {

                legend: {

                    labels: {

                        color: "white"

                    }

                }

            },

            scales: {

                x: {

                    ticks: {

                        color: "#9ca3af"

                    },

                    grid: {

                        color: "#30363d"

                    }

                },

                y: {

                    beginAtZero: true,

                    ticks: {

                        color: "#9ca3af"

                    },

                    grid: {

                        color: "#30363d"

                    }

                }

            }

        }

    });

}

function updateCharts(cpu, memory) {

    const now = new Date().toLocaleTimeString();

    labels.push(now);

    cpuHistory.push(cpu);

    memoryHistory.push(memory);

    if (labels.length > 20) {

        labels.shift();

        cpuHistory.shift();

        memoryHistory.shift();

    }

    cpuChart.update();

    memoryChart.update();

}

window.onload = function () {

    createCharts();

};
