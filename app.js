let trips = [];
let currentTripId = null;
let people = [];
let categories = [];
let expenses = [];

const STORAGE_KEYS = {
    TRIPS: 'tripExpense_trips',
    CURRENT_TRIP: 'tripExpense_currentTrip'
};

function loadTrips() {
    const storedTrips = localStorage.getItem(STORAGE_KEYS.TRIPS);
    trips = storedTrips ? JSON.parse(storedTrips) : [];
    
    const storedCurrentTrip = localStorage.getItem(STORAGE_KEYS.CURRENT_TRIP);
    currentTripId = storedCurrentTrip || null;
    
    if (currentTripId && trips.find(t => t.id === currentTripId)) {
        loadTripData(currentTripId);
    } else if (trips.length > 0) {
        currentTripId = trips[0].id;
        saveCurrentTrip();
        loadTripData(currentTripId);
    } else {
        people = [];
        categories = getDefaultCategories();
        expenses = [];
    }
    
    renderTripSelector();
}

function loadTripData(tripId) {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    
    people = trip.people || [];
    categories = trip.categories || getDefaultCategories();
    expenses = trip.expenses || [];
}

function saveTrips() {
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
}

function saveCurrentTrip() {
    localStorage.setItem(STORAGE_KEYS.CURRENT_TRIP, currentTripId);
}

function saveTripData() {
    if (!currentTripId) return;
    
    const trip = trips.find(t => t.id === currentTripId);
    if (trip) {
        trip.people = people;
        trip.categories = categories;
        trip.expenses = expenses;
        saveTrips();
    }
}

function getDefaultCategories() {
    return [
        { id: generateId(), name: 'Food', icon: ' ' },
        { id: generateId(), name: 'Transport', icon: ' ' },
        { id: generateId(), name: 'Accommodation', icon: ' ' },
        { id: generateId(), name: 'Entertainment', icon: ' ' },
        { id: generateId(), name: 'Shopping', icon: ' ' },
        { id: generateId(), name: 'Other', icon: ' ' }
    ];
}

function savePeople() {
    saveTripData();
}

function saveCategories() {
    saveTripData();
}

function saveExpenses() {
    saveTripData();
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function switchPage(pageName) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`${pageName}-page`).classList.add('active');
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');
    
    if (pageName === 'expenses') renderExpenses();
    if (pageName === 'people') renderPeople();
    if (pageName === 'categories') renderCategories();
    if (pageName === 'summary') renderSummary();
}

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchPage(btn.dataset.page));
});

function showPersonModal(personId = null) {
    const modal = document.getElementById('person-modal');
    const form = document.getElementById('person-form');
    const title = document.getElementById('person-modal-title');
    
    form.reset();
    
    if (personId) {
        const person = people.find(p => p.id === personId);
        if (person) {
            title.textContent = 'Edit Person';
            document.getElementById('person-id').value = person.id;
            document.getElementById('person-name').value = person.name;
            document.getElementById('person-email').value = person.email || '';
        }
    } else {
        title.textContent = 'Add Person';
        document.getElementById('person-id').value = '';
    }
    
    modal.classList.add('active');
}

function closePersonModal() {
    document.getElementById('person-modal').classList.remove('active');
}

function savePerson(event) {
    event.preventDefault();
    
    const id = document.getElementById('person-id').value;
    const name = document.getElementById('person-name').value.trim();
    const email = document.getElementById('person-email').value.trim();
    
    if (id) {
        const person = people.find(p => p.id === id);
        if (person) {
            person.name = name;
            person.email = email;
        }
    } else {
        people.push({
            id: generateId(),
            name: name,
            email: email
        });
    }
    
    savePeople();
    renderPeople();
    closePersonModal();
}

