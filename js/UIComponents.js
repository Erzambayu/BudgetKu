// ===== UI COMPONENTS & RENDERING =====

// Safe emoji constants to avoid syntax errors
const ICONS = {
    MONEY: '💰',
    EXPENSE: '💸', 
    CARD: '💳',
    BANK: '🏦',
    TARGET: '🎯',
    SUCCESS: '✅',
    ERROR: '❌',
    INFO: 'ℹ️',
    WARNING: '⚠️',
    EDIT: '✏️',
    DELETE: '🗑️',
    IMPORT: '📤',
    BUDGET: '💰',
    TIME: '⏰',
    CALENDAR: '📅',
    PARTY: '🎉'
};

class UIComponents {
    constructor(budgetManager = null, analytics = null) {
        this.budgetManager = budgetManager;
        this.analytics = analytics;
    }

    // Method to update budget manager
    setBudgetManager(budgetManager) {
        this.budgetManager = budgetManager;
        if (this.analytics) {
            this.analytics.budgetManager = budgetManager;
        }
    }

    // ===== MODAL SYSTEM =====
    showModal(content) {
        console.log('UIComponents.showModal called with content length:', content.length);
        
        const modalContainer = document.getElementById('modalContainer');
        if (modalContainer) {
            console.log('Modal container found:', modalContainer);
            
            // Clear any existing content
            modalContainer.innerHTML = '';
            
            // Set the content with proper CSS structure that matches styles.css
            modalContainer.innerHTML = `
                <div class="modal-backdrop" onclick="window.hideModal()"></div>
                <div class="modal">
                    ${content}
                </div>
            `;
            
            // Force display and add active class
            modalContainer.style.display = 'flex';
            modalContainer.classList.add('active');
            
            console.log('Modal container after setup:', {
                display: modalContainer.style.display,
                classes: modalContainer.className,
                innerHTML: modalContainer.innerHTML.substring(0, 100) + '...'
            });
            
            // Focus on first input field if exists
            setTimeout(() => {
                const firstInput = modalContainer.querySelector('input, select, textarea');
                if (firstInput) {
                    console.log('Focusing on first input:', firstInput);
                    firstInput.focus();
                } else {
                    console.log('No input fields found to focus');
                }
            }, 200);
            
            console.log('Modal should now be visible');
        } else {
            console.error('Modal container with ID "modalContainer" not found!');
            alert('Modal container tidak ditemukan. Silakan refresh halaman.');
        }
    }

    hideModal() {
        console.log('UIComponents.hideModal called');
        
        const modalContainer = document.getElementById('modalContainer');
        if (modalContainer) {
            console.log('Hiding modal container');
            
            // Remove active class and hide
            modalContainer.classList.remove('active');
            modalContainer.style.display = 'none';
            modalContainer.innerHTML = '';
            
            // Reset body overflow
            document.body.style.overflow = '';
            
            console.log('Modal hidden successfully');
        } else {
            console.error('Modal container not found when trying to hide');
        }
    }

