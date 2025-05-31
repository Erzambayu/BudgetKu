// ===== MAIN UI CLASS =====
class ModernBudgetUI {
    constructor(budgetManager = null) {
        this.budgetManager = budgetManager || new BudgetManager();
        this.analytics = new Analytics(this.budgetManager);
        this.components = new UIComponents(this.budgetManager, this.analytics);
        this.currentView = 'dashboard';
        this.isTransitioning = false;
        this.analyticsMode = 'overview'; // overview, patterns, predictions, budget
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;
        
        this.bindEvents();
        this.initializeTheme();
        this.preloadData();
        this.initialized = true;
        console.log('✅ ModernBudgetUI initialized');
    }

    init() {
        this.createLayout();
        this.initialize();
        this.render();
    }

    // Method for compatibility with SimpleUI
    renderPage(page) {
        if (!this.initialized) {
            console.warn('⚠️ ModernBudgetUI not initialized yet');
            return;
        }
        
        this.smoothSwitchView(page);
    }

    createLayout() {
        // Use existing app container instead of creating new one
        const appContainer = document.querySelector('.app-container');
        if (!appContainer) {
            console.error('❌ App container not found');
            return;
        }

        // Only replace content area, keep existing structure
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            // We'll render into the existing content area
            contentArea.innerHTML = `
                <!-- Content will be injected here by render methods -->
            `;
        }

        // Add missing elements if needed
        if (!document.getElementById('modalContainer')) {
            const modalContainer = document.createElement('div');
            modalContainer.className = 'modal-container';
            modalContainer.id = 'modalContainer';
            document.body.appendChild(modalContainer);
        }

