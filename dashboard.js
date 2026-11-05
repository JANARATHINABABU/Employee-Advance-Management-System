let transactions = JSON.parse(localStorage.getItem("employee_transactions")) || [];
let myChartInstance = null;

document.addEventListener("DOMContentLoaded", () => {
    // Theme Toggle
    const themeBtn = document.getElementById("themeToggleBtn");
    const savedTheme = localStorage.getItem("selected_theme") || "light";

    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        if (themeBtn) themeBtn.textContent = "☀️ Light Mode";
    }

    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            const isDark = document.body.classList.contains("dark-mode");
            localStorage.setItem("selected_theme", isDark ? "dark" : "light");
            themeBtn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
        });
    }

    // Tab Switcher
    const tabs = document.querySelectorAll(".tab-link");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(c => c.style.display = "none");
            tab.classList.add("active");
            const target = document.getElementById(`tab-${tab.dataset.tab}`);
            if (target) target.style.display = "block";

            if (tab.dataset.tab === "history") {
                populateYearDropdown();
                loadHistory();
            }
        });
    });

    populateYearDropdown();
    loadEmployees();

    const yearFilter = document.getElementById("yearFilter");
    if (yearFilter) {
        yearFilter.addEventListener("change", loadHistory);
    }

    // Save Entry Form
    const txForm = document.getElementById("transactionForm");
    if (txForm) {
        txForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("empNameInput").value.trim();
            const type = document.getElementById("txType").value;
            const amount = parseFloat(document.getElementById("txAmount").value);
            const date = document.getElementById("txDateTime").value;

            if (!name) return alert("Please enter employee name!");

            transactions.push({ id: Date.now(), name, type, amount, date });
            localStorage.setItem("employee_transactions", JSON.stringify(transactions));

            alert("Saved Successfully!");
            txForm.reset();

            populateYearDropdown();
            loadEmployees();
        });
    }

    const closeBtn = document.getElementById("closeAnalyticsModal");
    if (closeBtn) {
        closeBtn.onclick = () => {
            document.getElementById("analyticsModal").style.display = "none";
        };
    }

    // Print All Employees Button Event Listener
    const printBtn = document.getElementById("printAllBtn");
    if (printBtn) {
        printBtn.addEventListener("click", printAllEmployees);
    }

    // 🖨️ Transaction History Print Button Listener
    const printHistoryBtn = document.getElementById("printHistoryBtn");
    if (printHistoryBtn) {
        printHistoryBtn.addEventListener("click", printYearlyHistory);
    }

    // 🚪 Logout Button Listener (With Confirmation & Direct Redirect to index.html)
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            const confirmLogout = confirm("Are you sure you want to log out?");
            if (confirmLogout) {
                window.location.href = "index.html";
            }
        });
    }
});

function populateYearDropdown() {
    const yearSelect = document.getElementById("yearFilter");
    if (!yearSelect) return;

    const currentSelected = yearSelect.value;
    yearSelect.innerHTML = "";
    const currentYear = new Date().getFullYear();
    let yearsSet = new Set();

    transactions.forEach(tx => {
        if (tx.date) {
            const yr = new Date(tx.date).getFullYear();
            if (!isNaN(yr)) yearsSet.add(yr);
        }
    });

    for (let y = currentYear + 2; y >= currentYear - 5; y--) yearsSet.add(y);
    const sortedYears = Array.from(yearsSet).sort((a, b) => b - a);

    sortedYears.forEach(year => {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        if (currentSelected && parseInt(currentSelected) === year) option.selected = true;
        else if (!currentSelected && year === currentYear) option.selected = true;
        yearSelect.appendChild(option);
    });
}

// Employees Table Render
function loadEmployees() {
    const tbody = document.getElementById("employeeTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (transactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px; color:#888;">No records available. Add entries to get started.</td></tr>`;
        return;
    }

    const empMap = {};
    transactions.forEach(tx => {
        if (!empMap[tx.name]) empMap[tx.name] = { advance: 0, deduction: 0 };
        if (tx.type === "advance") empMap[tx.name].advance += tx.amount;
        if (tx.type === "deduction") empMap[tx.name].deduction += tx.amount;
    });

    let id = 1;
    for (let name in empMap) {
        const row = document.createElement("tr");
        const currentId = id++;
        row.innerHTML = `
            <td>${currentId}</td>
            <td><strong>${name}</strong></td>
            <td>₹${empMap[name].advance.toLocaleString()}</td>
            <td>₹${empMap[name].deduction.toLocaleString()}</td>
            <td>
                <button class="btn-sm btn-info" onclick="showAnalytics('${name}')">📊 Analytics</button>
                <button class="btn-sm btn-primary" onclick="printSingleEmployee('${currentId}', '${name}')">🖨️ Print</button>
                <button class="btn-sm btn-danger" onclick="deleteEmployee('${name}')">🗑️ Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    }
}