    // ===== TOAST NOTIFICATIONS =====
    showToast(message, type = 'info') {
        console.log('showToast called:', message, type);
        
        // Remove any existing toasts first
        const existingToasts = document.querySelectorAll('[data-toast="true"]');
        existingToasts.forEach(toast => {
            console.log('Removing existing toast');
            toast.remove();
        });
        
        // Create toast with NO CSS CLASSES - just a plain div
        const toast = document.createElement('div');
        toast.setAttribute('data-toast', 'true'); // Use data attribute instead of class
        
        // Apply ALL styles inline with highest specificity
        const styles = [
            'position: fixed !important',
            'top: 100px !important',
            'right: 20px !important',
            'z-index: 2147483647 !important', // Maximum z-index
            'background: #ffffff !important',
            'border: 1px solid #e2e8f0 !important',
            'border-radius: 12px !important',
            'padding: 16px !important',
            'width: 380px !important',
            'height: auto !important',
            'box-shadow: 0 10px 25px rgba(0,0,0,0.15), 0 4px 10px rgba(0,0,0,0.1) !important',
            'display: flex !important',
            'align-items: flex-start !important',
            'gap: 12px !important',
            'visibility: visible !important',
            'opacity: 1 !important',
            'font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important',
            'font-size: 14px !important',
            'color: #1f2937 !important',
            'line-height: 1.5 !important',
            'word-wrap: break-word !important',
            'pointer-events: auto !important',
            'transform: none !important',
            'margin: 0 !important',
            'backdrop-filter: blur(10px) !important'
        ];
        
        toast.style.cssText = styles.join('; ');
        
        // Add type-specific styling with modern colors
        if (type === 'success') {
            toast.style.backgroundColor = '#f0fdf4 !important';
            toast.style.borderColor = '#22c55e !important';
            toast.style.borderLeftWidth = '4px !important';
            toast.style.borderLeftColor = '#16a34a !important';
        } else if (type === 'error') {
            toast.style.backgroundColor = '#fef2f2 !important';
            toast.style.borderColor = '#ef4444 !important';
            toast.style.borderLeftWidth = '4px !important';
            toast.style.borderLeftColor = '#dc2626 !important';
        } else {
            toast.style.backgroundColor = '#eff6ff !important';
            toast.style.borderColor = '#3b82f6 !important';
            toast.style.borderLeftWidth = '4px !important';
            toast.style.borderLeftColor = '#2563eb !important';
        }
        
        // Modern, beautiful innerHTML
        toast.innerHTML = `
            <div style="
                font-size: 18px; 
                flex-shrink: 0; 
                margin-top: 2px;
                filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
            ">${type === 'success' ? ICONS.SUCCESS : type === 'error' ? ICONS.ERROR : ICONS.INFO}</div>
            <div style="
                flex: 1; 
                min-width: 0;
                line-height: 1.4;
                font-weight: 500;
                color: #374151;
            ">${message}</div>
            <button onclick="this.closest('[data-toast]').remove()" style="
                background: none; 
                border: none; 
                color: #9ca3af;
                font-size: 18px; 
                cursor: pointer; 
                padding: 4px;
                border-radius: 6px;
                transition: all 0.2s ease;
                flex-shrink: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            " onmouseover="this.style.backgroundColor='#f3f4f6'; this.style.color='#6b7280';" 
               onmouseout="this.style.backgroundColor='transparent'; this.style.color='#9ca3af';">×</button>
        `;
        
        console.log('About to append toast to body...');
        
        // Append to body
        document.body.appendChild(toast);
        
        console.log('Toast appended. Element:', toast);
        console.log('Toast style.cssText:', toast.style.cssText);
        
        // Auto remove after 8 seconds
        setTimeout(() => {
            console.log('Auto-removing toast');
            if (toast.parentElement) {
                toast.remove();
            }
        }, 8000);
        
        return toast;
    }

