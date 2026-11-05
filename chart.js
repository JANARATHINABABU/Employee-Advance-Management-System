document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('payrollChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    {
                        label: 'Total Advance Given (₹)',
                        data: [15000, 22000, 18000, 25000, 30000, 20000],
                        backgroundColor: 'rgba(37, 99, 235, 0.8)'
                    },
                    {
                        label: 'Total Deduction Taken (₹)',
                        data: [5000, 8000, 6000, 10000, 12000, 7000],
                        backgroundColor: 'rgba(220, 38, 38, 0.8)'
                    }
                ]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true } }
            }
        });
    }
});