
// ===========================================
// SHARED COMPONENTS (Header & Footer)
// ===========================================

export function renderHeader(activePage = '') {
    const headerHtml = `
        <div class="header-left">
            <div class="mobile-menu-btn" id="mobileMenuBtn">☰</div>
            <div class="logo" onclick="window.location.href='index.html'">🌿 ECOBANK</div>
            <div class="nav-overlay" id="navOverlay"></div>
            <nav class="nav" id="mainNav">
                <div class="nav-header-mobile">
                    <span class="logo">🌿 ECOBANK</span>
                    <span class="close-nav" id="closeNav">×</span>
                </div>
                <a href="index.html" class="nav-link ${activePage === 'home' ? 'active' : ''}">หน้าแรก</a>
                <a href="trash_types.html" class="nav-link ${activePage === 'price' ? 'active' : ''}">ราคาขยะวันนี้</a>
                <a href="exchange.html" class="nav-link ${activePage === 'market' ? 'active' : ''}">ตลาดซื้อขาย</a>
                <a href="map.html" class="nav-link ${activePage === 'map' ? 'active' : ''}">จุดรับซื้อ</a>
                <a href="leaderboard.html" class="nav-link ${activePage === 'rank' ? 'active' : ''}">จัดอันดับ</a>
                <a href="rewards.html" class="nav-link ${activePage === 'rewards' ? 'active' : ''}">ของรางวัล</a>
                <a href="wallet.html" class="nav-link ${activePage === 'wallet' ? 'active' : ''}">กระเป๋าเงิน</a>
            </nav>
        </div>
        </div>
        <div class="header-right">
            <div id="authSection" style="display:flex; align-items:center;">
                <!-- Auth content will be injected by firebase-service.js or auth state observer -->
                <div style="width: 100px; height: 35px; background: rgba(255,255,255,0.05); border-radius: 20px; animation: pulse 1.5s infinite;"></div>
            </div>
        </div>
    `;

    // 2. Inject Styles for Mobile Menu (Critical for it to work immediately without editing css yet)
    // Actually, I will add logic here to toggle it.
    
    // Inject Head Styles if not present (optional, but good for self-contained)
    // ... we assume style.css is already loaded.

    const headerEl = document.querySelector('.header');
    
    // Auto-Inject Mobile CSS Fix (Global for all pages)
    if (!document.getElementById('mobile-header-fix')) {
        const style = document.createElement('style');
        style.id = 'mobile-header-fix';
        style.textContent = `
            @media (max-width: 480px) {
                .header { padding: 10px 15px !important; }
                .logo { font-size: 20px !important; }
                .btn, .btn-login, .btn-register {
                    padding: 6px 10px !important;
                    font-size: 11px !important;
                    white-space: nowrap !important;
                    height: 32px !important;
                    display: flex !important; align-items: center !important;
                    min-width: auto !important;
                }
                #authSection div { gap: 5px !important; }
            }
        `;
        document.head.appendChild(style);
    }

    if (headerEl) {
        headerEl.innerHTML = headerHtml;
        
        // Mobile Menu Logic
        const mobileBtn = document.getElementById('mobileMenuBtn');
        const nav = document.getElementById('mainNav');
        const overlay = document.getElementById('navOverlay');
        const closeBtn = document.getElementById('closeNav');

        function toggleMenu() {
            nav.classList.toggle('mobile-active');
            overlay.classList.toggle('active');
            
            // Blur Main Content
            const mainContent = document.querySelector('main');
            if(mainContent) {
                mainContent.classList.toggle('content-blur');
            }
            
    // --- PWA Logic ---
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later.
        window.deferredPrompt = e;
        // Optionally dispatch a custom event to notify UI components
        window.dispatchEvent(new Event('pwa-ready'));
        console.log("PWA Install Prompt Captured");
    });
}

        if(mobileBtn) mobileBtn.addEventListener('click', toggleMenu);
        if(closeBtn) closeBtn.addEventListener('click', toggleMenu);
        if(overlay) overlay.addEventListener('click', toggleMenu);
    }
}

