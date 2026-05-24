document.addEventListener("DOMContentLoaded", async function () {
    // 1. Auth Page Check
    const isAuthPage = document.getElementById('auth-page') || 
                       window.location.pathname.includes('register.html') || 
                       window.location.pathname.includes('login.html');

    // 2. Inject Dots Background Matrix
    const dotsHTML = `<div class="dots-container"><div class="dots dots-white"></div><div class="dots dots-cyan"></div></div>`;
    document.body.insertAdjacentHTML('afterbegin', dotsHTML);

    if (isAuthPage) {
        document.dispatchEvent(new CustomEvent('componentsLoaded'));
        return;
    }

    // 3. Check Wallet Session Status
    let walletAddress = "";
    let isConnected = false;
    if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            walletAddress = accounts[0];
            isConnected = true;
        }
    }

    // --- META AI LOGO COMPONENT ---
    const metaAILogo = `
        <div class="w-full h-full rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)] animate-pulse">
            <i data-lucide="cpu" class="text-white w-6 h-6"></i>
        </div>
    `;

    // 4. Inject Premium Global Desktop Navbar (Meta AI Branding)
    const navHTML = `
        <nav class="max-w-7xl mx-auto px-4 md:px-6 py-6 flex justify-between items-center relative z-[100]">
            <div class="flex items-center gap-3 cursor-pointer group" onclick="location.href='index1.html'">
                <div class="w-12 h-12">${metaAILogo}</div>
                <div class="flex flex-col">
                    <span class="text-xl font-black tracking-tight text-white uppercase">META <span class="text-cyan-400">AI</span></span>
                    <span class="text-[8px] text-slate-500 tracking-[0.2em] uppercase font-bold">Analytics Terminal</span>
                </div>
            </div>
            
            <div class="hidden md:flex bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-1 shadow-2xl">
                <button class="nav-btn-new" onclick="location.href='index1.html'">Dashboard</button>
                <button class="nav-btn-new" onclick="location.href='index.html'">buy</button>
                <button class="nav-btn-new" onclick="location.href='web.html'">Token info</button>
            </div>
            
            <div class="relative">
                <button id="connect-btn" onclick="handleLogin()" class="new-cyber-btn">
                    <span>${isConnected ? walletAddress.substring(0, 6) + "..." + walletAddress.substring(38) : "Connect Wallet"}</span>
                </button>
            </div>
        </nav>

        <style>
            .nav-btn-new { color: #cbd5e1; font-size: 11px; font-weight: 800; padding: 10px 20px; border-radius: 12px; transition: 0.3s; text-transform: uppercase; }
            .nav-btn-new:hover { color: white; background: rgba(6, 182, 212, 0.1); }
            .new-cyber-btn { background: linear-gradient(135deg, #06b6d4 0%, #2563eb 100%); color: white; font-weight: 900; padding: 10px 20px; border-radius: 12px; transition: 0.3s; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; text-transform: uppercase; font-size: 11px; }
            .new-cyber-btn:hover { transform: translateY(-2px); box-shadow: 0 0 20px rgba(6, 182, 212, 0.3); }
        </style>
    `;
    document.body.insertAdjacentHTML('afterbegin', navHTML);

    // 5. Mobile Nav
    const mobileNavHTML = `
        <div class="fixed bottom-6 left-3 right-3 md:hidden z-[9999]">
            <div class="bg-[#04070c]/95 backdrop-blur-3xl border border-white/10 rounded-[2.2rem] flex justify-between items-center px-6 py-4 shadow-2xl">
                <a href="index1.html" class="flex flex-col items-center gap-1 text-cyan-400">
                    <i data-lucide="layout-dashboard" class="w-5 h-5"></i>
                    <span class="text-[8px] font-bold uppercase">Home</span>
                </a>
                <div class="relative -top-8 w-14 h-14 bg-[#0a0f1d] rounded-full flex items-center justify-center border-4 border-[#04070c] shadow-lg">
                    ${metaAILogo}
                </div>
                <a href="web.html" class="flex flex-col items-center gap-1 text-gray-500">
                    <i data-lucide="info" class="w-5 h-5"></i>
                    <span class="text-[8px] font-bold uppercase">info</span>
                </a>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', mobileNavHTML);

    // 6. Footer
    document.body.insertAdjacentHTML('beforeend', `<div id="footer-placeholder" class="w-full"></div>`);

    if (typeof lucide !== 'undefined') lucide.createIcons();
    document.dispatchEvent(new CustomEvent('componentsLoaded'));
});
