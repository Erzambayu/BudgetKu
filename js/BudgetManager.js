// ===== DATA MANAGEMENT CLASS =====
class BudgetManager {
    constructor() {
        this.data = {
            accounts: [],
            transactions: [],
            categories: [
                { id: 1, name: 'Makanan & Minuman', icon: '🍽️', color: '#FF6B6B', budget: 0 },
                { id: 2, name: 'Transportasi', icon: '🚗', color: '#4ECDC4', budget: 0 },
                { id: 3, name: 'Belanja', icon: '🛍️', color: '#45B7D1', budget: 0 },
                { id: 4, name: 'Hiburan', icon: '🎬', color: '#96CEB4', budget: 0 },
                { id: 5, name: 'Tagihan', icon: '📄', color: '#FFEAA7', budget: 0 },
                { id: 6, name: 'Kesehatan', icon: '⚕️', color: '#DDA0DD', budget: 0 },
                { id: 7, name: 'Pendidikan', icon: '📚', color: '#74B9FF', budget: 0 },
                { id: 8, name: 'Gaji', icon: '💰', color: '#00B894', budget: 0 },
                { id: 9, name: 'Investasi', icon: '📈', color: '#6C5CE7', budget: 0 },
                { id: 10, name: 'Lainnya', icon: '📝', color: '#A29BFE', budget: 0 }
            ],
            accountTypes: [
                { id: 1, name: 'Kas', icon: '💵', color: '#00B894' },
                { id: 2, name: 'Bank', icon: '🏦', color: '#0984E3' },
                { id: 3, name: 'E-Wallet', icon: '📱', color: '#6C5CE7' },
                { id: 4, name: 'Investasi', icon: '📈', color: '#E17055' }
            ],
            goals: [],
            budgets: [],
            settings: {
                currency: 'IDR',
                monthlyBudget: 0,
                notifications: true,
                theme: 'light',
                animationsEnabled: true
            }
        };
        this.loadData();
    }

