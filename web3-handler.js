// --- METAAI (MTA) NATIVE PRESALE CORE WEB3 HANDLER ---

let provider, signer, contract, usdtContract;

const CONTRACT_ADDRESS = "0x4b9635C27D01E5862b77931FE284294e82433f93"; // MetaAI Contract Address
const USDT_ADDRESS = "0x3B66b1E08F55AF26c8eA14a73dA64b6bC8D799dE";     // BEP20 USDT Token Address

// Dynamic Variable Storage Matching Split Frontend Cards
window.userData = {
    isRegistered: false,
    userWallet: ""
};

// Exact Production ABI structured directly from your Solidity Contract code
const CONTRACT_ABI = [
    // --- Write Functions ---
    "function buyTokens(address _referrer, uint256 _usdtAmount) external",
    "function withdrawAvailableTokens() external",
    "function sellAvailableTokens() external",
    
    // --- View Lookups ---
    "function currentPhase() external view returns (uint256)",
    "function checkClaimableTokens(address _user) public view returns (uint256)",
    "function presalePhases(uint256) external view returns (uint256 price, uint256 maxSupply, uint256 sold, uint256 duration, uint256 startTime)",
    
    // --- Mapped Tuple Views ---
    "function getUserPurchaseDetails(address _userAddress) external view returns (uint256 totalUsdtInvested, uint256 totalMtaTokensBought, uint256 unreleasedVestedTokens, uint256 readyToReleaseVestedTokens, uint256 totalVestedTokensReleased)",
    "function getUserRewardDetails(address _userAddress) external view returns (uint256 totalDirectRewardsEarned, uint256 totalDifferentialRewardsEarned, uint256 pendingUnclaimedRewards, uint256 totalRewardsWithdrawnHistory)",
    "function getUserNetworkStats(address _userAddress) external view returns (address uplineReferrer, uint256 currentRankCode, uint256 immediateDirectCount, uint256 downlineS1Count, uint256 downlineS2Count, uint256 downlineS3Count, uint256 downlineS4Count)"
];

const USDT_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)"
];

// --- REFERRAL LINK TERMINAL AUTO-FILL ---
function checkReferralURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const refAddr = urlParams.get('ref');
    const refField = document.getElementById('reg-referrer'); // Element on Register Section

    if (refAddr && ethers.utils.isAddress(refAddr) && refField) {
        refField.value = refAddr;
        console.log("Referral string auto-loaded successfully:", refAddr);
    }
}

// --- INITIALIZATION TERMINAL PROTOCOL ---
async function init() {
    checkReferralURL();
    if (window.ethereum) {
        try {
            provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            signer = provider.getSigner();
            contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);

            if (accounts && accounts.length > 0) {
                if (localStorage.getItem('manualLogout') !== 'true') {
                    await setupApp(accounts[0]);
                } else {
                    updateNavbar(accounts[0]);
                }
            }
        } catch (error) { 
            console.error("Initialization Failed on Block Channel:", error); 
        }
    } else { 
        alert("Web3 Extension missing! Please run this dApp within Trust Wallet or MetaMask application."); 
    }
}

// --- MODULE 1: BUY NOW TOKEN INTERFACE ---
window.handleBuyToken = async function() {
    try {
        const inputAmount = document.getElementById('buy-usdt-amount').value;
        if (!inputAmount || parseFloat(inputAmount) < 100) {
            alert("Security Protocol Boundary: Minimum capital threshold is $100 USDT.");
            return;
        }

        const priceWei = ethers.utils.parseUnits(inputAmount.toString(), 18);
        const userAddress = await signer.getAddress();
        
        // Dynamic detection of referral address through window query strings
        const urlParams = new URLSearchParams(window.location.search);
        let referrerAddress = urlParams.get('ref') || "0x0000000000000000000000000000000000000000";

        const btn = document.getElementById('buy-now-btn');
        if(btn) { btn.disabled = true; btn.innerText = "APPROVING USDT..."; }

        // ERC20 Allowance Checking Mechanism
        const currentAllowance = await usdtContract.allowance(userAddress, CONTRACT_ADDRESS);
        if (currentAllowance.lt(priceWei)) {
            const approveTx = await usdtContract.approve(CONTRACT_ADDRESS, ethers.constants.MaxUint256);
            await approveTx.wait();
        }
        
        if(btn) btn.innerText = "SWAPPING ASSETS...";
        
        // Executes direct transaction block against buyTokens method
        const tx = await contract.buyTokens(referrerAddress, priceWei, { gasLimit: 300000 });
        alert("Transaction Broadcasted! Waiting for confirmation block...");
        await tx.wait();
        
        alert("Allocation successful! Node assets updated.");
        location.reload();
        
    } catch (err) { 
        console.error("Swap Core Failure Log:", err);
        alert("Transaction Aborted: " + (err.reason || err.message));
        location.reload();
    }
}

