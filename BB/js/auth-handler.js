// ECOBANK Authentication Handler
// ใช้งานโดยเพิ่ม <script src="../js/auth-handler.js"></script> ในแต่ละหน้า

const AuthHandler = {
    // ตรวจสอบว่า user login หรือไม่
    isLoggedIn() {
        return !!localStorage.getItem('ecobank_user');
    },

    // ดึงข้อมูล user
    getUser() {
        try {
            return JSON.parse(localStorage.getItem('ecobank_user'));
        } catch (e) {
            return null;
        }
    },

    // Redirect ไปยังหน้า login-required
    redirectToLoginRequired(page) {
        // page: 'wallet', 'booths', 'exchange', 'trash_types', etc.
        const loginRequiredPages = {
            'wallet': 'wallet-login-required.html',
            'booths': 'booths-login-required.html',
            'exchange': 'exchange-login-required.html',
            'trash_types': 'trash-types-login-required.html'
        };
        
        if (loginRequiredPages[page]) {
            window.location.href = loginRequiredPages[page];
        }
    },

    // Redirect ไปยัง login page
    redirectToLogin() {
        window.location.href = 'login.html';
    },

    // Setup page based on login status
    setupPage(page, options = {}) {
        // Options: { requireLogin: true/false, redirectTo: 'login-required' / 'login' }
        
        if (options.requireLogin && !this.isLoggedIn()) {
            if (options.redirectTo === 'login-required') {
                this.redirectToLoginRequired(page);
            } else {
                this.redirectToLogin();
            }
            return;
        }

        // ถ้า login แล้ว แสดง user info
        if (this.isLoggedIn()) {
            this.updateUserUI();
        }
    },

    // Update UI with user info
    updateUserUI() {
        const user = this.getUser();
        if (!user) return;

        // Update user avatar
        const avatarElements = document.querySelectorAll('#userAvatar, [data-user-avatar]');
        avatarElements.forEach(el => {
            el.textContent = (user.name || 'U').charAt(0).toUpperCase();
        });

        // Update user name
        const nameElements = document.querySelectorAll('#userName, [data-user-name]');
        nameElements.forEach(el => {
            el.textContent = user.name || 'User';
        });
    },

    // Logout function
    logout() {
        if (confirm('ต้องการออกจากระบบหรือไม่?')) {
            localStorage.removeItem('ecobank_user');
            window.location.href = 'index.html';
        }
    },

    // Save user after login
    saveUser(userData) {
        localStorage.setItem('ecobank_user', JSON.stringify(userData));
    },

    // Clear user
    clearUser() {
        localStorage.removeItem('ecobank_user');
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthHandler;
}
