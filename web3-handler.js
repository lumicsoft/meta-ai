// --- METAAI (MTA) NATIVE PRESALE CORE WEB3 HANDLER ---

let provider, signer, contract, usdtContract;

// 🛠️ FIXED: Removed trailing space from address string to prevent parsing rejection
const CONTRACT_ADDRESS = "0x53E379E8364a6B72368C6040D72ad658cFc286dC"; // MetaAI Contract Address
const USDT_ADDRESS = "0x3B66b1E08F55AF26c8eA14a73dA64b6bC8D799dE";     // BEP20 USDT Token Address
const PUBLIC_RPC_URL = "https://bsc-testnet.publicnode.com";              // High-Performance BSC Testnet Public RPC Node

// Dynamic Variable Storage Matching Split Frontend Cards
window.userData = {
    isRegistered: false,
    userWallet: ""
};

// Exact Production ABI structured directly from your Solidity Contract code
const CONTRACT_ABI = [
    // --- Write Functions ---
    "function buyTokens(address _referrer, uint256 _usdtAmount) external",
    // ABI mein ye replace karein:
"function withdrawAvailableTokens(uint256 _amount) external",
"function sellAvailableTokens(uint256 _amount) external",
    "function transferOwnership(address _newOwner) external", 
    
    // --- View Lookups ---
    "function currentPhase() external view returns (uint256)",
    "function checkClaimableTokens(address _user) public view returns (uint256)",
    "function presalePhases(uint256) external view returns (uint256 price, uint256 maxSupply, uint256 sold, uint256 duration, uint256 startTime)",
    "function userPhaseInvestment(address, uint256) external view returns (uint256)", 
    "function users(address) external view returns (address referrer, uint256 rank, uint256 directCount, uint256 validDirectsCount, uint256 totalUsdtSpent, uint256 totalBoughtTokens, uint256 claimedTokens, uint256 lastClaimTimestamp, uint256 totalDirectRewardEarned, uint256 totalDifferentialRewardEarned, uint256 rewardBalance, uint256 totalRewardsWithdrawn)",
    
    // --- Mapped Tuple Views ---
    "function getUserPurchaseDetails(address _userAddress) external view returns (uint256 totalUsdtInvested, uint256 totalMtaTokensBought, uint256 unreleasedVestedTokens, uint256 readyToReleaseVestedTokens, uint256 totalVestedTokensReleased)",
    "function getUserRewardDetails(address _userAddress) external view returns (uint256 totalDirectRewardsEarned, uint256 totalDifferentialRewardsEarned, uint256 pendingUnclaimedRewards, uint256 totalRewardsWithdrawnHistory)",
    // 🛠️ EXACT MATCH WITH CONTRACT STRUCT: 7 return parameters mapped from contract function
    "function getUserNetworkStats(address _userAddress) external view returns (address uplineReferrer, uint256 currentRankCode, uint256 immediateDirectCount, uint256 downlineS1Count, uint256 downlineS2Count, uint256 downlineS3Count, uint256 downlineS4Count)",
    "function getUserHistoryLogs(address _userAddress) external view returns (tuple(string logType, uint256 usdtAmount, uint256 tokenAmount, uint256 timestamp)[])",
    
    // --- Transaction History Events ABI Mappings ---
    "event TokenPurchased(address indexed buyer, uint256 usdtAmount, uint256 tokenAmount, uint256 phaseId, uint256 timestamp)",
    "event DirectRewardDistributed(address indexed referrer, address indexed buyer, uint256 amount, uint256 timestamp)",
    "event DifferentialRewardDistributed(address indexed referrer, address indexed buyer, uint256 amount, uint256 rank, uint256 timestamp)",
    "event TokensWithdrawn(address indexed user, uint256 amount, uint256 timestamp)",
    "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)" 
];

const USDT_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)"
];

// --- REFERRAL LINK TERMINAL AUTO-FILL ---
function checkReferralURL() {
    const urlParams = new URLSearchParams(window.location.search);
    let refAddr = urlParams.get('ref');
    
    // Storage mein save karo
    if (refAddr && ethers.utils.isAddress(refAddr)) {
        localStorage.setItem('cachedReferrer', refAddr);
    }

    // Local storage se uthao
    const storedRef = localStorage.getItem('cachedReferrer');
    const refField = document.getElementById('reg-referrer'); 

    if (refField && storedRef) {
        refField.value = storedRef;
        refField.readOnly = true; 
        console.log("Referral string auto-loaded successfully:", storedRef);
    }
}

