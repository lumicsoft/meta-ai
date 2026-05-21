document.addEventListener("DOMContentLoaded", async function () {
    const path = window.location.pathname;

    // --- HTML Injection ---
    const dotsHTML = `<div class="dots-container"><div class="dots dots-white"></div><div class="dots dots-cyan"></div></div>`;
    document.body.insertAdjacentHTML('afterbegin', dotsHTML);

    let walletAddress = "";
    let isConnected = false;
    if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            walletAddress = accounts[0];
            isConnected = true;
        }
    }

    const navHTML = `... (Aapka pura navbar ka code yahan rahega) ...`; // Pura navbar code yahan paste kar dena
    
    // Inject Navbar
    const oldHeader = document.querySelector('header');
    if (oldHeader) oldHeader.remove();
    document.body.insertAdjacentHTML('afterbegin', navHTML);

    // Inject Mobile Nav
    const mobileNavHTML = `... (Aapka pura mobile nav code yahan rahega) ...`; // Pura code yahan
    document.body.insertAdjacentHTML('beforeend', mobileNavHTML);

    // Inject Footer
    const footerHTML = `... (Aapka footer code) ...`; 
    document.body.insertAdjacentHTML('beforeend', footerHTML);

    if (typeof lucide !== 'undefined') lucide.createIcons();

    // --- FINAL TRIGGER: Ye line sabse important hai ---
    // Jab HTML inject ho jaye, tabhi web3-handler ko signal bhejo
    const event = new Event('componentsLoaded');
    window.dispatchEvent(event);
    console.log("Components Injected Successfully");
});