    loadData() {
        try {
            const saved = localStorage.getItem('modernBudgetData');
            if (saved) {
                const savedData = JSON.parse(saved);
                this.data = { ...this.data, ...savedData };
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    saveData() {
        try {
            localStorage.setItem('modernBudgetData', JSON.stringify(this.data));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    // ===== ACCOUNT METHODS =====
    addAccount(name, balance, typeId) {
        const account = {
            id: Date.now(),
            name: name.trim(),
            balance: parseFloat(balance),
            typeId: parseInt(typeId),
            createdAt: new Date().toISOString()
        };
        this.data.accounts.push(account);
        this.saveData();
        return account;
    }

    updateAccount(id, data) {
        const index = this.data.accounts.findIndex(acc => acc.id === id);
        if (index !== -1) {
            this.data.accounts[index] = { ...this.data.accounts[index], ...data };
            this.saveData();
            return this.data.accounts[index];
        }
        throw new Error('Account not found');
    }

    deleteAccount(id) {
        const index = this.data.accounts.findIndex(acc => acc.id === id);
        if (index !== -1) {
            this.data.accounts.splice(index, 1);
            this.saveData();
            return true;
        }
        return false;
    }

    // ===== TRANSACTION METHODS =====
    addTransaction(type, amount, categoryId, accountId, description = '', date = null) {
        const transaction = {
            id: Date.now(),
            type, // 'income' or 'expense'
            amount: parseFloat(amount),
            categoryId: parseInt(categoryId),
            accountId: parseInt(accountId),
            description: description.trim(),
            date: date || new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        };

        // Update account balance
        const account = this.data.accounts.find(acc => acc.id === transaction.accountId);
        if (account) {
            account.balance += type === 'income' ? transaction.amount : -transaction.amount;
        }

        this.data.transactions.push(transaction);
        this.saveData();
        return transaction;
    }

    updateTransaction(id, data) {
        const index = this.data.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            const oldTransaction = this.data.transactions[index];
            
            // Revert old transaction from account
            const account = this.data.accounts.find(acc => acc.id === oldTransaction.accountId);
            if (account) {
                account.balance -= oldTransaction.type === 'income' ? oldTransaction.amount : -oldTransaction.amount;
            }

            // Update transaction
            this.data.transactions[index] = { ...oldTransaction, ...data };
            const newTransaction = this.data.transactions[index];

            // Apply new transaction to account
            const newAccount = this.data.accounts.find(acc => acc.id === newTransaction.accountId);
            if (newAccount) {
                newAccount.balance += newTransaction.type === 'income' ? newTransaction.amount : -newTransaction.amount;
            }

            this.saveData();
            return this.data.transactions[index];
        }
        throw new Error('Transaction not found');
    }

    deleteTransaction(id) {
        const index = this.data.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            const transaction = this.data.transactions[index];
            
            // Revert transaction from account
            const account = this.data.accounts.find(acc => acc.id === transaction.accountId);
            if (account) {
                account.balance -= transaction.type === 'income' ? transaction.amount : -transaction.amount;
            }

            this.data.transactions.splice(index, 1);
            this.saveData();
            return true;
        }
        return false;
    }

    // ===== GOAL METHODS =====
    addGoal(name, target, currentAmount = 0, deadline = null) {
        const goal = {
            id: Date.now(),
            name: name.trim(),
            target: parseFloat(target),
            currentAmount: parseFloat(currentAmount),
            deadline: deadline,
            createdAt: new Date().toISOString()
        };
        this.data.goals.push(goal);
        this.saveData();
        return goal;
    }

    updateGoalProgress(id, amount) {
        const index = this.data.goals.findIndex(goal => goal.id === id);
        if (index !== -1) {
            this.data.goals[index].currentAmount = Math.min(
                parseFloat(amount),
                this.data.goals[index].target
            );
            this.saveData();
            return this.data.goals[index];
        }
        throw new Error('Goal not found');
    }

    deleteGoal(id) {
        const index = this.data.goals.findIndex(goal => goal.id === id);
        if (index !== -1) {
            this.data.goals.splice(index, 1);
            this.saveData();
            return true;
        }
        return false;
    }

    // ===== UTILITY METHODS =====
    getTotalBalance() {
        return this.data.accounts.reduce((total, account) => total + account.balance, 0);
    }

    getCategoryById(id) {
        return this.data.categories.find(cat => cat.id === id);
    }

    getAccountById(id) {
        return this.data.accounts.find(acc => acc.id === id);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    }

    // ===== DEMO DATA =====
    generateDemoData() {
        // Clear existing data
        this.data.accounts = [];
        this.data.transactions = [];
        this.data.goals = [];

        // Add demo accounts
        const accounts = [
            { name: 'BCA Utama', balance: 5750000, typeId: 2 },
            { name: 'OVO', balance: 125000, typeId: 3 },
            { name: 'Dompet Tunai', balance: 150000, typeId: 1 },
            { name: 'Saham BRI', balance: 2500000, typeId: 4 }
        ];

        accounts.forEach(acc => {
            this.addAccount(acc.name, acc.balance, acc.typeId);
        });

        // Add demo transactions (last 30 days)
        const demoTransactions = [
            // Income
            { type: 'income', amount: 8000000, categoryId: 8, description: 'Gaji Bulanan', daysAgo: 25 },
            { type: 'income', amount: 500000, categoryId: 9, description: 'Dividen Saham', daysAgo: 15 },
            { type: 'income', amount: 300000, categoryId: 10, description: 'Freelance Project', daysAgo: 10 },
            
            // Expenses
            { type: 'expense', amount: 45000, categoryId: 1, description: 'Makan Siang', daysAgo: 0 },
            { type: 'expense', amount: 25000, categoryId: 2, description: 'Ongkos Grab', daysAgo: 1 },
            { type: 'expense', amount: 150000, categoryId: 3, description: 'Belanja Groceries', daysAgo: 2 },
            { type: 'expense', amount: 75000, categoryId: 4, description: 'Nonton Bioskop', daysAgo: 3 },
            { type: 'expense', amount: 500000, categoryId: 5, description: 'Bayar Listrik', daysAgo: 5 },
            { type: 'expense', amount: 200000, categoryId: 6, description: 'Vitamin', daysAgo: 7 },
            { type: 'expense', amount: 120000, categoryId: 7, description: 'Buku Programming', daysAgo: 8 },
            { type: 'expense', amount: 65000, categoryId: 1, description: 'Makan Malam', daysAgo: 10 },
            { type: 'expense', amount: 35000, categoryId: 2, description: 'Bensin Motor', daysAgo: 12 },
            { type: 'expense', amount: 250000, categoryId: 3, description: 'Baju Kerja', daysAgo: 15 },
            { type: 'expense', amount: 180000, categoryId: 4, description: 'Karaoke', daysAgo: 18 },
            { type: 'expense', amount: 90000, categoryId: 1, description: 'Makan Keluarga', daysAgo: 20 },
            { type: 'expense', amount: 50000, categoryId: 2, description: 'Parkir Mall', daysAgo: 22 },
        ];

        demoTransactions.forEach(tx => {
            const date = new Date();
            date.setDate(date.getDate() - tx.daysAgo);
            const randomAccount = this.data.accounts[Math.floor(Math.random() * this.data.accounts.length)];
            
            this.addTransaction(
                tx.type,
                tx.amount,
                tx.categoryId,
                randomAccount.id,
                tx.description,
                date.toISOString().split('T')[0]
            );
        });

        // Add demo goals
        const goals = [
            { name: 'Emergency Fund', target: 10000000, currentAmount: 2500000, deadline: '2024-12-31' },
            { name: 'Liburan Bali', target: 5000000, currentAmount: 1200000, deadline: '2024-08-15' },
            { name: 'Beli Laptop Baru', target: 15000000, currentAmount: 8500000, deadline: '2024-06-30' }
        ];

        goals.forEach(goal => {
            this.addGoal(goal.name, goal.target, goal.currentAmount, goal.deadline);
        });

        // Update category budgets
        this.data.categories.forEach(category => {
            if (category.id <= 7) { // Only for expense categories
                category.budget = Math.floor(Math.random() * 1000000) + 500000;
            }
        });

        this.saveData();
    }

    resetAllData() {
        this.data.accounts = [];
        this.data.transactions = [];
        this.data.goals = [];
        this.data.budgets = [];
        
        // Reset category budgets
        this.data.categories.forEach(category => {
            category.budget = 0;
        });
        
        // Reset settings to default
        this.data.settings = {
            currency: 'IDR',
            monthlyBudget: 0,
            notifications: true,
            theme: 'light',
            animationsEnabled: true
        };
        
        this.saveData();
    }
} 