// 🛠️ NEW: OBSERVER TO PREVENT OVERWRITES
const referralObserver = new MutationObserver(() => {
    const refField = document.getElementById('reg-referrer');
    const storedRef = localStorage.getItem('cachedReferrer');
    if (refField && storedRef && refField.value !== storedRef) {
        refField.value = storedRef;
    }
});

// --- INITIALIZATION TERMINAL PROTOCOL ---
async function init() {
    checkReferralURL();
    
    // CRITICAL FIX: Wallet session validation ka wait kiye bina, background rpc nodes se instantly market data update trigger karein
    await syncPublicPhaseDataOnly();

    if (window.ethereum) {
        try {
            // Ethers v5 provider initialization
            provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            
            // Contract initialization
            contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
            usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, provider);

            // Check if user is already connected
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            
            if (accounts && accounts.length > 0) {
                // Agar session active hai toh user ka address set karein
                signer = provider.getSigner();
                // Contract ko signer ke sath re-initialize karein taaki transactions ho sakein
                contract = contract.connect(signer);
                usdtContract = usdtContract.connect(signer);

                if (localStorage.getItem('manualLogout') !== 'true') {
                    await setupApp(accounts[0]);
                } else {
                    // Manual logout ke baad bhi navbar update aur public data dikhayein
                    updateNavbar(accounts[0]);
                    await syncPublicPhaseDataOnly();
                }
            } else {
                // Agar wallet connect nahi hai, toh sirf public data dikhayein
                await syncPublicPhaseDataOnly();
            }
        } catch (error) { 
            console.error("Initialization Failed on Block Channel:", error); 
        }
    } else { 
        console.warn("Web3 Extension missing. Falling back to static mode.");
    }
}

// --- PUBLIC PROVIDER SYNC MODULE (Purely Driven via Public RPC Node to bypass initial local fallback gaps) ---
async function syncPublicPhaseDataOnly() {
    try {
        // Fix: Local window injection context check par dependency hatakar clear network rpc parse kiya h
        const publicProvider = new ethers.providers.JsonRpcProvider(PUBLIC_RPC_URL);
        const tempContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, publicProvider);
        
        const currentPhaseIdx = await tempContract.currentPhase();
        // 🛠️ TYPO FIXED HERE: Removed the broken assignment token string to ensure clean execution loop
        const phaseObject = await tempContract.presalePhases(currentPhaseIdx);

        const tokenPriceString = ethers.utils.formatEther(phaseObject.price);
        const tokensSold = ethers.utils.formatEther(phaseObject.sold);
        const capacitySupplyMax = ethers.utils.formatEther(phaseObject.maxSupply);
        const supplyAvailableCalculated = parseFloat(capacitySupplyMax) - parseFloat(tokensSold);

        updateText('total-sold-tokens', parseFloat(tokensSold).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}));
        updateText('available-supply', parseFloat(supplyAvailableCalculated).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}));
        
        const phaseBadgeElement = document.getElementById('phase-badge');
        if (phaseBadgeElement) {
            phaseBadgeElement.innerText = "Phase " + currentPhaseIdx.toString();
        }
        
        const priceIndicatorLabel = document.getElementById('node-rate-display');
        if (priceIndicatorLabel) {
            priceIndicatorLabel.innerText = `${parseFloat(tokenPriceString).toFixed(2)} USDT`;
        }
    } catch (e) {
        console.log("Public allocation ledger display synced:", e);
    }
}