function deletePerson(personId) {
    if (!confirm('Are you sure you want to delete this person? This will also remove them from all expenses.')) {
        return;
    }
    
    people = people.filter(p => p.id !== personId);
    
    expenses.forEach(expense => {
        if (expense.paidBy === personId) {
            expense.paidBy = null;
        }
        expense.splitBetween = expense.splitBetween.filter(id => id !== personId);
    });
    
    savePeople();
    saveExpenses();
    renderPeople();
}

function renderPeople() {
    const container = document.getElementById('people-list');
    
    if (people.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"> </div>
                <div class="empty-state-text">No people added yet. Add people to start tracking expenses!</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = people.map(person => `
        <div class="list-item">
            <div class="item-info">
                <div class="item-title">${person.name}</div>
                ${person.email ? `<div class="item-subtitle">${person.email}</div>` : ''}
            </div>
            <div class="item-actions">
                <button class="btn btn-edit" onclick="showPersonModal('${person.id}')">Edit</button>
                <button class="btn btn-danger" onclick="deletePerson('${person.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function showCategoryModal(categoryId = null) {
    const modal = document.getElementById('category-modal');
    const form = document.getElementById('category-form');
    const title = document.getElementById('category-modal-title');
    
    form.reset();
    
    if (categoryId) {
        const category = categories.find(c => c.id === categoryId);
        if (category) {
            title.textContent = 'Edit Category';
            document.getElementById('category-id').value = category.id;
            document.getElementById('category-name').value = category.name;
            document.getElementById('category-icon').value = category.icon || '';
        }
    } else {
        title.textContent = 'Add Category';
        document.getElementById('category-id').value = '';
    }
    
    modal.classList.add('active');
}

function closeCategoryModal() {
    document.getElementById('category-modal').classList.remove('active');
}

function saveCategory(event) {
    event.preventDefault();
    
    const id = document.getElementById('category-id').value;
    const name = document.getElementById('category-name').value.trim();
    const icon = document.getElementById('category-icon').value.trim();
    
    if (id) {
        const category = categories.find(c => c.id === id);
        if (category) {
            category.name = name;
            category.icon = icon;
        }
    } else {
        categories.push({
            id: generateId(),
            name: name,
            icon: icon
        });
    }
    
    saveCategories();
    renderCategories();
    closeCategoryModal();
}

function deleteCategory(categoryId) {
    if (!confirm('Are you sure you want to delete this category?')) {
        return;
    }
    
    categories = categories.filter(c => c.id !== categoryId);
    
    expenses.forEach(expense => {
        if (expense.category === categoryId) {
            expense.category = null;
        }
    });
    
    saveCategories();
    saveExpenses();
    renderCategories();
}

function renderCategories() {
    const container = document.getElementById('categories-list');
    
    if (categories.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"> </div>
                <div class="empty-state-text">No categories added yet. Add categories to organize your expenses!</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = categories.map(category => `
        <div class="list-item">
            <div class="item-info">
                <div class="item-title">${category.icon ? category.icon + ' ' : ''}${category.name}</div>
            </div>
            <div class="item-actions">
                <button class="btn btn-edit" onclick="showCategoryModal('${category.id}')">Edit</button>
                <button class="btn btn-danger" onclick="deleteCategory('${category.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function showExpenseModal(expenseId = null) {
    const modal = document.getElementById('expense-modal');
    const form = document.getElementById('expense-form');
    const title = document.getElementById('expense-modal-title');
    
    form.reset();
    
    const categorySelect = document.getElementById('expense-category');
    categorySelect.innerHTML = '<option value="">Select a category</option>' + 
        categories.map(cat => `<option value="${cat.id}">${cat.icon ? cat.icon + ' ' : ''}${cat.name}</option>`).join('');
    
    const paidBySelect = document.getElementById('expense-paidby');
    paidBySelect.innerHTML = '<option value="">Select person</option>' + 
        people.map(person => `<option value="${person.id}">${person.name}</option>`).join('');
    
    const splitPeopleDiv = document.getElementById('split-people');
    splitPeopleDiv.innerHTML = people.map(person => `
        <div class="checkbox-item">
            <input type="checkbox" id="split-${person.id}" value="${person.id}" checked>
            <label for="split-${person.id}">${person.name}</label>
        </div>
    `).join('');
    
    if (expenseId) {
        const expense = expenses.find(e => e.id === expenseId);
        if (expense) {
            title.textContent = 'Edit Expense';
            document.getElementById('expense-id').value = expense.id;
            document.getElementById('expense-description').value = expense.description;
            document.getElementById('expense-amount').value = expense.amount;
            document.getElementById('expense-category').value = expense.category;
            document.getElementById('expense-paidby').value = expense.paidBy;
            document.getElementById('expense-date').value = expense.date;
            
            people.forEach(person => {
                const checkbox = document.getElementById(`split-${person.id}`);
                if (checkbox) {
                    checkbox.checked = expense.splitBetween.includes(person.id);
                }
            });
        }
    } else {
        title.textContent = 'Add Expense';
        document.getElementById('expense-id').value = '';
        document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];
    }
    
    modal.classList.add('active');
}

function closeExpenseModal() {
    document.getElementById('expense-modal').classList.remove('active');
}

function saveExpense(event) {
    event.preventDefault();
    
    const id = document.getElementById('expense-id').value;
    const description = document.getElementById('expense-description').value.trim();
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const category = document.getElementById('expense-category').value;
    const paidBy = document.getElementById('expense-paidby').value;
    const date = document.getElementById('expense-date').value;
    
    const splitBetween = [];
    people.forEach(person => {
        const checkbox = document.getElementById(`split-${person.id}`);
        if (checkbox && checkbox.checked) {
            splitBetween.push(person.id);
        }
    });
    
    if (splitBetween.length === 0) {
        alert('Please select at least one person to split the expense with.');
        return;
    }
    
    if (id) {
        const expense = expenses.find(e => e.id === id);
        if (expense) {
            expense.description = description;
            expense.amount = amount;
            expense.category = category;
            expense.paidBy = paidBy;
            expense.date = date;
            expense.splitBetween = splitBetween;
        }
    } else {
        expenses.push({
            id: generateId(),
            description: description,
            amount: amount,
            category: category,
            paidBy: paidBy,
            date: date,
            splitBetween: splitBetween
        });
    }
    
    saveExpenses();
    renderExpenses();
    closeExpenseModal();
}

function deleteExpense(expenseId) {
    if (!confirm('Are you sure you want to delete this expense?')) {
        return;
    }
    
    expenses = expenses.filter(e => e.id !== expenseId);
    saveExpenses();
    renderExpenses();
}

function renderExpenses() {
    const container = document.getElementById('expenses-list');
    
    if (expenses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"> </div>
                <div class="empty-state-text">No expenses recorded yet. Start adding expenses to track your trip!</div>
            </div>
        `;
        return;
    }
    
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = sortedExpenses.map(expense => {
        const category = categories.find(c => c.id === expense.category);
        const paidByPerson = people.find(p => p.id === expense.paidBy);
        const splitPeople = expense.splitBetween.map(id => people.find(p => p.id === id)).filter(p => p);
        
        return `
            <div class="list-item expense-item">
                <div class="expense-details">
                    <div class="expense-header">
                        <span class="expense-category">${category ? category.icon : ' '}</span>
                        <div>
                            <div class="item-title">${expense.description}</div>
                            <div class="expense-meta">
                                <span> ${new Date(expense.date).toLocaleDateString('en-IN')}</span>
                                <span> Paid by ${paidByPerson ? paidByPerson.name : 'Unknown'}</span>
                            </div>
                            <div class="expense-split">
                                Split between: ${splitPeople.map(p => p.name).join(', ')}
                            </div>
                        </div>
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
                    <div class="expense-amount">₹${expense.amount.toFixed(2)}</div>
                    <div class="item-actions">
                        <button class="btn btn-edit" onclick="showExpenseModal('${expense.id}')">Edit</button>
                        <button class="btn btn-danger" onclick="deleteExpense('${expense.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function calculateBalances() {
    const balances = {};
    
    people.forEach(person => {
        balances[person.id] = 0;
    });
    
    expenses.forEach(expense => {
        if (!expense.paidBy || expense.splitBetween.length === 0) return;
        
        const sharePerPerson = expense.amount / expense.splitBetween.length;
        
        balances[expense.paidBy] += expense.amount;
        
        expense.splitBetween.forEach(personId => {
            balances[personId] -= sharePerPerson;
        });
    });
    
    return balances;
}

function calculateSettlements() {
    const balances = calculateBalances();
    const settlements = [];
    
    const debtors = [];
    const creditors = [];
    
    Object.entries(balances).forEach(([personId, balance]) => {
        if (balance < -0.01) {
            debtors.push({ personId, amount: -balance });
        } else if (balance > 0.01) {
            creditors.push({ personId, amount: balance });
        }
    });
    
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);
    
    let i = 0, j = 0;
    
    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];
        
        const amount = Math.min(debtor.amount, creditor.amount);
        
        const debtorPerson = people.find(p => p.id === debtor.personId);
        const creditorPerson = people.find(p => p.id === creditor.personId);
        
        if (debtorPerson && creditorPerson) {
            settlements.push({
                from: debtorPerson.name,
                to: creditorPerson.name,
                amount: amount
            });
        }
        
        debtor.amount -= amount;
        creditor.amount -= amount;
        
        if (debtor.amount < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }
    
    return settlements;
}