// --- MODULE 2: EXTRACT RELEASES FROM VAULT (WITHDRAW) ---
window.handleWithdrawAvailable = async function() {
    try {
        const tx = await contract.withdrawAvailableTokens();
        alert("Withdraw execution sequence transmitted...");
        await tx.wait();
        alert("Withdrawal successful! Tokens cleared into wallet ledger.");
        location.reload();
    } catch (err) { 
        console.error("Withdraw sequence reverted:", err);
        alert("Withdraw failed: " + (err.reason || err.message)); 
    }
}

// --- MODULE 3: INTERNAL CONTRACT SWAP & BURN DIRECT LIQUIDATOR ---
window.handleSwapAndBurn = async function() {
    try {
        if(!confirm("Are you sure you want to trigger immediate liquidation burn?")) return;
        
        const tx = await contract.sellAvailableTokens();
        alert("Liquidation token burn signal broadcasted...");
        await tx.wait();
        alert("Liquidation successful! Safe USDT capital routed back to wallet address.");
        location.reload();
    } catch (err) {
        console.error("Internal swap call aborted:", err);
        alert("Liquidation failed: " + (err.reason || err.message));
    }
}

// --- MODULE 4: LOGIN PROTOCOLS GATEWAY ---
window.handleLogin = async function() {
    try {
        if (!window.ethereum) return alert("MetaMask or Trust Wallet required to authenticate login nodes.");
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length === 0) return;
        
        const userAddress = accounts[0]; 
        signer = provider.getSigner();
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        localStorage.removeItem('manualLogout');
        
        // Query if user has total purchased assets inside the system
        const purchaseData = await contract.getUserPurchaseDetails(userAddress);
        const hasBoughtBefore = purchaseData.totalMtaTokensBought.gt(0);
        
        if (hasBoughtBefore) {
            window.location.href = "index1.html"; // Redirect to dashboard page
        } else {
            alert("No active account record matches this wallet hex footprint!");
            window.location.href = "index.html"; // Loops back to Allocation Interface
        }
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
        if (network.chainId !== 97) { 
            try {
                // Automatic switch network request call
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x61' }], // Hex decimal code for BSC Testnet Chain 97
                });
                
                alert("Network switched successfully! Syncing nodes...");
                location.reload();
                return;
            } catch (err) {
                console.error("Network switch rejection or error:", err);
                alert("Network Conflict: Processing requires switching to the BSC Testnet. Please change network inside your wallet app.");
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
        const currentPhaseIdx = await contract.currentPhase();
        const phaseObject = await contract.presalePhases(currentPhaseIdx);

        const tokenPriceString = ethers.utils.formatEther(phaseObject.price);
        const tokensSold = ethers.utils.formatEther(phaseObject.sold);
        const capacitySupplyMax = ethers.utils.formatEther(phaseObject.maxSupply);
        const supplyAvailableCalculated = parseFloat(capacitySupplyMax) - parseFloat(tokensSold);

        // Inject variables into matching standalone fields on layout panels
        updateText('total-sold-tokens', parseFloat(tokensSold).toLocaleString());
        updateText('available-supply', parseFloat(supplyAvailableCalculated).toLocaleString());
        
        const priceIndicatorLabel = document.getElementById('node-rate-display');
        if (priceIndicatorLabel) {
            priceIndicatorLabel.innerText = `$${parseFloat(tokenPriceString).toFixed(2)} USDT`;
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

        // 3. Fetch data calculation from checkClaimableTokens view (Daily Release Block Mapping)
        const liveDailyReleaseClaimable = await contract.checkClaimableTokens(address);
        updateText('daily-release-mta', parseFloat(ethers.utils.formatEther(liveDailyReleaseClaimable)).toFixed(2));

        // 4. Fetch data array from getUserRewardDetails (Monetary Yield Block Mapping)
        const rewardsTuple = await contract.getUserRewardDetails(address);
        updateText('direct-income-vault', parseFloat(ethers.utils.formatEther(rewardsTuple.totalDirectRewardsEarned)).toFixed(2));
        updateText('rank-income-vault', parseFloat(ethers.utils.formatEther(rewardsTuple.totalDifferentialRewardsEarned)).toFixed(2));
        updateText('available-balance', parseFloat(ethers.utils.formatEther(rewardsTuple.pendingUnclaimedRewards)).toFixed(2));

        // 5. Fetch data array from getUserNetworkStats (Structural Topology Block Mapping)
        const networkTuple = await contract.getUserNetworkStats(address);
        updateText('direct-team-count', `${networkTuple.immediateDirectCount.toString()} Users`);
        
        // Mathematical multi-leg aggregation calculation loop to compute true overall network totals
        const entireTotalOrganizationFootprint = 
            parseInt(networkTuple.immediateDirectCount) +
            parseInt(networkTuple.downlineS1Count) +
            parseInt(networkTuple.downlineS2Count) +
            parseInt(networkTuple.downlineS3Count) +
            parseInt(networkTuple.downlineS4Count);
        updateText('total-team-count', `${entireTotalOrganizationFootprint.toString()} Nodes`);

        // Rank validation mapping structures code parameters checks
        const activeRankCode = networkTuple.currentRankCode.toNumber();
        updateRankMilestoneTopologyDOM(activeRankCode, networkTuple);

    } catch (error) {
        console.error("Dashboard batch synchronization trace terminated:", error);
    }
}