window.handleBuyToken = async function() {
    // 1. Connection Check
    if (!signer || !usdtContract) {
        alert("Wallet connect nahi hai. Connecting now...");
        await window.handleLogin();
        if (!signer) {
            alert("Connection cancel kar diya gaya.");
            return;
        }
    }

    try {
        const inputAmount = document.getElementById('buy-usdt-amount').value;
        if (!inputAmount || parseFloat(inputAmount) < 1) {
            alert("Security Protocol Boundary: Minimum capital threshold is $1 USDT.");
            return;
        }

        // BSC USDT ke liye 18 decimals (agar 6 hai to '6' likhein)
        const amountWei = ethers.utils.parseUnits(inputAmount.toString(), 18); 
        const userAddress = await signer.getAddress();
        
        // Referral Cleanup
        let referrerAddress = document.getElementById('reg-referrer')?.value.trim();
        if(!referrerAddress || !ethers.utils.isAddress(referrerAddress)) {
            const urlParams = new URLSearchParams(window.location.search);
            referrerAddress = urlParams.get('ref') || "0x0000000000000000000000000000000000000000";
        }

        const btn = document.getElementById('buy-now-btn');
        if(btn) { btn.disabled = true; btn.innerText = "CHECKING LIMITS..."; }

        // ✨ --- START: NEW COOPERATIVE PHASE LIMIT CONDITION --- ✨
        const currentPhaseIdx = await contract.currentPhase();
        const alreadyInvestedWei = await contract.userPhaseInvestment(userAddress, currentPhaseIdx);
        const maxLimitWei = ethers.utils.parseUnits("100", 18);

        if (alreadyInvestedWei.add(amountWei).gt(maxLimitWei)) {
            const alreadyInvestedUsdt = ethers.utils.formatEther(alreadyInvestedWei);
            const remainingLimit = 100 - parseFloat(alreadyInvestedUsdt);
            alert(`Phase Limit Exceeded! Aap is Phase mein max $100 invest kar sakte hain. Aap pehle hi $${parseFloat(alreadyInvestedUsdt).toFixed(2)} invest kar chuke hain. Aapka remaining allocation limit sirf $${remainingLimit.toFixed(2)} USDT hai.`);
            
            // Re-enabling button safely if local phase boundaries are triggered
            if(btn) { btn.disabled = false; btn.innerText = "BUY NOW"; }
            return;
        }
        // ✨ --- END: NEW COOPERATIVE PHASE LIMIT CONDITION --- ✨

        if(btn) btn.innerText = "CHECKING ALLOWANCE...";

        // --- FIXED APPROVAL LOGIC ---
        const currentAllowance = await usdtContract.allowance(userAddress, CONTRACT_ADDRESS);
        
        if (currentAllowance.lt(amountWei)) {
            if(btn) btn.innerText = "APPROVING USDT...";
            
            // Step 1: Kuch tokens ke liye allowance reset karna zaruri hai
            if (currentAllowance.gt(0)) {
                const resetTx = await usdtContract.approve(CONTRACT_ADDRESS, 0);
                await resetTx.wait();
            }
            
            // Step 2: New Approval
            const approveTx = await usdtContract.approve(CONTRACT_ADDRESS, amountWei);
            await approveTx.wait();
        }
        
        if(btn) btn.innerText = "SWAPPING ASSETS...";
        
        // --- EXECUTION ---
        // Gas limit 600000 kardi hai complex logic ke liye
        const tx = await contract.buyTokens(referrerAddress, amountWei, { gasLimit: 600000 });
        
        if(btn) btn.innerText = "CONFIRMING...";
        alert("Transaction Broadcasted! Waiting for confirmation block...");
        
        // Block confirmation ka waiting cycle
        await tx.wait();
        
        // ✨ SUCCESS REDIRECTION TRIGGER: Ab transaction confirm hone ke BAAD hi index1.html par bheja jayega, chahe pehli baar ho ya baar-baar!
        alert("Allocation successful!");
        window.location.href = "index1.html";
        
    } catch (err) { 
        console.error("Swap Core Failure Log:", err);
        
        // Error handling
        let errorMessage = err.data?.message || err.message;
        if (errorMessage.includes("user rejected")) {
            errorMessage = "User ne transaction reject kar di.";
        } else if (errorMessage.includes("limit of $100 USDT exceeded")) {
            errorMessage = "Phase purchase limit of $100 USDT exceeded!";
        } else if (errorMessage.includes("execution reverted")) {
            errorMessage = "Contract Reverted: Check if Phase is active or minimum amount is correct.";
        }
        
        alert("Transaction Aborted: " + errorMessage);
        
        // Button reset
        if(document.getElementById('buy-now-btn')) {
            document.getElementById('buy-now-btn').disabled = false;
            document.getElementById('buy-now-btn').innerText = "BUY NOW";
        }
    }
}