    // ===== QUICK ADD MODAL =====
    showQuickAddModal(type = 'expense') {
        console.log('UIComponents.showQuickAddModal called with type:', type);
        console.log('this context:', this);
        console.log('this.budgetManager:', this.budgetManager);
        console.log('this.budgetManager.data:', this.budgetManager?.data);
        
        // Enhanced error checking
        if (!this) {
            console.error('Context (this) is undefined in showQuickAddModal');
            alert('Error: Context tidak tersedia. Silakan refresh halaman.');
            return;
        }
        
        if (!this.budgetManager) {
            console.error('this.budgetManager is undefined:', this.budgetManager);
            
            // Try to recover budget manager from global sources
            const budgetManager = window.ui?.budgetManager || window.modernUI?.budgetManager || window.budgetManager || window.supabaseBudgetManager;
            
            if (budgetManager) {
                console.log('Recovered budget manager from global sources:', budgetManager);
                this.budgetManager = budgetManager;
                
                // Also recover analytics if needed
                if (!this.analytics && window.Analytics) {
                    this.analytics = new Analytics(budgetManager);
                    console.log('Recreated analytics with recovered budget manager');
                }
            } else {
                console.error('No budget manager available anywhere');
                this.showToast('Budget manager tidak tersedia. Silakan muat ulang halaman.', 'error');
                return;
            }
        }
        
        if (!this.budgetManager.data) {
            console.error('this.budgetManager.data is undefined:', this.budgetManager.data);
            this.showToast('Data budget manager tidak tersedia. Silakan muat ulang halaman.', 'error');
            return;
        }

        const categories = this.budgetManager.data.categories?.filter(cat => 
            type === 'income' ? cat.id >= 8 : cat.id <= 7
        ) || [];
        
        const accounts = this.budgetManager.data.accounts || [];
        
        console.log('Available categories:', categories.length);
        console.log('Available accounts:', accounts.length);
        
        if (!accounts || accounts.length === 0) {
            this.showToast('Harap tambahkan akun terlebih dahulu!', 'warning');
            return;
        }
        
        if (categories.length === 0) {
            this.showToast('Kategori tidak tersedia. Silakan muat ulang halaman.', 'error');
            return;
        }
        
        const modalContent = `
            <div class="modal-header">
                <h3 class="modal-title">
                    ${type === 'income' ? ICONS.MONEY + ' Tambah Pemasukan' : ICONS.EXPENSE + ' Tambah Pengeluaran'}
                </h3>
                <button class="modal-close" onclick="window.hideModal()">×</button>
            </div>
            <form class="modal-form" id="quickAddForm">
                <div class="form-group">
                    <label class="form-label">Jumlah *</label>
                    <input type="number" id="amount" class="form-input" placeholder="Masukkan jumlah" required min="1" step="0.01">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Kategori *</label>
                    <select id="category" class="form-input" required>
                        <option value="">Pilih kategori</option>
                        ${categories.map(cat => 
                            `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Akun *</label>
                    <select id="account" class="form-input" required>
                        <option value="">Pilih akun</option>
                        ${accounts.map(acc => {
                            const accountType = this.budgetManager.data.accountTypes.find(t => t.id === acc.typeId);
                            return `<option value="${acc.id}">${accountType?.icon || ICONS.CARD} ${acc.name} (${this.budgetManager.formatCurrency(acc.balance)})</option>`;
                        }).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Deskripsi</label>
                    <input type="text" id="description" class="form-input" placeholder="Deskripsi (opsional)">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Tanggal</label>
                    <input type="date" id="date" class="form-input" value="${new Date().toISOString().split('T')[0]}">
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="window.hideModal()">Batal</button>
                    <button type="submit" class="btn btn-primary">
                        ${type === 'income' ? 'Tambah Pemasukan' : 'Tambah Pengeluaran'}
                    </button>
                </div>
            </form>
        `;
        
        console.log('Showing modal for type:', type);
        this.showModal(modalContent);
        
        // Store reference to this for the event handler
        const thisComponent = this;
        
        // Bind form submit with proper context
        document.getElementById('quickAddForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            console.log('Form submitted, thisComponent:', thisComponent);
            console.log('thisComponent.budgetManager:', thisComponent.budgetManager);
            
            const amount = parseFloat(document.getElementById('amount').value);
            const categoryId = parseInt(document.getElementById('category').value);
            const accountId = parseInt(document.getElementById('account').value);
            const description = document.getElementById('description').value;
            const date = document.getElementById('date').value;
            
            try {
                if (!thisComponent.budgetManager) {
                    throw new Error('Budget manager tidak tersedia saat submit');
                }
                
                thisComponent.budgetManager.addTransaction(type, amount, categoryId, accountId, description, date);
                thisComponent.showToast(`${type === 'income' ? 'Pemasukan' : 'Pengeluaran'} berhasil ditambahkan!`, 'success');
                thisComponent.hideModal();
                
                // Refresh UI
                if (window.ui && typeof window.ui.render === 'function') {
                    window.ui.render();
                    window.ui.updateUserBalance();
                } else if (window.modernUI && typeof window.modernUI.render === 'function') {
                    window.modernUI.render();
                    window.modernUI.updateUserBalance();
                }
                
                console.log('Transaction added successfully');
            } catch (error) {
                console.error('Error adding transaction:', error);
                thisComponent.showToast('Gagal menambahkan transaksi: ' + error.message, 'error');
            }
        });
    }

    // ===== ADD ACCOUNT MODAL =====
    showAddAccountModal() {
        // Check if budgetManager is available
        if (!this.budgetManager || !this.budgetManager.data) {
            this.showToast('Budget manager tidak tersedia. Silakan muat ulang halaman.', 'error');
            console.error('budgetManager is not available:', this.budgetManager);
            return;
        }

        const accountTypes = this.budgetManager.data.accountTypes;
        
        if (!accountTypes || accountTypes.length === 0) {
            this.showToast('Tipe akun tidak tersedia. Silakan muat ulang halaman.', 'error');
            return;
        }

        const modalContent = `
            <div class="modal-header">
                <h3 class="modal-title">${ICONS.BANK} Tambah Akun Baru</h3>
                <button class="modal-close" onclick="window.hideModal()">×</button>
            </div>
            <form class="modal-form" id="addAccountForm">
                <div class="form-group">
                    <label class="form-label">Nama Akun *</label>
                    <input type="text" id="accountName" class="form-input" placeholder="Contoh: BCA Utama" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Jenis Akun *</label>
                    <select id="accountType" class="form-input" required>
                        <option value="">Pilih jenis akun</option>
                        ${accountTypes.map(type => 
                            `<option value="${type.id}">${type.icon} ${type.name}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Saldo Awal</label>
                    <input type="number" id="initialBalance" class="form-input" placeholder="0" min="0" step="0.01" value="0">
                    <div class="form-help">Masukkan saldo saat ini di akun tersebut</div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="window.hideModal()">Batal</button>
                    <button type="submit" class="btn btn-primary">Tambah Akun</button>
                </div>
            </form>
        `;
        
        this.showModal(modalContent);
        
        // Bind form submit
        document.getElementById('addAccountForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('accountName').value.trim();
            const typeId = parseInt(document.getElementById('accountType').value);
            const balance = parseFloat(document.getElementById('initialBalance').value) || 0;
            
            if (!name) {
                this.showToast('Nama akun harus diisi!', 'error');
                return;
            }
            
            try {
                this.budgetManager.addAccount(name, balance, typeId);
                this.showToast('Akun berhasil ditambahkan!', 'success');
                this.hideModal();
                
                // Refresh UI
                if (window.ui && typeof window.ui.render === 'function') {
                    window.ui.render();
                    window.ui.updateUserBalance();
                }
            } catch (error) {
                this.showToast('Gagal menambahkan akun: ' + error.message, 'error');
            }
        });
    }

    // ===== ADD GOAL MODAL =====
    showAddGoalModal() {
        const modalContent = `
            <div class="modal-header">
                <h3 class="modal-title">${ICONS.TARGET} Tambah Target Baru</h3>
                <button class="modal-close" onclick="window.hideModal()">×</button>
            </div>
            <form class="modal-form" id="addGoalForm">
                <div class="form-group">
                    <label class="form-label">Nama Target *</label>
                    <input type="text" id="goalName" class="form-input" placeholder="Contoh: Liburan ke Bali" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Target Nominal *</label>
                    <input type="number" id="targetAmount" class="form-input" placeholder="Contoh: 5000000" required min="1" step="0.01">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Jumlah Saat Ini</label>
                    <input type="number" id="currentAmount" class="form-input" placeholder="0" min="0" step="0.01" value="0">
                    <div class="form-help">Sudah berapa yang terkumpul saat ini</div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Target Tanggal</label>
                    <input type="date" id="deadline" class="form-input">
                    <div class="form-help">Kapan target ini ingin dicapai (opsional)</div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="window.hideModal()">Batal</button>
                    <button type="submit" class="btn btn-primary">Tambah Target</button>
                </div>
            </form>
        `;
        
        this.showModal(modalContent);
        
        // Set minimum date to today
        const deadlineInput = document.getElementById('deadline');
        if (deadlineInput) {
            deadlineInput.min = new Date().toISOString().split('T')[0];
        }
        
        // Bind form submit
        document.getElementById('addGoalForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('goalName').value.trim();
            const target = parseFloat(document.getElementById('targetAmount').value);
            const current = parseFloat(document.getElementById('currentAmount').value) || 0;
            const deadline = document.getElementById('deadline').value || null;
            
            if (!name) {
                this.showToast('Nama target harus diisi!', 'error');
                return;
            }
            
            if (current > target) {
                this.showToast('Jumlah saat ini tidak boleh lebih dari target!', 'error');
                return;
            }
            
            try {
                this.budgetManager.addGoal(name, target, current, deadline);
                this.showToast('Target berhasil ditambahkan!', 'success');
                this.hideModal();
                
                // Refresh UI
                if (window.ui && typeof window.ui.render === 'function') {
                    window.ui.render();
                }
            } catch (error) {
                this.showToast('Gagal menambahkan target: ' + error.message, 'error');
            }
        });
    }

    // ===== SET BUDGET MODAL =====
    showSetBudgetModal() {
        // Check if budgetManager is available
        if (!this.budgetManager || !this.budgetManager.data) {
            this.showToast('Budget manager tidak tersedia. Silakan muat ulang halaman.', 'error');
            console.error('budgetManager is not available:', this.budgetManager);
            return;
        }

        const categories = this.budgetManager.data.categories.filter(cat => cat.id <= 7);
        
        const modalContent = `
            <div class="modal-header">
                <h3 class="modal-title">${ICONS.BUDGET} Atur Budget Kategori</h3>
                <button class="modal-close" onclick="window.hideModal()">×</button>
            </div>
            <form class="modal-form" id="setBudgetForm">
                <div class="form-group">
                    <label class="form-label">Kategori *</label>
                    <select id="budgetCategory" class="form-input" required>
                        <option value="">Pilih kategori</option>
                        ${categories.map(cat => 
                            `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Budget Bulanan *</label>
                    <input type="number" id="budgetAmount" class="form-input" placeholder="Masukkan budget" required min="1" step="0.01">
                    <div class="form-help">Budget yang akan diterapkan setiap bulan</div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="window.hideModal()">Batal</button>
                    <button type="submit" class="btn btn-primary">Atur Budget</button>
                </div>
            </form>
        `;
        
        this.showModal(modalContent);
        
        // Bind form submit
        document.getElementById('setBudgetForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const categoryId = parseInt(document.getElementById('budgetCategory').value);
            const amount = parseFloat(document.getElementById('budgetAmount').value);
            
            try {
                // Cari kategori dan set budget secara langsung
                const category = this.budgetManager.data.categories.find(cat => cat.id === categoryId);
                if (category) {
                    category.budget = amount;
                    this.budgetManager.saveData();
                    this.showToast('Budget berhasil diatur!', 'success');
                    this.hideModal();
                    
                    // Refresh UI
                    if (window.ui && typeof window.ui.render === 'function') {
                        window.ui.render();
                    }
                } else {
                    throw new Error('Kategori tidak ditemukan');
                }
            } catch (error) {
                this.showToast('Gagal mengatur budget: ' + error.message, 'error');
            }
        });
    }

    // ===== ACCOUNT IMPORT MODAL =====
    showAccountImportModal() {
        const modalContent = `
            <div class="modal-header">
                <h3 class="modal-title">${ICONS.IMPORT} Import Akun</h3>
                <button class="modal-close" onclick="window.hideModal()">×</button>
            </div>
            <div class="modal-form">
                <div class="form-group">
                    <label class="form-label">Import dari CSV/JSON</label>
                    <input type="file" id="accountFile" class="form-input" accept=".csv,.json">
                    <div class="form-help">Format: nama,jenis,saldo</div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Atau masukkan data manual:</label>
                    <textarea id="accountData" class="form-input" rows="6" placeholder="Nama,Jenis,Saldo&#10;BCA Utama,Bank,5000000&#10;Cash,Tunai,500000"></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="window.hideModal()">Batal</button>
                    <button type="button" class="btn btn-primary" onclick="window.processAccountImport()">Import</button>
                </div>
            </div>
        `;
        
        this.showModal(modalContent);
    }

    processAccountImport() {
        // Implementation for import functionality
        this.showToast('Fitur import akan segera tersedia!', 'info');
        this.hideModal();
    }

    // ===== GOAL IMPORT MODAL =====
    showGoalImportModal() {
        const modalContent = `
            <div class="modal-header">
                <h3 class="modal-title">${ICONS.IMPORT} Import Target</h3>
                <button class="modal-close" onclick="window.hideModal()">×</button>
            </div>
            <div class="modal-form">
                <div class="form-group">
                    <label class="form-label">Import dari CSV/JSON</label>
                    <input type="file" id="goalFile" class="form-input" accept=".csv,.json">
                    <div class="form-help">Format: nama,target,deadline</div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Atau masukkan data manual:</label>
                    <textarea id="goalData" class="form-input" rows="6" placeholder="Nama,Target,Deadline&#10;Liburan Bali,10000000,2024-12-31&#10;Emergency Fund,50000000,2025-06-30"></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="window.hideModal()">Batal</button>
                    <button type="button" class="btn btn-primary" onclick="window.processGoalImport()">Import</button>
                </div>
            </div>
        `;
        
        this.showModal(modalContent);
    }

    processGoalImport() {
        // Implementation for import functionality
        this.showToast('Fitur import akan segera tersedia!', 'info');
        this.hideModal();
    }

    // ===== TRANSACTION ITEM RENDERING =====
    renderTransactionItem(transaction) {
        // Safety checks
        if (!transaction || !this.budgetManager) {
            return `<div class="transaction-item">${ICONS.WARNING} Data transaksi tidak valid</div>`;
        }

        const category = this.budgetManager.getCategoryById(transaction.categoryId);
        const account = this.budgetManager.getAccountById(transaction.accountId);
        const accountType = this.budgetManager.data.accountTypes.find(t => t.id === account?.typeId);
        
        // Safe date handling
        let formattedDate = 'Tanggal tidak tersedia';
        let timeAgo = '';
        
        try {
            if (transaction.date) {
                const date = new Date(transaction.date);
                if (!isNaN(date.getTime())) {
                    formattedDate = date.toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    });
                    timeAgo = this.getTimeAgo(date);
                }
            }
        } catch (error) {
            console.warn('Date parsing error for transaction:', transaction.id, error);
            formattedDate = 'Tanggal tidak valid';
            timeAgo = '';
        }
        
        return `
            <div class="transaction-item detailed ${transaction.type}" data-id="${transaction.id}">
                <div class="transaction-main">
                    <div class="transaction-icon">
                        ${category?.icon || (transaction.type === 'income' ? ICONS.MONEY : ICONS.EXPENSE)}
                    </div>
                    <div class="transaction-details">
                        <div class="transaction-name">
                            ${transaction.description || category?.name || 'Transaksi'}
                        </div>
                        <div class="transaction-meta">
                            <span>${formattedDate}</span>
                            <span class="transaction-separator">•</span>
                            <span>${accountType?.icon || ICONS.CARD} ${account?.name || 'Unknown'}</span>
                            ${timeAgo ? `<span class="transaction-separator">•</span><span>${timeAgo}</span>` : ''}
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
                            style="cursor: pointer; pointer-events: auto; position: relative; z-index: 10;">
                        ${ICONS.EDIT}
                    </button>
                    <button class="action-btn-small delete" 
                            onclick="event.stopPropagation(); console.log('Delete button clicked for transaction ${transaction.id}'); window.deleteTransaction(${transaction.id});" 
                            title="Hapus Transaksi"
                            style="cursor: pointer; pointer-events: auto; position: relative; z-index: 10;">
                        ${ICONS.DELETE}
                    </button>
                </div>
            </div>
        `;
    }

    // ===== ACCOUNT CARD RENDERING =====
    renderAccountCard(account) {
        const accountType = this.budgetManager.data.accountTypes.find(t => t.id === account.typeId);
        const recentTransactions = this.budgetManager.data.transactions
            .filter(t => t.accountId === account.id)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);
        
        return `
            <div class="account-card" data-id="${account.id}">
                <div class="account-header">
                    <div class="account-info">
                        <div class="account-icon">${accountType?.icon || ICONS.CARD}</div>
                        <div class="account-name">${account.name}</div>
                    </div>
                    <div class="account-actions">
                        <button class="action-btn-small edit" 
                                onclick="event.stopPropagation(); console.log('Edit button clicked for account ${account.id}'); window.editAccount(${account.id});" 
                                title="Edit"
                                style="cursor: pointer; pointer-events: auto; position: relative; z-index: 10;">
                            ${ICONS.EDIT}
                        </button>
                        <button class="action-btn-small delete" 
                                onclick="event.stopPropagation(); console.log('Delete button clicked for account ${account.id}'); window.deleteAccount(${account.id});" 
                                title="Hapus"
                                style="cursor: pointer; pointer-events: auto; position: relative; z-index: 10;">
                            ${ICONS.DELETE}
                        </button>
                    </div>
                </div>
                
                <div class="account-balance">
                    <div class="balance-amount ${account.balance >= 0 ? 'positive' : 'negative'}">
                        ${this.budgetManager.formatCurrency(account.balance)}
                    </div>
                    <div class="balance-label">Saldo Saat Ini</div>
                </div>
                
                ${recentTransactions.length > 0 ? `
                    <div class="account-transactions">
                        <div class="mini-transactions-title">Transaksi Terbaru</div>
                        ${recentTransactions.map(t => {
                            const category = this.budgetManager.getCategoryById(t.categoryId);
                            return `
                                <div class="mini-transaction ${t.type}">
                                    <div class="mini-transaction-name">
                                        ${category?.icon || (t.type === 'income' ? ICONS.MONEY : ICONS.EXPENSE)} ${t.description || category?.name}
                                    </div>
                                    <div class="mini-transaction-amount">
                                        ${t.type === 'income' ? '+' : '-'}${this.budgetManager.formatCurrency(t.amount)}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    // ===== GOAL CARD RENDERING =====
    renderGoalCard(goal) {
        console.log('renderGoalCard called with goal:', goal);
        
        // Handle both Supabase format and localStorage format for compatibility
        const targetAmount = goal.targetAmount || goal.target_amount || goal.target || 0;
        const currentAmount = goal.currentAmount || goal.current_amount || 0;
        
        const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
        const remaining = targetAmount - currentAmount;
        const isCompleted = progress >= 100;
        
        console.log('Goal progress calculation:', { targetAmount, currentAmount, progress, remaining, isCompleted });
        
        let deadlineInfo = '';
        if (goal.deadline) {
            const deadline = new Date(goal.deadline);
            const today = new Date();
            const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
            
            if (daysLeft < 0) {
                deadlineInfo = `<div class="goal-deadline urgent">${ICONS.TIME} Terlambat ${Math.abs(daysLeft)} hari</div>`;
            } else if (daysLeft <= 30) {
                deadlineInfo = `<div class="goal-deadline urgent">${ICONS.TIME} ${daysLeft} hari lagi</div>`;
            } else {
                deadlineInfo = `<div class="goal-deadline">${ICONS.CALENDAR} ${deadline.toLocaleDateString('id-ID')}</div>`;
            }
        }
        
        return `
            <div class="goal-card ${isCompleted ? 'completed' : ''}" data-id="${goal.id}">
                <div class="goal-header">
                    <div class="goal-info">
                        <div class="goal-name">${goal.name}</div>
                        ${deadlineInfo}
                    </div>
                    <div class="goal-actions">
                        <button class="action-btn-small edit" 
                                onclick="event.stopPropagation(); console.log('Edit button clicked for goal ${goal.id}'); window.editGoal(${goal.id});" 
                                title="Edit"
                                style="cursor: pointer; pointer-events: auto; position: relative; z-index: 10;">
                            ${ICONS.EDIT}
                        </button>
                        <button class="action-btn-small delete" 
                                onclick="event.stopPropagation(); console.log('Delete button clicked for goal ${goal.id}'); window.deleteGoal(${goal.id});" 
                                title="Hapus"
                                style="cursor: pointer; pointer-events: auto; position: relative; z-index: 10;">
                            ${ICONS.DELETE}
                        </button>
                    </div>
                </div>
                
                <div class="goal-progress">
                    <div class="progress-info">
                        <div class="progress-current">${this.budgetManager.formatCurrency(currentAmount)}</div>
                        <div class="progress-target">dari ${this.budgetManager.formatCurrency(targetAmount)}</div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-percentage" style="width: ${Math.min(progress, 100)}%"></div>
                    </div>
                </div>
                
                ${isCompleted ? 
                    `<div class="goal-completed">${ICONS.PARTY} Target tercapai!</div>` :
                    `<div class="goal-remaining">
                        <strong>Tersisa: ${this.budgetManager.formatCurrency(remaining)}</strong>
                        <div style="font-size: 0.9em; color: var(--gray-600); margin-top: 4px;">
                            ${Math.round(progress)}% tercapai
                        </div>
                    </div>`
                }
            </div>
        `;
    }

    // ===== UTILITY METHODS =====
    getTimeAgo(date) {
        try {
            if (!date || isNaN(new Date(date).getTime())) {
                return 'Waktu tidak diketahui';
            }
            
            const now = new Date();
            const inputDate = new Date(date);
            const diffTime = Math.abs(now - inputDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) return 'Kemarin';
            if (diffDays < 7) return `${diffDays} hari lalu`;
            if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
            if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan lalu`;
            return `${Math.floor(diffDays / 365)} tahun lalu`;
        } catch (error) {
            console.warn('Error calculating time ago:', error);
            return 'Waktu tidak valid';
        }
    }
}