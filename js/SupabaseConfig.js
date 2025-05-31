// ===== SUPABASE CONFIGURATION =====
class SupabaseConfig {
    constructor() {
        // CONFIGURE THESE WITH YOUR SUPABASE PROJECT DETAILS
        this.SUPABASE_URL = 'https://oejvqwwkmviuyvrfxtmz.supabase.co'; // Updated with correct project URL
        this.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lanZxd3drbXZpdXl2cmZ4dG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NzIxMzQsImV4cCI6MjA2NDI0ODEzNH0.8mfBn37vzSAIYizL6AA9dxsRHE06SsZC6S-Ht1xonvM'; // Your anon key
        
        this.supabase = null;
        this.isConnected = false;
    }

    async initialize() {
        try {
            // Import Supabase from CDN
            if (typeof window !== 'undefined' && !window.supabase) {
                console.log('📦 Loading Supabase SDK...');
                await this.loadSupabaseSDK();
            }
            
            // Initialize Supabase client
            console.log('🔧 Creating Supabase client...');
            this.supabase = window.supabase.createClient(this.SUPABASE_URL, this.SUPABASE_ANON_KEY);
            
            // Test connection
            console.log('🔍 Testing Supabase connection...');
            const { data, error } = await this.supabase.from('account_types').select('count').limit(1);
            
            if (error) {
                console.error('❌ Supabase connection test failed:', error);
                throw error;
            }
            
            this.isConnected = true;
            console.log('✅ Supabase connected successfully');
            return true;
        } catch (error) {
            console.error('❌ Supabase connection failed:', error);
            this.isConnected = false;
            return false;
        }
    }

    async loadSupabaseSDK() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@supabase/supabase-js@2';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    getClient() {
        if (!this.isConnected || !this.supabase) {
            throw new Error('Supabase not initialized. Call initialize() first.');
        }
        return this.supabase;
    }

    // DATABASE SCHEMA SETUP
    async setupDatabase() {
        if (!this.isConnected) {
            throw new Error('Supabase not connected');
        }

        try {
            console.log('🔧 Setting up database schema...');
            
            // Check if tables exist, if not show creation SQL
            const { data: tables } = await this.supabase
                .from('information_schema.tables')
                .select('table_name')
                .eq('table_schema', 'public');

            const requiredTables = ['profiles', 'account_types', 'categories', 'accounts', 'transactions', 'goals'];
            const existingTables = tables?.map(t => t.table_name) || [];
            const missingTables = requiredTables.filter(table => !existingTables.includes(table));

            if (missingTables.length > 0) {
                console.log('📋 Missing tables detected. Please run this SQL in your Supabase SQL editor:');
                console.log(this.getCreateTablesSQL());
                return false;
            }

            console.log('✅ Database schema is ready');
            return true;
        } catch (error) {
            console.error('❌ Database setup failed:', error);
            return false;
        }
    }

    getCreateTablesSQL() {
        return `
-- ===== BUDGETKU DATABASE SCHEMA =====

-- Enable RLS (Row Level Security)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (User profiles)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    currency TEXT DEFAULT 'IDR',
    monthly_budget DECIMAL(15,2) DEFAULT 0,
    notifications BOOLEAN DEFAULT true,
    theme TEXT DEFAULT 'light',
    animations_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ACCOUNT TYPES TABLE
CREATE TABLE account_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default account types
INSERT INTO account_types (name, icon, color) VALUES
('Kas', '💵', '#00B894'),
('Bank', '🏦', '#0984E3'),
('E-Wallet', '📱', '#6C5CE7'),
('Investasi', '📈', '#E17055');

-- 3. CATEGORIES TABLE
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    budget DECIMAL(15,2) DEFAULT 0,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, icon, color, is_system) VALUES
('Makanan & Minuman', '🍽️', '#FF6B6B', true),
('Transportasi', '🚗', '#4ECDC4', true),
('Belanja', '🛍️', '#45B7D1', true),
('Hiburan', '🎬', '#96CEB4', true),
('Tagihan', '📄', '#FFEAA7', true),
('Kesehatan', '⚕️', '#DDA0DD', true),
('Pendidikan', '📚', '#74B9FF', true),
('Gaji', '💰', '#00B894', true),
('Investasi', '📈', '#6C5CE7', true),
('Lainnya', '📝', '#A29BFE', true);

-- 4. ACCOUNTS TABLE
CREATE TABLE accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0,
    type_id INTEGER REFERENCES account_types(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TRANSACTIONS TABLE
CREATE TABLE transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id),
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. GOALS TABLE
CREATE TABLE goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0,
    deadline DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== ROW LEVEL SECURITY POLICIES =====

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories policies
CREATE POLICY "Users can view categories" ON categories FOR SELECT USING (user_id = auth.uid() OR is_system = true);
CREATE POLICY "Users can insert own categories" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON categories FOR DELETE USING (auth.uid() = user_id AND is_system = false);

-- Accounts policies
CREATE POLICY "Users can view own accounts" ON accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own accounts" ON accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own accounts" ON accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own accounts" ON accounts FOR DELETE USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can view own goals" ON goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON goals FOR DELETE USING (auth.uid() = user_id);

-- Account types is public read-only
CREATE POLICY "Anyone can view account types" ON account_types FOR SELECT USING (true);

-- ===== FUNCTIONS & TRIGGERS =====

-- Update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== INDEXES FOR PERFORMANCE =====
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_categories_user_id ON categories(user_id);

-- ===== SUCCESS MESSAGE =====
SELECT 'BudgetKu database schema created successfully! 🎉' as message;
        `;
    }
}

// Export global instance
window.supabaseConfig = new SupabaseConfig(); 