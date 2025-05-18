// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Identificação da Página ---
    const currentPage = window.location.pathname.split("/").pop();
    const isIndexPage = currentPage === 'index.html' || currentPage === '';
    const isDashboardPage = currentPage === 'dashboard.html';

    // --- Elementos do Seletor de Tema ---
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const moonIcon = themeToggleButton ? themeToggleButton.querySelector('.fa-moon') : null;
    const sunIcon = themeToggleButton ? themeToggleButton.querySelector('.fa-sun') : null;

    // --- Elementos Comuns do DOM ---
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpenseEl = document.getElementById('total-expense');
    const currentBalanceEl = document.getElementById('current-balance');
    const incomeExpenseChartEl = document.getElementById('incomeExpenseChart');
    const balanceHistoryChartEl = document.getElementById('balanceHistoryChart');
    const expenseCategoryChartEl = document.getElementById('expenseCategoryChart'); // Canvas para o novo gráfico
    const currentYearSpan = document.getElementById('current-year');

    // --- Elementos Específicos da Página Index ---
    let screens, navButtonsInternal, transactionForm, formMessage, transactionsTableBody, noTransactionsMessage;
    let searchTransactionsInput, filterTypeSelect;
    let editModal, closeEditModalButton, cancelEditButton, editTransactionForm;
    let editIdInput, editDescriptionInput, editAmountInput, editDateInput, editCategoryInput; // Adicionado editCategoryInput

    if (isIndexPage) {
        screens = document.querySelectorAll('.screen');
        navButtonsInternal = document.querySelectorAll('nav .nav-button:not(a)');
        transactionForm = document.getElementById('transaction-form');
        formMessage = document.getElementById('form-message');
        transactionsTableBody = document.getElementById('transactions-table-body');
        noTransactionsMessage = document.getElementById('no-transactions-message');
        searchTransactionsInput = document.getElementById('search-transactions');
        filterTypeSelect = document.getElementById('filter-type');
        editModal = document.getElementById('edit-modal');
        closeEditModalButton = document.getElementById('close-modal-button');
        cancelEditButton = document.getElementById('cancel-edit-button');
        editTransactionForm = document.getElementById('edit-transaction-form');
        editIdInput = document.getElementById('edit-id');
        editDescriptionInput = document.getElementById('edit-description');
        editAmountInput = document.getElementById('edit-amount');
        editDateInput = document.getElementById('edit-date');
        editCategoryInput = document.getElementById('edit-category'); // Para o modal de edição
    }

    // --- Elementos Específicos da Página Dashboard ---
    let currentDateDisplayEl, todayIncomeEl, todayExpenseEl;
    let emergencyFundGoalInputEl, emergencyFundMonthsInputEl, saveEmergencyGoalButtonEl, emergencyGoalSavedMessageEl;
    let emergencyFundOperationAmountInputEl, addToEmergencyFundButtonEl, withdrawFromEmergencyFundButtonEl, emergencyOperationMessageEl;
    let emergencyFundGoalDisplayEl, emergencyFundMonthsDisplayEl, emergencyFundMonthlyGoalDisplayEl, emergencyFundCurrentDisplayEl, emergencyFundProgressTextEl;
    let shieldVisualizationEl, shieldFillEl, shieldStatusMessageEl, shieldIconBaseEl;
    let vaultContainerEl, vaultIconEl, vaultMessageEl, emergencyFundSurplusEl, noSurplusMessageEl;

    if (isDashboardPage) {
        currentDateDisplayEl = document.getElementById('current-date-display');
        todayIncomeEl = document.getElementById('today-income');
        todayExpenseEl = document.getElementById('today-expense');
        emergencyFundGoalInputEl = document.getElementById('emergency-fund-goal-input');
        emergencyFundMonthsInputEl = document.getElementById('emergency-fund-months-input');
        saveEmergencyGoalButtonEl = document.getElementById('save-emergency-goal-button');
        emergencyGoalSavedMessageEl = document.getElementById('emergency-goal-saved-message');
        emergencyFundOperationAmountInputEl = document.getElementById('emergency-fund-operation-amount-input');
        addToEmergencyFundButtonEl = document.getElementById('add-to-emergency-fund-button');
        withdrawFromEmergencyFundButtonEl = document.getElementById('withdraw-from-emergency-fund-button');
        emergencyOperationMessageEl = document.getElementById('emergency-operation-message');
        emergencyFundGoalDisplayEl = document.getElementById('emergency-fund-goal-display');
        emergencyFundMonthsDisplayEl = document.getElementById('emergency-fund-months-display');
        emergencyFundMonthlyGoalDisplayEl = document.getElementById('emergency-fund-monthly-goal-display');
        emergencyFundCurrentDisplayEl = document.getElementById('emergency-fund-current-display');
        emergencyFundProgressTextEl = document.getElementById('emergency-fund-progress-text');
        shieldVisualizationEl = document.getElementById('shield-visualization');
        if (shieldVisualizationEl) { 
            shieldFillEl = shieldVisualizationEl.querySelector('.emergency-shield-fill');
            shieldIconBaseEl = shieldVisualizationEl.querySelector('.emergency-shield-icon');
        }
        shieldStatusMessageEl = document.getElementById('shield-status-message');
        vaultContainerEl = document.getElementById('vault-container');
        vaultIconEl = document.getElementById('vault-icon');
        vaultMessageEl = document.getElementById('vault-message');
        emergencyFundSurplusEl = document.getElementById('emergency-fund-surplus');
        noSurplusMessageEl = document.getElementById('no-surplus-message');

        if (saveEmergencyGoalButtonEl) {
            saveEmergencyGoalButtonEl.addEventListener('click', () => {
                const goalAmountValue = parseFloat(emergencyFundGoalInputEl.value);
                const goalMonthsValue = emergencyFundMonthsInputEl.value ? parseInt(emergencyFundMonthsInputEl.value) : null;
                if (isNaN(goalAmountValue) || goalAmountValue <= 0) {
                    alert('Por favor, insira um valor de META válido (maior que zero).');
                    emergencyFundGoalInputEl.focus(); return;
                }
                if (goalMonthsValue !== null && (isNaN(goalMonthsValue) || goalMonthsValue <= 0)) {
                    alert('Por favor, insira um número de MESES válido (maior que zero) ou deixe em branco.');
                    emergencyFundMonthsInputEl.focus(); return;
                }
                const currentDetails = getEmergencyFundDetails();
                saveEmergencyFundDetails({ 
                    goalAmount: goalAmountValue, currentAmount: currentDetails.currentAmount, goalMonths: goalMonthsValue
                }); 
                if(emergencyGoalSavedMessageEl) {
                    emergencyGoalSavedMessageEl.textContent = "Meta da reserva salva!";
                    emergencyGoalSavedMessageEl.classList.remove('hidden', 'text-red-600');
                    emergencyGoalSavedMessageEl.classList.add('text-green-600');
                    setTimeout(() => emergencyGoalSavedMessageEl.classList.add('hidden'), 2500);
                }
                updateUIData(); 
            });
        }
        if (addToEmergencyFundButtonEl) {
            addToEmergencyFundButtonEl.addEventListener('click', () => {
                const amountToAdd = parseFloat(emergencyFundOperationAmountInputEl.value);
                if (isNaN(amountToAdd) || amountToAdd <= 0) {
                    alert('Por favor, insira um valor positivo para adicionar.');
                    emergencyFundOperationAmountInputEl.focus(); return;
                }
                const currentDetails = getEmergencyFundDetails();
                saveEmergencyFundDetails({
                    goalAmount: currentDetails.goalAmount, currentAmount: currentDetails.currentAmount + amountToAdd, goalMonths: currentDetails.goalMonths
                });
                if(emergencyOperationMessageEl){
                    emergencyOperationMessageEl.textContent = `${formatCurrency(amountToAdd)} adicionado à reserva.`;
                    emergencyOperationMessageEl.classList.remove('hidden', 'text-red-600');
                    emergencyOperationMessageEl.classList.add('text-green-600');
                    setTimeout(() => emergencyOperationMessageEl.classList.add('hidden'), 2500);
                }
                emergencyFundOperationAmountInputEl.value = ''; updateUIData();
            });
        }
        if (withdrawFromEmergencyFundButtonEl) {
            withdrawFromEmergencyFundButtonEl.addEventListener('click', () => {
                const amountToWithdraw = parseFloat(emergencyFundOperationAmountInputEl.value);
                if (isNaN(amountToWithdraw) || amountToWithdraw <= 0) {
                    alert('Por favor, insira um valor positivo para retirar.');
                    emergencyFundOperationAmountInputEl.focus(); return;
                }
                const currentDetails = getEmergencyFundDetails();
                if (amountToWithdraw > currentDetails.currentAmount) {
                    alert('Valor de retirada maior que o saldo atual da reserva.');
                    emergencyFundOperationAmountInputEl.focus(); return;
                }
                saveEmergencyFundDetails({
                    goalAmount: currentDetails.goalAmount, currentAmount: currentDetails.currentAmount - amountToWithdraw, goalMonths: currentDetails.goalMonths
                });
                 if(emergencyOperationMessageEl){
                    emergencyOperationMessageEl.textContent = `${formatCurrency(amountToWithdraw)} retirado da reserva.`;
                    emergencyOperationMessageEl.classList.remove('hidden', 'text-green-600');
                    emergencyOperationMessageEl.classList.add('text-red-600');
                    setTimeout(() => emergencyOperationMessageEl.classList.add('hidden'), 2500);
                }
                emergencyFundOperationAmountInputEl.value = ''; updateUIData();
            });
        }
    }
    
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            if (moonIcon) moonIcon.classList.add('hidden');
            if (sunIcon) sunIcon.classList.remove('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            if (moonIcon) moonIcon.classList.remove('hidden');
            if (sunIcon) sunIcon.classList.add('hidden');
        }
    }

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            const isCurrentlyDark = document.documentElement.classList.contains('dark');
            const newTheme = isCurrentlyDark ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
            if (typeof updateDashboardData === 'function' && (isDashboardPage || (isIndexPage && document.getElementById('dashboard-screen')?.classList.contains('active')))) {
                updateDashboardData(getAllTransactions());
            }
        });
    }
    
    function setActiveScreen(screenId) {
        if (!isIndexPage || !screens || !navButtonsInternal) return;
        screens.forEach(screen => screen.classList.toggle('active', screen.id === screenId));
        navButtonsInternal.forEach(button => {
            const isButtonForScreen = button.dataset.screen === screenId;
            button.classList.toggle('active-nav', isButtonForScreen);
            const baseClasses = 'flex-1 py-3 px-4 text-sm font-medium text-center rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500';
            const activeClasses = 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-slate-700';
            const inactiveClasses = 'text-slate-700 hover:bg-indigo-100 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-indigo-400';
            button.classList.remove(...activeClasses.split(' '), ...inactiveClasses.split(' '));
            button.classList.add(...baseClasses.split(' '));
            if (isButtonForScreen) button.classList.add(...activeClasses.split(' '));
            else button.classList.add(...inactiveClasses.split(' '));
        });
        if (history.pushState) history.pushState(null, null, `#${screenId}`);
        else window.location.hash = `#${screenId}`;
        if (screenId === 'dashboard-screen' || screenId === 'transactions-screen') updateUIData();
    }

    if (isIndexPage && navButtonsInternal) {
        navButtonsInternal.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault(); 
                setActiveScreen(button.dataset.screen);
            });
        });
    }
    
    if (isDashboardPage) {
        const dashboardNavLink = document.getElementById('nav-dashboard-link');
        if (dashboardNavLink) {
            dashboardNavLink.classList.remove('text-slate-700', 'hover:bg-indigo-100', 'hover:text-indigo-600', 'dark:text-slate-300', 'dark:hover:bg-slate-700', 'dark:hover:text-indigo-400');
            dashboardNavLink.classList.add('text-indigo-600', 'bg-indigo-100', 'dark:text-indigo-400', 'dark:bg-slate-700', 'active-nav');
        }
    } else if (isIndexPage) { 
        const dashboardIndexLink = document.getElementById('nav-dashboard-link-index');
        if (dashboardIndexLink) {
             dashboardIndexLink.classList.add('text-slate-700', 'hover:bg-indigo-100', 'hover:text-indigo-600', 'dark:text-slate-300', 'dark:hover:bg-slate-700', 'dark:hover:text-indigo-400');
             dashboardIndexLink.classList.remove('text-indigo-600', 'bg-indigo-100', 'dark:text-indigo-400', 'dark:bg-slate-700', 'active-nav');
        }
    }

    function formatCurrency(amount) {
        return parseFloat(amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function formatDate(dateString, options = { day: '2-digit', month: '2-digit', year: 'numeric' }) {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', options);
    }

    function showFormMessage(message, type = 'success') {
        if (!formMessage) return; 
        const successClasses = 'bg-green-100 text-green-700 border border-green-300 dark:bg-green-800/30 dark:text-green-300 dark:border-green-600';
        const errorClasses = 'bg-red-100 text-red-700 border border-red-300 dark:bg-red-800/30 dark:text-red-300 dark:border-red-600';
        formMessage.className = `mt-4 text-center p-3 rounded-md text-sm ${type === 'success' ? successClasses : errorClasses}`;
        formMessage.classList.remove('hidden');
        setTimeout(() => {
            formMessage.classList.add('hidden');
            formMessage.textContent = '';
        }, 3000);
    }

    function setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        if (isIndexPage && transactionForm && transactionForm.date) transactionForm.date.value = today;
        if (isIndexPage && editDateInput) editDateInput.value = today;
    }

    // ATUALIZADO: Lógica de Transações para incluir categoria
    if (isIndexPage && transactionForm) {
        transactionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const description = transactionForm.description.value.trim();
            const amount = parseFloat(transactionForm.amount.value);
            const date = transactionForm.date.value;
            const type = transactionForm.type.value;
            const category = transactionForm.category.value; // Pega o valor da categoria

            if (!description || isNaN(amount) || amount <= 0 || !date || !category) { // Valida categoria
                showFormMessage('Por favor, preencha todos os campos, incluindo a categoria.', 'error');
                return;
            }
            addTransaction({ description, amount, date, type, category }); // Passa categoria
            showFormMessage('Transação adicionada com sucesso!', 'success');
            transactionForm.reset();
            setDefaultDate(); 
            updateUIData();
            if (screens && navButtonsInternal) setActiveScreen('transactions-screen'); 
        });
    }

    // ATUALIZADO: renderTransactionsTable para exibir categoria
    function renderTransactionsTable(transactionsToRender) {
        if (!isIndexPage || !transactionsTableBody || !noTransactionsMessage) return;
        transactionsTableBody.innerHTML = ''; 
        if (transactionsToRender.length === 0) {
            noTransactionsMessage.classList.remove('hidden');
            // Aumenta colspan para 6 devido à nova coluna de categoria
            transactionsTableBody.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-slate-500 dark:text-slate-400">Nenhuma transação encontrada.</td></tr>`;
            return;
        }
        noTransactionsMessage.classList.add('hidden');
        transactionsToRender.forEach(transaction => {
            const row = transactionsTableBody.insertRow();
            row.className = `hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${transaction.type === 'income' ? 'transaction-income' : 'transaction-expense'}`;
            // Adiciona a célula da categoria
            row.innerHTML = `
                <td class="px-6 py-4 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">${transaction.description}</td>
                <td class="px-6 py-4 whitespace-nowrap">${formatCurrency(transaction.amount)}</td>
                <td class="px-6 py-4 whitespace-nowrap"><span class="px-2.5 py-1 text-xs font-semibold rounded-full">${transaction.type === 'income' ? 'Receita' : 'Despesa'}</span></td>
                <td class="px-6 py-4 whitespace-nowrap text-sm capitalize">${transaction.category ? transaction.category.replace('-', ' ') : 'N/A'}</td> 
                <td class="px-6 py-4 whitespace-nowrap">${formatDate(transaction.date)}</td>
                <td class="px-6 py-4 text-center whitespace-nowrap">
                    <button class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors mr-3 p-1" data-id="${transaction.id}" title="Editar"><i class="fas fa-edit fa-fw"></i></button>
                    <button class="text-red-500 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1" data-id="${transaction.id}" title="Excluir"><i class="fas fa-trash fa-fw"></i></button>
                </td>`;
            row.querySelector('button[title="Editar"]').addEventListener('click', () => openEditModal(transaction.id));
            row.querySelector('button[title="Excluir"]').addEventListener('click', () => handleDeleteTransaction(transaction.id));
        });
    }

    function updateEmergencyFundVisuals(emergencyDetails) {
        if (!isDashboardPage || !shieldFillEl || !emergencyFundGoalDisplayEl || !shieldVisualizationEl || !vaultContainerEl) return;
        const goalAmount = emergencyDetails ? emergencyDetails.goalAmount : 0;
        const currentAmount = emergencyDetails ? emergencyDetails.currentAmount : 0;
        const goalMonths = emergencyDetails ? emergencyDetails.goalMonths : null;
        emergencyFundGoalDisplayEl.textContent = formatCurrency(goalAmount > 0 ? goalAmount : 0);
        if (emergencyFundMonthsDisplayEl) emergencyFundMonthsDisplayEl.textContent = goalMonths ? `(Representa ${goalMonths} meses)` : "";
        if (emergencyFundCurrentDisplayEl) emergencyFundCurrentDisplayEl.textContent = formatCurrency(currentAmount);
        if (emergencyFundMonthlyGoalDisplayEl) {
            if (goalAmount > 0 && goalMonths && goalMonths > 0) {
                emergencyFundMonthlyGoalDisplayEl.textContent = `Você precisa guardar ${formatCurrency(goalAmount / goalMonths)}/mês para atingir sua meta em ${goalMonths} meses.`;
            } else emergencyFundMonthlyGoalDisplayEl.textContent = "";
        }
        if (goalAmount <= 0) {
            if (emergencyFundProgressTextEl) emergencyFundProgressTextEl.textContent = "0%";
            shieldFillEl.style.height = '0%'; shieldFillEl.style.backgroundColor = '#e5e7eb'; 
            if(shieldStatusMessageEl) shieldStatusMessageEl.textContent = "Defina uma meta para sua reserva de emergência.";
            vaultIconEl.classList.add('hidden'); emergencyFundSurplusEl.classList.add('hidden');
            vaultMessageEl.classList.add('hidden'); noSurplusMessageEl.classList.remove('hidden');
            return;
        }
        let progressPercentageRaw = (currentAmount / goalAmount) * 100;
        const displayPercentageForShield = Math.min(Math.max(progressPercentageRaw, 0), 100);
        if (emergencyFundProgressTextEl) emergencyFundProgressTextEl.textContent = `${progressPercentageRaw.toFixed(1)}%`;
        shieldFillEl.style.height = `${displayPercentageForShield}%`;
        let shieldColor = '#e5e7eb', statusMessage = "";
        if (displayPercentageForShield <= 0) { statusMessage = "Comece a construir sua reserva!"; shieldColor = '#ef4444'; }
        else if (displayPercentageForShield <= 33) { shieldColor = '#ef4444'; statusMessage = "Reserva em estágio inicial. Continue poupando!"; }
        else if (displayPercentageForShield <= 66) { shieldColor = '#f59e0b'; statusMessage = "Bom progresso! Quase lá."; }
        else { shieldColor = '#22c55e'; statusMessage = displayPercentageForShield < 100 ? "Excelente! Mantenha o foco." : "Reserva de emergência completa!";}
        shieldFillEl.style.backgroundColor = shieldColor;
        if(shieldStatusMessageEl) shieldStatusMessageEl.textContent = statusMessage;
        if (progressPercentageRaw > 100) {
            const surplusAmount = currentAmount - goalAmount;
            vaultIconEl.classList.remove('hidden'); emergencyFundSurplusEl.textContent = `+ ${formatCurrency(surplusAmount)}`;
            emergencyFundSurplusEl.classList.remove('hidden'); vaultMessageEl.classList.remove('hidden');
            noSurplusMessageEl.classList.add('hidden');
        } else {
            vaultIconEl.classList.add('hidden'); emergencyFundSurplusEl.classList.add('hidden');
            vaultMessageEl.classList.add('hidden'); noSurplusMessageEl.classList.remove('hidden');
        }
    }

    function updateDashboardData(transactions) {
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const balance = totalIncome - totalExpense; 
        if (totalIncomeEl) totalIncomeEl.textContent = formatCurrency(totalIncome);
        if (totalExpenseEl) totalExpenseEl.textContent = formatCurrency(totalExpense);
        if (currentBalanceEl) { 
            currentBalanceEl.textContent = formatCurrency(balance);
            const isDark = document.documentElement.classList.contains('dark');
            currentBalanceEl.className = `text-3xl font-bold ${balance >= 0 ? (isDark ? 'text-indigo-400' : 'text-indigo-600') : (isDark ? 'text-red-400' : 'text-red-600')}`;
        }
        const isDarkMode = document.documentElement.classList.contains('dark');
        if (incomeExpenseChartEl && typeof renderIncomeExpenseChart === 'function') renderIncomeExpenseChart(totalIncome, totalExpense, isDarkMode);
        if (balanceHistoryChartEl && typeof renderBalanceHistoryChart === 'function') renderBalanceHistoryChart(transactions, isDarkMode);
        
        // CHAMA O NOVO GRÁFICO DE CATEGORIA
        if (expenseCategoryChartEl && typeof renderExpenseCategoryChart === 'function') {
            renderExpenseCategoryChart(transactions, isDarkMode);
        }

        if (isDashboardPage) {
            if (currentDateDisplayEl) currentDateDisplayEl.textContent = formatDate(new Date().toISOString().split('T')[0], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const todayString = new Date().toISOString().split('T')[0];
            const todayIn = transactions.filter(t => t.date === todayString && t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const todayOut = transactions.filter(t => t.date === todayString && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            if (todayIncomeEl) todayIncomeEl.textContent = formatCurrency(todayIn);
            if (todayExpenseEl) todayExpenseEl.textContent = formatCurrency(todayOut);
            const avgDailyExpenseEl = document.getElementById('avg-daily-expense');
            if (avgDailyExpenseEl) {
                const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30); thirtyDaysAgo.setHours(0,0,0,0);
                const expensesLast30Days = transactions.filter(t => new Date(t.date + 'T00:00:00') >= thirtyDaysAgo && t.type === 'expense');
                const totalExpenses30Days = expensesLast30Days.reduce((sum, t) => sum + t.amount, 0);
                avgDailyExpenseEl.textContent = formatCurrency(totalExpenses30Days > 0 ? totalExpenses30Days / 30 : 0);
            }
            const savedEmergencyDetails = getEmergencyFundDetails(); 
            if (emergencyFundGoalInputEl && emergencyFundMonthsInputEl && savedEmergencyDetails) {
                if (emergencyFundGoalInputEl.value === "" && savedEmergencyDetails.goalAmount > 0) emergencyFundGoalInputEl.value = savedEmergencyDetails.goalAmount.toFixed(2);
                if (emergencyFundMonthsInputEl.value === "" && savedEmergencyDetails.goalMonths !== null) emergencyFundMonthsInputEl.value = savedEmergencyDetails.goalMonths;
            }
            updateEmergencyFundVisuals(savedEmergencyDetails);
        }
    }

    function updateUIData() {
        const transactions = getAllTransactions();
        updateDashboardData(transactions); 
        if (isIndexPage && transactionsTableBody) {
            const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id);
            const searchTerm = searchTransactionsInput && searchTransactionsInput.value ? searchTransactionsInput.value.toLowerCase() : "";
            const filterTypeValue = filterTypeSelect ? filterTypeSelect.value : "all";
            const filteredTransactions = sortedTransactions.filter(t => 
                (searchTerm === "" || t.description.toLowerCase().includes(searchTerm) || formatCurrency(t.amount).toLowerCase().includes(searchTerm) || formatDate(t.date).includes(searchTerm) || (t.category && t.category.toLowerCase().includes(searchTerm))) && // Adiciona busca por categoria
                (filterTypeValue === 'all' || t.type === filterTypeValue)
            );
            renderTransactionsTable(filteredTransactions);
        }
    }

    if (isIndexPage && searchTransactionsInput && filterTypeSelect) {
        searchTransactionsInput.addEventListener('input', updateUIData);
        filterTypeSelect.addEventListener('change', updateUIData);
    }

    // ATUALIZADO: openEditModal para incluir categoria
    function openEditModal(transactionId) {
        if (!isIndexPage || !editModal || !editTransactionForm) return;
        const transaction = getTransactionById(transactionId);
        if (!transaction) return;
        editIdInput.value = transaction.id;
        editDescriptionInput.value = transaction.description;
        editAmountInput.value = transaction.amount;
        editDateInput.value = transaction.date; 
        editCategoryInput.value = transaction.category || ""; // Preenche categoria
        document.querySelector(`input[name="edit-type"][value="${transaction.type}"]`).checked = true;
        editModal.classList.remove('hidden');
        setTimeout(() => {
            editModal.classList.remove('opacity-0');
            editModal.querySelector('.transform').classList.remove('scale-95');
        }, 10);
    }

    function closeEditModal() {
        if (!isIndexPage || !editModal || !editTransactionForm) return;
        editModal.classList.add('opacity-0');
        editModal.querySelector('.transform').classList.add('scale-95');
        setTimeout(() => editModal.classList.add('hidden'), 300);
        editTransactionForm.reset();
    }

    // ATUALIZADO: Formulário de Edição para incluir categoria
    if (isIndexPage && editModal) {
        closeEditModalButton.addEventListener('click', closeEditModal);
        cancelEditButton.addEventListener('click', closeEditModal);
        editModal.addEventListener('click', (e) => { if (e.target === editModal) closeEditModal(); });
        editTransactionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = parseInt(editIdInput.value);
            const description = editDescriptionInput.value.trim();
            const amount = parseFloat(editAmountInput.value);
            const date = editDateInput.value;
            const type = document.querySelector('input[name="edit-type"]:checked').value;
            const category = editCategoryInput.value; // Pega categoria do modal

            if (!description || isNaN(amount) || amount <= 0 || !date || !category) { // Valida categoria
                alert('Por favor, preencha todos os campos corretamente, incluindo a categoria.'); return;
            }
            if (updateTransaction({ id, description, amount, date, type, category })) { // Passa categoria
                if (formMessage) showFormMessage('Transação atualizada com sucesso!', 'success');
                else alert('Transação atualizada com sucesso!');
                closeEditModal(); updateUIData();
            } else alert('Erro ao atualizar transação.');
        });
    }
    
    function handleDeleteTransaction(transactionId) {
        if (!isIndexPage) return;
        if (confirm('Tem certeza que deseja excluir esta transação?')) {
            if (deleteTransaction(transactionId)) {
                if (formMessage) showFormMessage('Transação excluída com sucesso!', 'success');
                else alert('Transação excluída com sucesso!');
            } else {
                 if (formMessage) showFormMessage('Erro ao excluir transação.', 'error');
                 else alert('Erro ao excluir transação.');
            }
            updateUIData();
        }
    }
    
    function initializeApp() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) applyTheme(savedTheme);
        else if (window.matchMedia('(prefers-color-scheme: dark)').matches) applyTheme('dark');
        else applyTheme('light');
        if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();
        setDefaultDate(); 
        if (isIndexPage) {
            const hash = window.location.hash.substring(1);
            const validScreens = ['home-screen', 'dashboard-screen', 'transactions-screen'];
            if (hash && validScreens.includes(hash) && document.getElementById(hash)) setActiveScreen(hash);
            else setActiveScreen('home-screen');
        }
        updateUIData(); 
    }

    initializeApp();
});