        if (!document.getElementById('toastContainer')) {
            const toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            toastContainer.id = 'toastContainer';
            document.body.appendChild(toastContainer);
        }
    }

    // ===== EVENT HANDLING =====
    bindEvents() {
        // Navigation events - Use existing nav elements
        document.addEventListener('click', (e) => {
            // Handle navigation clicks
            if (e.target.closest('.nav-item')) {
                e.preventDefault();
                const viewName = e.target.closest('.nav-item').dataset.page;
                if (viewName) {
                    this.smoothSwitchView(viewName);
                }
            }
            
            // Handle bottom nav clicks
            if (e.target.closest('.bottom-nav-item')) {
                e.preventDefault();
                const viewName = e.target.closest('.bottom-nav-item').dataset.page;
                if (viewName) {
                    this.smoothSwitchView(viewName);
                }
            }
        });

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Mobile menu toggle
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => this.toggleMobileSidebar());
        }

        // Sidebar overlay
        const sidebarOverlay = document.querySelector('.sidebar-overlay');
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => this.closeMobileSidebar());
        }

        // Window resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Initialize other event handlers
        this.initSwipeGestures();
        this.initKeyboardShortcuts();
        
        console.log('✅ Event handlers bound to existing elements');
    }

    initSwipeGestures() {
        let startX = 0;
        let startY = 0;
        let isIPhone = /iPhone/.test(navigator.userAgent);

        document.addEventListener('touchstart', (e) => {
            if (isIPhone) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            }
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (isIPhone && e.changedTouches.length > 0) {
                const endX = e.changedTouches[0].clientX;
                const endY = e.changedTouches[0].clientY;
                const deltaX = endX - startX;
                const deltaY = endY - startY;

                // Horizontal swipes for navigation
                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                    if (deltaX > 0) {
                        this.handleSwipeNavigation('right');
                    } else {
                        this.handleSwipeNavigation('left');
                    }
                }
            }
        }, { passive: true });
    }

    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                const key = e.key;
                switch(key) {
                    case '1':
                        e.preventDefault();
                        this.smoothSwitchView('dashboard');
                        break;
                    case '2':
                        e.preventDefault();
                        this.smoothSwitchView('transactions');
                        break;
                    case '3':
                        e.preventDefault();
                        this.smoothSwitchView('accounts');
                        break;
                    case '4':
                        e.preventDefault();
                        this.smoothSwitchView('goals');
                        break;
                    case '5':
                        e.preventDefault();
                        this.smoothSwitchView('analytics');
                        break;
                    case 'n':
                        e.preventDefault();
                        window.showQuickAddModal('expense');
                        break;
                }
            }
        });
    }

    handleSwipeNavigation(direction) {
        const views = ['dashboard', 'transactions', 'accounts', 'goals', 'analytics'];
        const currentIndex = views.indexOf(this.currentView);
        
        let newIndex;
        if (direction === 'left' && currentIndex < views.length - 1) {
            newIndex = currentIndex + 1;
        } else if (direction === 'right' && currentIndex > 0) {
            newIndex = currentIndex - 1;
        }
        
        if (newIndex !== undefined) {
            this.smoothSwitchView(views[newIndex]);
        }
    }

    // ===== NAVIGATION =====
    smoothSwitchView(view) {
        if (this.isTransitioning || view === this.currentView) return;
        
        this.isTransitioning = true;
        const contentArea = document.getElementById('content-area');
        
        if (contentArea) {
            contentArea.style.opacity = '0.5';
            contentArea.style.transform = 'translateY(10px)';
        }
        
        setTimeout(() => {
            this.currentView = view;
            this.updateNavigationStates(view);
            this.updatePageHeader(view);
            this.render();
            
            if (contentArea) {
                contentArea.style.opacity = '1';
                contentArea.style.transform = 'translateY(0)';
            }
            
            this.isTransitioning = false;
        }, 200);
    }

    updateNavigationStates(view) {
        // Update sidebar navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === view);
        });
        
        // Update bottom navigation
        document.querySelectorAll('.bottom-nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === view);
        });
    }

    updatePageHeader(view) {
        const pageTitle = document.querySelector('.page-title');
        const breadcrumb = document.querySelector('.breadcrumb-item');
        
        const titles = {
            dashboard: 'Dashboard',
            transactions: 'Transaksi',
            accounts: 'Akun',
            goals: 'Target',
            analytics: 'Analisis'
        };
        
        if (pageTitle && breadcrumb) {
            pageTitle.textContent = titles[view] || 'Dashboard';
            breadcrumb.textContent = titles[view] || 'Dashboard';
        }
    }

    // ===== THEME MANAGEMENT =====
    initializeTheme() {
        const savedTheme = localStorage.getItem('budgetTheme') || 'light';
        this.setTheme(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            document.querySelectorAll('.theme-toggle').forEach(btn => {
                btn.textContent = '☀️';
            });
        } else {
            document.body.classList.remove('dark-theme');
            document.querySelectorAll('.theme-toggle').forEach(btn => {
                btn.textContent = '🌙';
            });
        }
        localStorage.setItem('budgetTheme', theme);
    }

    // ===== MOBILE SIDEBAR =====
    toggleMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        
        if (!sidebar || !overlay) {
            console.warn('⚠️ Sidebar elements not found');
            return;
        }
        
        if (sidebar.classList.contains('open')) {
            this.closeMobileSidebar();
        } else {
            this.openMobileSidebar();
        }
    }

    openMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        
        if (sidebar && overlay) {
            sidebar.classList.add('open');
            overlay.classList.add('active');
        }
    }

    closeMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        
        if (sidebar && overlay) {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        }
    }

    // ===== LOADING STATES =====
    showLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('active');
        }
    }

    hideLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    // ===== DATA PRELOADING =====
    preloadData() {
        // Initialize demo data if needed
        if (this.budgetManager.data.accounts.length === 0) {
            console.log('📝 No data found, ready for demo data or manual entry');
        }
    }

    // ===== RENDER METHODS =====
    render() {
        if (!this.currentView) {
            this.currentView = 'dashboard';
        }

        const contentArea = document.getElementById('content-area');
        if (!contentArea) {
            console.error('❌ Content area not found');
            return;
        }

        let content = '';
        
        switch(this.currentView) {
            case 'dashboard':
                content = this.renderDashboard();
                break;
            case 'transactions':
                content = this.renderTransactions();
                break;
            case 'accounts':
                content = this.renderAccounts();
                break;
            case 'goals':
                content = this.renderGoals();
                break;
            case 'analytics':
                content = this.renderAdvancedAnalytics();
                break;
            default:
                content = this.renderDashboard();
        }

        contentArea.innerHTML = content;
        this.initializePageSpecific();
        this.updateUserBalance();
    }

    // ===== DASHBOARD RENDERING =====
    renderDashboard() {
        console.log('🎯 renderDashboard called');
        console.log('Budget manager:', this.budgetManager);
        console.log('Analytics:', this.analytics);
        
        const stats = this.analytics.getMonthlyStats();
        console.log('Monthly stats:', stats);
        
        const totalBalance = this.budgetManager.getTotalBalance();
        console.log('Total balance:', totalBalance);
        
        const recentTransactions = this.budgetManager.data.transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
        
        console.log('Recent transactions:', recentTransactions);

        return `
            <div class="dashboard-container">
                <!-- Statistics Cards -->
                <div class="stats-grid">
                    <div class="stat-card success">
                        <div class="stat-icon">💰</div>
                        <div class="stat-content">
                            <div class="stat-value">${this.budgetManager.formatCurrency(totalBalance)}</div>
                            <div class="stat-label">Total Saldo</div>
                        </div>
                    </div>
                    
                    <div class="stat-card info">
                        <div class="stat-icon">📈</div>
                        <div class="stat-content">
                            <div class="stat-value">${this.budgetManager.formatCurrency(stats.income)}</div>
                            <div class="stat-label">Pemasukan Bulan Ini</div>
                        </div>
                    </div>
                    
                    <div class="stat-card warning">
                        <div class="stat-icon">💸</div>
                        <div class="stat-content">
                            <div class="stat-value">${this.budgetManager.formatCurrency(stats.expense)}</div>
                            <div class="stat-label">Pengeluaran Bulan Ini</div>
                        </div>
                    </div>
                    
                    <div class="stat-card ${stats.balance >= 0 ? 'success' : 'danger'}">
                        <div class="stat-icon">💎</div>
                        <div class="stat-content">
                            <div class="stat-value">${this.budgetManager.formatCurrency(stats.balance)}</div>
                            <div class="stat-label">Selisih Bulan Ini</div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions">
                    <h2 class="section-title">Aksi Cepat</h2>
                    <div class="action-grid">
                        <button class="action-btn" onclick="window.showQuickAddModal('income')">
                            <div class="action-icon">💰</div>
                            <div class="action-text">Tambah Pemasukan</div>
                        </button>
                        <button class="action-btn" onclick="window.showQuickAddModal('expense')">
                            <div class="action-icon">💸</div>
                            <div class="action-text">Tambah Pengeluaran</div>
                        </button>
                        <button class="action-btn" onclick="window.showAddAccountModal()">
                            <div class="action-icon">🏦</div>
                            <div class="action-text">Tambah Akun</div>
                        </button>
                        <button class="action-btn" onclick="window.showAddGoalModal()">
                            <div class="action-icon">🎯</div>
                            <div class="action-text">Tambah Target</div>
                        </button>
                        <button class="action-btn demo" onclick="window.loadDemoData()">
                            <div class="action-icon">🎲</div>
                            <div class="action-text">Data Demo</div>
                        </button>
                        <button class="action-btn reset" onclick="window.resetAllData()">
                            <div class="action-icon">🗑️</div>
                            <div class="action-text">Reset Data</div>
                        </button>
                        <button class="action-btn" onclick="console.log('🔍 Diagnostic:', {modernUI: window.modernUI, ui: window.ui, budgetManager: window.modernUI?.budgetManager || window.ui?.budgetManager}); window.ui?.render() || window.modernUI?.render();" style="background: #6c5ce7;">
                            <div class="action-icon">🔍</div>
                            <div class="action-text">Diagnostic</div>
                        </button>
                    </div>
                </div>

                <!-- Recent Transactions -->
                <div class="recent-section">
                    <div class="section-header">
                        <h2 class="section-title">Transaksi Terbaru</h2>
                        <button class="section-action" onclick="window.ui?.smoothSwitchView ? window.ui.smoothSwitchView('transactions') : (window.ui?.showPage ? window.ui.showPage('transactions') : console.log('No nav available'))">
                            Lihat Semua →
                        </button>
                    </div>
                    
                    <div class="transaction-list">
                        ${recentTransactions.length > 0 ? 
                            recentTransactions.map(t => this.components.renderTransactionItem(t)).join('') :
                            '<div class="empty-state"><div class="empty-icon">📝</div><div class="empty-title">Belum Ada Transaksi</div><div class="empty-description">Tambahkan transaksi pertama Anda</div></div>'
                        }
                    </div>
                </div>
            </div>
        `;
    }

    // ===== TRANSACTIONS PAGE RENDERING =====
    renderTransactions() {
        const stats = this.analytics.getMonthlyStats();
        const allTransactions = this.budgetManager.data.transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const accounts = this.budgetManager.data.accounts;
        const categories = this.budgetManager.data.categories;

        return `
            <div class="transactions-container">
                <!-- Transactions Statistics -->
                <div class="transactions-stats">
                    <div class="stat-card success">
                        <div class="stat-icon">💰</div>
                        <div class="stat-content">
                            <div class="stat-value">${this.budgetManager.formatCurrency(stats.income)}</div>
                            <div class="stat-label">Pemasukan Bulan Ini</div>
                        </div>
                    </div>
                    
                    <div class="stat-card warning">
                        <div class="stat-icon">💸</div>
                        <div class="stat-content">
                            <div class="stat-value">${this.budgetManager.formatCurrency(stats.expense)}</div>
                            <div class="stat-label">Pengeluaran Bulan Ini</div>
                        </div>
                    </div>
                    
                    <div class="stat-card info">
                        <div class="stat-icon">📊</div>
                        <div class="stat-content">
                            <div class="stat-value">${stats.transactionCount}</div>
                            <div class="stat-label">Total Transaksi</div>
                        </div>
                    </div>
                    
                    <div class="stat-card ${stats.balance >= 0 ? 'success' : 'danger'}">
                        <div class="stat-icon">💎</div>
                        <div class="stat-content">
                            <div class="stat-value">${this.budgetManager.formatCurrency(stats.balance)}</div>
                            <div class="stat-label">Selisih Bulan Ini</div>
                        </div>
                    </div>
                </div>

                <!-- Page Actions -->
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="window.showQuickAddModal('income')">
                        <span class="btn-icon">💰</span>
                        <span class="btn-text">Tambah Pemasukan</span>
                    </button>
                    <button class="btn btn-primary" onclick="window.showQuickAddModal('expense')">
                        <span class="btn-icon">💸</span>
                        <span class="btn-text">Tambah Pengeluaran</span>
                    </button>
                </div>

                <!-- Transactions Section -->
                <div class="transactions-section">
                    <div class="section-header">
                        <h2 class="section-title">Semua Transaksi</h2>
                        <div class="section-actions">
                            <select class="filter-select" id="transactionFilter" onchange="window.filterTransactions()">
                                <option value="all">Semua Transaksi</option>
                                <option value="income">Pemasukan</option>
                                <option value="expense">Pengeluaran</option>
                            </select>
                            <select class="filter-select" id="monthFilter" onchange="window.filterTransactions()">
                                <option value="">Semua Bulan</option>
                                <option value="${new Date().toISOString().slice(0, 7)}">Bulan Ini</option>
                                ${this.generateMonthOptions()}
                            </select>
                        </div>
                    </div>
                    
                    <div class="transactions-list" id="transactionsList">
                        ${allTransactions.length > 0 ? 
                            allTransactions.map(t => this.components.renderTransactionItem(t)).join('') :
                            '<div class="empty-state"><div class="empty-icon">📝</div><div class="empty-title">Belum Ada Transaksi</div><div class="empty-description">Mulai dengan menambahkan transaksi pertama Anda</div><button class="btn btn-primary" onclick="window.showQuickAddModal(\'expense\')" style="margin-top: 1rem;">Tambah Transaksi</button></div>'
                        }
                    </div>
                </div>
            </div>
        `;
    }

    // ===== TRANSACTION ITEM RENDERING =====
    renderDetailedTransactionItem(transaction) {
        const category = this.budgetManager.getCategoryById(transaction.categoryId);
        const account = this.budgetManager.getAccountById(transaction.accountId);
        const accountType = this.budgetManager.data.accountTypes.find(t => t.id === account?.typeId);
        
        const date = new Date(transaction.date);
        const formattedDate = date.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        const timeAgo = this.getTimeAgo(date);
        
        return `
            <div class="transaction-item detailed ${transaction.type}" data-id="${transaction.id}">
                <div class="transaction-main">
                    <div class="transaction-icon">
                        ${category?.icon || (transaction.type === 'income' ? '💰' : '💸')}
                    </div>
                    <div class="transaction-details">
                        <div class="transaction-name">
                            ${transaction.description || category?.name || 'Transaksi'}
                        </div>
                        <div class="transaction-meta">
                            <span>${formattedDate}</span>
                            <span class="transaction-separator">•</span>
                            <span>${accountType?.icon || '💳'} ${account?.name || 'Unknown'}</span>
                            <span class="transaction-separator">•</span>
                            <span>${timeAgo}</span>
                        </div>
                    </div>
                    <div class="transaction-amount ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : '-'}${this.budgetManager.formatCurrency(transaction.amount)}
                    </div>
                </div>
                <div class="transaction-actions">
                    <button class="action-btn-small edit" 
                            onclick="event.stopPropagation(); console.log('Edit button clicked for transaction ${transaction.id}'); window.editTransaction(${transaction.id});" 
                            title="Edit Transaksi"
                            style="cursor: pointer; pointer-events: auto; position: relative; z-index: 10; background: #f59e0b; color: white; border: none; border-radius: 4px; padding: 6px 8px; margin: 0 2px; font-size: 12px;">
                        ✏️
                    </button>
                    <button class="action-btn-small delete" 
                            onclick="event.stopPropagation(); console.log('Delete button clicked for transaction ${transaction.id}'); window.deleteTransaction(${transaction.id});" 
                            title="Hapus Transaksi"
                            style="cursor: pointer; pointer-events: auto; position: relative; z-index: 10; background: #ef4444; color: white; border: none; border-radius: 4px; padding: 6px 8px; margin: 0 2px; font-size: 12px;">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }

    // ===== TRANSACTION MANAGEMENT METHODS =====
    editTransaction(id) {
        const transaction = this.budgetManager.data.transactions.find(t => t.id === id);
        if (!transaction) {
            this.components.showToast('Transaksi tidak ditemukan!', 'error');
            return;
        }

        const categories = this.budgetManager.data.categories.filter(cat => 
            transaction.type === 'income' ? cat.id >= 8 : cat.id <= 7
        );
        const accounts = this.budgetManager.data.accounts;
        
        const modalContent = `
            <div class="modal-header">
                <h3 class="modal-title">✏️ Edit ${transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</h3>
                <button class="modal-close" onclick="window.hideModal()">×</button>
            </div>
            <form class="modal-form" id="editTransactionForm">
                <div class="form-group">
                    <label class="form-label">Jumlah *</label>
                    <input type="number" id="editAmount" class="form-input" value="${transaction.amount}" required min="1" step="0.01">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Kategori *</label>
                    <select id="editCategory" class="form-input" required>
                        ${categories.map(cat => 
                            `<option value="${cat.id}" ${cat.id === transaction.categoryId ? 'selected' : ''}>${cat.icon} ${cat.name}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Akun *</label>
                    <select id="editAccount" class="form-input" required>
                        ${accounts.map(acc => {
                            const accountType = this.budgetManager.data.accountTypes.find(t => t.id === acc.typeId);
                            return `<option value="${acc.id}" ${acc.id === transaction.accountId ? 'selected' : ''}>${accountType?.icon || '💳'} ${acc.name}</option>`;
                        }).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Deskripsi</label>
                    <input type="text" id="editDescription" class="form-input" value="${transaction.description || ''}" placeholder="Deskripsi (opsional)">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Tanggal</label>
                    <input type="date" id="editDate" class="form-input" value="${transaction.date}">
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="window.hideModal()">Batal</button>
                    <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
                </div>
            </form>
        `;
        
        this.components.showModal(modalContent);
        
        // Bind form submit
        document.getElementById('editTransactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const amount = parseFloat(document.getElementById('editAmount').value);
            const categoryId = parseInt(document.getElementById('editCategory').value);
            const accountId = parseInt(document.getElementById('editAccount').value);
            const description = document.getElementById('editDescription').value;
            const date = document.getElementById('editDate').value;
            
            try {
                this.budgetManager.updateTransaction(id, {
                    amount,
                    categoryId,
                    accountId,
                    description,
                    date
                });
                this.components.showToast('Transaksi berhasil diperbarui!', 'success');
                this.hideModal();
                this.render();
                this.updateUserBalance();
            } catch (error) {
                this.components.showToast('Gagal memperbarui transaksi: ' + error.message, 'error');
            }
        });
    }

    deleteTransaction(id) {
        const transaction = this.budgetManager.data.transactions.find(t => t.id === id);
        if (!transaction) {
            this.components.showToast('Transaksi tidak ditemukan!', 'error');
            return;
        }

        const category = this.budgetManager.getCategoryById(transaction.categoryId);
        const confirmMessage = `Hapus transaksi "${transaction.description || category?.name || 'Transaksi'}" sebesar ${this.budgetManager.formatCurrency(transaction.amount)}?`;
        
        if (confirm(confirmMessage)) {
            try {
                this.budgetManager.deleteTransaction(id);
                this.components.showToast('Transaksi berhasil dihapus!', 'success');
                this.render();
                this.updateUserBalance();
            } catch (error) {
                this.components.showToast('Gagal menghapus transaksi: ' + error.message, 'error');
            }
        }
    }

    // ===== TRANSACTION FILTERING =====
    filterTransactions() {
        const typeFilter = document.getElementById('transactionFilter')?.value || 'all';
        const monthFilter = document.getElementById('monthFilter')?.value || '';
        
        let filteredTransactions = this.budgetManager.data.transactions;
        
        // Filter by type
        if (typeFilter !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
        }
        
        // Filter by month
        if (monthFilter) {
            filteredTransactions = filteredTransactions.filter(t => t.date.startsWith(monthFilter));
        }
        
        // Sort by date (newest first)
        filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Update the transactions list
        const transactionsList = document.getElementById('transactionsList');
        if (transactionsList) {
            if (filteredTransactions.length > 0) {
                transactionsList.innerHTML = filteredTransactions.map(t => this.components.renderTransactionItem(t)).join('');
            } else {
                transactionsList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">🔍</div>
                        <div class="empty-title">Tidak Ada Transaksi</div>
                        <div class="empty-description">Tidak ada transaksi yang sesuai dengan filter yang dipilih</div>
                    </div>
                `;
            }
        }
    }

    // ===== UTILITY METHODS =====
    updateUserBalance() {
        const totalBalance = this.budgetManager.getTotalBalance();
        
        // Update header balance
        const headerBalance = document.getElementById('header-balance');
        if (headerBalance) {
            headerBalance.textContent = this.budgetManager.formatCurrency(totalBalance);
        }
        
        // Update sidebar balance if it exists
        const userBalance = document.querySelector('.user-balance');
        if (userBalance) {
            userBalance.textContent = this.budgetManager.formatCurrency(totalBalance);
        }
    }

    handleResize() {
        if (window.innerWidth > 768) {
            this.closeMobileSidebar();
        }
    }

    initializePageSpecific() {
        // Initialize page-specific functionality based on current view
        if (this.currentView === 'analytics') {
            this.initializeAnalyticsCharts();
        }
        
        // Add animations for stat cards on dashboard
        if (this.currentView === 'dashboard') {
            setTimeout(() => {
                const statCards = document.querySelectorAll('.stat-card');
                statCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                        card.classList.add('animate');
                    }, index * 100);
                });
            }, 100);
        }
    }

    initializeAnalyticsCharts() {
        // Placeholder for chart initialization
        console.log('Analytics charts initialized');
    }

    // ===== DEMO DATA & RESET =====
    loadDemoData() {
        if (confirm('Ini akan mengganti semua data yang ada dengan data demo. Lanjutkan?')) {
            try {
                this.budgetManager.generateDemoData();
                this.components.showToast('Data demo berhasil dimuat! Silakan cek semua halaman untuk melihat fitur-fitur analisis.', 'success');
                this.render();
                this.updateUserBalance();
                this.preloadData();
            } catch (error) {
                this.components.showToast('Gagal memuat data demo: ' + error.message, 'error');
            }
        }
    }

    resetAllData() {
        if (confirm('⚠️ PERINGATAN: Ini akan menghapus SEMUA data (akun, transaksi, target, budget). Yakin ingin melanjutkan?')) {
            if (confirm('Konfirmasi sekali lagi: Semua data akan hilang permanen. Lanjutkan?')) {
                try {
                    this.budgetManager.resetAllData();
                    this.components.showToast('Semua data berhasil dihapus! Aplikasi kembali ke kondisi awal.', 'success');
                    this.render();
                    this.updateUserBalance();
                    this.preloadData();
                } catch (error) {
                    this.components.showToast('Gagal reset data: ' + error.message, 'error');
                }
            }
        }
    }

    // ===== PLACEHOLDER METHODS FOR OTHER VIEWS =====
    renderAccounts() {
        const totalBalance = this.budgetManager.getTotalBalance();
        const accounts = this.budgetManager.data.accounts;
        const positiveAccounts = accounts.filter(a => a.balance > 0).length;
        const negativeAccounts = accounts.filter(a => a.balance < 0).length;

        return `
            <div class="accounts-container">
                <!-- Account Statistics -->
                <div class="accounts-stats">
                    <div class="stat-card success">
                        <div class="stat-icon">💰</div>
                        <div class="stat-content">
                            <div class="stat-value">${this.budgetManager.formatCurrency(totalBalance)}</div>
                            <div class="stat-label">Total Saldo</div>
                        </div>
                    </div>
                    
                    <div class="stat-card info">
                        <div class="stat-icon">🏦</div>
                        <div class="stat-content">
                            <div class="stat-value">${accounts.length}</div>
                            <div class="stat-label">Total Akun</div>
                        </div>
                    </div>
                    
                    <div class="stat-card ${positiveAccounts > 0 ? 'success' : 'warning'}">
                        <div class="stat-icon">📈</div>
                        <div class="stat-content">
                            <div class="stat-value">${positiveAccounts}</div>
                            <div class="stat-label">Akun Positif</div>
                        </div>
                    </div>
                    
                    <div class="stat-card ${negativeAccounts > 0 ? 'danger' : 'success'}">
                        <div class="stat-icon">📉</div>
                        <div class="stat-content">
                            <div class="stat-value">${negativeAccounts}</div>
                            <div class="stat-label">Akun Negatif</div>
                        </div>
                    </div>
                </div>

                <!-- Page Actions -->
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="window.showAddAccountModal()">
                        <span class="btn-icon">🏦</span>
                        <span class="btn-text">Tambah Akun</span>
                    </button>
                    <button class="btn btn-secondary" onclick="window.showAccountImportModal()">
                        <span class="btn-icon">📤</span>
                        <span class="btn-text">Import Akun</span>
                    </button>
                </div>

                <!-- Accounts Section -->
                <div class="accounts-section">
                    <div class="section-header">
                        <h2 class="section-title">Daftar Akun & Dompet</h2>
                        <div class="section-actions">
                            <select class="filter-select" id="accountTypeFilter" onchange="window.filterAccounts()">
                                <option value="all">Semua Jenis</option>
                                <option value="cash">Tunai</option>
                                <option value="bank">Bank</option>
                                <option value="ewallet">E-Wallet</option>
                                <option value="investment">Investasi</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="accounts-grid" id="accountsGrid">
                        ${accounts.length > 0 ? 
                            accounts.map(account => this.components.renderAccountCard(account)).join('') :
                            '<div class="empty-state"><div class="empty-icon">🏦</div><div class="empty-title">Belum Ada Akun</div><div class="empty-description">Tambahkan akun pertama Anda untuk mulai melacak keuangan</div><button class="btn btn-primary" onclick="window.showAddAccountModal()" style="margin-top: 1rem;">Tambah Akun</button></div>'
                        }
                    </div>
                </div>
            </div>
        `;
    }

    // ===== COMPONENT ACCESS METHODS =====
    hideModal() {
        this.components.hideModal();
    }

    showToast(message, type) {
        this.components.showToast(message, type);
    }

    // ===== UTILITY METHODS =====
    generateMonthOptions() {
        const months = [];
        const currentDate = new Date();
        
        // Generate last 12 months
        for (let i = 1; i <= 12; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthStr = date.toISOString().slice(0, 7);
            const monthName = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
            months.push(`<option value="${monthStr}">${monthName}</option>`);
        }
        
        return months.join('');
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Kemarin';
        if (diffDays < 7) return `${diffDays} hari lalu`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan lalu`;
        return `${Math.floor(diffDays / 365)} tahun lalu`;
    }

    // ===== GOALS PAGE RENDERING =====
    renderGoals() {
        const goals = this.budgetManager.data.goals || [];
        console.log('🎯 renderGoals called with goals:', goals.length, goals);
        
        // Fix property mapping for Supabase compatibility
        const completedGoals = goals.filter(g => (g.currentAmount || g.current_amount || 0) >= (g.targetAmount || g.target_amount || g.target || 0)).length;
        const activeGoals = goals.filter(g => (g.currentAmount || g.current_amount || 0) < (g.targetAmount || g.target_amount || g.target || 0)).length;
        const totalTargetAmount = goals.reduce((sum, g) => sum + (g.targetAmount || g.target_amount || g.target || 0), 0);
        const totalCurrentAmount = goals.reduce((sum, g) => sum + (g.currentAmount || g.current_amount || 0), 0);

        console.log('🎯 Goals stats:', { completedGoals, activeGoals, totalTargetAmount, totalCurrentAmount });

        return `
            <div class="goals-container">
                <!-- Goals Statistics -->
                <div class="goals-stats">
                    <div class="stat-card success">
                        <div class="stat-icon">🎯</div>
                        <div class="stat-content">
                            <div class="stat-value">${goals.length}</div>
                            <div class="stat-label">Total Target</div>
                        </div>
                    </div>
                    
                    <div class="stat-card ${completedGoals > 0 ? 'success' : 'info'}">
                        <div class="stat-icon">✅</div>
                        <div class="stat-content">
                            <div class="stat-value">${completedGoals}</div>
                            <div class="stat-label">Target Tercapai</div>
                        </div>
                    </div>
                    
                    <div class="stat-card warning">
                        <div class="stat-icon">⏳</div>
                        <div class="stat-content">
                            <div class="stat-value">${activeGoals}</div>
                            <div class="stat-label">Target Aktif</div>
                        </div>
                    </div>
                    
                    <div class="stat-card info">
                        <div class="stat-icon">💰</div>
                        <div class="stat-content">
                            <div class="stat-value">${this.budgetManager.formatCurrency(totalCurrentAmount)}</div>
                            <div class="stat-label">Total Terkumpul</div>
                        </div>
                    </div>
                </div>

                <!-- Page Actions -->
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="window.showAddGoalModal()">
                        <span class="btn-icon">🎯</span>
                        <span class="btn-text">Tambah Target</span>
                    </button>
                    <button class="btn btn-secondary" onclick="window.showGoalImportModal()">
                        <span class="btn-icon">📤</span>
                        <span class="btn-text">Import Target</span>
                    </button>
                </div>

                <!-- Goals Section -->
                <div class="goals-section">
                    <div class="section-header">
                        <h2 class="section-title">Daftar Target Keuangan</h2>
                        <div class="section-actions">
                            <select class="filter-select" id="goalStatusFilter" onchange="window.filterGoals()">
                                <option value="all">Semua Status</option>
                                <option value="active">Sedang Berjalan</option>
                                <option value="completed">Sudah Tercapai</option>
                                <option value="overdue">Terlambat</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="goals-grid" id="goalsGrid">
                        ${goals.length > 0 ? 
                            goals.map(goal => this.components.renderGoalCard(goal)).join('') :
                            '<div class="empty-state"><div class="empty-icon">🎯</div><div class="empty-title">Belum Ada Target</div><div class="empty-description">Buat target keuangan pertama Anda untuk mencapai impian finansial</div><button class="btn btn-primary" onclick="window.showAddGoalModal()" style="margin-top: 1rem;">Tambah Target</button></div>'
                        }
                    </div>
                </div>
            </div>
        `;
    }

    // ===== ANALYTICS PAGE RENDERING =====
    renderAdvancedAnalytics() {
        const monthlyStats = this.analytics.getMonthlyStats();
        const weeklyTrend = this.analytics.getWeeklyTrend();
        const healthScore = this.analytics.calculateFinancialHealthScore();

        return `
            <div class="analytics-container">
                <!-- Analytics Overview Stats -->
                <div class="analytics-stats">
                    <div class="stat-card info">
                        <div class="stat-icon">📊</div>
                        <div class="stat-content">
                            <div class="stat-value">${monthlyStats.transactionCount}</div>
                            <div class="stat-label">Total Transaksi</div>
                        </div>
                    </div>
                    
                    <div class="stat-card ${healthScore >= 80 ? 'success' : healthScore >= 60 ? 'warning' : 'danger'}">
                        <div class="stat-icon">${healthScore >= 80 ? '💚' : healthScore >= 60 ? '💛' : '❤️'}</div>
                        <div class="stat-content">
                            <div class="stat-value">${healthScore}%</div>
                            <div class="stat-label">Skor Kesehatan Keuangan</div>
                        </div>
                    </div>
                    
                    <div class="stat-card ${monthlyStats.savingsRate >= 20 ? 'success' : monthlyStats.savingsRate >= 10 ? 'warning' : 'danger'}">
                        <div class="stat-icon">💰</div>
                        <div class="stat-content">
                            <div class="stat-value">${monthlyStats.savingsRate.toFixed(1)}%</div>
                            <div class="stat-label">Tingkat Tabungan</div>
                        </div>
                    </div>
                    
                    <div class="stat-card ${weeklyTrend.trend === 'increasing' ? 'danger' : weeklyTrend.trend === 'decreasing' ? 'success' : 'info'}">
                        <div class="stat-icon">${weeklyTrend.trend === 'increasing' ? '📈' : weeklyTrend.trend === 'decreasing' ? '📉' : '➡️'}</div>
                        <div class="stat-content">
                            <div class="stat-value">${Math.abs(weeklyTrend.percentageChange).toFixed(1)}%</div>
                            <div class="stat-label">Tren Pengeluaran</div>
                        </div>
                    </div>
                </div>

                <!-- Analytics Tabs -->
                <div class="analytics-tabs">
                    <button class="analytics-tab active" data-tab="overview" onclick="window.switchAnalyticsTab('overview')">
                        📊 Ringkasan
                    </button>
                    <button class="analytics-tab" data-tab="categories" onclick="window.switchAnalyticsTab('categories')">
                        🏷️ Kategori
                    </button>
                    <button class="analytics-tab" data-tab="insights" onclick="window.switchAnalyticsTab('insights')">
                        💡 Insights
                    </button>
                </div>

                <!-- Analytics Content -->
                <div class="analytics-content" id="analyticsContent">
                    ${this.renderAnalyticsTab('overview')}
                </div>
            </div>
        `;
    }

    renderAnalyticsTab(tab) {
        switch(tab) {
            case 'overview':
                return this.renderOverviewAnalytics();
            case 'categories':
                return this.renderCategoriesAnalytics();
            case 'insights':
                return this.renderInsightsAnalytics();
            default:
                return this.renderOverviewAnalytics();
        }
    }

    renderOverviewAnalytics() {
        const monthlyStats = this.analytics.getMonthlyStats();
        const expensePatterns = this.analytics.analyzeExpensePatterns();
        
        return `
            <div class="analytics-overview">
                <div class="analytics-section">
                    <h3 class="analytics-section-title">📊 Ringkasan Bulan Ini</h3>
                    <div class="overview-cards">
                        <div class="overview-card">
                            <div class="overview-label">Pemasukan</div>
                            <div class="overview-value income">+${this.budgetManager.formatCurrency(monthlyStats.income)}</div>
                        </div>
                        <div class="overview-card">
                            <div class="overview-label">Pengeluaran</div>
                            <div class="overview-value expense">-${this.budgetManager.formatCurrency(monthlyStats.expense)}</div>
                        </div>
                        <div class="overview-card">
                            <div class="overview-label">Saldo Bersih</div>
                            <div class="overview-value ${monthlyStats.balance >= 0 ? 'positive' : 'negative'}">
                                ${monthlyStats.balance >= 0 ? '+' : ''}${this.budgetManager.formatCurrency(monthlyStats.balance)}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="analytics-section">
                    <h3 class="analytics-section-title">🔍 Pola Pengeluaran</h3>
                    <div class="expense-patterns">
                        <div class="pattern-item">
                            <div class="pattern-label">Hari Tertinggi:</div>
                            <div class="pattern-value">${expensePatterns.highestExpenseDay}</div>
                        </div>
                        <div class="pattern-item">
                            <div class="pattern-label">Rata-rata per Hari:</div>
                            <div class="pattern-value">${this.budgetManager.formatCurrency(expensePatterns.averageDaily)}</div>
                        </div>
                        <div class="pattern-item">
                            <div class="pattern-label">Transaksi Terbesar:</div>
                            <div class="pattern-value">${this.budgetManager.formatCurrency(expensePatterns.largestTransaction)}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderCategoriesAnalytics() {
        try {
            const categoryExpenses = this.analytics.getCategoryExpenses();
            console.log('📊 Category expenses data:', categoryExpenses);
            
            if (!categoryExpenses || categoryExpenses.length === 0) {
                return `
                    <div class="analytics-categories">
                        <div class="analytics-section">
                            <h3 class="analytics-section-title">🏷️ Pengeluaran per Kategori</h3>
                            <div class="empty-state">
                                <div class="empty-icon">📋</div>
                                <div class="empty-title">Belum Ada Data Kategori</div>
                                <div class="empty-description">Tambahkan transaksi untuk melihat analisis kategori</div>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            return `
                <div class="analytics-categories">
                    <div class="analytics-section">
                        <h3 class="analytics-section-title">🏷️ Pengeluaran per Kategori</h3>
                        <div class="category-list">
                            ${categoryExpenses.map(cat => `
                                <div class="category-item">
                                    <div class="category-info">
                                        <div class="category-icon">${cat.icon || '📋'}</div>
                                        <div class="category-details">
                                            <div class="category-name">${cat.name || 'Unknown'}</div>
                                            <div class="category-transactions">${cat.transactionCount || 0} transaksi</div>
                                        </div>
                                    </div>
                                    <div class="category-amount">
                                        <div class="category-value">${this.budgetManager.formatCurrency(cat.amount || 0)}</div>
                                        <div class="category-percentage">${(cat.percentage || 0).toFixed(1)}%</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('📊 Error in renderCategoriesAnalytics:', error);
            return `
                <div class="analytics-categories">
                    <div class="analytics-section">
                        <h3 class="analytics-section-title">🏷️ Pengeluaran per Kategori</h3>
                        <div class="error-state">
                            <div class="error-icon">⚠️</div>
                            <div class="error-title">Error Loading Categories</div>
                            <div class="error-description">Gagal memuat data kategori: ${error.message}</div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    renderInsightsAnalytics() {
        try {
            const insights = this.analytics.generateInsights();
            console.log('📊 Generated insights:', insights);
            
            if (!insights || insights.length === 0) {
                return `
                    <div class="analytics-insights">
                        <div class="analytics-section">
                            <h3 class="analytics-section-title">💡 Insights & Rekomendasi</h3>
                            <div class="empty-state">
                                <div class="empty-icon">💡</div>
                                <div class="empty-title">Belum Ada Insights</div>
                                <div class="empty-description">Tambahkan lebih banyak transaksi untuk mendapatkan insights yang lebih mendalam</div>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            return `
                <div class="analytics-insights">
                    <div class="analytics-section">
                        <h3 class="analytics-section-title">💡 Insights & Rekomendasi</h3>
                        <div class="insights-list">
                            ${insights.map(insight => `
                                <div class="insight-item ${insight.type || 'info'}">
                                    <div class="insight-icon">
                                        ${insight.type === 'warning' ? '⚠️' : 
                                          insight.type === 'success' ? '✅' : 
                                          insight.type === 'info' ? 'ℹ️' : '💡'}
                                    </div>
                                    <div class="insight-content">
                                        <div class="insight-title">${insight.title || 'Insight'}</div>
                                        <div class="insight-description">${insight.description || 'No description available'}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('📊 Error in renderInsightsAnalytics:', error);
            return `
                <div class="analytics-insights">
                    <div class="analytics-section">
                        <h3 class="analytics-section-title">💡 Insights & Rekomendasi</h3>
                        <div class="error-state">
                            <div class="error-icon">⚠️</div>
                            <div class="error-title">Error Loading Insights</div>
                            <div class="error-description">Gagal memuat insights: ${error.message}</div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    switchAnalyticsTab(tab) {
        // Update tab states
        document.querySelectorAll('.analytics-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });
        
        // Update content
        const content = document.getElementById('analyticsContent');
        if (content) {
            content.innerHTML = this.renderAnalyticsTab(tab);
        }
        
        this.analyticsMode = tab;
    }

    // ===== ACCOUNT MANAGEMENT METHODS =====
    editAccount(id) {
        const account = this.budgetManager.data.accounts.find(a => a.id === id);
        if (!account) {
            this.components.showToast('Akun tidak ditemukan!', 'error');
            return;
        }

        const accountTypes = this.budgetManager.data.accountTypes;
        const accountType = accountTypes.find(t => t.id === account.typeId);
        
        const modalContent = `
            <div class="modal-header">
                <h3 class="modal-title">✏️ Edit Akun</h3>
                <button class="modal-close" onclick="window.hideModal()">×</button>
            </div>
            <form class="modal-form" id="editAccountForm">
                <div class="form-group">
                    <label class="form-label">Nama Akun *</label>
                    <input type="text" id="editAccountName" class="form-input" value="${account.name}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Jenis Akun *</label>
                    <select id="editAccountType" class="form-input" required>
                        ${accountTypes.map(type => 
                            `<option value="${type.id}" ${type.id === account.typeId ? 'selected' : ''}>
                                ${type.icon} ${type.name}
                            </option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Saldo Saat Ini</label>
                    <input type="number" id="editAccountBalance" class="form-input" value="${account.balance}" step="0.01">
                    <div class="form-help">Saldo saat ini di akun tersebut</div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="window.hideModal()">Batal</button>
                    <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
                </div>
            </form>
        `;
        
        this.components.showModal(modalContent);
        
        // Bind form submit
        document.getElementById('editAccountForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('editAccountName').value.trim();
            const typeId = parseInt(document.getElementById('editAccountType').value);
            const balance = parseFloat(document.getElementById('editAccountBalance').value) || 0;
            
            if (!name) {
                this.components.showToast('Nama akun harus diisi!', 'error');
                return;
            }
            
            try {
                this.budgetManager.updateAccount(id, { name, typeId, balance });
                this.components.showToast('Akun berhasil diperbarui!', 'success');
                this.hideModal();
                this.render();
                this.updateUserBalance();
            } catch (error) {
                this.components.showToast('Gagal memperbarui akun: ' + error.message, 'error');
            }
        });
    }

    deleteAccount(id) {
        const account = this.budgetManager.data.accounts.find(a => a.id === id);
        if (!account) {
            this.components.showToast('Akun tidak ditemukan!', 'error');
            return;
        }

        const transactionCount = this.budgetManager.data.transactions.filter(t => t.accountId === id).length;
        let confirmMessage = `Hapus akun "${account.name}"?`;
        
        if (transactionCount > 0) {
            confirmMessage += `\n\nPeringatan: Ada ${transactionCount} transaksi yang terkait dengan akun ini. Semua transaksi tersebut juga akan dihapus!`;
        }
        
        if (confirm(confirmMessage)) {
            try {
                // Delete related transactions first
                this.budgetManager.data.transactions = this.budgetManager.data.transactions.filter(t => t.accountId !== id);
                
                // Delete account
                this.budgetManager.deleteAccount(id);
                this.components.showToast('Akun berhasil dihapus!', 'success');
                this.render();
                this.updateUserBalance();
            } catch (error) {
                this.components.showToast('Gagal menghapus akun: ' + error.message, 'error');
            }
        }
    }

    filterAccounts() {
        const typeFilter = document.getElementById('accountTypeFilter')?.value || 'all';
        let filteredAccounts = this.budgetManager.data.accounts;
        
        if (typeFilter !== 'all') {
            const accountTypes = this.budgetManager.data.accountTypes;
            const targetTypeIds = accountTypes
                .filter(t => t.name.toLowerCase().includes(typeFilter))
                .map(t => t.id);
            filteredAccounts = filteredAccounts.filter(a => targetTypeIds.includes(a.typeId));
        }
        
        const accountsGrid = document.getElementById('accountsGrid');
        if (accountsGrid) {
            if (filteredAccounts.length > 0) {
                accountsGrid.innerHTML = filteredAccounts.map(a => this.components.renderAccountCard(a)).join('');
            } else {
                accountsGrid.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">🔍</div>
                        <div class="empty-title">Tidak Ada Akun</div>
                        <div class="empty-description">Tidak ada akun yang sesuai dengan filter yang dipilih</div>
                    </div>
                `;
            }
        }
    }

    // ===== GOAL MANAGEMENT METHODS =====
    editGoal(id) {
        const goal = this.budgetManager.data.goals?.find(g => g.id === id);
        if (!goal) {
            this.components.showToast('Target tidak ditemukan!', 'error');
            return;
        }
        
        const modalContent = `
            <div class="modal-header">
                <h3 class="modal-title">✏️ Edit Target</h3>
                <button class="modal-close" onclick="window.hideModal()">×</button>
            </div>
            <form class="modal-form" id="editGoalForm">
                <div class="form-group">
                    <label class="form-label">Nama Target *</label>
                    <input type="text" id="editGoalName" class="form-input" value="${goal.name}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Target Nominal *</label>
                    <input type="number" id="editTargetAmount" class="form-input" value="${goal.target}" required min="1" step="0.01">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Jumlah Saat Ini</label>
                    <input type="number" id="editCurrentAmount" class="form-input" value="${goal.currentAmount}" min="0" step="0.01">
                    <div class="form-help">Sudah berapa yang terkumpul saat ini</div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Target Tanggal</label>
                    <input type="date" id="editDeadline" class="form-input" value="${goal.deadline || ''}">
                    <div class="form-help">Kapan target ini ingin dicapai (opsional)</div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="window.hideModal()">Batal</button>
                    <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
                </div>
            </form>
        `;
        
        this.components.showModal(modalContent);
        
        // Set minimum date to today
        const deadlineInput = document.getElementById('editDeadline');
        if (deadlineInput) {
            deadlineInput.min = new Date().toISOString().split('T')[0];
        }
        
        // Bind form submit
        document.getElementById('editGoalForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('editGoalName').value.trim();
            const target = parseFloat(document.getElementById('editTargetAmount').value);
            const currentAmount = parseFloat(document.getElementById('editCurrentAmount').value) || 0;
            const deadline = document.getElementById('editDeadline').value || null;
            
            if (!name) {
                this.components.showToast('Nama target harus diisi!', 'error');
                return;
            }
            
            if (currentAmount > target) {
                this.components.showToast('Jumlah saat ini tidak boleh lebih dari target!', 'error');
                return;
            }
            
            try {
                const updatedGoal = this.budgetManager.data.goals.find(g => g.id === id);
                if (updatedGoal) {
                    updatedGoal.name = name;
                    updatedGoal.target = target;
                    updatedGoal.currentAmount = currentAmount;
                    updatedGoal.deadline = deadline;
                    this.budgetManager.saveData();
                    
                    this.components.showToast('Target berhasil diperbarui!', 'success');
                    this.hideModal();
                    this.render();
                }
            } catch (error) {
                this.components.showToast('Gagal memperbarui target: ' + error.message, 'error');
            }
        });
    }

    deleteGoal(id) {
        const goal = this.budgetManager.data.goals?.find(g => g.id === id);
        if (!goal) {
            this.components.showToast('Target tidak ditemukan!', 'error');
            return;
        }

        const progress = goal.target > 0 ? (goal.currentAmount / goal.target) * 100 : 0;
        let confirmMessage = `Hapus target "${goal.name}"?`;
        
        if (progress > 0) {
            confirmMessage += `\n\nTarget ini sudah ${Math.round(progress)}% tercapai (${this.budgetManager.formatCurrency(goal.currentAmount)} dari ${this.budgetManager.formatCurrency(goal.target)}).`;
        }
        
        if (confirm(confirmMessage)) {
            try {
                this.budgetManager.deleteGoal(id);
                this.components.showToast('Target berhasil dihapus!', 'success');
                this.render();
            } catch (error) {
                this.components.showToast('Gagal menghapus target: ' + error.message, 'error');
            }
        }
    }

    filterGoals() {
        const statusFilter = document.getElementById('goalStatusFilter')?.value || 'all';
        let filteredGoals = this.budgetManager.data.goals || [];
        
        if (statusFilter !== 'all') {
            const now = new Date();
            filteredGoals = filteredGoals.filter(goal => {
                const isCompleted = goal.currentAmount >= goal.target;
                const deadline = new Date(goal.deadline);
                const isOverdue = deadline < now && !isCompleted;
                
                switch(statusFilter) {
                    case 'active':
                        return !isCompleted && !isOverdue;
                    case 'completed':
                        return isCompleted;
                    case 'overdue':
                        return isOverdue;
                    default:
                        return true;
                }
            });
        }
        
        const goalsGrid = document.getElementById('goalsGrid');
        if (goalsGrid) {
            if (filteredGoals.length > 0) {
                goalsGrid.innerHTML = filteredGoals.map(g => this.components.renderGoalCard(g)).join('');
            } else {
                goalsGrid.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">🔍</div>
                        <div class="empty-title">Tidak Ada Target</div>
                        <div class="empty-description">Tidak ada target yang sesuai dengan filter yang dipilih</div>
                    </div>
                `;
            }
        }
    }
} 

// Export alias for compatibility
const UI = ModernBudgetUI;

// Global instance untuk backward compatibility
window.UI = UI;