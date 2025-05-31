// ===== ANALYTICS ENGINE =====
class Analytics {
    constructor(budgetManager) {
        this.budgetManager = budgetManager;
    }

    // ===== MONTHLY STATISTICS =====
    getMonthlyStats(month = null) {
        const targetMonth = month || new Date().toISOString().slice(0, 7);
        const transactions = this.budgetManager.data.transactions.filter(t => 
            t && t.date && typeof t.date === 'string' && t.date.startsWith(targetMonth)
        );
        
        const stats = {
            income: 0,
            expense: 0,
            balance: 0,
            transactions: transactions,
            transactionCount: transactions.length
        };

        transactions.forEach(t => {
            if (t.type === 'income') {
                stats.income += t.amount;
            } else {
                stats.expense += t.amount;
            }
        });

        stats.balance = stats.income - stats.expense;
        
        // Add savings rate calculation
        stats.savingsRate = stats.income > 0 ? ((stats.income - stats.expense) / stats.income) * 100 : 0;
        
        return stats;
    }

    // ===== WEEKLY TREND ANALYSIS =====
    getWeeklyTrend(weeks = 8) {
        const trends = [];
        const now = new Date();
        
        for (let i = weeks - 1; i >= 0; i--) {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
            weekStart.setHours(0, 0, 0, 0);
            
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);
            
            const weekTransactions = this.budgetManager.data.transactions.filter(t => {
                if (!t.date) return false;
                try {
                    const transactionDate = typeof t.date === 'string' ? new Date(t.date) : t.date;
                    if (isNaN(transactionDate.getTime())) return false;
                    return transactionDate >= weekStart && transactionDate <= weekEnd;
                } catch (error) {
                    console.warn('Error parsing transaction date in getWeeklyTrend:', t.date, error);
                    return false;
                }
            });
            
            const weekStats = {
                week: i === 0 ? 'Minggu Ini' : `${i} minggu lalu`,
                income: weekTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
                expense: weekTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
                transactions: weekTransactions.length
            };
            
            trends.push(weekStats);
        }
        
        // Calculate trend
        if (trends.length >= 2) {
            const currentWeek = trends[trends.length - 1];
            const previousWeek = trends[trends.length - 2];
            
            const percentageChange = previousWeek.expense > 0 ? 
                ((currentWeek.expense - previousWeek.expense) / previousWeek.expense) * 100 : 0;
                
            const trend = percentageChange > 5 ? 'increasing' : 
                         percentageChange < -5 ? 'decreasing' : 'stable';
            
            return {
                trends,
                trend,
                percentageChange: Math.abs(percentageChange),
                currentWeekExpense: currentWeek.expense,
                previousWeekExpense: previousWeek.expense
            };
        }
        