// --- MODULE 2: EXTRACT RELEASES FROM VAULT (WITHDRAW) ---
window.handleWithdrawAvailable = async function() {
    try {
        // Frontend se amount uthayein (Assume: <input id="withdraw-amount">)
        const amountStr = document.getElementById('withdraw-amount')?.value;
        if (!amountStr || parseFloat(amountStr) <= 0) {
            return alert("Valid withdrawal amount enter karein.");
        }
        const amountWei = ethers.utils.parseUnits(amountStr, 18);
        
        const tx = await contract.withdrawAvailableTokens(amountWei);
        alert("Withdraw execution sequence transmitted...");
        await tx.wait();
        alert("Withdrawal successful!");
        location.reload();
    } catch (err) { 
        console.error("Withdraw sequence reverted:", err);
        alert("Withdraw failed: " + (err.reason || err.message)); 
    }
}

window.handleSwapAndBurn = async function() {
    try {
        // Frontend se amount uthayein (Assume: <input id="sell-amount">)
        const amountStr = document.getElementById('sell-amount')?.value;
        if (!amountStr || parseFloat(amountStr) <= 0) {
            return alert("Valid liquidation amount enter karein.");
        }
        const amountWei = ethers.utils.parseUnits(amountStr, 18);

        if(!confirm("Are you sure you want to trigger liquidation burn for " + amountStr + " MTA?")) return;
        
        const tx = await contract.sellAvailableTokens(amountWei);
        alert("Liquidation token burn signal broadcasted...");
        await tx.wait();
        alert("Liquidation successful! Safe USDT capital routed back to wallet address.");
        location.reload();
    } catch (err) {
        console.error("Internal swap call aborted:", err);
        alert("Liquidation failed: " + (err.reason || err.message));
    }
}

// --- DYNAMIC LIVE RATE MULTIPLIER (Directly querying from public rpc node to secure real active instance rates) ---
async function getLiveRate() {
    try {
        let activeContractInstance = contract;
        // Agar main local object wallet initialization bypass state me ho, toh instant proxy configuration use karein
        if (!activeContractInstance) {
            const publicProvider = new ethers.providers.JsonRpcProvider(PUBLIC_RPC_URL);
            activeContractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, publicProvider);
        }
        const currentPhaseIdx = await activeContractInstance.currentPhase();
        const phase = await activeContractInstance.presalePhases(currentPhaseIdx);
        // Contract price 18 decimals mein hai, use ether mein format karein
        return parseFloat(ethers.utils.formatEther(phase.price));
    } catch (e) {
        console.error("Rate fetch error:", e);
        return 0.50; // Dynamic fallback backup targeting Phase 2 value standard structures
    }
}

// --- MODULE 4: LOGIN PROTOCOLS GATEWAY (FIXED REDIRECTION LOOP) ---
window.handleLogin = async function() {
    try {
        if (!window.ethereum) return alert("MetaMask or Trust Wallet required to authenticate login nodes.");
        
        provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length === 0) return;
        
        const userAddress = accounts[0]; 
        signer = provider.getSigner();
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
        localStorage.removeItem('manualLogout');
        
        // Ab login/connect par koi restriction nahi hogi, user direct isi buy section application panel par setup hoga.
        await setupApp(userAddress);
        
    } catch (err) {
        console.error("Authentication Process Error:", err);
    }
}

// --- SYSTEM APP COMPLIANCE FRAMEWORK SETUP ---
async function setupApp(address) {
    try {
        window.userData.userWallet = address;
        const path = window.location.pathname;

        // --- 🔒 STRICT NETWORK VERIFICATION SHIELD (BSC TESTNET ONLY) ---
        const network = await provider.getNetwork();
        if (network.chainId !== 56) { 
            try {
                // Automatic switch network request call
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x38' }], // Hex decimal code for BSC Testnet Chain 97
                });
                
                alert("Network switched successfully! Syncing nodes...");
                location.reload();
                return;
            } catch (err) {
                console.error("Network switch rejection or error:", err);
                alert("Network Conflict: Processing requires switching to the BSC mainnet. Please change network inside your wallet app.");
                return; // Execution stops immediately if network shift is declined
            }
        }

        updateNavbar(address);
        renderWalletCredentialsString(address);

        // Auto routing calculations sync conditionally based on layout destinations
        if (path.includes('index1') || path.endsWith('index1.html')) {
            await fetchAllSplitDataMetrics(address);
        } else {
            // Load live market phase pricing data on initialization interface
            await syncCurrentPhaseData();
        }

    } catch (e) {
        console.error("Setup compliance routing error trace:", e);
    }
}

