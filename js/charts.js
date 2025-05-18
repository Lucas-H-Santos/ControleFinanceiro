// js/charts.js

let incomeExpenseChartInstance = null;
let balanceHistoryChartInstance = null;
let expenseCategoryChartInstance = null; // Instância para o novo gráfico

/**
 * Formats a number as Brazilian Real currency.
 * @param {number} amount - The amount to format.
 * @returns {string} The formatted currency string.
 */
function formatCurrencyBRL(amount) {
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Generates an array of distinct colors for charts.
 * @param {number} count - The number of colors needed.
 * @param {boolean} isDarkMode - Flag for dark mode.
 * @returns {Array<string>} An array of RGBA color strings.
 */
function getChartColors(count, isDarkMode = false) {
    const colorsLight = [
        'rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)',
        'rgba(199, 199, 199, 0.7)', 'rgba(83, 102, 255, 0.7)', 'rgba(40, 159, 64, 0.7)',
        'rgba(210, 99, 132, 0.7)' 
    ];
    const colorsDark = [ // Cores mais vibrantes ou claras para contraste no modo escuro
        'rgba(250, 128, 114, 0.8)', // Salmon
        'rgba(100, 149, 237, 0.8)', // CornflowerBlue
        'rgba(255, 215, 0, 0.8)',   // Gold
        'rgba(64, 224, 208, 0.8)',  // Turquoise
        'rgba(221, 160, 221, 0.8)', // Plum
        'rgba(255, 160, 122, 0.8)', // LightSalmon
        'rgba(176, 196, 222, 0.8)', // LightSteelBlue
        'rgba(147, 112, 219, 0.8)', // MediumPurple
        'rgba(60, 179, 113, 0.8)',  // MediumSeaGreen
        'rgba(240, 128, 128, 0.8)'  // LightCoral
    ];
    const baseColors = isDarkMode ? colorsDark : colorsLight;
    const resultColors = [];
    for (let i = 0; i < count; i++) {
        resultColors.push(baseColors[i % baseColors.length]); // Repete cores se necessário
    }
    return resultColors;
}


/**
 * Initializes or updates the Income vs. Expense Pie Chart.
 * @param {number} totalIncome - Total income amount.
 * @param {number} totalExpense - Total expense amount.
 * @param {boolean} isDarkMode - Flag to indicate if dark mode is active.
 */
function renderIncomeExpenseChart(totalIncome, totalExpense, isDarkMode = false) {
    const ctx = document.getElementById('incomeExpenseChart')?.getContext('2d');
    if (!ctx) return;

    const textColor = isDarkMode ? 'rgba(229, 231, 235, 0.9)' : 'rgba(55, 65, 81, 0.9)';
    const data = {
        labels: ['Receitas', 'Despesas'],
        datasets: [{
            data: [totalIncome, totalExpense],
            backgroundColor: [
                isDarkMode ? 'rgba(34, 197, 94, 0.7)' : 'rgba(76, 175, 80, 0.7)', 
                isDarkMode ? 'rgba(239, 68, 68, 0.7)' : 'rgba(244, 67, 54, 0.7)'
            ],
            borderColor: [
                isDarkMode ? 'rgba(34, 197, 94, 1)' : 'rgba(76, 175, 80, 1)',
                isDarkMode ? 'rgba(239, 68, 68, 1)' : 'rgba(244, 67, 54, 1)'
            ],
            borderWidth: 1, hoverOffset: 8
        }]
    };
    const config = {
        type: 'doughnut', data: data,
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: textColor, font: { family: 'Inter, sans-serif' }, padding: 15, usePointStyle: true, pointStyle: 'circle' }},
                tooltip: {
                    callbacks: { label: context => `${context.label || ''}: ${formatCurrencyBRL(context.parsed)}` },
                    backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(0,0,0,0.8)',
                    titleColor: textColor, bodyColor: textColor, titleFont: { family: 'Inter, sans-serif' }, bodyFont: { family: 'Inter, sans-serif' },
                    padding: 10, cornerRadius: 6
                }
            },
            animation: { animateScale: true, animateRotate: true, duration: 800, easing: 'easeInOutQuart' },
            cutout: '60%'
        }
    };
    if (incomeExpenseChartInstance) incomeExpenseChartInstance.destroy();
    incomeExpenseChartInstance = new Chart(ctx, config);
}

/**
 * Initializes or updates the Balance History Line Chart.
 * @param {Array} transactions - Array of all transactions.
 * @param {boolean} isDarkMode - Flag to indicate if dark mode is active.
 */
