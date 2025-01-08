const ctx = document.getElementById('myChart').getContext('2d');
let socket = new WebSocket('wss://ws.coincap.io/prices?assets=bitcoin');

let chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Bitcoin Price',
            data: [],
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            fill: false
        }]
    },
    options: {
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'second'
                }
            },
            y: {
                beginAtZero: false
            }
        }
    }
});

//only updating the ui if the document is active
socket.addEventListener('message', (event) => {
    if (!document.hidden) {
        const data = JSON.parse(event.data);
        const price = data.bitcoin;
        const time = new Date();

        chart.data.labels.push(time);
        chart.data.datasets[0].data.push(price);

        if (chart.data.labels.length > 20) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }

        chart.update();
    }
});

//Closing the socket when the tab is closed can cause overhead by repeatedly opening and closing the connection.

// document.addEventListener('visibilitychange', () => {
//     if (document.hidden) {
//         socket.close();
//     } else {
//         socket = new WebSocket('wss://ws.coincap.io/prices?assets=bitcoin');
//     }
// });