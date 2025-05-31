// ===== AUTHENTICATION UI CLASS =====
class AuthUI {
    constructor() {
        this.budgetManager = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            this.budgetManager = window.supabaseBudgetManager;
            this.setupEventListeners();
            this.isInitialized = true;
            
            // Check if user is already logged in
            if (this.budgetManager.isAuthenticated()) {
                console.log('🔑 User already authenticated, showing main app...');
                this.showMainApp();
            } else {
                console.log('🔑 User not authenticated, showing auth screen...');
                this.showAuthScreen();
            }
            
            console.log('✅ AuthUI initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize AuthUI:', error);
        }
    }

    setupEventListeners() {
        // Listen for auth state changes
        document.addEventListener('supabase-auth-change', (event) => {
            console.log('📱 Auth UI received auth change:', event.detail);
            
            if (event.detail.authenticated) {
                this.showLoadingScreen('Memuat aplikasi...');
                // Wait a bit for data to load, then show main app
                setTimeout(() => {
                    this.showMainApp();
                }, 1000);
            } else {
                this.showAuthScreen();
            }
        });
        
        // Listen for data loading events
        document.addEventListener('supabase-data-loaded', (event) => {
            console.log('📊 Data loading completed:', event.detail);
            
            if (event.detail.success) {
                // Data loaded successfully, ensure main app is shown
                if (this.budgetManager.isAuthenticated()) {
                    this.showMainApp();
                }
            } else {
                // Data loading failed, show error
                this.showToast('⚠️ Gagal memuat data: ' + event.detail.error, 'error');
            }
        });
    }

    showAuthScreen() {
        const appContainer = document.querySelector('.app-container');
        if (!appContainer) return;

        appContainer.innerHTML = `
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <div class="auth-logo">
                            <span class="logo-icon">💰</span>
                            <h1 class="auth-title">BudgetKu</h1>
                        </div>
                        <p class="auth-subtitle">Kelola keuangan Anda dengan mudah dan aman</p>
                    </div>

                    <div class="auth-tabs">
                        <button class="auth-tab active" data-tab="login" onclick="window.authUI.switchTab('login')">
                            Masuk
                        </button>
                        <button class="auth-tab" data-tab="register" onclick="window.authUI.switchTab('register')">
                            Daftar
                        </button>
                    </div>

                    <div class="auth-content">
                        <!-- Login Form -->
                        <div class="auth-form active" id="login-form">
                            <form onsubmit="window.authUI.handleLogin(event)">
                                <div class="form-group">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-input" name="email" required placeholder="masukkan@email.com">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Password</label>
                                    <input type="password" class="form-input" name="password" required placeholder="••••••••">
                                </div>
                                
                                <button type="submit" class="btn btn-primary btn-block auth-submit">
                                    <span class="btn-text">Masuk</span>
                                    <div class="auth-spinner" style="display: none;">
                                        <div class="spinner"></div>
                                    </div>
                                </button>
                            </form>
                            
                            <div class="auth-footer">
                                <p>Belum punya akun? <button class="link-btn" onclick="window.authUI.switchTab('register')">Daftar sekarang</button></p>
                            </div>
                        </div>

                        <!-- Register Form -->
                        <div class="auth-form" id="register-form">
                            <form onsubmit="window.authUI.handleRegister(event)">
                                <div class="form-group">
                                    <label class="form-label">Nama Lengkap</label>
                                    <input type="text" class="form-input" name="fullName" required placeholder="Nama lengkap Anda">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-input" name="email" required placeholder="masukkan@email.com">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Password</label>
                                    <input type="password" class="form-input" name="password" required placeholder="••••••••" minlength="6">
                                    <div class="form-help">Minimal 6 karakter</div>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Konfirmasi Password</label>
                                    <input type="password" class="form-input" name="confirmPassword" required placeholder="••••••••">
                                </div>
                                
                                <button type="submit" class="btn btn-primary btn-block auth-submit">
                                    <span class="btn-text">Daftar</span>
                                    <div class="auth-spinner" style="display: none;">
                                        <div class="spinner"></div>
                                    </div>
                                </button>
                            </form>
                            
                            <div class="auth-footer">
                                <p>Sudah punya akun? <button class="link-btn" onclick="window.authUI.switchTab('login')">Masuk di sini</button></p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Demo Notice -->
                <div class="demo-notice">
                    <div class="demo-content">
                        <h3>🚀 Mode Demo</h3>
                        <p>Tidak ingin mendaftar? <button class="btn btn-outline btn-sm" onclick="window.authUI.startDemo()">Coba Demo</button></p>
                    </div>
                </div>
            </div>
        `;

        // Add auth-specific styles
        this.addAuthStyles();
    }

    async showMainApp() {
        // Remove auth and loading styles and restore main app
        this.removeAuthStyles();
        this.removeLoadingStyles();
        
        // Reinitialize main app
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            // Restore original app structure
            appContainer.innerHTML = `
                <!-- Mobile Header -->
                <div class="mobile-header">
                    <button class="mobile-menu-toggle" onclick="window.ui.toggleSidebar()">
                        <div class="hamburger">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </button>
                    
                    <div class="mobile-logo">
                        <span class="logo-icon">💰</span>
                        <span>BudgetKu</span>
                    </div>
                    
                    <div class="mobile-actions">
                        <button class="mobile-add-btn" onclick="window.ui.showQuickAddModal()">+</button>
                    </div>
                </div>

                <!-- Sidebar -->
                <div class="sidebar">
                    <div class="sidebar-header">
                        <div class="logo">
                            <span class="logo-icon">💰</span>
                            <div class="logo-content">
                                <div class="logo-text">BudgetKu</div>
                                <div class="logo-subtitle">Smart Finance</div>
                            </div>
                        </div>
                    </div>

                    <nav class="sidebar-nav">
                        <div class="nav-section">
                            <div class="nav-section-title">Menu Utama</div>
                            <a href="#" class="nav-item active" data-page="dashboard" onclick="window.ui.showPage('dashboard')">
                                <span class="nav-icon">📊</span>
                                <div class="nav-content">
                                    <div class="nav-text">Dashboard</div>
                                    <div class="nav-desc">Ringkasan keuangan</div>
                                </div>
                                <span class="nav-indicator"></span>
                            </a>
                            <a href="#" class="nav-item" data-page="transactions" onclick="window.ui.showPage('transactions')">
                                <span class="nav-icon">💳</span>
                                <div class="nav-content">
                                    <div class="nav-text">Transaksi</div>
                                    <div class="nav-desc">Pemasukan & pengeluaran</div>
                                </div>
                            </a>
                            <a href="#" class="nav-item" data-page="accounts" onclick="window.ui.showPage('accounts')">
                                <span class="nav-icon">🏦</span>
                                <div class="nav-content">
                                    <div class="nav-text">Akun</div>
                                    <div class="nav-desc">Kelola rekening</div>
                                </div>
                            </a>
                            <a href="#" class="nav-item" data-page="goals" onclick="window.ui.showPage('goals')">
                                <span class="nav-icon">🎯</span>
                                <div class="nav-content">
                                    <div class="nav-text">Target</div>
                                    <div class="nav-desc">Tujuan keuangan</div>
                                </div>
                            </a>
                        </div>

                        <div class="nav-section">
                            <div class="nav-section-title">Analisis</div>
                            <a href="#" class="nav-item" data-page="analytics" onclick="window.ui.showPage('analytics')">
                                <span class="nav-icon">📈</span>
                                <div class="nav-content">
                                    <div class="nav-text">Analisis</div>
                                    <div class="nav-desc">Insight keuangan</div>
                                </div>
                            </a>
                        </div>
                    </nav>

                    <div class="sidebar-footer">
                        <div class="user-profile">
                            <div class="user-avatar">👤</div>
                            <div class="user-info">
                                <div class="user-name">${this.budgetManager.getCurrentUser()?.email || 'User'}</div>
                                <div class="user-balance">Online Mode</div>
                            </div>
                        </div>
                        <button class="btn btn-ghost btn-sm" onclick="window.authUI.handleLogout()" style="margin-top: 10px; width: 100%;">
                            🚪 Keluar
                        </button>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="main-content">
                    <div class="main-header">
                        <div class="header-left">
                            <h1 class="page-title" id="page-title">Dashboard</h1>
                            <nav class="page-breadcrumb">
                                <span class="breadcrumb-item">BudgetKu</span>
                                <span class="breadcrumb-separator">›</span>
                                <span class="breadcrumb-item active" id="breadcrumb-current">Dashboard</span>
                            </nav>
                        </div>
                        
                        <div class="header-right">
                            <div class="header-stats">
                                <div class="quick-stat">
                                    <div class="quick-stat-value" id="header-balance">Rp 0</div>
                                    <div class="quick-stat-label">Total Saldo</div>
                                </div>
                            </div>
                            
                            <!-- Theme Toggle Button -->
                            <button class="theme-toggle" id="themeToggle" title="Toggle Dark Mode">
                                🌙
                            </button>
                        </div>
                    </div>

                    <div class="content-wrapper">
                        <div class="content-area" id="content-area">
                            <!-- Content akan diisi oleh UI.js -->
                        </div>
                    </div>
                </div>

                <!-- Sidebar Overlay -->
                <div class="sidebar-overlay" onclick="window.ui.toggleSidebar()"></div>

                <!-- Bottom Navigation -->
                <div class="bottom-nav">
                    <a href="#" class="bottom-nav-item active" data-page="dashboard" onclick="window.ui.showPage('dashboard')">
                        <span class="bottom-nav-icon">📊</span>
                        <span class="bottom-nav-text">Dashboard</span>
                    </a>
                    <a href="#" class="bottom-nav-item" data-page="transactions" onclick="window.ui.showPage('transactions')">
                        <span class="bottom-nav-icon">💳</span>
                        <span class="bottom-nav-text">Transaksi</span>
                    </a>
                    <a href="#" class="bottom-nav-item" data-page="accounts" onclick="window.ui.showPage('accounts')">
                        <span class="bottom-nav-icon">🏦</span>
                        <span class="bottom-nav-text">Akun</span>
                    </a>
                    <a href="#" class="bottom-nav-item" data-page="goals" onclick="window.ui.showPage('goals')">
                        <span class="bottom-nav-icon">🎯</span>
                        <span class="bottom-nav-text">Target</span>
                    </a>
                    <a href="#" class="bottom-nav-item" data-page="analytics" onclick="window.ui.showPage('analytics')">
                        <span class="bottom-nav-icon">📈</span>
                        <span class="bottom-nav-text">Analisis</span>
                    </a>
                </div>
            `;
            
            // Reinitialize UI
            if (window.ui && window.ui.setBudgetManager) {
                // Use existing SimpleUI for basic navigation
                window.ui.setBudgetManager(this.budgetManager);
                window.ui.showPage('dashboard');
            }
            
            // Initialize full ModernBudgetUI for proper UI components
            try {
                if (typeof ModernBudgetUI !== 'undefined') {
                    console.log('🎨 Initializing ModernBudgetUI...');
                    const modernUI = new ModernBudgetUI(this.budgetManager);
                    await modernUI.initialize();
                    
                    // Set global reference immediately
                    window.modernUI = modernUI;
                    
                    // Update SimpleUI to use ModernBudgetUI
                    if (window.ui) {
                        window.ui.modernUI = modernUI;
                        window.ui.budgetManager = this.budgetManager;
                        window.ui.setBudgetManager(this.budgetManager);
                        console.log('✅ SimpleUI integrated with ModernBudgetUI');
                    }
                    
                    // Force render dashboard with cards
                    setTimeout(() => {
                        console.log('🎨 Rendering dashboard with cards...');
                        modernUI.currentView = 'dashboard';
                        modernUI.budgetManager = this.budgetManager;
                        modernUI.analytics = new Analytics(this.budgetManager);
                        modernUI.components = new UIComponents(this.budgetManager, modernUI.analytics);
                        modernUI.render();
                        
                        // Update navigation state
                        modernUI.updateNavigationStates('dashboard');
                        modernUI.updatePageHeader('dashboard');
                        
                        console.log('✅ Dashboard cards rendered successfully');
                    }, 500);
                    
                    console.log('✅ ModernBudgetUI initialized and ready');
                } else {
                    console.warn('⚠️ ModernBudgetUI class not available');
                }
            } catch (error) {
                console.error('❌ Failed to initialize ModernBudgetUI:', error);
            }
        }
    }

    switchTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.auth-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // Update forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.toggle('active', form.id === `${tab}-form`);
        });
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');

        const submitBtn = form.querySelector('.auth-submit');
        const btnText = submitBtn.querySelector('.btn-text');
        const spinner = submitBtn.querySelector('.auth-spinner');

        try {
            // Show loading state
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            spinner.style.display = 'flex';

            const result = await this.budgetManager.signIn(email, password);
            
            if (result.success) {
                this.showToast('✅ Login berhasil! Selamat datang kembali.', 'success');
                // Auth state change will automatically handle showing main app
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Login failed:', error);
            
            // Handle specific Supabase errors
            let errorMessage = error.message;
            if (errorMessage.includes('Email not confirmed')) {
                errorMessage = 'Email belum dikonfirmasi. Silakan cek email Anda dan klik link konfirmasi terlebih dahulu.';
            } else if (errorMessage.includes('Invalid login credentials')) {
                errorMessage = 'Email atau password salah. Silakan periksa kembali.';
            } else if (errorMessage.includes('Too many requests')) {
                errorMessage = 'Terlalu banyak percobaan login. Silakan tunggu beberapa saat.';
            } else if (errorMessage.includes('User not found')) {
                errorMessage = 'Akun tidak ditemukan. Silakan daftar terlebih dahulu.';
            }
            
            this.showToast('❌ Login gagal: ' + errorMessage, 'error');
        } finally {
            // Reset loading state
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            spinner.style.display = 'none';
        }
    }

    async handleRegister(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const fullName = formData.get('fullName');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        // Validate password confirmation
        if (password !== confirmPassword) {
            this.showToast('❌ Password tidak cocok!', 'error');
            return;
        }

        const submitBtn = form.querySelector('.auth-submit');
        const btnText = submitBtn.querySelector('.btn-text');
        const spinner = submitBtn.querySelector('.auth-spinner');

        try {
            // Show loading state
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            spinner.style.display = 'flex';

            const result = await this.budgetManager.signUp(email, password, fullName);
            
            if (result.success) {
                this.showToast('✅ Pendaftaran berhasil! Silakan periksa email untuk verifikasi.', 'success');
                // Switch to login tab
                this.switchTab('login');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Registration failed:', error);
            
            // Handle specific Supabase registration errors
            let errorMessage = error.message;
            if (errorMessage.includes('User already registered')) {
                errorMessage = 'Email sudah terdaftar. Silakan gunakan email lain atau login.';
            } else if (errorMessage.includes('Password should be at least 6 characters')) {
                errorMessage = 'Password harus minimal 6 karakter.';
            } else if (errorMessage.includes('Invalid email')) {
                errorMessage = 'Format email tidak valid.';
            } else if (errorMessage.includes('Signup is disabled')) {
                errorMessage = 'Pendaftaran sementara tidak tersedia.';
            }
            
            this.showToast('❌ Pendaftaran gagal: ' + errorMessage, 'error');
        } finally {
            // Reset loading state
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            spinner.style.display = 'none';
        }
    }

    async handleLogout() {
        try {
            const result = await this.budgetManager.signOut();
            if (result.success) {
                this.showToast('✅ Berhasil keluar. Sampai jumpa!', 'success');
                this.showAuthScreen();
            }
        } catch (error) {
            console.error('Logout failed:', error);
            this.showToast('❌ Gagal keluar: ' + error.message, 'error');
        }
    }

    async startDemo() {
        try {
            console.log('🚀 Starting demo mode...');
            
            // Switch to localStorage manager for demo
            if (window.budgetManager) {
                // Update auth UI budget manager reference
                this.budgetManager = window.budgetManager;
                
                // Initialize ModernBudgetUI for demo mode
                if (typeof ModernBudgetUI !== 'undefined') {
                    console.log('🎨 Initializing ModernBudgetUI for demo...');
                    const modernUI = new ModernBudgetUI(window.budgetManager);
                    await modernUI.initialize();
                    
                    // Set global reference
                    window.modernUI = modernUI;
                    
                    // Update SimpleUI
                    if (window.ui) {
                        window.ui.modernUI = modernUI;
                        window.ui.setBudgetManager(window.budgetManager);
                        console.log('✅ SimpleUI updated for demo mode');
                    }
                    
                    // Show main app with demo data
                    this.showMainApp();
                    
                    // Load demo data if available
                    if (window.budgetManager.generateDemoData) {
                        window.budgetManager.generateDemoData();
                        console.log('✅ Demo data loaded');
                    }
                    
                    // Force render dashboard with cards
                    setTimeout(() => {
                        console.log('🎨 Rendering demo dashboard...');
                        modernUI.currentView = 'dashboard';
                        modernUI.budgetManager = window.budgetManager;
                        modernUI.analytics = new Analytics(window.budgetManager);
                        modernUI.components = new UIComponents(window.budgetManager, modernUI.analytics);
                        modernUI.render();
                        
                        modernUI.updateNavigationStates('dashboard');
                        modernUI.updatePageHeader('dashboard');
                        
                        console.log('✅ Demo dashboard rendered with cards');
                    }, 300);
                    
                } else {
                    console.warn('⚠️ ModernBudgetUI not available for demo');
                    this.showMainApp();
                }
                
                this.showToast('🚀 Mode demo aktif! Data tersimpan lokal di browser.', 'info');
                console.log('✅ Demo mode started successfully');
            } else {
                throw new Error('localStorage BudgetManager not available');
            }
        } catch (error) {
            console.error('❌ Failed to start demo mode:', error);
            this.showToast('❌ Gagal memulai demo: ' + error.message, 'error');
        }
    }

    addAuthStyles() {
        const style = document.createElement('style');
        style.id = 'auth-styles';
        style.textContent = `
            .auth-container {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                width: 100vw;
                height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 20px;
                box-sizing: border-box;
                overflow-y: auto;
            }

            .auth-card {
                background: white;
                border-radius: 20px;
                padding: 40px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                width: 90%;
                max-width: 500px;
                margin: auto;
                position: relative;
                min-width: 320px;
                flex-shrink: 0;
            }

            .auth-header {
                text-align: center;
                margin-bottom: 24px;
            }

            .auth-logo {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                margin-bottom: 16px;
            }

            .auth-logo .logo-icon {
                font-size: 3rem;
            }

            .auth-title {
                font-size: 1.875rem;
                font-weight: 800;
                color: #111827;
                margin: 0;
                line-height: 1.2;
            }

            .auth-subtitle {
                color: #6B7280;
                font-size: 0.875rem;
                margin: 8px 0 0 0;
                line-height: 1.4;
            }

            .auth-tabs {
                display: flex;
                margin-bottom: 24px;
                border-bottom: 2px solid #E5E7EB;
                border-radius: 0;
            }

            .auth-tab {
                flex: 1;
                background: none;
                border: none;
                padding: 12px;
                font-size: 0.875rem;
                font-weight: 600;
                color: #6B7280;
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
            }

            .auth-tab.active {
                color: #3B82F6;
                border-bottom: 2px solid #3B82F6;
                margin-bottom: -2px;
            }

            .auth-tab:hover {
                color: #3B82F6;
            }

            .auth-form {
                display: none;
            }

            .auth-form.active {
                display: block;
            }

            .form-group {
                margin-bottom: 20px;
            }

            .form-label {
                display: block;
                margin-bottom: 8px;
                font-size: 0.875rem;
                font-weight: 500;
                color: #374151;
            }

            .form-input {
                width: 100%;
                padding: 14px 16px;
                border: 1px solid #D1D5DB;
                border-radius: 8px;
                font-size: 0.9rem;
                transition: all 0.2s ease;
                box-sizing: border-box;
                min-height: 48px;
            }

            .form-input:focus {
                outline: none;
                border-color: #3B82F6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .form-help {
                margin-top: 6px;
                font-size: 0.75rem;
                color: #6B7280;
            }

            .btn {
                padding: 14px 24px;
                border-radius: 8px;
                font-weight: 500;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.2s ease;
                border: none;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                min-height: 48px;
            }

            .btn-primary {
                background: #3B82F6;
                color: white;
            }

            .btn-primary:hover:not(:disabled) {
                background: #2563EB;
            }

            .btn-primary:disabled {
                background: #9CA3AF;
                cursor: not-allowed;
            }

            .btn-outline {
                background: transparent;
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.3);
            }

            .btn-outline:hover {
                background: rgba(255, 255, 255, 0.1);
            }

            .btn-block {
                width: 100%;
            }

            .btn-sm {
                padding: 8px 16px;
                font-size: 0.75rem;
            }

            .auth-submit {
                position: relative;
            }

            .auth-spinner {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .auth-spinner .spinner {
                width: 20px;
                height: 20px;
                border: 2px solid rgba(255,255,255,0.3);
                border-top: 2px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .auth-footer {
                text-align: center;
                margin-top: 16px;
                font-size: 0.875rem;
                color: #6B7280;
            }

            .link-btn {
                background: none;
                border: none;
                color: #3B82F6;
                cursor: pointer;
                text-decoration: underline;
                font-size: inherit;
            }

            .link-btn:hover {
                color: #2563EB;
            }

            .demo-notice {
                margin-top: 24px;
                background: rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 16px;
                padding: 20px;
                text-align: center;
                color: white;
                width: 90%;
                max-width: 500px;
                margin-left: auto;
                margin-right: auto;
                flex-shrink: 0;
            }

            .demo-content h3 {
                margin: 0 0 8px 0;
                font-size: 1.125rem;
                font-weight: 600;
            }

            .demo-content p {
                margin: 0;
                font-size: 0.875rem;
                opacity: 0.9;
                line-height: 1.4;
            }

            /* Mobile responsiveness */
            @media (max-width: 768px) {
                .auth-container {
                    padding: 16px;
                }
                
                .auth-card {
                    padding: 30px;
                    width: 95%;
                    min-width: unset;
                }
                
                .demo-notice {
                    margin-top: 20px;
                    padding: 16px;
                    width: 95%;
                }
            }

            @media (max-width: 480px) {
                .auth-container {
                    padding: 12px;
                }
                
                .auth-card {
                    padding: 24px;
                    width: 98%;
                }
                
                .demo-notice {
                    width: 98%;
                }
                
                .auth-title {
                    font-size: 1.5rem;
                }
            }

            @media (min-width: 769px) {
                .auth-container {
                    padding: 40px;
                }
                
                .auth-card {
                    padding: 48px;
                    width: 85%;
                }
                
                .demo-notice {
                    width: 85%;
                }
            }

            @media (min-width: 1024px) {
                .auth-card {
                    width: 80%;
                    max-width: 550px;
                }
                
                .demo-notice {
                    width: 80%;
                    max-width: 550px;
                }
            }

            /* Toast styles */
            .toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 99999;
                display: flex;
                flex-direction: column;
                gap: 12px;
                pointer-events: none;
            }

            .toast {
                background: white;
                border-radius: 12px;
                padding: 16px 20px;
                box-shadow: 0 20px 30px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                display: flex;
                align-items: center;
                gap: 12px;
                min-width: 320px;
                max-width: 400px;
                animation: slideIn 0.4s ease-out;
                pointer-events: auto;
                border: 1px solid #E5E7EB;
            }

            .toast-success {
                border-left: 4px solid #10B981;
                background: #F0FDF4;
            }

            .toast-error {
                border-left: 4px solid #EF4444;
                background: #FEF2F2;
            }

            .toast-info {
                border-left: 4px solid #3B82F6;
                background: #EFF6FF;
            }

            .toast-icon {
                font-size: 1.25rem;
                flex-shrink: 0;
            }

            .toast-message {
                flex: 1;
                font-size: 0.875rem;
                line-height: 1.4;
                color: #374151;
                font-weight: 500;
            }

            .toast-close {
                background: none;
                border: none;
                cursor: pointer;
                font-size: 1.25rem;
                color: #6B7280;
                margin-left: auto;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.2s ease;
                flex-shrink: 0;
            }

            .toast-close:hover {
                background: rgba(0, 0, 0, 0.05);
                color: #374151;
            }

            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }

            /* Mobile toast positioning */
            @media (max-width: 768px) {
                .toast-container {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    width: auto;
                }
                
                .toast {
                    min-width: auto;
                    width: 100%;
                    margin: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    removeAuthStyles() {
        const authStyles = document.getElementById('auth-styles');
        if (authStyles) {
            authStyles.remove();
        }
    }

    showToast(message, type = 'info') {
        // Create toast container if it doesn't exist
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
        
        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        toastContainer.appendChild(toast);

        // Auto remove after 8 seconds (increased from 5)
        const autoRemoveTimer = setTimeout(() => {
            if (toast.parentElement) {
                toast.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (toast.parentElement) {
                        toast.remove();
                    }
                }, 300);
            }
        }, 8000);

        // Clear timer if manually closed
        toast.querySelector('.toast-close').addEventListener('click', () => {
            clearTimeout(autoRemoveTimer);
            toast.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 300);
        });

        // Pause auto-remove on hover
        toast.addEventListener('mouseenter', () => {
            clearTimeout(autoRemoveTimer);
        });

        // Resume auto-remove on mouse leave
        toast.addEventListener('mouseleave', () => {
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.style.animation = 'slideOut 0.3s ease-in';
                    setTimeout(() => {
                        if (toast.parentElement) {
                            toast.remove();
                        }
                    }, 300);
                }
            }, 2000); // Resume with 2 second delay
        });
    }

    showLoadingScreen(message = 'Memuat...') {
        const appContainer = document.querySelector('.app-container');
        if (!appContainer) return;

        appContainer.innerHTML = `
            <div class="loading-container">
                <div class="loading-content">
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                    </div>
                    <div class="loading-text">${message}</div>
                </div>
            </div>
        `;

        // Add loading styles
        this.addLoadingStyles();
    }

    addLoadingStyles() {
        const style = document.createElement('style');
        style.id = 'loading-styles';
        style.textContent = `
            .loading-container {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                width: 100vw;
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                z-index: 99999;
            }

            .loading-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
                color: white;
            }

            .loading-spinner .spinner {
                width: 40px;
                height: 40px;
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-top: 3px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            .loading-text {
                font-size: 1.1rem;
                font-weight: 500;
                text-align: center;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    removeLoadingStyles() {
        const loadingStyles = document.getElementById('loading-styles');
        if (loadingStyles) {
            loadingStyles.remove();
        }
    }
}

// Initialize global instance
window.authUI = new AuthUI(); 