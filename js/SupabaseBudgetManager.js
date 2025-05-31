// ===== SUPABASE BUDGET MANAGER CLASS =====
class SupabaseBudgetManager {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.isInitialized = false;
        
        // Cache for offline support
        this.cache = {
            accounts: [],
            transactions: [],
            categories: [],
            goals: [],
            accountTypes: []
        };
        
        // Loading states
        this.loading = {
            accounts: false,
            transactions: false,
            categories: false,
            goals: false
        };
    }

    async initialize() {
        try {
            console.log('🚀 Initializing Supabase Budget Manager...');
            
            // Initialize Supabase connection
            const connected = await window.supabaseConfig.initialize();
            if (!connected) {
                throw new Error('Failed to connect to Supabase');
            }
            
            this.supabase = window.supabaseConfig.getClient();
            
            // Setup auth state listener
            this.supabase.auth.onAuthStateChange(async (event, session) => {
                console.log('🔑 Auth state changed:', event, session?.user?.email);
                
                if (event === 'SIGNED_IN') {
                    this.currentUser = session.user;
                    
                    // Trigger auth UI update
                    document.dispatchEvent(new CustomEvent('supabase-auth-change', {
                        detail: { authenticated: true, user: session.user }
                    }));
                    
                    // Load user data
                    await this.loadAllData();
                    
                } else if (event === 'SIGNED_OUT') {
                    this.currentUser = null;
                    this.clearCache();
                    
                    // Trigger auth UI update
                    document.dispatchEvent(new CustomEvent('supabase-auth-change', {
                        detail: { authenticated: false, user: null }
                    }));
                }
            });
            
            // Check current session
            const { data: { session } } = await this.supabase.auth.getSession();
            if (session) {
                this.currentUser = session.user;
                console.log('🔑 Found existing session for:', session.user.email);
                
                // Trigger initial auth state
                document.dispatchEvent(new CustomEvent('supabase-auth-change', {
                    detail: { authenticated: true, user: session.user }
                }));
            } else {
                console.log('🔑 No existing session found');
                
                // Trigger auth screen
                document.dispatchEvent(new CustomEvent('supabase-auth-change', {
                    detail: { authenticated: false, user: null }
                }));
            }
            
            // Load account types (public data)
            await this.loadAccountTypes();
            
            // Load user data if logged in
            if (this.currentUser) {
                await this.loadAllData();
            }
            
            this.isInitialized = true;
            console.log('✅ Supabase Budget Manager initialized successfully');
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Supabase Budget Manager:', error);
            return false;
        }
    }

    // ===== AUTHENTICATION METHODS =====
    
    async signUp(email, password, fullName = '') {
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName
                    }
                }
            });
            
            if (error) throw error;
            
            // Create user profile
            if (data.user) {
                await this.createUserProfile(data.user, fullName);
            }
            
            return { success: true, data };
        } catch (error) {
            console.error('❌ Sign up failed:', error);
            return { success: false, error: error.message };
        }
    }

    async signIn(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            return { success: true, data };
        } catch (error) {
            console.error('❌ Sign in failed:', error);
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            
            this.clearCache();
            return { success: true };
        } catch (error) {
            console.error('❌ Sign out failed:', error);
            return { success: false, error: error.message };
        }
    }

    async createUserProfile(user, fullName) {
        try {
            const { error } = await this.supabase
                .from('profiles')
                .insert({
                    id: user.id,
                    email: user.email,
                    full_name: fullName || user.user_metadata?.full_name || ''
                });
            
            if (error) throw error;
        } catch (error) {
            console.error('❌ Failed to create user profile:', error);
        }
    }

    async ensureUserProfile() {
        if (!this.currentUser) return;
        
        try {
            console.log(`🔍 Checking profile for user: ${this.currentUser.email} (${this.currentUser.id})`);
            
            // Check if profile exists
            const { data: existingProfile, error: selectError } = await this.supabase
                .from('profiles')
                .select('id')
                .eq('id', this.currentUser.id)
                .single();
                
            if (selectError && selectError.code === 'PGRST116') {
                // Profile doesn't exist, create it
                console.log('📝 Creating user profile...');
                
                const profileData = {
                    id: this.currentUser.id,
                    email: this.currentUser.email,
                    full_name: this.currentUser.user_metadata?.full_name || 
                              this.currentUser.user_metadata?.name || 
                              this.currentUser.email?.split('@')[0] || 
                              'User'
                };
                
                console.log('📝 Profile data to insert:', profileData);
                
                const { data: newProfile, error: insertError } = await this.supabase
                    .from('profiles')
                    .insert(profileData)
                    .select()
                    .single();
                
                if (insertError) {
                    console.error('❌ Failed to insert profile:', insertError);
                    throw insertError;
                }
                
                console.log('✅ User profile created successfully:', newProfile);
                
            } else if (selectError) {
                console.error('❌ Error checking profile:', selectError);
                throw selectError;
            } else {
                console.log('✅ User profile already exists:', existingProfile);
            }
            
            // Additional verification - try to read the profile again
            const { data: verifyProfile, error: verifyError } = await this.supabase
                .from('profiles')
                .select('id, email, full_name')
                .eq('id', this.currentUser.id)
                .single();
            
            if (verifyError) {
                console.error('❌ Profile verification failed:', verifyError);
                throw verifyError;
            }
            
            console.log('✅ Profile verification successful:', verifyProfile);
            
        } catch (error) {
            console.error('❌ Failed to ensure user profile:', error);
            
            // If it's a permissions error, provide helpful message
            if (error.code === '42501') {
                throw new Error('Masalah izin database. Pastikan RLS policies sudah diaktifkan dengan benar.');
            } else if (error.code === '23505') {
                // Unique constraint violation - profile might already exist
                console.warn('⚠️ Profile sudah ada (unique constraint), melanjutkan...');
                return;
            } else {
                throw error;
            }
        }
    }

    // ===== DATA LOADING METHODS =====
    
    async loadAllData() {
        if (!this.currentUser) return;
        
        try {
            console.log('📥 Loading all user data...');
            
            // Ensure user profile exists first
            await this.ensureUserProfile();
            
            // Load with retry mechanism
            const loadWithRetry = async (loadFunction, retries = 3) => {
                for (let i = 0; i < retries; i++) {
                    try {
                        return await loadFunction();
                    } catch (error) {
                        console.warn(`⚠️ Attempt ${i + 1} failed:`, error.message);
                        if (i === retries - 1) throw error;
                        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Progressive delay
                    }
                }
            };
            
            // Load each data type with retry
            const results = await Promise.allSettled([
                loadWithRetry(() => this.loadCategories()),
                loadWithRetry(() => this.loadAccounts()),
                loadWithRetry(() => this.loadTransactions()),
                loadWithRetry(() => this.loadGoals())
            ]);
            
            // Check results and log any failures
            const [categoriesResult, accountsResult, transactionsResult, goalsResult] = results;
            
            if (categoriesResult.status === 'rejected') {
                console.warn('⚠️ Failed to load categories:', categoriesResult.reason);
            } else {
                console.log('✅ Categories loaded:', this.cache.categories.length);
            }
            
            if (accountsResult.status === 'rejected') {
                console.warn('⚠️ Failed to load accounts:', accountsResult.reason);
            } else {
                console.log('✅ Accounts loaded:', this.cache.accounts.length);
            }
            
            if (transactionsResult.status === 'rejected') {
                console.warn('⚠️ Failed to load transactions:', transactionsResult.reason);
            } else {
                console.log('✅ Transactions loaded:', this.cache.transactions.length);
            }
            
            if (goalsResult.status === 'rejected') {
                console.warn('⚠️ Failed to load goals:', goalsResult.reason);
            } else {
                console.log('✅ Goals loaded:', this.cache.goals.length);
            }
            
            console.log('✅ Data loading completed');
            
            // Trigger data loaded event
            document.dispatchEvent(new CustomEvent('supabase-data-loaded', {
                detail: { success: true, partialFailure: results.some(r => r.status === 'rejected') }
            }));
            
        } catch (error) {
            console.error('❌ Failed to load data:', error);
            
            // Still trigger success event to show UI, just with empty data
            document.dispatchEvent(new CustomEvent('supabase-data-loaded', {
                detail: { success: true, error: error.message, fallback: true }
            }));
        }
    }

    async loadAccountTypes() {
        try {
            const { data, error } = await this.supabase
                .from('account_types')
                .select('*')
                .order('id');
            
            if (error) throw error;
            
            this.cache.accountTypes = data || [];
            return data;
        } catch (error) {
            console.error('❌ Failed to load account types:', error);
            return [];
        }
    }

    async loadCategories() {
        if (!this.currentUser) return [];
        
        try {
            this.loading.categories = true;
            
            const { data, error } = await this.supabase
                .from('categories')
                .select('*')
                .or(`user_id.eq.${this.currentUser.id},is_system.eq.true`)
                .order('name');
            
            if (error) throw error;
            
            this.cache.categories = data || [];
            return data;
        } catch (error) {
            console.error('❌ Failed to load categories:', error);
            return [];
        } finally {
            this.loading.categories = false;
        }
    }

    async loadAccounts() {
        if (!this.currentUser) return [];
        
        try {
            this.loading.accounts = true;
            
            const { data, error } = await this.supabase
                .from('accounts')
                .select(`
                    *,
                    account_types (
                        id,
                        name,
                        icon,
                        color
                    )
                `)
                .eq('user_id', this.currentUser.id)
                .order('name');
            
            if (error) throw error;
            
            this.cache.accounts = data || [];
            return data;
        } catch (error) {
            console.error('❌ Failed to load accounts:', error);
            return [];
        } finally {
            this.loading.accounts = false;
        }
    }

    async loadTransactions() {
        if (!this.currentUser) return [];
        
        try {
            this.loading.transactions = true;
            
            const { data, error } = await this.supabase
                .from('transactions')
                .select(`
                    *,
                    accounts (
                        id,
                        name
                    ),
                    categories (
                        id,
                        name,
                        icon,
                        color
                    )
                `)
                .eq('user_id', this.currentUser.id)
                .order('transaction_date', { ascending: false })
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            this.cache.transactions = data || [];
            return data;
        } catch (error) {
            console.error('❌ Failed to load transactions:', error);
            return [];
        } finally {
            this.loading.transactions = false;
        }
    }

    async loadGoals() {
        if (!this.currentUser) return [];
        
        try {
            this.loading.goals = true;
            
            const { data, error } = await this.supabase
                .from('goals')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            this.cache.goals = data || [];
            return data;
        } catch (error) {
            console.error('❌ Failed to load goals:', error);
            return [];
        } finally {
            this.loading.goals = false;
        }
    }

    // ===== ACCOUNT METHODS =====
    
    async addAccount(name, balance, typeId) {
        if (!this.currentUser) throw new Error('User not authenticated');
        
        try {
            const { data, error } = await this.supabase
                .from('accounts')
                .insert({
                    user_id: this.currentUser.id,
                    name: name.trim(),
                    balance: parseFloat(balance),
                    type_id: parseInt(typeId)
                })
                .select(`
                    *,
                    account_types (
                        id,
                        name,
                        icon,
                        color
                    )
                `)
                .single();
            
            if (error) throw error;
            
            // Update cache
            this.cache.accounts.push(data);
            
            return data;
        } catch (error) {
            console.error('❌ Failed to add account:', error);
            throw error;
        }
    }

    async updateAccount(id, updateData) {
        if (!this.currentUser) throw new Error('User not authenticated');
        
        try {
            const { data, error } = await this.supabase
                .from('accounts')
                .update(updateData)
                .eq('id', id)
                .eq('user_id', this.currentUser.id)
                .select(`
                    *,
                    account_types (
                        id,
                        name,
                        icon,
                        color
                    )
                `)
                .single();
            
            if (error) throw error;
            
            // Update cache
            const index = this.cache.accounts.findIndex(acc => acc.id === id);
            if (index !== -1) {
                this.cache.accounts[index] = data;
            }
            
            return data;
        } catch (error) {
            console.error('❌ Failed to update account:', error);
            throw error;
        }
    }

    async deleteAccount(id) {
        if (!this.currentUser) throw new Error('User not authenticated');
        
        try {
            const { error } = await this.supabase
                .from('accounts')
                .delete()
                .eq('id', id)
                .eq('user_id', this.currentUser.id);
            
            if (error) throw error;
            
            // Update cache
            this.cache.accounts = this.cache.accounts.filter(acc => acc.id !== id);
            
            return true;
        } catch (error) {
            console.error('❌ Failed to delete account:', error);
            throw error;
        }
    }

    // ===== TRANSACTION METHODS =====
    
    async addTransaction(type, amount, categoryId, accountId, description = '', date = null) {
        if (!this.currentUser) throw new Error('User not authenticated');
        
        try {
            const transactionDate = date || new Date().toISOString().split('T')[0];
            const transactionAmount = parseFloat(amount);
            
            // Insert transaction
            const { data: transaction, error: transactionError } = await this.supabase
                .from('transactions')
                .insert({
                    user_id: this.currentUser.id,
                    type,
                    amount: transactionAmount,
                    category_id: parseInt(categoryId),
                    account_id: accountId,
                    description: description.trim(),
                    transaction_date: transactionDate
                })
                .select(`
                    *,
                    accounts (
                        id,
                        name
                    ),
                    categories (
                        id,
                        name,
                        icon,
                        color
                    )
                `)
                .single();
            
            if (transactionError) throw transactionError;
            
            // Update account balance
            const balanceChange = type === 'income' ? transactionAmount : -transactionAmount;
            const { error: balanceError } = await this.supabase
                .from('accounts')
                .update({
                    balance: this.supabase.sql`balance + ${balanceChange}`
                })
                .eq('id', accountId)
                .eq('user_id', this.currentUser.id);
            
            if (balanceError) throw balanceError;
            
            // Update caches
            this.cache.transactions.unshift(transaction);
            const accountIndex = this.cache.accounts.findIndex(acc => acc.id === accountId);
            if (accountIndex !== -1) {
                this.cache.accounts[accountIndex].balance += balanceChange;
            }
            
            return transaction;
        } catch (error) {
            console.error('❌ Failed to add transaction:', error);
            throw error;
        }
    }

    async updateTransaction(id, updateData) {
        if (!this.currentUser) throw new Error('User not authenticated');
        
        try {
            // Get original transaction
            const { data: oldTransaction, error: getError } = await this.supabase
                .from('transactions')
                .select('*')
                .eq('id', id)
                .eq('user_id', this.currentUser.id)
                .single();
            
            if (getError) throw getError;
            
            // Revert old transaction from account balance
            const oldBalanceChange = oldTransaction.type === 'income' ? -oldTransaction.amount : oldTransaction.amount;
            
            // Update transaction
            const { data: transaction, error: updateError } = await this.supabase
                .from('transactions')
                .update(updateData)
                .eq('id', id)
                .eq('user_id', this.currentUser.id)
                .select(`
                    *,
                    accounts (
                        id,
                        name
                    ),
                    categories (
                        id,
                        name,
                        icon,
                        color
                    )
                `)
                .single();
            
            if (updateError) throw updateError;
            
            // Apply new transaction to account balance
            const newBalanceChange = transaction.type === 'income' ? transaction.amount : -transaction.amount;
            const totalBalanceChange = oldBalanceChange + newBalanceChange;
            
            const { error: balanceError } = await this.supabase
                .from('accounts')
                .update({
                    balance: this.supabase.sql`balance + ${totalBalanceChange}`
                })
                .eq('id', transaction.account_id)
                .eq('user_id', this.currentUser.id);
            
            if (balanceError) throw balanceError;
            
            // Update caches
            const transactionIndex = this.cache.transactions.findIndex(t => t.id === id);
            if (transactionIndex !== -1) {
                this.cache.transactions[transactionIndex] = transaction;
            }
            
            const accountIndex = this.cache.accounts.findIndex(acc => acc.id === transaction.account_id);
            if (accountIndex !== -1) {
                this.cache.accounts[accountIndex].balance += totalBalanceChange;
            }
            
            return transaction;
        } catch (error) {
            console.error('❌ Failed to update transaction:', error);
            throw error;
        }
    }

    async deleteTransaction(id) {
        if (!this.currentUser) throw new Error('User not authenticated');
        
        try {
            // Get transaction to revert balance
            const { data: transaction, error: getError } = await this.supabase
                .from('transactions')
                .select('*')
                .eq('id', id)
                .eq('user_id', this.currentUser.id)
                .single();
            
            if (getError) throw getError;
            
            // Delete transaction
            const { error: deleteError } = await this.supabase
                .from('transactions')
                .delete()
                .eq('id', id)
                .eq('user_id', this.currentUser.id);
            
            if (deleteError) throw deleteError;
            
            // Revert balance change
            const balanceChange = transaction.type === 'income' ? -transaction.amount : transaction.amount;
            const { error: balanceError } = await this.supabase
                .from('accounts')
                .update({
                    balance: this.supabase.sql`balance + ${balanceChange}`
                })
                .eq('id', transaction.account_id)
                .eq('user_id', this.currentUser.id);
            
            if (balanceError) throw balanceError;
            
            // Update caches
            this.cache.transactions = this.cache.transactions.filter(t => t.id !== id);
            const accountIndex = this.cache.accounts.findIndex(acc => acc.id === transaction.account_id);
            if (accountIndex !== -1) {
                this.cache.accounts[accountIndex].balance += balanceChange;
            }
            
            return true;
        } catch (error) {
            console.error('❌ Failed to delete transaction:', error);
            throw error;
        }
    }

    // ===== GOAL METHODS =====
    
    async addGoal(name, targetAmount, currentAmount = 0, deadline = null) {
        if (!this.currentUser) throw new Error('User not authenticated');
        
        try {
            const { data, error } = await this.supabase
                .from('goals')
                .insert({
                    user_id: this.currentUser.id,
                    name: name.trim(),
                    target_amount: parseFloat(targetAmount),
                    current_amount: parseFloat(currentAmount),
                    deadline
                })
                .select('*')
                .single();
            
            if (error) throw error;
            
            // Update cache
            this.cache.goals.unshift(data);
            
            return data;
        } catch (error) {
            console.error('❌ Failed to add goal:', error);
            throw error;
        }
    }

    async updateGoal(id, updateData) {
        if (!this.currentUser) throw new Error('User not authenticated');
        
        try {
            const { data, error } = await this.supabase
                .from('goals')
                .update(updateData)
                .eq('id', id)
                .eq('user_id', this.currentUser.id)
                .select('*')
                .single();
            
            if (error) throw error;
            
            // Update cache
            const index = this.cache.goals.findIndex(goal => goal.id === id);
            if (index !== -1) {
                this.cache.goals[index] = data;
            }
            
            return data;
        } catch (error) {
            console.error('❌ Failed to update goal:', error);
            throw error;
        }
    }

    async deleteGoal(id) {
        if (!this.currentUser) throw new Error('User not authenticated');
        
        try {
            const { error } = await this.supabase
                .from('goals')
                .delete()
                .eq('id', id)
                .eq('user_id', this.currentUser.id);
            
            if (error) throw error;
            
            // Update cache
            this.cache.goals = this.cache.goals.filter(goal => goal.id !== id);
            
            return true;
        } catch (error) {
            console.error('❌ Failed to delete goal:', error);
            throw error;
        }
    }

    // ===== UTILITY METHODS =====
    
    clearCache() {
        this.cache = {
            accounts: [],
            transactions: [],
            categories: [],
            goals: [],
            accountTypes: []
        };
    }

    // Getter methods for compatibility with existing UI
    get data() {
        // Create transformed data each time it's accessed
        const transformedData = {
            accounts: this.cache.accounts.map(account => ({
                ...account,
                // Map Supabase fields to expected format
                typeId: account.type_id,
                accountType: account.account_types
            })),
            transactions: this.cache.transactions.map(transaction => ({
                ...transaction,
                // Map Supabase fields to expected format
                date: transaction.transaction_date, // Map transaction_date to date for Analytics compatibility
                categoryId: transaction.category_id,
                accountId: transaction.account_id,
                userId: transaction.user_id
            })),
            categories: this.cache.categories.map(category => ({
                ...category,
                // Ensure all expected fields are present
                budget: category.budget || 0
            })),
            goals: this.cache.goals.map(goal => ({
                ...goal,
                // Map Supabase fields to expected format
                targetAmount: goal.target_amount,
                currentAmount: goal.current_amount,
                userId: goal.user_id
            })),
            accountTypes: this.cache.accountTypes.map(type => ({
                ...type,
                // Ensure consistent format
                id: type.id,
                name: type.name,
                icon: type.icon,
                color: type.color
            }))
        };
        
        // Debug logging for analytics integration
        if (transformedData.transactions.length > 0) {
            const sampleTransaction = transformedData.transactions[0];
            console.log('📊 SupabaseBudgetManager.data accessed, sample transaction:', {
                id: sampleTransaction.id,
                date: sampleTransaction.date,
                transaction_date: sampleTransaction.transaction_date,
                hasDate: !!sampleTransaction.date,
                hasTransactionDate: !!sampleTransaction.transaction_date
            });
        }
        
        return transformedData;
    }

    getCategoryById(id) {
        return this.cache.categories.find(cat => cat.id === parseInt(id));
    }

    getAccountById(id) {
        return this.cache.accounts.find(acc => acc.id === id);
    }

    getAccountTypeById(id) {
        return this.cache.accountTypes.find(type => type.id === parseInt(id));
    }

    getTotalBalance() {
        return this.cache.accounts.reduce((total, account) => total + account.balance, 0);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // ===== DEMO DATA & RESET METHODS =====
    
    async generateDemoData() {
        if (!this.currentUser) throw new Error('User not authenticated');
        
        try {
            console.log('🎲 Generating demo data for Supabase...');
            
            // Ensure user profile exists first - this is critical for foreign key constraints
            console.log('📝 Ensuring user profile exists...');
            await this.ensureUserProfile();
            console.log('✅ User profile confirmed');
            
            // Small delay to ensure profile is properly created
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Create demo accounts if none exist
            if (this.cache.accounts.length === 0) {
                console.log('🏦 Creating demo accounts...');
                const demoAccounts = [
                    { name: 'Kas Harian', balance: 500000, type_id: 1 },
                    { name: 'Bank BCA', balance: 10000000, type_id: 2 },
                    { name: 'GoPay', balance: 250000, type_id: 3 },
                    { name: 'Investasi Saham', balance: 5000000, type_id: 4 }
                ];
                
                for (const account of demoAccounts) {
                    try {
                        await this.addAccount(account.name, account.balance, account.type_id);
                        console.log(`✅ Created account: ${account.name}`);
                    } catch (error) {
                        console.error(`❌ Failed to create account ${account.name}:`, error);
                        
                        // If it's a foreign key error, try to recreate profile
                        if (error.code === '23503') {
                            console.log('🔄 Retrying profile creation...');
                            await this.ensureUserProfile();
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            
                            // Retry account creation
                            try {
                                await this.addAccount(account.name, account.balance, account.type_id);
                                console.log(`✅ Retry success: ${account.name}`);
                            } catch (retryError) {
                                console.error(`❌ Retry failed for ${account.name}:`, retryError);
                                throw retryError;
                            }
                        } else {
                            throw error;
                        }
                    }
                }
            }
            
            // Create demo transactions
            console.log('💳 Creating demo transactions...');
            const demoTransactions = [
                { type: 'income', amount: 8000000, category_id: 8, description: 'Gaji Bulanan' },
                { type: 'expense', amount: 2000000, category_id: 1, description: 'Belanja Bulanan' },
                { type: 'expense', amount: 500000, category_id: 2, description: 'Bensin Motor' },
                { type: 'expense', amount: 150000, category_id: 3, description: 'Beli Baju' },
                { type: 'expense', amount: 75000, category_id: 4, description: 'Nonton Bioskop' },
                { type: 'income', amount: 500000, category_id: 9, description: 'Dividen Saham' },
                { type: 'expense', amount: 300000, category_id: 5, description: 'Bayar Listrik' },
                { type: 'expense', amount: 100000, category_id: 6, description: 'Vitamin' }
            ];
            
            // Add transactions if we have accounts
            if (this.cache.accounts.length > 0) {
                for (const trans of demoTransactions) {
                    try {
                        const accountId = this.cache.accounts[Math.floor(Math.random() * this.cache.accounts.length)].id;
                        await this.addTransaction(
                            trans.type,
                            trans.amount,
                            trans.category_id,
                            accountId,
                            trans.description
                        );
                        console.log(`✅ Created transaction: ${trans.description}`);
                    } catch (error) {
                        console.warn(`⚠️ Failed to create transaction ${trans.description}:`, error);
                        // Continue with other transactions even if one fails
                    }
                }
            }
            
            // Create demo goals
            console.log('🎯 Creating demo goals...');
            const demoGoals = [
                { name: 'Dana Darurat', target_amount: 50000000, current_amount: 15000000 },
                { name: 'Liburan ke Jepang', target_amount: 25000000, current_amount: 5000000 },
                { name: 'Beli Motor Baru', target_amount: 20000000, current_amount: 8000000 }
            ];
            
            for (const goal of demoGoals) {
                try {
                    await this.addGoal(goal.name, goal.target_amount, goal.current_amount);
                    console.log(`✅ Created goal: ${goal.name}`);
                } catch (error) {
                    console.warn(`⚠️ Failed to create goal ${goal.name}:`, error);
                    // Continue with other goals even if one fails
                }
            }
            
            // Reload all data
            await this.loadAllData();
            
            console.log('✅ Demo data generated successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to generate demo data:', error);
            
            // Provide user-friendly error message
            let userMessage = 'Gagal membuat data demo';
            if (error.code === '23503') {
                userMessage = 'Gagal membuat akun - masalah dengan profil pengguna. Coba logout dan login lagi.';
            } else if (error.message) {
                userMessage = error.message;
            }
            
            throw new Error(userMessage);
        }
    }
    
    async resetAllData() {
        if (!this.currentUser) throw new Error('User not authenticated');
        
        try {
            console.log('🗑️ Resetting all data...');
            
            // Delete all user data
            await Promise.all([
                this.supabase.from('transactions').delete().eq('user_id', this.currentUser.id),
                this.supabase.from('goals').delete().eq('user_id', this.currentUser.id),
                this.supabase.from('accounts').delete().eq('user_id', this.currentUser.id),
                this.supabase.from('categories').delete().eq('user_id', this.currentUser.id).eq('is_system', false)
            ]);
            
            // Clear cache
            this.clearCache();
            
            // Reload account types and system categories
            await this.loadAccountTypes();
            await this.loadCategories();
            
            console.log('✅ All data reset successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to reset data:', error);
            throw error;
        }
    }
}

// Export global instance
window.supabaseBudgetManager = new SupabaseBudgetManager(); 