function renderSummary() {
    const container = document.getElementById('summary-content');
    
    if (expenses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"> </div>
                <div class="empty-state-text">No expenses to summarize yet. Add some expenses to see the summary!</div>
            </div>
        `;
        return;
    }
    
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const balances = calculateBalances();
    const settlements = calculateSettlements();
    
    const statsHtml = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Total Expenses</div>
                <div class="stat-value">₹${totalExpenses.toFixed(2)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Number of Expenses</div>
                <div class="stat-value">${expenses.length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">People Involved</div>
                <div class="stat-value">${people.length}</div>
            </div>
        </div>
    `;
    
    const balancesHtml = `
        <div class="summary-card">
            <h3>Individual Balances</h3>
            <div class="balance-list">
                ${people.map(person => {
                    const balance = balances[person.id] || 0;
                    const balanceClass = balance > 0.01 ? 'positive' : balance < -0.01 ? 'negative' : '';
                    const balanceText = balance > 0.01 ? `Gets back ₹${balance.toFixed(2)}` : 
                                       balance < -0.01 ? `Owes ₹${Math.abs(balance).toFixed(2)}` : 
                                       'Settled';
                    return `
                        <div class="balance-item">
                            <span class="balance-name">${person.name}</span>
                            <span class="balance-amount ${balanceClass}">${balanceText}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    const settlementsHtml = settlements.length > 0 ? `
        <div class="summary-card">
            <h3>Suggested Settlements</h3>
            <div class="settlement-list">
                ${settlements.map(settlement => `
                    <div class="settlement-item">
                        <strong>${settlement.from}</strong> should pay <strong>₹${settlement.amount.toFixed(2)}</strong> to <strong>${settlement.to}</strong>
                    </div>
                `).join('')}
            </div>
        </div>
    ` : `
        <div class="summary-card">
            <h3>Suggested Settlements</h3>
            <p style="color: var(--text-secondary); text-align: center; padding: 20px;">All expenses are settled! </p>
        </div>
    `;
    
    const categoryBreakdown = {};
    expenses.forEach(expense => {
        const category = categories.find(c => c.id === expense.category);
        const categoryName = category ? category.name : 'Uncategorized';
        const categoryIcon = category ? category.icon : ' ';
        
        if (!categoryBreakdown[categoryName]) {
            categoryBreakdown[categoryName] = { amount: 0, icon: categoryIcon };
        }
        categoryBreakdown[categoryName].amount += expense.amount;
    });
    
    const categoryHtml = `
        <div class="summary-card">
            <h3>Expenses by Category</h3>
            <div class="balance-list">
                ${Object.entries(categoryBreakdown).map(([name, data]) => `
                    <div class="balance-item">
                        <span class="balance-name">${data.icon} ${name}</span>
                        <span class="balance-amount">₹${data.amount.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    container.innerHTML = statsHtml + balancesHtml + settlementsHtml + categoryHtml;
}

function showTripModal(tripId = null) {
    const modal = document.getElementById('trip-modal');
    const form = document.getElementById('trip-form');
    const title = document.getElementById('trip-modal-title');
    
    form.reset();
    
    if (tripId) {
        const trip = trips.find(t => t.id === tripId);
        if (trip) {
            title.textContent = 'Edit Trip';
            document.getElementById('trip-id').value = trip.id;
            document.getElementById('trip-name').value = trip.name;
            document.getElementById('trip-description').value = trip.description || '';
            document.getElementById('trip-start-date').value = trip.startDate || '';
        }
    } else {
        title.textContent = 'Create New Trip';
        document.getElementById('trip-id').value = '';
    }
    
    modal.classList.add('active');
}

function closeTripModal() {
    document.getElementById('trip-modal').classList.remove('active');
}

function saveTrip(event) {
    event.preventDefault();
    
    const id = document.getElementById('trip-id').value;
    const name = document.getElementById('trip-name').value.trim();
    const description = document.getElementById('trip-description').value.trim();
    const startDate = document.getElementById('trip-start-date').value;
    
    if (id) {
        const trip = trips.find(t => t.id === id);
        if (trip) {
            trip.name = name;
            trip.description = description;
            trip.startDate = startDate;
        }
    } else {
        const newTrip = {
            id: generateId(),
            name: name,
            description: description,
            startDate: startDate,
            people: [],
            categories: getDefaultCategories(),
            expenses: [],
            createdAt: new Date().toISOString()
        };
        trips.push(newTrip);
        currentTripId = newTrip.id;
        saveCurrentTrip();
        loadTripData(currentTripId);
    }
    
    saveTrips();
    renderTripSelector();
    renderExpenses();
    renderPeople();
    renderCategories();
    closeTripModal();
}

function switchTrip() {
    const selector = document.getElementById('trip-selector');
    const selectedTripId = selector.value;
    
    if (!selectedTripId) return;
    
    if (currentTripId) {
        saveTripData();
    }
    
    currentTripId = selectedTripId;
    saveCurrentTrip();
    loadTripData(currentTripId);
    
    renderExpenses();
    renderPeople();
    renderCategories();
    renderSummary();
}

function renderTripSelector() {
    const selector = document.getElementById('trip-selector');
    
    if (trips.length === 0) {
        selector.innerHTML = '<option value="">No trips yet - Create one!</option>';
        selector.disabled = true;
        return;
    }
    
    selector.disabled = false;
    selector.innerHTML = trips.map(trip => 
        `<option value="${trip.id}" ${trip.id === currentTripId ? 'selected' : ''}>${trip.name}</option>`
    ).join('');
}

window.onclick = function(event) {
    const personModal = document.getElementById('person-modal');
    const categoryModal = document.getElementById('category-modal');
    const expenseModal = document.getElementById('expense-modal');
    const tripModal = document.getElementById('trip-modal');
    
    if (event.target === personModal) {
        closePersonModal();
    }
    if (event.target === categoryModal) {
        closeCategoryModal();
    }
    if (event.target === expenseModal) {
        closeExpenseModal();
    }
    if (event.target === tripModal) {
        closeTripModal();
    }
}

loadTrips();
renderExpenses();
renderPeople();
renderCategories();