// 🗑️ Delete Function
function deleteEmployee(empName) {
    const confirmDelete = confirm(`Are you sure you want to delete all records for "${empName}"? This action cannot be undone!`);
    
    if (confirmDelete) {
        transactions = transactions.filter(tx => tx.name !== empName);
        localStorage.setItem("employee_transactions", JSON.stringify(transactions));

        alert(`All records for "${empName}" have been deleted.`);

        populateYearDropdown();
        loadEmployees();
        if (document.getElementById("tab-history") && document.getElementById("tab-history").style.display !== "none") {
            loadHistory();
        }
    }
}

function showAnalytics(empName) {
    const empTxs = transactions.filter(t => t.name === empName);
    
    const availableYears = Array.from(new Set(empTxs.map(t => new Date(t.date).getFullYear()))).filter(y => !isNaN(y)).sort((a,b) => b - a);
    const defaultYear = availableYears.length > 0 ? availableYears[0] : new Date().getFullYear();

    document.getElementById("modalEmpNameHeader").innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <h3 style="margin:0;">${empName.toUpperCase()} - ANALYTICS</h3>
            <div>
                <label style="font-weight:600; margin-right:5px; font-size: 0.9rem;">SELECT YEAR:</label>
                <select id="analyticsYearFilter" style="padding: 4px 8px; font-weight: bold; border-radius: 4px;">
                    ${availableYears.map(y => `<option value="${y}">${y}</option>`).join('')}
                </select>
            </div>
        </div>
    `;

    function renderChartForYear(year) {
        let totalAdv = 0, totalDed = 0;
        const monthlyAdvance = Array(12).fill(0);
        const monthlyDeduction = Array(12).fill(0);

        empTxs.filter(t => new Date(t.date).getFullYear() === parseInt(year)).forEach(tx => {
            const m = new Date(tx.date).getMonth();
            if (tx.type === "advance") { totalAdv += tx.amount; monthlyAdvance[m] += tx.amount; }
            else if (tx.type === "deduction") { totalDed += tx.amount; monthlyDeduction[m] += tx.amount; }
        });

        document.getElementById("mAdvance").textContent = totalAdv.toLocaleString();
        document.getElementById("mDeduction").textContent = totalDed.toLocaleString();
        document.getElementById("mBalance").textContent = (totalAdv - totalDed).toLocaleString();

        const ctx = document.getElementById("analyticsChart").getContext("2d");
        if (myChartInstance) myChartInstance.destroy();

        myChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [
                    `Jan ${year}`, `Feb ${year}`, `Mar ${year}`, `Apr ${year}`, 
                    `May ${year}`, `Jun ${year}`, `Jul ${year}`, `Aug ${year}`, 
                    `Sep ${year}`, `Oct ${year}`, `Nov ${year}`, `Dec ${year}`
                ],
                datasets: [
                    { label: 'Advance', data: monthlyAdvance, backgroundColor: '#2563eb' },
                    { label: 'Deduction', data: monthlyDeduction, backgroundColor: '#ef4444' }
                ]
            },
            options: { 
                indexAxis: 'y', 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) { label += ': '; }
                                if (context.parsed.x !== null) {
                                    label += '₹' + context.parsed.x.toLocaleString();
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    renderChartForYear(defaultYear);

    setTimeout(() => {
        const yearSelect = document.getElementById("analyticsYearFilter");
        if(yearSelect) {
            yearSelect.addEventListener("change", (e) => {
                renderChartForYear(e.target.value);
            });
        }
    }, 100);

    document.getElementById("analyticsModal").style.display = "flex";
}

// ==========================================
// 1. PRINT SINGLE EMPLOYEE (Matches Image 1)
// ==========================================
function printSingleEmployee(empId, empName) {
    const empTxs = transactions.filter(t => t.name === empName);

    let totalAdv = 0;
    let totalDed = 0;
    let lastDate = "-";
    let historyRowsHtml = "";

    empTxs.forEach((tx, idx) => {
        if (tx.type === "advance") totalAdv += tx.amount;
        if (tx.type === "deduction") totalDed += tx.amount;
        lastDate = new Date(tx.date).toLocaleString();

        const advVal = tx.type === "advance" ? `₹${tx.amount.toLocaleString()}` : "₹0";
        const dedVal = tx.type === "deduction" ? `₹${tx.amount.toLocaleString()}` : "₹0";

        historyRowsHtml += `
            <tr>
                <td>${idx + 1}</td>
                <td>${advVal}</td>
                <td>${dedVal}</td>
                <td>${new Date(tx.date).toLocaleString()}</td>
            </tr>
        `;
    });

    const printWindow = window.open('', '_blank', 'width=800,height=600');

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Print Employee - ${empName}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    color: #000;
                    background: #fff;
                }
                .header-info {
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 15px;
                }
                .section-title {
                    font-size: 15px;
                    font-weight: bold;
                    margin-top: 25px;
                    margin-bottom: 10px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: center;
                    margin-bottom: 20px;
                }
                th, td {
                    border: 1px solid #000;
                    padding: 8px 10px;
                    font-size: 14px;
                }
                th {
                    background-color: #f2f2f2;
                }
            </style>
        </head>
        <body>
            <div class="header-info">(ID: ${empId}, Name: ${empName})</div>

            <!-- Total Summary Table -->
            <table>
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
                        <td>₹${totalAdv.toLocaleString()}</td>
                        <td>₹${totalDed.toLocaleString()}</td>
                        <td>${lastDate}</td>
                    </tr>
                </tbody>
            </table>

            <!-- Transaction History Section -->
            <div class="section-title">Transaction history</div>
            <table>
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Total advance</th>
                        <th>Total Deduction</th>
                        <th>Date & Time</th>
                    </tr>
                </thead>
                <tbody>
                    ${historyRowsHtml || '<tr><td colspan="4">No transactions found</td></tr>'}
                </tbody>
            </table>

            <script>
                window.onload = function() {
                    window.print();
                    window.close();
                };
            </script>
        </body>
        </html>
    `);

    printWindow.document.close();
}

