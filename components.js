document.addEventListener("DOMContentLoaded", async function () {
    // 1. Path Identity
    const path = window.location.pathname;

    // 2. Inject Dots Background Matrix
    const dotsHTML = `<div class="dots-container"><div class="dots dots-white"></div><div class="dots dots-cyan"></div></div>`;
    document.body.insertAdjacentHTML('afterbegin', dotsHTML);

    // 3. Check Wallet Session Status Directly From Network Provider
    let walletAddress = "";
    let isConnected = false;
    if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            walletAddress = accounts[0];
            isConnected = true;
        }
    }

    // --- PREMIUM META AI (MTA) LOGO IMAGE ---
    const premiumMetaAILogo = `
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <i data-lucide="cpu" class="text-white w-5 h-5 animate-pulse"></i>
        </div>
    `;

    // 4. Inject Premium Global Desktop Navbar System
    const navHTML = `
        <header class="w-full border-b border-white/[0.04] bg-[#04070c]/80 backdrop-blur-xl fixed top-0 left-0 z-50 px-4 sm:px-6 lg:px-8">
            <div class="max-w-7xl mx-auto h-20 flex items-center justify-between">
                <div class="flex items-center gap-3 cursor-pointer group" onclick="location.href='index.html'">
                    <div class="relative flex items-center justify-center">
                        <div class="absolute inset-0 bg-cyan-500/20 blur-xl group-hover:bg-blue-500/40 transition-all duration-500"></div>
                        <div class="z-10 transform group-hover:scale-105 transition-transform duration-500">
                            ${premiumMetaAILogo}
                        </div>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-lg font-extrabold tracking-tight text-white block">META <span class="text-cyan-400">AI</span></span>
                        <span class="block text-[9px] text-slate-500 font-mono tracking-widest uppercase">Node Swap Engine</span>
                    </div>
                </div>
                
                <div class="hidden md:flex bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-1 shadow-2xl">
                    <button class="nav-btn-new" onclick="location.href='index.html'">Swap Vault</button>
                    <button class="nav-btn-new" onclick="location.href='index1.html'">Pro Dashboard</button>
                </div>
                
                <div class="relative flex items-center gap-3">
                    <div class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-white/[0.05] text-xs font-mono text-slate-400">
                        <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span> BSC Testnet
                    </div>
                    <button id="connect-btn" onclick="initWalletConnection()" class="new-cyber-btn flex items-center gap-2">
                        <i data-lucide="wallet" class="w-3.5 h-3.5"></i>
                        <span>${isConnected ? walletAddress.substring(0, 6) + "..." + walletAddress.substring(38) : "Connect Wallet"}</span>
                    </button>
                </div>
            </div>
        </header>

        <style>
            .nav-btn-new { color: #cbd5e1; font-size: 11px; font-weight: 800; padding: 10px 20px; border-radius: 12px; transition: 0.3s; text-transform: uppercase; letter-spacing: 0.5px; }
            .nav-btn-new:hover { color: white; background: rgba(255,255,255,0.08); text-shadow: 0 0 10px rgba(6,182,212,0.6); }
            .new-cyber-btn { background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; font-weight: 900; padding: 10px 20px; border-radius: 12px; transition: 0.3s; border: 1px solid rgba(255,255,255,0.2); cursor: pointer; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(6,182,212,0.2); }
            @media (min-width: 768px) { .new-cyber-btn { padding: 12px 24px; font-size: 12px; } }
            .new-cyber-btn:hover { transform: translateY(-2px); box-shadow: 0 0 20px rgba(6,182,212,0.5); }
        </style>
    `;
    
    const oldHeader = document.querySelector('header');
    if (oldHeader) oldHeader.remove();
    document.body.insertAdjacentHTML('afterbegin', navHTML);

    // 5. Inject Luxury Floating Mobile Navigation Bar
    const mobileNavHTML = `
        <div class="fixed bottom-6 left-3 right-3 md:hidden z-[9999]">
            <div class="bg-[#04070c]/95 backdrop-blur-3xl border border-white/10 rounded-[2.2rem] flex justify-around items-center px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.95)]">
                <a href="index.html" class="flex flex-col items-center gap-1 transition-all duration-300 w-16 ${(!path.includes('index1.html')) ? 'text-cyan-400 drop-shadow-[0_0_8px_#06b6d4]' : 'text-slate-500'}">
                    <i data-lucide="refresh-cw" class="w-5 h-5"></i>
                    <span class="text-[8px] font-extrabold uppercase tracking-wider">Swap Vault</span>
                </a>
                <div class="relative -top-5 flex flex-col items-center">
                    <div class="relative group block" onclick="initWalletConnection()">
                        <div class="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-blue-600 blur-xl opacity-60 rounded-full"></div>
                        <div class="relative w-12 h-12 bg-gradient-to-tr from-[#0b1220] to-[#04070e] rounded-full flex items-center justify-center border-4 border-[#020407] shadow-[0_6px_20px_rgba(6,182,212,0.4)] p-1">
                            <i data-lucide="wallet" class="text-cyan-400 w-5 h-5"></i>
                        </div>
                    </div>
                </div>
                <a href="index1.html" class="flex flex-col items-center gap-1 transition-all duration-300 w-16 ${(path.includes('index1.html')) ? 'text-cyan-400 drop-shadow-[0_0_8px_#06b6d4]' : 'text-slate-500'}">
                    <i data-lucide="layout-dashboard" class="w-5 h-5"></i>
                    <span class="text-[8px] font-extrabold uppercase tracking-wider">Analytics</span>
                </a>
            </div>
        </div>
    `;
    
    const oldMobileNav = document.querySelector('.fixed.bottom-6');
    if (oldMobileNav) oldMobileNav.remove();
    document.body.insertAdjacentHTML('beforeend', mobileNavHTML);

    // 6. Inject Luxury Pre-Rendered Meta AI Footer 
    const footerHTML = `
        <footer class="py-16 text-center border-t border-white/5 relative z-10 mb-24 md:mb-0 bg-[#030508]">
            <div class="flex flex-col items-center gap-3 mb-4">
                 <div class="opacity-90 flex items-center justify-center">${premiumMetaAILogo}</div>
                <p class="font-black text-xl tracking-tight text-white uppercase font-sans">META <span class="text-cyan-400">AI</span></p>
            </div>
            <p class="text-slate-600 text-[8px] md:text-[10px] tracking-[0.4em] md:tracking-[0.6em] uppercase font-bold font-mono">Decentralized Asset Allocation Node Initialization © 2026</p>
        </footer>
    `;
    
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = footerHTML;
    } else {
        document.body.insertAdjacentHTML('beforeend', footerHTML);
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
});