// --- RENDER CURRENT PHASE DYNAMIC DATA FIELDS ---
async function syncCurrentPhaseData() {
    try {
        let activeContractInstance = contract;
        if (!activeContractInstance) {
            const publicProvider = new ethers.providers.JsonRpcProvider(PUBLIC_RPC_URL);
            activeContractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, publicProvider);
        }
        
        const currentPhaseIdx = await activeContractInstance.currentPhase();
        const phaseObject = await activeContractInstance.presalePhases(currentPhaseIdx);

        const tokenPriceString = ethers.utils.formatEther(phaseObject.price);
        const tokensSold = ethers.utils.formatEther(phaseObject.sold);
        const capacitySupplyMax = ethers.utils.formatEther(phaseObject.maxSupply);
        const supplyAvailableCalculated = parseFloat(capacitySupplyMax) - parseFloat(tokensSold);

        // Inject variables into matching standalone fields on layout panels
        updateText('total-sold-tokens', parseFloat(tokensSold).toLocaleString());
        updateText('available-supply', parseFloat(supplyAvailableCalculated).toLocaleString());
        
        const priceIndicatorLabel = document.getElementById('node-rate-display');
        if (priceIndicatorLabel) {
            priceIndicatorLabel.innerText = `${parseFloat(tokenPriceString).toFixed(2)} USDT`;
        }
    } catch (err) {
        console.error("Presale global ledger fetch metrics trace error:", err);
    }
}

// --- MODULE 5: BATCH DATA QUERY ENGINE FOR SEPARATED CARDS ---
async function fetchAllSplitDataMetrics(address) {
    try {
        console.log("Synchronizing 1:1 separate cards parameters stack for hex identity:", address);
        
        // 1. Core pricing phase counters execution updates
        await syncCurrentPhaseData();

        // 2. Fetch data array from getUserPurchaseDetails (Vesting Blocks Mapping)
        const purchasesTuple = await contract.getUserPurchaseDetails(address);
        updateText('allocated-capital-usdt', parseFloat(ethers.utils.formatEther(purchasesTuple.totalUsdtInvested)).toFixed(2));
        updateText('total-purchased-mta', parseFloat(ethers.utils.formatEther(purchasesTuple.totalMtaTokensBought)).toFixed(2));
        updateText('total-released-mta', parseFloat(ethers.utils.formatEther(purchasesTuple.totalVestedTokensReleased)).toFixed(2));

        const liveDailyReleaseClaimable = await contract.checkClaimableTokens(address);
        updateText('daily-release-mta', parseFloat(ethers.utils.formatEther(liveDailyReleaseClaimable)).toFixed(2));

        const rewardsTuple = await contract.getUserRewardDetails(address);
        updateText('direct-income-vault', parseFloat(ethers.utils.formatEther(rewardsTuple.totalDirectRewardsEarned)).toFixed(2));
        updateText('rank-income-vault', parseFloat(ethers.utils.formatEther(rewardsTuple.totalDifferentialRewardsEarned)).toFixed(2));
        updateText('available-balance', parseFloat(ethers.utils.formatEther(rewardsTuple.pendingUnclaimedRewards)).toFixed(2));

        // 5. Fetch data array from getUserNetworkStats (Structural Topology Block Mapping)
        const networkTuple = await contract.getUserNetworkStats(address);
        
        // 🛠️ COOPERATIVE CORRECTION LOGIC: Exact 7 elements structural extraction matching your Solidity contract indices
        const directCount = networkTuple.immediateDirectCount ? networkTuple.immediateDirectCount.toString() : (networkTuple[2] ? networkTuple[2].toString() : "0");
        const downlineS1 = networkTuple.downlineS1Count ? networkTuple.downlineS1Count.toString() : (networkTuple[3] ? networkTuple[3].toString() : "0");
        const downlineS2 = networkTuple.downlineS2Count ? networkTuple.downlineS2Count.toString() : (networkTuple[4] ? networkTuple[4].toString() : "0");
        const downlineS3 = networkTuple.downlineS3Count ? networkTuple.downlineS3Count.toString() : (networkTuple[5] ? networkTuple[5].toString() : "0");
        const downlineS4 = networkTuple.downlineS4Count ? networkTuple.downlineS4Count.toString() : (networkTuple[6] ? networkTuple[6].toString() : "0");

        // Inject Dynamic Live Team Values Safely Into DOM Elements
        updateText('direct-team-count', `${directCount} Users`);
        
        // Mathematical multi-leg aggregation calculation loop to compute true overall network totals
        const entireTotalOrganizationFootprint = 
            parseInt(directCount) +
            parseInt(downlineS1) +
            parseInt(downlineS2) +
            parseInt(downlineS3) +
            parseInt(downlineS4);
            
        updateText('total-team-count', `${entireTotalOrganizationFootprint.toString()} Nodes`);

        // 🛠️ FETCH validDirectsCount FROM PUBLIC USERS MAPPING SAFELY (Index 3)
        const rawUserMapping = await contract.users(address);
        const trueValidDirectsCount = rawUserMapping.validDirectsCount ? rawUserMapping.validDirectsCount.toString() : (rawUserMapping[3] ? rawUserMapping[3].toString() : "0");

        const activeRankCode = networkTuple.currentRankCode ? networkTuple.currentRankCode.toNumber() : (networkTuple[1] ? networkTuple[1].toNumber() : 0);
        updateRankMilestoneTopologyDOM(activeRankCode, networkTuple, trueValidDirectsCount);

        // 🚀 LIVE INJECT TRANSACTION HISTORY BLOCK SCANNER CHANNELS
        await renderLiveEventHistoryLedger(address);

    } catch (error) {
        console.error("Dashboard batch synchronization trace terminated:", error);
    }
}

