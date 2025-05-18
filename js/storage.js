// js/storage.js

const TRANSACTIONS_KEY = 'financial_app_transactions';
const EMERGENCY_FUND_DETAILS_KEY = 'financial_app_emergency_details';

/**
 * Retrieves all transactions from Local Storage.
 * @returns {Array} An array of transaction objects.
 */
function getAllTransactions() {
    const transactionsJson = localStorage.getItem(TRANSACTIONS_KEY);
    return transactionsJson ? JSON.parse(transactionsJson) : [];
}

/**
 * Saves an array of transactions to Local Storage.
 * @param {Array} transactions - The array of transaction objects to save.
 */
function saveTransactions(transactions) {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}

/**
 * Adds a new transaction to Local Storage.
 * @param {Object} transaction - The transaction object to add. Must include description, amount, date, type, and category.
 * @returns {Object} The added transaction object (with an ID).
 */
function addTransaction(transaction) {
    const transactions = getAllTransactions();
    // Adiciona um ID único e garante que a categoria esteja presente (mesmo que vazia)
    const newTransaction = { 
        ...transaction, 
        id: Date.now() + Math.floor(Math.random() * 1000),
        category: transaction.category || 'nao-categorizado' // Categoria padrão se não fornecida
    };
    transactions.push(newTransaction);
    saveTransactions(transactions);
    return newTransaction;
}

/**
 * Updates an existing transaction in Local Storage.
 * @param {Object} updatedTransaction - The transaction object with updated data. Must include id.
 * @returns {boolean} True if the transaction was found and updated, false otherwise.
 */
function updateTransaction(updatedTransaction) {
    let transactions = getAllTransactions();
    const transactionIndex = transactions.findIndex(t => t.id === updatedTransaction.id);

    if (transactionIndex > -1) {
        // Garante que a categoria seja atualizada ou mantida
        transactions[transactionIndex] = {
            ...transactions[transactionIndex], // Mantém campos existentes
            ...updatedTransaction, // Sobrescreve com os atualizados
            category: updatedTransaction.category || transactions[transactionIndex].category || 'nao-categorizado'
        };
        saveTransactions(transactions);
        return true;
    }
    return false;
}

/**
 * Deletes a transaction from Local Storage by its ID.
 * @param {number | string} transactionId - The ID of the transaction to delete.
 * @returns {boolean} True if the transaction was found and deleted, false otherwise.
 */
function deleteTransaction(transactionId) {
    let transactions = getAllTransactions();
    const initialLength = transactions.length;
    transactions = transactions.filter(t => t.id !== transactionId);

    if (transactions.length < initialLength) {
        saveTransactions(transactions);
        return true;
    }
    return false;
}

/**
 * Retrieves a single transaction by its ID.
 * @param {number | string} transactionId - The ID of the transaction to retrieve.
 * @returns {Object | null} The transaction object if found, otherwise null.
 */
function getTransactionById(transactionId) {
    const transactions = getAllTransactions();
    return transactions.find(t => t.id === transactionId) || null;
}

/**
 * Saves the user's emergency fund details to Local Storage.
 * @param {Object} details - The emergency fund details object.
 * @param {number} details.goalAmount - The target amount for the emergency fund.
 * @param {number} details.currentAmount - The current amount saved for the emergency fund.
 * @param {number | null} details.goalMonths - The number of months this goal represents (optional).
 */
function saveEmergencyFundDetails(details) {
    const validDetails = {
        goalAmount: typeof details.goalAmount === 'number' ? details.goalAmount : 0,
        currentAmount: typeof details.currentAmount === 'number' ? details.currentAmount : 0,
        goalMonths: (typeof details.goalMonths === 'number' && details.goalMonths > 0) ? details.goalMonths : null
    };
    localStorage.setItem(EMERGENCY_FUND_DETAILS_KEY, JSON.stringify(validDetails));
}

/**
 * Retrieves the user's emergency fund details from Local Storage.
 * @returns {{goalAmount: number, currentAmount: number, goalMonths: number | null}} 
 * The details object. Returns default values if not found or invalid.
 */
function getEmergencyFundDetails() {
    const detailsJson = localStorage.getItem(EMERGENCY_FUND_DETAILS_KEY);
    if (detailsJson) {
        try {
            const details = JSON.parse(detailsJson);
            if (typeof details.goalAmount === 'number' && typeof details.currentAmount === 'number') {
                return {
                    goalAmount: details.goalAmount,
                    currentAmount: details.currentAmount,
                    goalMonths: (typeof details.goalMonths === 'number' && details.goalMonths > 0) ? details.goalMonths : null
                };
            }
        } catch (e) {
            console.error("Erro ao parsear detalhes da reserva de emergência:", e);
        }
    }
    return { goalAmount: 0, currentAmount: 0, goalMonths: null }; // Retorna padrão
}

// console.log('storage.js loaded with category and detailed emergency fund functions');
