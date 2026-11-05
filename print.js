document.addEventListener('DOMContentLoaded', () => {
    const printAllBtnTop = document.getElementById('printAllBtnTop');

    if (printAllBtnTop) {
        printAllBtnTop.addEventListener('click', () => {
            printAllEmployees();
        });
    }
});

function getCurrentDateTime() {
    const now = new Date();
    return now.toLocaleString();
}

// Single Employee Print
window.printSingleEmployee = function(id) {
    const emp = window.employeesData.find(e => e.id === id);
    const printableArea = document.getElementById('printableArea');

    if (emp && printableArea) {
        printableArea.innerHTML = `
            <div class="print-title">(${emp.id}, ${emp.name})</div>
            <table class="print-table">
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Total Advance</th>
                        <th>Total Deduction</th>
                        <th>Date & Time</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td>₹${emp.advance.toLocaleString()}</td>
                        <td>₹${emp.deduction.toLocaleString()}</td>
                        <td>${getCurrentDateTime()}</td>
                    </tr>
                </tbody>
            </table>
        `;
        window.print();
    }
};

// All Employees Print
window.printAllEmployees = function() {
    const printableArea = document.getElementById('printableArea');

    if (printableArea) {
        const rows = window.employeesData.map(e => `
            <tr>
                <td>${e.id}</td>
                <td>${e.name}</td>
                <td>₹${e.advance.toLocaleString()}</td>
                <td>₹${e.deduction.toLocaleString()}</td>
                <td>${getCurrentDateTime()}</td>
            </tr>
        `).join('');

        printableArea.innerHTML = `
            <div class="print-title">Print all employees</div>
            <table class="print-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Total Advance</th>
                        <th>Total Deduction</th>
                        <th>Date & Time</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
        window.print();
    }
};