function renderBalanceHistoryChart(transactions, isDarkMode = false) {
    const ctx = document.getElementById('balanceHistoryChart')?.getContext('2d');
    if (!ctx) return;

    const textColor = isDarkMode ? 'rgba(229, 231, 235, 0.9)' : 'rgba(55, 65, 81, 0.9)';
    const gridColor = isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(200, 200, 200, 0.2)';
    const lineColor = isDarkMode ? 'rgba(99, 102, 241, 1)' : 'rgba(75, 100, 192, 1)';
    const fillColor = isDarkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(75, 100, 192, 0.1)';

    const last30DaysData = {};
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today); date.setDate(today.getDate() - i);
        last30DaysData[date.toISOString().split('T')[0]] = { date: new Date(date.toISOString().split('T')[0]), balance: 0 };
    }
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    let currentBalance = 0; const balanceSnapshots = {};
    for (const transaction of sortedTransactions) {
        const transactionDateString = new Date(transaction.date + 'T00:00:00').toISOString().split('T')[0];
        currentBalance += (transaction.type === 'income' ? parseFloat(transaction.amount) : -parseFloat(transaction.amount));
        balanceSnapshots[transactionDateString] = currentBalance;
    }
    let lastKnownBalance = 0; const labels = []; const dataPoints = [];
    Object.keys(last30DaysData).sort().forEach(dateString => {
        labels.push(new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
        if (balanceSnapshots[dateString] !== undefined) lastKnownBalance = balanceSnapshots[dateString];
        dataPoints.push(lastKnownBalance);
    });
    const data = {
        labels: labels,
        datasets: [{
            label: 'Saldo ao Final do Dia', data: dataPoints, fill: true, borderColor: lineColor, backgroundColor: fillColor, tension: 0.3,
            pointBackgroundColor: lineColor, pointBorderColor: isDarkMode ? '#1f2937' : '#fff',
            pointHoverBackgroundColor: isDarkMode ? '#1f2937' : '#fff', pointHoverBorderColor: lineColor,
            pointRadius: 4, pointHoverRadius: 7
        }]
    };
    const config = {
        type: 'line', data: data,
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: false, ticks: { color: textColor, callback: value => formatCurrencyBRL(value), font: { family: 'Inter, sans-serif' } }, grid: { color: gridColor } },
                x: { ticks: { color: textColor, font: { family: 'Inter, sans-serif' } }, grid: { display: false } }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: { label: context => `${context.dataset.label || ''}: ${formatCurrencyBRL(context.parsed.y)}` },
                    backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(0,0,0,0.8)',
                    titleColor: textColor, bodyColor: textColor, titleFont: { family: 'Inter, sans-serif' }, bodyFont: { family: 'Inter, sans-serif' },
                    padding: 10, cornerRadius: 6, intersect: false, mode: 'index'
                }
            },
            animation: { duration: 800, easing: 'easeInOutQuart' }
        }
    };
    if (balanceHistoryChartInstance) balanceHistoryChartInstance.destroy();
    balanceHistoryChartInstance = new Chart(ctx, config);
}


/**
 * Initializes or updates the Expense Category Distribution Chart.
 * @param {Array} transactions - Array of all transactions.
 * @param {boolean} isDarkMode - Flag to indicate if dark mode is active.
 */
function renderExpenseCategoryChart(transactions, isDarkMode = false) {
    const ctx = document.getElementById('expenseCategoryChart')?.getContext('2d');
    const noDataMessageEl = document.getElementById('no-expense-category-data');

    if (!ctx || !noDataMessageEl) {
        // console.error('ExpenseCategoryChart canvas or no-data message element not found');
        return;
    }

    const expenseTransactions = transactions.filter(t => t.type === 'expense' && t.category && t.category !== 'nao-categorizado');

    if (expenseTransactions.length === 0) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Limpa o canvas se houver gráfico anterior
        if (expenseCategoryChartInstance) {
            expenseCategoryChartInstance.destroy();
            expenseCategoryChartInstance = null;
        }
        noDataMessageEl.classList.remove('hidden');
        ctx.canvas.classList.add('hidden'); // Esconde o canvas
        return;
    }
    
    noDataMessageEl.classList.add('hidden');
    ctx.canvas.classList.remove('hidden'); // Mostra o canvas

    const expensesByCategory = expenseTransactions.reduce((acc, transaction) => {
        const category = transaction.category || 'Outras Despesas'; // Garante uma categoria
        acc[category] = (acc[category] || 0) + parseFloat(transaction.amount);
        return acc;
    }, {});

    const labels = Object.keys(expensesByCategory);
    const dataValues = Object.values(expensesByCategory);
    const chartColors = getChartColors(labels.length, isDarkMode);
    const chartBorderColors = chartColors.map(color => color.replace('0.7', '1').replace('0.8', '1')); // Aumenta opacidade para borda

    const textColor = isDarkMode ? 'rgba(229, 231, 235, 0.9)' : 'rgba(55, 65, 81, 0.9)';

    const data = {
        labels: labels,
        datasets: [{
            label: 'Despesas por Categoria',
            data: dataValues,
            backgroundColor: chartColors,
            borderColor: chartBorderColors,
            borderWidth: 1,
            hoverOffset: 8
        }]
    };

    const config = {
        type: 'pie', // Ou 'doughnut'
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right', // Melhor para gráficos de pizza com muitas categorias
                    labels: {
                        color: textColor,
                        font: { family: 'Inter, sans-serif', size: 12 },
                        padding: 10,
                        boxWidth: 15,
                        usePointStyle: true,
                        pointStyle: 'rectRounded'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) label += ': ';
                            if (context.parsed !== null) {
                                label += formatCurrencyBRL(context.parsed);
                                const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                                const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                                label += ` (${percentage}%)`;
                            }
                            return label;
                        }
                    },
                    backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(0,0,0,0.8)',
                    titleColor: textColor,
                    bodyColor: textColor,
                    titleFont: { family: 'Inter, sans-serif', size: 14 },
                    bodyFont: { family: 'Inter, sans-serif', size: 12 },
                    padding: 10,
                    cornerRadius: 6
                },
                title: {
                    display: false, // O título já está no card HTML
                    // text: 'Distribuição de Despesas por Categoria',
                    // color: textColor,
                    // font: { size: 16, family: 'Inter, sans-serif', weight: '600' },
                    // padding: { top: 10, bottom: 20 }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 800,
                easing: 'easeInOutQuart'
            }
            // Se for doughnut:
            // cutout: '50%' 
        }
    };

    if (expenseCategoryChartInstance) {
        expenseCategoryChartInstance.destroy();
    }
    expenseCategoryChartInstance = new Chart(ctx, config);
}

// console.log('charts.js loaded with category chart function');
