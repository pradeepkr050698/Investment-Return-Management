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

    // Event Listener for adding new client or deleting selected client
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
        checkClientSelect();
    }

    // Check if a client is selected, change the Add Client button text
    function checkClientSelect() {
        if (clientSelect.value) {
            addClientBtn.textContent = "Delete Client";
        } else {
            addClientBtn.textContent = "Add Client";
        }
    }

    // Event listener for client selection
    clientSelect.addEventListener('change', function () {
        const selectedClientId = parseInt(this.value);
        if (selectedClientId) {
            currentClientId = selectedClientId;
            showClientData(currentClientId);
        } else {
            currentClientId = null;
            hideClientData();
        }
        checkClientSelect();
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
            totalInvestment += parseFloat(investment.amount); // Correctly sum investments
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
            totalReturns += parseFloat(returnItem.amount); // Correctly sum returns
        });

        // Display the totals
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
            const remarks = document.getElementById("remarks").value;

            if (type === "investment") {
                saveInvestment(data.clientId, data.index, { date, amount, remarks });
            } else {
                saveReturn(data.clientId, data.index, { date, amount, remarks });
            }

            modal.style.display = "none";
        };
    }

    // Save Investment data
    function saveInvestment(clientId, index, investmentData) {
        let investments = JSON.parse(localStorage.getItem(`investments_${clientId}`)) || [];
        if (index !== undefined) {
            investments[index] = investmentData;
        } else {
            investments.push(investmentData);
        }
        localStorage.setItem(`investments_${clientId}`, JSON.stringify(investments));
        showClientData(clientId);
    }

    // Save Return data
    function saveReturn(clientId, index, returnData) {
        let returns = JSON.parse(localStorage.getItem(`returns_${clientId}`)) || [];
        if (index !== undefined) {
            returns[index] = returnData;
        } else {
            returns.push(returnData);
        }
        localStorage.setItem(`returns_${clientId}`, JSON.stringify(returns));
        showClientData(clientId);
    }

    // Delete Client
    function deleteClient(clientId) {
        clients = clients.filter(client => client.id !== clientId);
        localStorage.setItem("clients", JSON.stringify(clients));

        // Clear client-specific investments and returns
        localStorage.removeItem(`investments_${clientId}`);
        localStorage.removeItem(`returns_${clientId}`);

        updateClientDropdown();
        hideClientData();
        alert("Client deleted successfully.");
    }

    // Add Investment Button functionality
    addInvestmentBtn.addEventListener('click', function () {
        if (currentClientId) {
            openModal('Add Investment', 'investment', { clientId: currentClientId });
        }
    });

    // Add Return Button functionality
    addReturnBtn.addEventListener('click', function () {
        if (currentClientId) {
            openModal('Add Return', 'return', { clientId: currentClientId });
        }
    });

    // Edit Button functionality
    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('edit-btn')) {
            const clientId = event.target.dataset.clientId;
            const type = event.target.dataset.type;
            const index = event.target.dataset.index;
            const data = type === 'investment' ? 
                JSON.parse(localStorage.getItem(`investments_${clientId}`))[index] :
                JSON.parse(localStorage.getItem(`returns_${clientId}`))[index];

            openModal(`Edit ${type.charAt(0).toUpperCase() + type.slice(1)}`, type, {
                clientId,
                index,
                ...data
            });
        }
    });

    // Delete Button functionality
    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('delete-btn')) {
            const clientId = event.target.dataset.clientId;
            const type = event.target.dataset.type;
            const index = event.target.dataset.index;

            if (type === 'investment') {
                deleteInvestment(clientId, index);
            } else {
                deleteReturn(clientId, index);
            }
        }
    });

    // Delete Investment
    function deleteInvestment(clientId, index) {
        let investments = JSON.parse(localStorage.getItem(`investments_${clientId}`)) || [];
        investments.splice(index, 1);
        localStorage.setItem(`investments_${clientId}`, JSON.stringify(investments));
        showClientData(clientId);
    }

    // Delete Return
    function deleteReturn(clientId, index) {
        let returns = JSON.parse(localStorage.getItem(`returns_${clientId}`)) || [];
        returns.splice(index, 1);
        localStorage.setItem(`returns_${clientId}`, JSON.stringify(returns));
        showClientData(clientId);
    }

    // Close Modal
    closeModalBtn.addEventListener('click', function () {
        modal.style.display = "none";
    });

    // Initialize the client dropdown on page load
    updateClientDropdown();
});