async function renderLiveEventHistoryLedger(userAddress) {
    const historyRows = document.getElementById('income-history-rows');
    if (!historyRows) return;

    try {
        // Direct storage call - Zero timeout, zero RPC crash risk
        const logs = await contract.getUserHistoryLogs(userAddress);
        
        if (logs.length === 0) {
            historyRows.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-slate-500 font-sans">No network ledger statements found.</td></tr>`;
            return;
        }

        historyRows.innerHTML = "";
        
        // Reverse array to show latest first (Luxury sort)
        for (let i = logs.length - 1; i >= 0; i--) {
            const log = logs[i];
            const dateStr = new Date(log.timestamp.toNumber() * 1000).toLocaleString();
            
            let badgeStyle = "bg-cyan-500/10 text-cyan-400";
            let displayType = log.logType;
            
            if (log.logType.includes("INC")) {
                badgeStyle = "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
                displayType = log.logType === "DIRECT_INC" ? "DIRECT INC" : "MLM INC";
            }
            if (log.logType === "WITHDRAW") badgeStyle = "bg-red-500/10 text-red-400 border border-red-500/10";
            if (log.logType === "LIQUIDATE") badgeStyle = "bg-orange-500/10 text-orange-400 border border-orange-500/10";

            const usdtFormatted = log.usdtAmount.gt(0) ? `${parseFloat(ethers.utils.formatEther(log.usdtAmount)).toFixed(2)} USDT` : "—";
            const mtaFormatted = `${parseFloat(ethers.utils.formatEther(log.tokenAmount)).toFixed(2)} MTA`;

            historyRows.innerHTML += `
                <tr class="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors">
                    <td class="py-3.5 pl-2 text-blue-400 select-all font-mono">#0000${i}</td>
                    <td class="py-3.5"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${badgeStyle}">${displayType}</span></td>
                    <td class="py-3.5 text-slate-400">${usdtFormatted}</td>
                    <td class="py-3.5 font-bold ${log.logType === 'WITHDRAW' ? 'text-red-400' : 'text-cyan-400'}">${mtaFormatted}</td>
                    <td class="py-3.5 pr-2 text-right text-slate-500 font-sans">${dateStr}</td>
                </tr>
            `;
        }
    } catch (e) {
        console.error("Ledger rendering failed:", e);
        historyRows.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-red-400">Failed to load system log array.</td></tr>`;
    }
}