export function renderFooter() {
    const footerHtml = `
        <div class="footer-container">
            <div class="footer-col">
                <div class="footer-logo">🌿 ECOBANK</div>
                <p class="footer-desc">
                    แพลตฟอร์มธนาคารขยะดิจิทัลเพื่อชุมชน<br>
                    เปลี่ยนขยะให้เป็นมูลค่า สร้างรายได้ ลดโลกร้อน
                </p>
            </div>

            <div class="footer-col">
                <h4>เมนูลัด</h4>
                <ul class="nav-links">
                    <li><a href="index.html">หน้าหลัก</a></li>
                    <li><a href="trash_types.html">ประเภทขยะ</a></li>
                    <li><a href="map.html">จุดรับซื้อ (แผนที่)</a></li>
                    <li><a href="leaderboard.html">จัดอันดับ</a></li>
                </ul>
            </div>

            <div class="footer-col">
                <h4>ติดต่อเรา</h4>
                <ul class="footer-contact">
                    <li>📞 011-111-111</li>
                    <li>📧 contact@ecobank.com</li>
                    <li>📍 เทศบาลเมืองสกลนคร</li>
                </ul>
            </div>
        </div>
        
        <div class="footer-bottom">
            &copy; 2025 ECOBANK. All Rights Reserved.
        </div>
    `;

    const footerEl = document.querySelector('.site-footer');
    if (footerEl) {
        footerEl.innerHTML = footerHtml;
    }

    // --- Inject Floating Buttons (FAB) ---
    // Remove existing if any (to prevent duplicates on re-render)
    const existingFab = document.querySelector('.fab-container');
    if(existingFab) existingFab.remove();

    const fabHtml = `
        <div class="fab-container">
            <a href="knowledge.html" class="fab-btn fab-secondary" title="ศูนย์ความรู้">
                <span style="font-size:20px;">📚</span>
            </a>
            <!-- Scan Removed as per user request -->
            <!-- <a href="scan.html" class="fab-btn fab-primary" title="AI Scan">
                <span style="font-size:20px;">📸</span>
            </a> -->
        </div>
        <style>
            .fab-container {
                position: fixed;
                bottom: 30px;
                right: 30px;
                display: flex;
                flex-direction: column;
                gap: 15px;
                z-index: 1000;
            }
            .fab-btn {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                text-decoration: none;
                box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                border: 2px solid rgba(255,255,255,0.1);
            }
            .fab-btn:hover { transform: scale(1.1); }
            
            .fab-primary { background: linear-gradient(135deg, #0ecb81 0%, #00a86b 100%); color: #fff; }
            .fab-primary:hover { box-shadow: 0 0 20px rgba(14, 203, 129, 0.6); }

            .fab-secondary { background: #1e2329; color: #fff; border-color: #2b3139; }
            .fab-secondary:hover { background: #2b3139; color: var(--primary-color); }
        </style>
    `;
    document.body.insertAdjacentHTML('beforeend', fabHtml);
}

// --- Auth UI Handler ---
export function initAuth(auth, showConfirm, signOut) {
    // We expect auth, showConfirm from firebase-services/config to be passed in
    // or we can import them here if we switch to full module approach.
    // For now, let's keep it flexible or rely on imports if we change top imports.
    // Actually, to make it easy, let's just pass them or import them.
    // Let's import them here to be self-contained.
}

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

export function setupAuthListener(auth, showConfirm, signOut) {
    onAuthStateChanged(auth, (user) => {
        const authSection = document.getElementById('authSection');
        if (user) {
            if(authSection) {
                authSection.innerHTML = `
                    <div class="user-dropdown">
                        <div class="user-btn"><div class="user-avatar-xs">👤</div><span>${user.email.split('@')[0]}</span><span style="font-size:10px; color:#888;">▼</span></div>
                        <div class="dropdown-content">
                            <a href="profile.html">👤 ข้อมูลส่วนตัว (Profile)</a><a href="wallet.html">💰 กระเป๋าเงิน (Wallet)</a><a href="#" id="logoutBtn" class="logout-item">🚪 ออกจากระบบ</a>
                        </div>
                    </div>`;
                document.getElementById('logoutBtn').addEventListener('click', async (e) => { 
                    e.preventDefault(); 
                    if(await showConfirm("ยืนยัน","ออกจากระบบ?")) { 
                        await signOut(auth); 
                        window.location.href='login.html'; 
                    } 
                });
            }
        } else {
            if(authSection) authSection.innerHTML = `<div style="display:flex; gap:10px;"><a href="login.html" class="btn btn-login">เข้าสู่ระบบ</a><a href="register.html" class="btn btn-register">สมัครสมาชิก</a></div>`;
        }
    });
}

// --- Global Dropdown Handler (Mobile Fix) ---
document.addEventListener('click', (e) => {
    // 1. Find the dropdown wrapper
    const dropdown = e.target.closest('.user-dropdown');

    // 2. Close ANY open dropdowns that are NOT the one we just clicked
    document.querySelectorAll('.user-dropdown.active').forEach(d => {
        if (d !== dropdown) {
            d.classList.remove('active');
        }
    });

    // 3. If we clicked inside a dropdown...
    if (dropdown) {
        // Check if we clicked the TOGGLE button (user-btn)
        if (e.target.closest('.user-btn')) {
            // Toggle the current one
            dropdown.classList.toggle('active');
        }
        // If we clicked inside dropdown-content, do nothing (let links work)
        // If we clicked elsewhere in .user-dropdown (unlikely), do nothing
    }
});
