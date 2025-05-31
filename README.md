# 💰 BudgetKu - Smart Financial Management

**Aplikasi manajemen keuangan modern dengan integrasi Supabase dan analisis prediktif**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://www.javascript.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-green.svg)](https://supabase.com/)

🌐 **[Demo Live](https://erzambayu.github.io/BudgetKu/)** · 📚 **[Documentation](./README_SUPABASE.md)** · 🐛 **[Laporkan Bug](https://github.com/Erzambayu/BudgetKu/issues)**

## 📋 Daftar Isi

- [Tentang Aplikasi](#-tentang-aplikasi)
- [Fitur Utama](#-fitur-utama)
- [Demo & Screenshot](#-demo--screenshot)
- [Teknologi](#-teknologi)
- [Instalasi](#-instalasi)
- [Penggunaan](#-penggunaan)
- [Struktur Project](#-struktur-project)
- [Kontribusi](#-kontribusi)
- [Roadmap](#-roadmap)
- [Lisensi](#-lisensi)
- [Kontak](#-kontak)

## 🎯 Tentang Aplikasi

**BudgetKu** adalah aplikasi manajemen keuangan pribadi yang modern dan powerful, dirancang untuk membantu Anda mengelola keuangan dengan lebih smart dan efisien. Dengan antarmuka yang intuitif dan fitur analisis mendalam, BudgetKu memberikan insights yang valuable untuk mengoptimalkan pengelolaan keuangan Anda.

### 🌟 Mengapa BudgetKu?

- **🎨 UI/UX Modern**: Desain yang clean, responsive, dan user-friendly
- **📊 Analisis Mendalam**: Prediksi keuangan berbasis AI dan pattern analysis  
- **🌙 Dark/Light Theme**: Pilihan tema sesuai preferensi Anda
- **📱 Mobile-First**: Optimized untuk semua device dengan gesture support
- **💾 Local Storage**: Data tersimpan aman di browser Anda
- **🚀 No Backend Required**: Pure frontend application, mudah di-deploy

## ✨ Fitur Utama

### 🎯 **Manajemen Keuangan Lengkap**
- **Dashboard Interaktif** - Overview keuangan dengan statistik real-time
- **Transaksi Management** - Tambah, edit, hapus transaksi income/expense
- **Multi-Account Support** - Kelola berbagai jenis akun (Bank, Cash, E-wallet, Investasi)
- **Goals Tracking** - Set dan monitor progress target finansial
- **Advanced Analytics** - Analisis mendalam dengan insights dan trends

### 🌙 **User Experience**
- **Dark/Light Mode** - Toggle tema sesuai preferensi
- **Responsive Design** - Perfect di desktop dan mobile
- **Real-time Updates** - Data tersinkronisasi langsung
- **Beautiful UI** - Modern interface dengan smooth animations

### 🔐 **Authentication & Security**
- **Supabase Auth** - Login/register yang secure
- **Row Level Security** - Data protection per user
- **Email Verification** - Account confirmation system
- **Session Management** - Automatic auth state handling

## 🖼️ Demo & Screenshot

### Dashboard Cards
```
┌─────────────────────────────────────────────────┐
│ 💰 Total Saldo    📈 Pemasukan    💸 Pengeluaran │
│ Rp 5.750.000     Rp 8.000.000    Rp 2.250.000   │
└─────────────────────────────────────────────────┘
```

### Quick Actions Grid
```
┌──────────────┬──────────────┬──────────────┐
│ 💰 Tambah    │ 💸 Tambah    │ 🏦 Tambah    │
│ Pemasukan    │ Pengeluaran  │ Akun         │
├──────────────┼──────────────┼──────────────┤
│ 🎯 Tambah    │ 🎲 Data      │ 🗑️ Reset    │
│ Target       │ Demo         │ Data         │
└──────────────┴──────────────┴──────────────┘
```

## 🛠️ Teknologi

### Frontend
- **Vanilla JavaScript (ES6+)**: Core application logic
- **HTML5 & CSS3**: Modern semantic markup dan styling
- **CSS Grid & Flexbox**: Responsive layout system
- **Local Storage API**: Offline data persistence

### Backend & Database
- **Supabase**: Backend-as-a-Service dengan PostgreSQL
- **Row Level Security**: Data protection dan authorization
- **Real-time subscriptions**: Live data synchronization
- **Edge Functions**: Serverless API endpoints

### DevOps & Deployment
- **GitHub Pages**: Static hosting dengan CI/CD
- **Progressive Web App**: Offline support dan app-like experience
- **Performance Optimized**: Lazy loading dan code splitting

## 🚀 Instalasi

### Option 1: GitHub Pages (Recommended)
Langsung akses: **[https://erzambayu.github.io/BudgetKu/](https://erzambayu.github.io/BudgetKu/)**

### Option 2: Local Development
```bash
# Clone repository
git clone https://github.com/Erzambayu/BudgetKu.git
cd BudgetKu

# Buka dengan web server (Python)
python -m http.server 8000

# Atau dengan Node.js
npx serve .

# Akses di browser
# http://localhost:8000
```

### Option 3: Cloud Setup dengan Supabase
1. **Setup Supabase Project** (Opsional untuk cloud sync)
   - Buat account di [Supabase](https://supabase.com/)
   - Create new project
   - Copy SQL schema dari [README_SUPABASE.md](./README_SUPABASE.md)
   - Update `js/SupabaseConfig.js` dengan credentials Anda

2. **Deploy ke hosting favorit**
   - Vercel, Netlify, GitHub Pages, atau hosting lainnya
   - Upload semua files atau connect dengan Git repository

## 📖 Penggunaan

### Mode Demo (Tanpa Registrasi)
1. Buka aplikasi
2. Klik "**Coba Demo**" di halaman login
3. Explore semua fitur dengan data sample
4. Data tersimpan di localStorage browser

### Mode Cloud (Dengan Supabase)
1. **Daftar** akun baru atau **Masuk** dengan akun existing
2. **Setup Akun** pertama (Bank/E-Wallet/Cash)
3. **Tambah Transaksi** pemasukan dan pengeluaran
4. **Set Target** keuangan dan track progress
5. **Analisis** data dengan berbagai tools yang tersedia

### 🎯 Quick Actions
- **Ctrl+1**: Dashboard
- **Ctrl+2**: Transaksi
- **Ctrl+3**: Akun
- **Ctrl+4**: Target
- **Ctrl+5**: Analisis
- **Ctrl+N**: Tambah Transaksi Baru

## 📁 Struktur Project

```
BudgetKu/
├── 📄 index.html              # Main application entry
├── 🎨 styles.css              # Global styles dan UI components
├── 📁 js/                     # JavaScript modules
│   ├── 🧠 BudgetManager.js    # Core data management (localStorage)
│   ├── ☁️ SupabaseBudgetManager.js # Supabase integration
│   ├── 🔧 SupabaseConfig.js   # Database configuration
│   ├── 🎨 UI.js               # Modern UI controller
│   ├── 🔐 AuthUI.js           # Authentication interface
│   ├── 📊 Analytics.js        # Data analysis engine
│   └── 🧩 UIComponents.js     # Reusable UI components
├── 📖 README.md               # Documentation utama
├── 📚 README_SUPABASE.md      # Supabase setup guide
└── 📜 LICENSE                 # MIT License
```

## 🤝 Kontribusi

Kontribusi sangat diterima! Lihat [CONTRIBUTING.md](./CONTRIBUTING.md) untuk guidelines.

### Development Setup
```bash
# Fork repository
git fork https://github.com/Erzambayu/BudgetKu.git

# Create feature branch
git checkout -b feature/AmazingFeature

# Commit changes
git commit -m 'Add some AmazingFeature'

# Push and create PR
git push origin feature/AmazingFeature
```

## 🗺️ Roadmap

### ✅ Completed
- ✅ Modern UI dengan cards dan responsive design
- ✅ Supabase integration dengan real-time sync
- ✅ Authentication dengan email/password
- ✅ Multi-device support dan cloud storage
- ✅ Advanced analytics dan reporting

### 🚧 In Progress
- 🚧 Export data ke PDF/Excel
- 🚧 Multi-currency support
- 🚧 Recurring transactions
- 🚧 Advanced AI recommendations

### 💭 Future Plans
- 💭 Mobile app dengan React Native
- 💭 Investment portfolio tracking
- 💭 OCR untuk receipt scanning
- 💭 Bank API integration
- 💭 Family/shared budgets

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

```
MIT License - feel free to use this project for personal or commercial purposes.
```

## 📞 Kontak

**Erzambayu** - [@Erzambayu](https://github.com/Erzambayu)

Project Link: **[https://github.com/Erzambayu/BudgetKu](https://github.com/Erzambayu/BudgetKu)**

Live Demo: **[https://erzambayu.github.io/BudgetKu/](https://erzambayu.github.io/BudgetKu/)**

---

**⭐ Jika project ini bermanfaat, jangan lupa kasih star ya! ⭐**

Made with ❤️ by [Erzambayu](https://github.com/Erzambayu) 