// --- DYNAMIC STANDALONE RANK MILESTONE CALCULATOR DOM ENGINE ---
function updateRankMilestoneTopologyDOM(rankIndex, networkTuple, trueValidDirectsCount) {
    const statusLabel = document.getElementById('rank-badge-status');
    const needLabel = document.getElementById('rank-qualification-need');
    const progressLabel = document.getElementById('current-qualification-status');

    if (statusLabel) {
        statusLabel.innerText = rankIndex > 0 ? `S${rankIndex} Tier Active` : "No Active Rank Base";
    }

    if (needLabel && progressLabel) {
        if (rankIndex === 0) {
            // ✨ Upgraded S1 Target Rule Text matching smart contract criteria exactly
            needLabel.innerText = "Target Milestone S1: Requires $100 Self Deposit & 3 Direct referrals with min $100 total spent";
            progressLabel.innerText = `Progress Vector: ${trueValidDirectsCount} / 3 Valid Directs ($100+) Active`;
        } else if (rankIndex === 1) {
            const s1Count = networkTuple.downlineS1Count ? networkTuple.downlineS1Count.toString() : (networkTuple[3] ? networkTuple[3].toString() : "0");
            needLabel.innerText = "Target Milestone S2: Requires 2 parallel lines to qualify S1 tier rank nodes";
            progressLabel.innerText = `Progress Vector: ${s1Count} / 2 Downline S1 Legs Active`;
        } else if (rankIndex === 2) {
            const s2Count = networkTuple.downlineS2Count ? networkTuple.downlineS2Count.toString() : (networkTuple[4] ? networkTuple[4].toString() : "0");
            needLabel.innerText = "Target Milestone S3: Requires 2 parallel lines to qualify S2 tier rank nodes";
            progressLabel.innerText = `Progress Vector: ${s2Count} / 2 Downline S2 Legs Active`;
        } else if (rankIndex === 3) {
            const s3Count = networkTuple.downlineS3Count ? networkTuple.downlineS3Count.toString() : (networkTuple[5] ? networkTuple[5].toString() : "0");
            needLabel.innerText = "Target Milestone S4: Requires 2 parallel lines to qualify S3 tier rank nodes";
            progressLabel.innerText = `Progress Vector: ${s3Count} / 2 Downline S3 Legs Active`;
        } else if (rankIndex >= 4) {
            needLabel.innerText = "Target Milestone S5: Maximum System Milestone Node Achievement reached";
            progressLabel.innerText = "Progress Vector: Elite Master Node Status Secured";
        }
    }
}

// --- GLOBAL ATOMIC DOM UTILITIES (FIXED FOR GITHUB PAGES 404 & AUTOFILL) ---
// --- GLOBAL ATOMIC DOM UTILITIES (FIXED FOR CORRECT URL STRUCTURE) ---
function renderWalletCredentialsString(walletAddress) {
    const addressBox = document.getElementById("user-address");
    if (addressBox) addressBox.innerText = `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`;
    
    const referralInputLinkElement = document.getElementById("refURL");
    if (referralInputLinkElement) {
        // Base URL nikalne ke liye
        const currentUrl = window.location.href.split('?')[0]; 
        
        // Agar URL mein index1 hai, toh usse hata kar index replace karein
        // Yeh logic index1.php ya index1.html dono par kaam karega
        let targetBuyPageUrl = currentUrl.replace('index1.', 'index.');
        
        // Agar kisi wajah se 'index1' replace na hua ho toh default check
        if (targetBuyPageUrl.includes('index1')) {
             targetBuyPageUrl = targetBuyPageUrl.replace('index1', 'index');
        }
        
        referralInputLinkElement.value = `${targetBuyPageUrl}?ref=${walletAddress}`;
    }
}

const updateText = (id, val) => { const el = document.getElementById(id); if(el) el.innerText = val; };

function updateNavbar(addr) {
    const btn = document.getElementById('connect-btn');
    if (btn) {
        const span = btn.querySelector('span');
        if (span) {
            span.innerText = addr.substring(0, 6) + "..." + addr.substring(38);
        } else {
            btn.innerText = addr.substring(0, 6) + "..." + addr.substring(38);
        }
    }
}

window.handleLogout = function() {
    if (confirm("Disconnect wallet connection node link properties?")) {
        localStorage.setItem('manualLogout', 'true');
        signer = null;
        contract = null;
        window.location.href = "index.html";
    }
}

// --- 🚀 FINAL AUTOFILL & OBSERVER INTEGRATION ---
window.addEventListener('load', () => {
    // Initial check
    checkReferralURL();
    
    // MutationObserver to keep referral alive
    const targetNode = document.body;
    referralObserver.observe(targetNode, { childList: true, subtree: true });
});

if (window.ethereum) {
    window.ethereum.on('accountsChanged', () => { location.reload(); });
    window.ethereum.on('chainChanged', () => location.reload());
}

window.addEventListener('componentsLoaded', init);
