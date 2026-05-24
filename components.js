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
            
            <div class="hidden md:flex relative">
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

    // 5. Updated Mobile Premium Navigation Hub (Integrated Adaptive Wallet Trigger Console)
    const currentPath = window.location.pathname;
    const mobileNavHTML = `
        <div class="fixed bottom-6 left-4 right-4 md:hidden z-[9999]">
            <div class="bg-[#04070c]/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl flex justify-between items-center px-3 py-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                
                <!-- Link 1: Dashboard -->
                <a href="index1.html" class="flex flex-col items-center gap-1 flex-1 transition-all duration-200 ${currentPath.includes('index1') ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}">
                    <i data-lucide="layout-dashboard" class="w-5 h-5"></i>
                    <span class="text-[9px] font-black tracking-wider uppercase">Dashboard</span>
                </a>
                
                <!-- Link 2: Buy Now -->
                <a href="index.html" class="flex flex-col items-center gap-1 flex-1 transition-all duration-200 ${currentPath.endsWith('index.html') || currentPath.endsWith('/') ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}">
                    <i data-lucide="zap" class="w-5 h-5"></i>
                    <span class="text-[9px] font-black tracking-wider uppercase">Buy</span>
                </a>

                <!-- Centered Luxury Interactive Wallet Logo Trigger -->
                <div class="relative flex-1 flex justify-center h-6 cursor-pointer" onclick="handleLogin()">
                    <div class="absolute -top-9 w-14 h-14 bg-[#070b12] rounded-full flex items-center justify-center border-4 border-[#030508] shadow-xl ${isConnected ? 'shadow-emerald-500/20 border-emerald-500/30' : 'shadow-cyan-500/10'}">
                        <div class="w-11 h-11 flex items-center justify-center rounded-xl ${isConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white'}">
                            <i data-lucide="${isConnected ? 'wallet' : 'cpu'}" class="w-5 h-5 ${isConnected ? '' : 'animate-pulse'}"></i>
                        </div>
                    </div>
                </div>
                
                <!-- Link 3: Token Info -->
                <a href="web.html" class="flex flex-col items-center gap-1 flex-1 transition-all duration-200 ${currentPath.includes('web.html') ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}">
                    <i data-lucide="info" class="w-5 h-5"></i>
                    <span class="text-[9px] font-black tracking-wider uppercase">Info</span>
                </a>
                
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', mobileNavHTML);

    // 6. Inject Premium Luxury Cyber Footer Component
    const footerHTML = `
        <footer class="w-full border-t border-white/[0.04] bg-[#020407] mt-16 relative overflow-hidden z-[10]">
            <!-- Subtle Radial Bottom Glow Accent -->
            <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[280px] sm:w-[600px] h-[100px] bg-cyan-500/[0.03] rounded-full blur-[80px] pointer-events-none"></div>

            <div class="max-w-7xl mx-auto px-4 md:px-6 py-12 lg:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 relative z-10">
                
                <!-- Column 1: Core Branding Matrix -->
                <div class="md:col-span-4 space-y-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                            <i data-lucide="cpu" class="text-white w-5 h-5"></i>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-md font-black tracking-tight text-white uppercase">META <span class="text-cyan-400">AI</span></span>
                            <span class="text-[8px] text-slate-500 tracking-[0.2em] uppercase font-bold">Analytics Terminal</span>
                        </div>
                    </div>
                    <p class="text-xs text-slate-500 leading-relaxed max-w-sm">
                        Next-generation cryptographic token distribution layer. Yield allocation protocols monitored strictly on-chain via algorithmic infrastructure matrix loops.
                    </p>
                </div>

                <!-- Column 2: Quick Architecture Links -->
                <div class="md:col-span-2 space-y-3">
                    <span class="text-[10px] font-bold tracking-widest text-slate-400 uppercase block">Navigation</span>
                    <ul class="space-y-2 text-xs font-medium text-slate-500">
                        <li><a href="index1.html" class="hover:text-cyan-400 transition-colors">Operational Node</a></li>
                        <li><a href="index.html" class="hover:text-cyan-400 transition-colors">Direct Allocation</a></li>
                        <li><a href="web.html" class="hover:text-cyan-400 transition-colors">Token Verification</a></li>
                    </ul>
                </div>

                <!-- Column 3: Security Clearances -->
                <div class="md:col-span-3 space-y-3">
                    <span class="text-[10px] font-bold tracking-widest text-slate-400 uppercase block">Security Layer</span>
                    <div class="space-y-2">
                        <div class="flex items-center gap-2 text-xs text-slate-500">
                            <i data-lucide="shield-check" class="w-4 h-4 text-emerald-400 flex-shrink-0"></i>
                            <span>Smart Contract Audited</span>
                        </div>
                        <div class="flex items-center gap-2 text-xs text-slate-500">
                            <i data-lucide="lock" class="w-4 h-4 text-cyan-400 flex-shrink-0"></i>
                            <span>Symmetric Asset Lock</span>
                        </div>
                    </div>
                </div>

                <!-- Column 4: Social Infrastructure Channels -->
                <div class="md:col-span-3 space-y-3">
                    <span class="text-[10px] font-bold tracking-widest text-slate-400 uppercase block">Global Broadcasts</span>
                    <div class="flex items-center gap-3">
                        <a href="#" class="w-8 h-8 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-cyan-500/30 text-slate-400 hover:text-cyan-400 flex items-center justify-center transition-all">
                            <i data-lucide="send" class="w-4 h-4"></i>
                        </a>
                        <a href="#" class="w-8 h-8 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-cyan-500/30 text-slate-400 hover:text-cyan-400 flex items-center justify-center transition-all">
                            <i data-lucide="twitter" class="w-4 h-4"></i>
                        </a>
                        <a href="#" class="w-8 h-8 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-cyan-500/30 text-slate-400 hover:text-cyan-400 flex items-center justify-center transition-all">
                            <i data-lucide="globe" class="w-4 h-4"></i>
                        </a>
                    </div>
                </div>

            </div>

            <!-- Bottom Sub-Copyright Deck -->
            <div class="w-full border-t border-white/[0.02] py-6 text-center text-[10px] font-mono text-slate-600 tracking-wider">
                &copy; 2026 META AI LABS. ALL CRYPTOGRAPHIC RIGHTS SECURED DIRECT.
            </div>
        </footer>
    `;

    // Safe DOM injection mapping script
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        footerPlaceholder.outerHTML = footerHTML;
    } else {
        document.body.insertAdjacentHTML('beforeend', footerHTML);
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
    document.dispatchEvent(new CustomEvent('componentsLoaded'));
});