        return {
            trends,
            trend: 'stable',
            percentageChange: 0,
            currentWeekExpense: trends[0]?.expense || 0,
            previousWeekExpense: 0
        };
    }

    // ===== CATEGORY EXPENSES =====
    getCategoryExpenses(month = null) {
        const targetMonth = month || new Date().toISOString().slice(0, 7);
        const expenses = this.budgetManager.data.transactions.filter(t => 
            t && t.date && typeof t.date === 'string' && 
            t.type === 'expense' && t.date.startsWith(targetMonth)
        );

        const categoryTotals = {};
        const categoryTransactionCount = {};
        let totalExpense = 0;
        
        expenses.forEach(t => {
            const category = this.budgetManager.getCategoryById(t.categoryId);
            if (category) {
                categoryTotals[category.name] = (categoryTotals[category.name] || 0) + t.amount;
                categoryTransactionCount[category.name] = (categoryTransactionCount[category.name] || 0) + 1;
                totalExpense += t.amount;
            }
        });

        // Convert to array format expected by UI
        return Object.entries(categoryTotals)
            .map(([name, amount]) => {
                const category = this.budgetManager.data.categories.find(c => c.name === name);
                return {
                    name,
                    amount,
                    percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
                    transactionCount: categoryTransactionCount[name] || 0,
                    icon: category?.icon || '📋'
                };
            })
            .sort((a, b) => b.amount - a.amount);
    }

    // ===== BUDGET ANALYSIS =====
    getCategoryBudgetAnalysis() {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const categoryExpensesArray = this.getCategoryExpenses(currentMonth);
        
        // Convert array back to object format for easier lookup
        const monthlyExpenses = {};
        categoryExpensesArray.forEach(cat => {
            monthlyExpenses[cat.name] = cat.amount;
        });
        
        return this.budgetManager.data.categories.map(category => {
            const spent = monthlyExpenses[category.name] || 0;
            const budget = category.budget || 0;
            const percentage = budget > 0 ? (spent / budget) * 100 : 0;
            
            return {
                ...category,
                spent,
                budget,
                percentage: Math.round(percentage),
                remaining: Math.max(0, budget - spent),
                status: percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good'
            };
        }).filter(category => category.budget > 0);
    }

    // ===== EXPENSE PATTERNS =====
    getExpensePatterns() {
        const transactions = this.budgetManager.data.transactions.filter(t => t.type === 'expense');
        
        // Daily patterns
        const dailyTotals = {};
        const monthlyTotals = {};
        
        transactions.forEach(t => {
            if (!t.date) {
                console.warn('Transaction missing date in getExpensePatterns:', t);
                return;
            }
            
            try {
                const date = typeof t.date === 'string' ? new Date(t.date) : t.date;
                if (isNaN(date.getTime())) {
                    console.warn('Invalid date value in getExpensePatterns:', t.date);
                    return;
                }
                
                const dayOfWeek = date.getDay();
                const month = date.getMonth();
                
                dailyTotals[dayOfWeek] = (dailyTotals[dayOfWeek] || 0) + t.amount;
                monthlyTotals[month] = (monthlyTotals[month] || 0) + t.amount;
            } catch (error) {
                console.warn('Error parsing date in getExpensePatterns:', t.date, error);
                return;
            }
        });
        
        const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
        
        return {
            daily: dayNames.map((day, index) => ({
                day,
                amount: dailyTotals[index] || 0
            })),
            monthly: monthNames.map((month, index) => ({
                month,
                amount: monthlyTotals[index] || 0
            }))
        };
    }

    // ===== PREDICTIVE ANALYSIS =====
    getPredictiveAnalysis() {
        const last3Months = [];
        const now = new Date();
        
        // Get last 3 months data
        for (let i = 2; i >= 0; i--) {
            const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStr = month.toISOString().slice(0, 7);
            last3Months.push(this.getMonthlyStats(monthStr));
        }
        
        // Calculate averages
        const avgIncome = last3Months.reduce((sum, month) => sum + month.income, 0) / 3;
        const avgExpense = last3Months.reduce((sum, month) => sum + month.expense, 0) / 3;
        
        // Calculate trends
        const incomeGrowth = this.calculateGrowthRate(last3Months.map(m => m.income));
        const expenseGrowth = this.calculateGrowthRate(last3Months.map(m => m.expense));
        
        // Predict next month
        const predictedIncome = avgIncome * (1 + incomeGrowth / 100);
        const predictedExpense = avgExpense * (1 + expenseGrowth / 100);
        
        // Generate recommendations
        const recommendations = this.generateRecommendations({
            avgIncome,
            avgExpense,
            incomeGrowth,
            expenseGrowth,
            predictedIncome,
            predictedExpense
        });
        
        return {
            historical: {
                avgIncome,
                avgExpense,
                incomeGrowth,
                expenseGrowth
            },
            predictions: {
                nextMonthIncome: predictedIncome,
                nextMonthExpense: predictedExpense,
                nextMonthBalance: predictedIncome - predictedExpense
            },
            recommendations,
            confidence: this.calculateConfidence(last3Months),
            
            // Add flat properties for backward compatibility
            nextMonthExpense: predictedExpense,
            nextMonthBalance: predictedIncome - predictedExpense
        };
    }

    // ===== HELPER METHODS =====
    calculateGrowthRate(values) {
        if (values.length < 2) return 0;
        
        let totalGrowth = 0;
        let validPairs = 0;
        
        for (let i = 1; i < values.length; i++) {
            if (values[i - 1] > 0) {
                totalGrowth += ((values[i] - values[i - 1]) / values[i - 1]) * 100;
                validPairs++;
            }
        }
        
        return validPairs > 0 ? totalGrowth / validPairs : 0;
    }

    calculateConfidence(monthlyData) {
        if (monthlyData.length < 3) return 50;
        
        // Calculate consistency in data
        const incomeVariation = this.calculateVariation(monthlyData.map(m => m.income));
        const expenseVariation = this.calculateVariation(monthlyData.map(m => m.expense));
        
        // Higher variation = lower confidence
        const confidence = Math.max(30, 100 - (incomeVariation + expenseVariation) / 2);
        return Math.round(confidence);
    }

    calculateVariation(values) {
        if (values.length < 2) return 0;
        
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        
        return mean > 0 ? (stdDev / mean) * 100 : 0;
    }

    generateRecommendations(monthlyData) {
        const recommendations = [];
        const savingsRate = ((monthlyData.avgIncome - monthlyData.avgExpense) / monthlyData.avgIncome) * 100;
        
        // Savings recommendations
        if (savingsRate < 10) {
            recommendations.push({
                type: 'warning',
                title: 'Tingkatkan Tabungan',
                description: 'Tingkat tabungan Anda kurang dari 10%. Coba kurangi pengeluaran atau tingkatkan pendapatan.',
                priority: 'high'
            });
        } else if (savingsRate > 30) {
            recommendations.push({
                type: 'success',
                title: 'Tabungan Excellent!',
                description: 'Tingkat tabungan Anda sangat baik. Pertimbangkan untuk investasi jangka panjang.',
                priority: 'medium'
            });
        }
        
        // Expense growth recommendations
        if (monthlyData.expenseGrowth > 10) {
            recommendations.push({
                type: 'warning',
                title: 'Kontrol Pengeluaran',
                description: 'Pengeluaran Anda meningkat terlalu cepat. Review kategori pengeluaran terbesar.',
                priority: 'high'
            });
        }
        
        // Income growth recommendations
        if (monthlyData.incomeGrowth < 0) {
            recommendations.push({
                type: 'info',
                title: 'Diversifikasi Pendapatan',
                description: 'Pendapatan cenderung menurun. Pertimbangkan sumber pendapatan tambahan.',
                priority: 'medium'
            });
        }
        
        return recommendations;
    }

    // ===== HEALTH SCORE =====
    calculateHealthScore(stats) {
        let score = 0;
        
        // Savings rate (40% of total score)
        const savingsRate = stats.income > 0 ? ((stats.income - stats.expense) / stats.income) * 100 : 0;
        if (savingsRate >= 20) score += 40;
        else if (savingsRate >= 10) score += 30;
        else if (savingsRate >= 5) score += 20;
        else if (savingsRate >= 0) score += 10;
        
        // Budget adherence (30% of total score)
        const budgetAnalysis = this.getCategoryBudgetAnalysis();
        if (budgetAnalysis.length > 0) {
            const overBudgetCategories = budgetAnalysis.filter(cat => cat.status === 'over').length;
            const totalCategories = budgetAnalysis.length;
            const adherenceRate = ((totalCategories - overBudgetCategories) / totalCategories) * 100;
            
            if (adherenceRate >= 90) score += 30;
            else if (adherenceRate >= 70) score += 25;
            else if (adherenceRate >= 50) score += 20;
            else score += 10;
        } else {
            score += 15; // Default score if no budgets set
        }
        
        // Consistency (20% of total score)
        const weeklyTrends = this.getWeeklyTrend(4);
        const expenseVariation = this.calculateVariation(weeklyTrends.trends.map(w => w.expense));
        if (expenseVariation < 20) score += 20;
        else if (expenseVariation < 40) score += 15;
        else if (expenseVariation < 60) score += 10;
        else score += 5;
        
        // Emergency fund (10% of total score)
        const totalBalance = this.budgetManager.getTotalBalance();
        const monthlyExpense = stats.expense;
        const emergencyRatio = monthlyExpense > 0 ? totalBalance / monthlyExpense : 0;
        
        if (emergencyRatio >= 6) score += 10;
        else if (emergencyRatio >= 3) score += 8;
        else if (emergencyRatio >= 1) score += 5;
        else score += 2;
        
        return Math.min(100, Math.max(0, Math.round(score)));
    }

    // Alias for UI compatibility
    calculateFinancialHealthScore() {
        const stats = this.getMonthlyStats();
        return this.calculateHealthScore(stats);
    }

    // ===== EXPENSE PATTERNS ANALYSIS =====
    analyzeExpensePatterns() {
        const transactions = this.budgetManager.data.transactions.filter(t => t.type === 'expense');
        if (transactions.length === 0) {
            return {
                highestExpenseDay: 'Belum ada data',
                averageDaily: 0,
                largestTransaction: 0,
                mostFrequentCategory: 'Belum ada data',
                spendingPattern: 'stable'
            };
        }

        // Group by day of week
        const dailyExpenses = {};
        let totalExpense = 0;
        let largestTransaction = 0;
        const categoryCount = {};

        transactions.forEach(t => {
            // Safety check for date property
            if (!t.date) {
                console.warn('Transaction missing date:', t);
                return;
            }
            
            let date;
            try {
                // Handle different date formats
                if (typeof t.date === 'string') {
                    date = new Date(t.date);
                } else if (t.date instanceof Date) {
                    date = t.date;
                } else {
                    console.warn('Invalid date format:', t.date);
                    return;
                }
                
                // Validate date
                if (isNaN(date.getTime())) {
                    console.warn('Invalid date value:', t.date);
                    return;
                }
            } catch (error) {
                console.warn('Error parsing date:', t.date, error);
                return;
            }
            
            const dayOfWeek = date.toLocaleDateString('id-ID', { weekday: 'long' });
            
            dailyExpenses[dayOfWeek] = (dailyExpenses[dayOfWeek] || 0) + t.amount;
            totalExpense += t.amount;
            
            if (t.amount > largestTransaction) {
                largestTransaction = t.amount;
            }

            const category = this.budgetManager.getCategoryById(t.categoryId);
            const categoryName = category?.name || 'Unknown';
            categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
        });

        // Find highest expense day
        const highestExpenseDay = Object.keys(dailyExpenses).length > 0 ? 
            Object.keys(dailyExpenses).reduce((a, b) => 
                dailyExpenses[a] > dailyExpenses[b] ? a : b
            ) : 'Belum ada data';

        // Find most frequent category
        const mostFrequentCategory = Object.keys(categoryCount).length > 0 ?
            Object.keys(categoryCount).reduce((a, b) => 
                categoryCount[a] > categoryCount[b] ? a : b
            ) : 'Belum ada data';

        // Calculate daily average - with better date handling
        const validTransactions = transactions.filter(t => {
            if (!t.date) return false;
            try {
                const date = typeof t.date === 'string' ? new Date(t.date) : t.date;
                return !isNaN(date.getTime());
            } catch {
                return false;
            }
        });
        
        const uniqueDates = new Set();
        validTransactions.forEach(t => {
            try {
                const date = typeof t.date === 'string' ? new Date(t.date) : t.date;
                const dateStr = date.toISOString().split('T')[0];
                uniqueDates.add(dateStr);
            } catch (error) {
                console.warn('Error processing date for unique dates:', t.date, error);
            }
        });
        
        const daysWithTransactions = uniqueDates.size;
        const averageDaily = daysWithTransactions > 0 ? totalExpense / daysWithTransactions : 0;

        return {
            highestExpenseDay,
            averageDaily,
            largestTransaction,
            mostFrequentCategory,
            totalExpense,
            transactionCount: transactions.length
        };
    }

    // ===== INSIGHTS GENERATION =====
    generateInsights() {
        const insights = [];
        const monthlyStats = this.getMonthlyStats();
        const expensePatterns = this.analyzeExpensePatterns();
        const weeklyTrend = this.getWeeklyTrend();
        const savingsRate = monthlyStats.income > 0 ? ((monthlyStats.income - monthlyStats.expense) / monthlyStats.income) * 100 : 0;

        // Savings insights
        if (savingsRate < 10) {
            insights.push({
                type: 'warning',
                title: 'Tingkat Tabungan Rendah',
                description: `Anda hanya menabung ${savingsRate.toFixed(1)}% dari pendapatan. Target ideal adalah minimal 20%.`
            });
        } else if (savingsRate >= 20) {
            insights.push({
                type: 'success',
                title: 'Excellent Saving Rate!',
                description: `Tingkat tabungan Anda ${savingsRate.toFixed(1)}% sudah sangat baik. Pertimbangkan investasi jangka panjang.`
            });
        }

        // Spending pattern insights
        if (expensePatterns.highestExpenseDay && expensePatterns.highestExpenseDay !== 'Belum ada data') {
            insights.push({
                type: 'info',
                title: 'Pola Pengeluaran Harian',
                description: `Anda cenderung mengeluarkan uang terbanyak di hari ${expensePatterns.highestExpenseDay}. Perhatikan pengeluaran di hari tersebut.`
            });
        }

        // Trend insights
        if (weeklyTrend.trend === 'increasing' && weeklyTrend.percentageChange > 20) {
            insights.push({
                type: 'warning',
                title: 'Pengeluaran Meningkat Drastis',
                description: `Pengeluaran Anda meningkat ${weeklyTrend.percentageChange.toFixed(1)}% dalam beberapa minggu terakhir. Evaluasi kategori pengeluaran Anda.`
            });
        } else if (weeklyTrend.trend === 'decreasing') {
            insights.push({
                type: 'success',
                title: 'Kontrol Pengeluaran Baik',
                description: `Pengeluaran Anda menurun ${Math.abs(weeklyTrend.percentageChange).toFixed(1)}%. Pertahankan disiplin finansial ini!`
            });
        }

        // Large transaction insights
        if (expensePatterns.largestTransaction > monthlyStats.expense * 0.3) {
            insights.push({
                type: 'info',
                title: 'Transaksi Besar Terdeteksi',
                description: `Ada transaksi besar ${this.budgetManager.formatCurrency(expensePatterns.largestTransaction)} yang merupakan ${((expensePatterns.largestTransaction / monthlyStats.expense) * 100).toFixed(1)}% dari total pengeluaran bulan ini.`
            });
        }

        // Emergency fund insights
        const totalBalance = this.budgetManager.getTotalBalance();
        const emergencyMonths = monthlyStats.expense > 0 ? totalBalance / monthlyStats.expense : 0;
        
        if (emergencyMonths < 3) {
            insights.push({
                type: 'warning',
                title: 'Dana Darurat Kurang',
                description: `Saldo Anda hanya cukup untuk ${emergencyMonths.toFixed(1)} bulan. Target ideal adalah 3-6 bulan pengeluaran.`
            });
        } else if (emergencyMonths >= 6) {
            insights.push({
                type: 'success',
                title: 'Dana Darurat Memadai',
                description: `Dana darurat Anda sudah cukup untuk ${emergencyMonths.toFixed(1)} bulan. Pertimbangkan untuk investasi sebagian.`
            });
        }

        // Category insights
        const categoryExpenses = this.getCategoryExpenses();
        if (categoryExpenses.length > 0) {
            const topCategory = categoryExpenses[0];
            if (topCategory.percentage > 40) {
                insights.push({
                    type: 'warning',
                    title: 'Konsentrasi Pengeluaran Tinggi',
                    description: `${topCategory.percentage.toFixed(1)}% pengeluaran Anda untuk ${topCategory.name}. Pertimbangkan diversifikasi pengeluaran.`
                });
            }
        }

        // Default insight if no specific insights
        if (insights.length === 0) {
            insights.push({
                type: 'info',
                title: 'Mulai Tracking Keuangan',
                description: 'Tambahkan lebih banyak transaksi untuk mendapatkan insights yang lebih mendalam tentang pola keuangan Anda.'
            });
        }

        return insights;
    }

    // ===== FINANCIAL HEALTH SCORE =====
    calculateFinancialHealthScore() {
        console.log('📊 Calculating financial health score...');
        
        try {
            const monthlyStats = this.getMonthlyStats();
            console.log('📊 Monthly stats for health score:', monthlyStats);
            
            let score = 0;
            
            // Savings rate (40% of total score)
            const savingsRate = monthlyStats.income > 0 ? ((monthlyStats.income - monthlyStats.expense) / monthlyStats.income) * 100 : 0;
            console.log('📊 Savings rate:', savingsRate);
            
            if (savingsRate >= 30) score += 40;
            else if (savingsRate >= 20) score += 35;
            else if (savingsRate >= 10) score += 25;
            else if (savingsRate >= 5) score += 15;
            else if (savingsRate >= 0) score += 10;
            else score += 5; // Negative savings
            
            // Budget adherence (30% of total score)
            try {
                const budgetAnalysis = this.getCategoryBudgetAnalysis();
                console.log('📊 Budget analysis:', budgetAnalysis);
                
                if (budgetAnalysis.length > 0) {
                    const overBudgetCategories = budgetAnalysis.filter(cat => cat.status === 'over').length;
                    const totalCategories = budgetAnalysis.length;
                    const adherenceRate = ((totalCategories - overBudgetCategories) / totalCategories) * 100;
                    
                    if (adherenceRate >= 90) score += 30;
                    else if (adherenceRate >= 70) score += 25;
                    else if (adherenceRate >= 50) score += 20;
                    else score += 10;
                } else {
                    score += 15; // Default score if no budgets set
                }
            } catch (budgetError) {
                console.warn('📊 Budget analysis error:', budgetError);
                score += 15; // Default fallback
            }
            
            // Consistency (20% of total score)
            try {
                const weeklyTrends = this.getWeeklyTrend(4);
                console.log('📊 Weekly trends:', weeklyTrends);
                
                const expenseData = weeklyTrends.trends.map(w => w.expense).filter(e => e > 0);
                if (expenseData.length > 1) {
                    const expenseVariation = this.calculateVariation(expenseData);
                    console.log('📊 Expense variation:', expenseVariation);
                    
                    if (expenseVariation < 20) score += 20;
                    else if (expenseVariation < 40) score += 15;
                    else if (expenseVariation < 60) score += 10;
                    else score += 5;
                } else {
                    score += 10; // Default for limited data
                }
            } catch (trendError) {
                console.warn('📊 Weekly trend error:', trendError);
                score += 10; // Default fallback
            }
            
            // Emergency fund (10% of total score)
            try {
                const totalBalance = this.budgetManager.getTotalBalance();
                const monthlyExpense = monthlyStats.expense;
                const emergencyRatio = monthlyExpense > 0 ? totalBalance / monthlyExpense : 0;
                
                console.log('📊 Emergency fund ratio:', emergencyRatio);
                
                if (emergencyRatio >= 6) score += 10;
                else if (emergencyRatio >= 3) score += 8;
                else if (emergencyRatio >= 1) score += 5;
                else score += 2;
            } catch (emergencyError) {
                console.warn('📊 Emergency fund calculation error:', emergencyError);
                score += 5; // Default fallback
            }
            
            const finalScore = Math.max(0, Math.min(100, Math.round(score)));
            console.log('📊 Final health score:', finalScore);
            
            return finalScore;
            
        } catch (error) {
            console.error('📊 Error calculating financial health score:', error);
            return 50; // Default neutral score
        }
    }
} 