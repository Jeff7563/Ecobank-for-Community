// Shared Header Setup
export function initializeHeader() {
    const headerHTML = `
        <div class="header-left">
            <div class="logo">🌿 ECOBANK</div>
            <div class="nav">
                <a href="index.html">Home</a>
                <a href="trash_types.html">Type</a>
                <a href="exchange.html">Exchange</a>
                <a href="wallet.html">Wallet</a>
                <a href="booths.html">Booths</a>
            </div>
        </div>
        <div class="header-right" id="headerRight"></div>
    `;

    const header = document.querySelector('.header');
    if (header) {
        header.innerHTML = headerHTML;
        // Mark current page as active
        markActiveNavLink();
    }
}

export function markActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

export function setupHeaderAuth(userData) {
    const headerRight = document.getElementById('headerRight');
    if (!headerRight) return;

    if (userData) {
        headerRight.innerHTML = `
            <div class="user-profile">
                <div class="user-avatar">${(userData?.name || 'U')[0].toUpperCase()}</div>
                <span class="user-name">${userData?.name || 'User'}</span>
            </div>
            <button class="logout-btn" id="logoutBtn">Logout</button>
        `;
    } else {
        headerRight.innerHTML = `
            <a href="login.html"><button style="padding: 8px 14px; background: transparent; border: 1px solid #2b3139; color: #eaecef; border-radius: 4px; cursor: pointer; font-size: 14px; transition: all 0.3s ease;">Log In</button></a>
            <a href="register.html"><button style="padding: 8px 14px; background: #b2ff59; color: #000; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.3s ease;">Sign Up</button></a>
        `;
    }
}

export function setupLogoutHandler(auth) {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await auth.signOut();
                localStorage.removeItem('ecobank_user');
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Logout error:', error);
            }
        });
    }
}