// --- DYNAMIC STANDALONE RANK MILESTONE CALCULATOR DOM ENGINE ---
function updateRankMilestoneTopologyDOM(rankIndex, networkTuple) {
    const statusLabel = document.getElementById('rank-badge-status');
    const needLabel = document.getElementById('rank-qualification-need');
    const progressLabel = document.getElementById('current-qualification-status');

    if (statusLabel) {
        statusLabel.innerText = rankIndex > 0 ? `S${rankIndex} Tier Active` : "No Active Rank Base";
    }

    if (needLabel && progressLabel) {
        if (rankIndex === 0) {
            needLabel.innerText = "Target Milestone S1: Requires 3 Direct referrals to bind structural nodes";
            progressLabel.innerText = `Progress Vector: ${networkTuple.immediateDirectCount.toString()} / 3 Referrals Registered`;
        } else if (rankIndex === 1) {
            needLabel.innerText = "Target Milestone S2: Requires 2 parallel lines to qualify S1 tier rank nodes";
            progressLabel.innerText = `Progress Vector: ${networkTuple.downlineS1Count.toString()} / 2 Downline S1 Legs Active`;
        } else if (rankIndex === 2) {
            needLabel.innerText = "Target Milestone S3: Requires 2 parallel lines to qualify S2 tier rank nodes";
            progressLabel.innerText = `Progress Vector: ${networkTuple.downlineS2Count.toString()} / 2 Downline S2 Legs Active`;
        } else if (rankIndex === 3) {
            needLabel.innerText = "Target Milestone S4: Requires 2 parallel lines to qualify S3 tier rank nodes";
            progressLabel.innerText = `Progress Vector: ${networkTuple.downlineS3Count.toString()} / 2 Downline S3 Legs Active`;
        } else if (rankIndex >= 4) {
            needLabel.innerText = "Target Milestone S5: Maximum System Milestone Node Achievement reached";
            progressLabel.innerText = "Progress Vector: Elite Master Node Status Secured";
        }
    }
}

// --- GLOBAL ATOMIC DOM UTILITIES ---
function renderWalletCredentialsString(walletAddress) {
    const addressBox = document.getElementById("user-address");
    if (addressBox) addressBox.innerText = `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`;
    
    const referralInputLinkElement = document.getElementById("refURL");
    if (referralInputLinkElement) {
        referralInputLinkElement.value = `${window.location.origin}/index.html?ref=${walletAddress}`;
    }
}

const updateText = (id, val) => { const el = document.getElementById(id); if(el) el.innerText = val; };

function updateNavbar(addr) {
    const btn = document.getElementById('connect-btn');
    if(btn) btn.innerText = addr.substring(0,6) + "..." + addr.substring(38);
}

window.handleLogout = function() {
    if (confirm("Disconnect wallet connection node link properties?")) {
        localStorage.setItem('manualLogout', 'true');
        signer = null;
        contract = null;
        window.location.href = "index.html";
    }
}

if (window.ethereum) {
    window.ethereum.on('accountsChanged', () => { location.reload(); });
    window.ethereum.on('chainChanged', () => location.reload());
}

window.addEventListener('load', init);
