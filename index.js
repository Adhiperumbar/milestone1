const express = require('express');
const bodyParser = require('body-parser');
const cron = require('node-cron');

const app = express();
const PORT = 3001;

let expenses = [];

app.use(express.json());

app.post('/expenses', (req, res) => {
    const { category, amount, date } = req.body;
    
    console.log("Received body:", req.body);  // Log the request body

    // Validate input
    if (!category || typeof amount !== 'number' || amount <= 0 || !date) {
        return res.status(400).json({ status: 'error', error: 'Invalid data provided.' });
    }

    // Create new expense
    const newExpense = { id: expenses.length + 1, category, amount, date };

    // Add to the array
    expenses.push(newExpense);

    // Respond with the new expense
    res.json({ status: 'success', data: newExpense });
});



app.get('/expenses', (req, res) => {
    const { category, startDate, endDate } = req.query;
    let filteredExpenses = expenses;
    if (category) filteredExpenses = filteredExpenses.filter(exp => exp.category === category);
    if (startDate && endDate) {
        filteredExpenses = filteredExpenses.filter(
            exp => new Date(exp.date) >= new Date(startDate) && new Date(exp.date) <= new Date(endDate)
        );
    }
    res.json({ status: 'success', data: filteredExpenses });
});

app.get('/expenses/analysis', (req, res) => {
    const totalByCategory = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {});
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    res.json({ status: 'success', data: { totalAmount, totalByCategory } });
});

cron.schedule('0 0 * * *', () => {
    console.log('Generating daily summary...');
    const totalByCategory = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {});
    console.log('Daily Summary:', totalByCategory);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
