document.addEventListener("DOMContentLoaded", function () {
    const clientSelect = document.getElementById("clientSelect");
    const investmentTable = document.getElementById("investmentTable").getElementsByTagName('tbody')[0];
    const returnsTable = document.getElementById("returnsTable").getElementsByTagName('tbody')[0];
    const totalInvestmentElement = document.getElementById("totalInvestment");
    const totalReturnsElement = document.getElementById("totalReturns");

    const investmentSection = document.getElementById("investmentSection");
    const returnsSection = document.getElementById("returnsSection");
    const addClientBtn = document.getElementById("addClientBtn");
    const addInvestmentBtn = document.getElementById("addInvestmentBtn");
    const addReturnBtn = document.getElementById("addReturnBtn");

    const modal = document.getElementById("modal");
    const closeModalBtn = document.querySelector(".close");
    const modalForm = document.getElementById("modalForm");
    const modalTitle = document.getElementById("modalTitle");

    let clients = JSON.parse(localStorage.getItem("clients")) || [];
    let currentClientId = null;

    // Event Listener for adding new client
    addClientBtn.addEventListener("click", function () {
        if (currentClientId) {
            // Delete Client logic
            deleteClient(currentClientId);
        } else {
            // Add Client logic
            const clientName = prompt("Enter Client Name:");
            if (clientName) {
                const newClient = {
                    id: Date.now(),
                    name: clientName
                };
                clients.push(newClient);
                localStorage.setItem("clients", JSON.stringify(clients));
                updateClientDropdown();
                clientSelect.value = newClient.id;
                showClientData(newClient.id);
                alert("Client added successfully.");
            }
        }
    });

    // Update Client Dropdown
    function updateClientDropdown() {
        clientSelect.innerHTML = '<option value="">Select Client</option>';
        clients.forEach(client => {
            const option = document.createElement("option");
            option.value = client.id;
            option.textContent = client.name;
            clientSelect.appendChild(option);
        });
    }

    // Event listener for client selection
    clientSelect.addEventListener('change', function () {
        const selectedClientId = parseInt(this.value);
        if (selectedClientId) {
            currentClientId = selectedClientId;
            showClientData(currentClientId);
            addClientBtn.textContent = "Delete Client"; // Change button to Delete Client
        } else {
            currentClientId = null;
            hideClientData();
            addClientBtn.textContent = "Add Client"; // Change button back to Add Client
        }
    });

    // Show selected client data (investments and returns)
    function showClientData(clientId) {
        investmentTable.innerHTML = '';
        returnsTable.innerHTML = '';
        let totalInvestment = 0;
        let totalReturns = 0;

        const clientInvestments = JSON.parse(localStorage.getItem(`investments_${clientId}`)) || [];
        const clientReturns = JSON.parse(localStorage.getItem(`returns_${clientId}`)) || [];

        // Fill investment table
        clientInvestments.forEach((investment, index) => {
            const row = investmentTable.insertRow();
            row.insertCell(0).textContent = investment.date;
            row.insertCell(1).textContent = investment.amount;
            row.insertCell(2).textContent = investment.remarks || "N/A";
            const actionCell = row.insertCell(3);
            actionCell.innerHTML = `
                <button class="edit-btn" data-client-id="${clientId}" data-type="investment" data-index="${index}">Edit</button>
                <button class="delete-btn" data-client-id="${clientId}" data-type="investment" data-index="${index}">Delete</button>
            `;
            totalInvestment += investment.amount;
        });

        // Fill return table
        clientReturns.forEach((returnItem, index) => {
            const row = returnsTable.insertRow();
            row.insertCell(0).textContent = returnItem.date;
            row.insertCell(1).textContent = returnItem.amount;
            row.insertCell(2).textContent = returnItem.remarks || "N/A";
            const actionCell = row.insertCell(3);
            actionCell.innerHTML = `
                <button class="edit-btn" data-client-id="${clientId}" data-type="return" data-index="${index}">Edit</button>
                <button class="delete-btn" data-client-id="${clientId}" data-type="return" data-index="${index}">Delete</button>
            `;
            totalReturns += returnItem.amount;
        });

        totalInvestmentElement.textContent = `Total Investment: ${totalInvestment}`;
        totalReturnsElement.textContent = `Total Returns: ${totalReturns}`;

        investmentSection.style.display = 'block';
        returnsSection.style.display = 'block';
    }

    function hideClientData() {
        investmentSection.style.display = 'none';
        returnsSection.style.display = 'none';
    }

    // Modal for Add/Edit Investment/Return
    function openModal(title, type, data = {}) {
        modal.style.display = "block";
        modalTitle.textContent = title;
        modalForm.reset(); // Reset form fields

        document.getElementById("date").value = data.date || '';
        document.getElementById("amount").value = data.amount || '';
        document.getElementById("remarks").value = data.remarks || '';

        modalForm.onsubmit = function (event) {
            event.preventDefault();
            const date = document.getElementById("date").value;
            const amount = document.getElementById("amount").value;
            const remarks = document.getElementById("remarks").value || "N/A";

            if (date && amount) {
                if (type === 'investment') {
                    saveInvestment(data.clientId, data.index, date, amount, remarks);
                } else if (type === 'return') {
                    saveReturn(data.clientId, data.index, date, amount, remarks);
                }
                closeModal();
            } else {
                alert("Please fill in all the fields.");
            }
        };
    }

    function closeModal() {
        modal.style.display = "none";
    }

    // Close modal when clicking on the close button (X)
    closeModalBtn.addEventListener("click", closeModal);

    // Open modal for adding new investment
    addInvestmentBtn.addEventListener("click", function () {
        if (currentClientId) {
            openModal("Add Investment", "investment", { clientId: currentClientId });
        } else {
            alert("Please select a client first.");
        }
    });

    // Open modal for adding new return
    addReturnBtn.addEventListener("click", function () {
        if (currentClientId) {
            openModal("Add Return", "return", { clientId: currentClientId });
        } else {
            alert("Please select a client first.");
        }
    });

    // Save or Update Investment
    function saveInvestment(clientId, index, date, amount, remarks) {
        let investments = JSON.parse(localStorage.getItem(`investments_${clientId}`)) || [];
        if (index !== undefined) {
            investments[index] = { date, amount: parseFloat(amount), remarks };
        } else {
            investments.push({ date, amount: parseFloat(amount), remarks });
        }
        localStorage.setItem(`investments_${clientId}`, JSON.stringify(investments));
        showClientData(clientId);
    }

    // Save or Update Return
    function saveReturn(clientId, index, date, amount, remarks) {
        let returns = JSON.parse(localStorage.getItem(`returns_${clientId}`)) || [];
        if (index !== undefined) {
            returns[index] = { date, amount: parseFloat(amount), remarks };
        } else {
            returns.push({ date, amount: parseFloat(amount), remarks });
        }
        localStorage.setItem(`returns_${clientId}`, JSON.stringify(returns));
        showClientData(clientId);
    }

    // Edit Investment
    document.addEventListener("click", function (event) {
        if (event.target && event.target.classList.contains("edit-btn")) {
            const clientId = event.target.getAttribute("data-client-id");
            const type = event.target.getAttribute("data-type");
            const index = event.target.getAttribute("data-index");
            if (type === "investment") {
                const investments = JSON.parse(localStorage.getItem(`investments_${clientId}`)) || [];
                openModal("Edit Investment", "investment", { clientId, index, ...investments[index] });
            } else if (type === "return") {
                const returns = JSON.parse(localStorage.getItem(`returns_${clientId}`)) || [];
                openModal("Edit Return", "return", { clientId, index, ...returns[index] });
            }
        }
    });

    // Delete Investment
    document.addEventListener("click", function (event) {
        if (event.target && event.target.classList.contains("delete-btn")) {
            const clientId = event.target.getAttribute("data-client-id");
            const type = event.target.getAttribute("data-type");
            const index = event.target.getAttribute("data-index");
            if (type === "investment") {
                deleteInvestment(clientId, index);
            } else if (type === "return") {
                deleteReturn(clientId, index);
            }
        }
    });

    // Delete Investment logic
    function deleteInvestment(clientId, index) {
        let investments = JSON.parse(localStorage.getItem(`investments_${clientId}`)) || [];
        investments.splice(index, 1);
        localStorage.setItem(`investments_${clientId}`, JSON.stringify(investments));
        showClientData(clientId);
    }

    // Delete Return logic
    function deleteReturn(clientId, index) {
        let returns = JSON.parse(localStorage.getItem(`returns_${clientId}`)) || [];
        returns.splice(index, 1);
        localStorage.setItem(`returns_${clientId}`, JSON.stringify(returns));
        showClientData(clientId);
    }

    // Delete Client logic
    function deleteClient(clientId) {
        const clientIndex = clients.findIndex(client => client.id === clientId);
        clients.splice(clientIndex, 1);
        localStorage.setItem("clients", JSON.stringify(clients));
        localStorage.removeItem(`investments_${clientId}`);
        localStorage.removeItem(`returns_${clientId}`);
        updateClientDropdown();
        hideClientData();
    }

    // Initialize by updating the dropdown
    updateClientDropdown();
});