// ==========================================
// 2. PRINT ALL EMPLOYEES (Matches Image 2)
// ==========================================
function printAllEmployees() {
    if (!transactions || transactions.length === 0) {
        alert("No employee records found to print!");
        return;
    }

    const empMap = {};
    transactions.forEach(tx => {
        if (!empMap[tx.name]) empMap[tx.name] = { advance: 0, deduction: 0, lastDate: "-" };
        if (tx.type === "advance") empMap[tx.name].advance += tx.amount;
        if (tx.type === "deduction") empMap[tx.name].deduction += tx.amount;
        empMap[tx.name].lastDate = new Date(tx.date).toLocaleString();
    });

    let rowsHtml = "";
    let currentId = 1;

    for (let name in empMap) {
        rowsHtml += `
            <tr>
                <td>${currentId++}</td>
                <td>${name}</td>
                <td>₹${empMap[name].advance.toLocaleString()}</td>
                <td>₹${empMap[name].deduction.toLocaleString()}</td>
                <td>${empMap[name].lastDate}</td>
            </tr>
        `;
    }

    const printWindow = window.open('', '_blank', 'width=800,height=600');

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Employees Advance Details</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    color: #000;
                    background: #fff;
                }
                .title {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 15px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: center;
                }
                th, td {
                    border: 1px solid #000;
                    padding: 8px 10px;
                    font-size: 14px;
                }
                th {
                    background-color: #f2f2f2;
                }
            </style>
        </head>
        <body>
            <div class="title">All Employees Details</div>

            <table>
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
                    ${rowsHtml}
                </tbody>
            </table>

            <script>
                window.onload = function() {
                    window.print();
                    window.close();
                };
            </script>
        </body>
        </html>
    `);

    printWindow.document.close();
}

// ==========================================
// 3. PRINT TRANSACTION HISTORY BY YEAR
// ==========================================
function printYearlyHistory() {
    const yearSelect = document.getElementById("yearFilter");
    const selectedYear = yearSelect ? yearSelect.value : new Date().getFullYear();

    const filtered = transactions.filter(tx => tx.date && new Date(tx.date).getFullYear().toString() === selectedYear.toString());

    if (filtered.length === 0) {
        alert(`No transaction history records found for ${selectedYear} to print!`);
        return;
    }

    let rowsHtml = "";
    filtered.forEach((tx, idx) => {
        const advVal = tx.type === "advance" ? `₹${tx.amount.toLocaleString()}` : "₹0";
        const dedVal = tx.type === "deduction" ? `₹${tx.amount.toLocaleString()}` : "₹0";

        rowsHtml += `
            <tr>
                <td>${idx + 1}</td>
                <td>${tx.name}</td>
                <td>${advVal}</td>
                <td>${dedVal}</td>
                <td>${new Date(tx.date).toLocaleString()}</td>
            </tr>
        `;
    });

    const printWindow = window.open('', '_blank', 'width=800,height=600');

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Transaction History - ${selectedYear}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    color: #000;
                    background: #fff;
                }
                .title {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 15px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: center;
                }
                th, td {
                    border: 1px solid #000;
                    padding: 8px 10px;
                    font-size: 14px;
                }
                th {
                    background-color: #f2f2f2;
                }
            </style>
        </head>
        <body>
            <div class="title">Transaction History (${selectedYear})</div>

            <table>
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Employee Name</th>
                        <th>Advance</th>
                        <th>Deduction</th>
                        <th>Date & Time</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>

            <script>
                window.onload = function() {
                    window.print();
                    window.close();
                };
            </script>
        </body>
        </html>
    `);

    printWindow.document.close();
}

// 📜 Load History Table
function loadHistory() {
    const yearSelect = document.getElementById("yearFilter");
    if (!yearSelect) return;
    const selectedYear = yearSelect.value;
    const tbody = document.getElementById("historyTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const filtered = transactions.filter(tx => tx.date && tx.date.startsWith(selectedYear));

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px;">No records found for ${selectedYear}</td></tr>`;
        return;
    }

    filtered.forEach((tx, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${new Date(tx.date).toLocaleString()}</td>
            <td>${tx.name}</td>
            <td><span style="color:${tx.type === 'advance' ? 'green' : 'red'}; font-weight:bold;">${tx.type.toUpperCase()}</span></td>
            <td>₹${tx.amount.toLocaleString()}</td>
        `;
        tbody.appendChild(row);
    });
}