// Initial Default Configuration

const DEFAULT_BANKS = [
    {
        id: 'mufg',
        name: '三菱UFJ銀行',
        type: '都市銀行',
        color: '#dc2626',
        stressRate: 4.0,
        ratioConfig: { threshold: 400, below: 0.30, above: 0.35 },
        description: '審査金利 4.0% / 厳格審査'
    },
    {
        id: 'smbc',
        name: '三井住友銀行',
        type: '都市銀行',
        color: '#16a34a',
        stressRate: 4.0,
        ratioConfig: { threshold: 400, below: 0.30, above: 0.35 },
        description: '審査金利 4.0% / 安定重視'
    },
    {
        id: 'mizuho',
        name: 'みずほ銀行',
        type: '都市銀行',
        color: '#2563eb',
        stressRate: 3.5,
        ratioConfig: { threshold: 400, below: 0.30, above: 0.35 },
        description: '審査金利 3.5% / バランス'
    },
    {
        id: 'resona',
        name: 'りそな銀行',
        type: '都市銀行',
        color: '#65a30d',
        stressRate: 3.5,
        ratioConfig: { threshold: 400, below: 0.30, above: 0.35 },
        description: '審査金利 3.5% / 柔軟対応'
    },
    {
        id: 'resona_plus',
        name: 'りそな銀行（諸費用込み）',
        type: '都市銀行',
        color: '#65a30d',
        stressRate: 4.0, // Higher stress for over-loan
        ratioConfig: { threshold: 400, below: 0.30, above: 0.35 },
        description: '審査金利 4.0% / 諸費用込'
    },
    {
        id: 'smzb_trust',
        name: '三井住友信託銀行',
        type: '信託銀行',
        color: '#0f4c81',
        stressRate: 3.25,
        ratioConfig: { threshold: 400, below: 0.30, above: 0.35 },
        description: '審査金利 3.25% / 独自基準'
    },
    {
        id: 'yokohama',
        name: '横浜銀行',
        type: '地方銀行',
        color: '#005BAA',
        stressRate: 4.0,
        ratioConfig: { threshold: 400, below: 0.30, above: 0.35 },
        description: '審査金利 4.0% / 地域No.1'
    },
    {
        id: 'shizuoka',
        name: '静岡銀行',
        type: '地方銀行',
        color: '#f68b1e',
        stressRate: 3.8,
        ratioConfig: { threshold: 400, below: 0.30, above: 0.35 },
        description: '審査金利 3.8%(推定) / 柔軟'
    },
    {
        id: 'gunma',
        name: '群馬銀行',
        type: '地方銀行',
        color: '#00A040',
        stressRate: 3.8,
        ratioConfig: { threshold: 400, below: 0.30, above: 0.35 },
        description: '審査金利 3.8%(推定) / 地域密着'
    },
    {
        id: 'ja',
        name: 'JAバンク',
        type: '協同組織',
        color: '#009944',
        stressRate: 3.5,
        // JA has complex steps, but we simplify to standard config for user editability,
        // or we keep custom function if they don't edit.
        // Let's provide a editable config that mimics it roughly or standardizes it.
        // The previous logic was: <3m:25%, <4m:30%, <8m:35%, >8m:40%.
        // To fit the new 2-stage model, we'll simplify or use the standard model.
        // Let's use the standard model to allow editing, maybe initialized to 400/30/35 for consistency,
        // OR we can make the model usage flexible.
        // For now, to support the user request "edit above/below threshold", we unify to that model.
        ratioConfig: { threshold: 800, below: 0.35, above: 0.40 },
        description: '審査金利 3.5%(推定) / 高年収優遇'
    },
    {
        id: 'rokin_member',
        name: '中央労金（組合員）',
        type: '労働金庫',
        color: '#f5cd00',
        stressRate: 3.0, // Preferential treatment
        ratioConfig: { threshold: 400, below: 0.30, above: 0.35 },
        description: '審査金利 3.0%(推定) / 組合員優遇'
    },
    {
        id: 'rokin_coop',
        name: '中央労金（生協会員）',
        type: '労働金庫',
        color: '#f5cd00',
        stressRate: 3.2, // Slightly higher than member
        ratioConfig: { threshold: 400, below: 0.30, above: 0.35 },
        description: '審査金利 3.2%(推定) / 生協優遇'
    },
    {
        id: 'sib_net',
        name: '住信SBIネット銀行',
        type: 'ネット銀行',
        color: '#0284c7',
        stressRate: 3.0,
        ratioConfig: { threshold: 0, below: 0.35, above: 0.35 }, // Flat 35% effectively
        description: '審査金利 3.0% / 返済比率 35%'
    },
    {
        id: 'shinsei',
        name: 'SBI新生銀行',
        type: 'ネット銀行',
        color: '#003F6C',
        stressRate: 3.0,
        ratioConfig: { threshold: 0, below: 0.35, above: 0.35 },
        description: '審査金利 3.0% / 諸費用対応'
    },
    {
        id: 'au_jibun',
        name: 'auじぶん銀行',
        type: 'ネット銀行',
        color: '#f97316',
        stressRate: 3.0,
        ratioConfig: { threshold: 0, below: 0.35, above: 0.35 },
        description: '審査金利 3.0% / 返済比率 35%'
    },
    {
        id: 'aeon',
        name: 'イオン銀行',
        type: '流通系',
        color: '#D0006F',
        stressRate: 3.5,
        ratioConfig: { threshold: 400, below: 0.30, above: 0.35 },
        description: '審査金利 3.5% / お買物優遇'
    },
    {
        id: 'flat35',
        name: 'フラット35',
        type: '固定金利',
        color: '#84cc16',
        stressRate: 1.95,
        ratioConfig: { threshold: 400, below: 0.30, above: 0.35 },
        description: '審査金利 1.95% (実質) / 固定'
    },
    {
        id: 'chunan',
        name: '中南信用金庫',
        type: '信用金庫',
        color: '#E60012',
        stressRate: 3.5,
        ratioConfig: { threshold: 400, below: 0.30, above: 0.35 },
        description: '審査金利 3.5%(推定) / 地域密着'
    }
];

// Helper to reconstruct functions from stored data
const hydrateBank = (bank) => {
    // New Configurable Ratio Logic
    if (bank.ratioConfig) {
        bank.getRepaymentRatio = (income) => {
            // income is in Yen
            // threshold is in Man-yen (e.g. 400)
            const thresholdYen = bank.ratioConfig.threshold * 10000;
            if (income < thresholdYen) {
                return bank.ratioConfig.below;
            } else {
                return bank.ratioConfig.above;
            }
        };
        return bank;
    }

    // Fallback or Legacy Data handling
    if (bank.customRatio) {
        bank.getRepaymentRatio = () => bank.customRatio;
        return bank;
    }

    // Legacy Hardcoded Defaults (should rarely be hit with new defaults)
    bank.getRepaymentRatio = (income) => (income < 4000000 ? 0.30 : 0.35);
    return bank;
};

// Data Access Layer
const getBanks = () => {
    // Changed key to v2 to force update for users with old data
    const stored = localStorage.getItem('custom_banks_v2');
    if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map(hydrateBank);
    }
    return DEFAULT_BANKS.map(b => ({ ...b })).map(hydrateBank);
};

// Global function for Settings page
window.updateBank = (index, updates) => {
    let banksToSave;
    const stored = localStorage.getItem('custom_banks_v2');
    if (stored) {
        banksToSave = JSON.parse(stored);
    } else {
        banksToSave = JSON.parse(JSON.stringify(DEFAULT_BANKS));
    }

    // Apply updates
    banksToSave[index] = { ...banksToSave[index], ...updates };

    // Save
    localStorage.setItem('custom_banks_v2', JSON.stringify(banksToSave));

    // Trigger visual update if on settings page
    if (typeof showSaveBanner === 'function') showSaveBanner();
};

window.addBank = (bank) => {
    let banksToSave;
    const stored = localStorage.getItem('custom_banks_v2');
    if (stored) {
        banksToSave = JSON.parse(stored);
    } else {
        banksToSave = JSON.parse(JSON.stringify(DEFAULT_BANKS));
    }

    // Ensure ID is unique if not provided
    if (!bank.id) {
        bank.id = 'custom_' + Date.now();
    }

    banksToSave.push(bank);
    localStorage.setItem('custom_banks_v2', JSON.stringify(banksToSave));

    if (typeof showSaveBanner === 'function') showSaveBanner();
};

window.deleteBank = (index) => {
    let banksToSave;
    const stored = localStorage.getItem('custom_banks_v2');
    if (stored) {
        banksToSave = JSON.parse(stored);
    } else {
        banksToSave = JSON.parse(JSON.stringify(DEFAULT_BANKS));
    }

    if (banksToSave.length <= 1) {
        alert('少なくとも1つは銀行が必要です');
        return;
    }

    banksToSave.splice(index, 1);
    localStorage.setItem('custom_banks_v2', JSON.stringify(banksToSave));

    if (typeof showSaveBanner === 'function') showSaveBanner();
};


// Elements
const form = document.getElementById('calc-form');
const resultContainer = document.getElementById('results-container');
const emptyState = document.getElementById('empty-state');

// Utilities
const formatMoney = (amount) => {
    const man = Math.floor(amount / 10000);
    return man.toLocaleString();
};

const calculateMaxLoan = (income, currentDebt, years, bank) => {
    const ratio = bank.getRepaymentRatio(income);
    const maxAnnualPayment = income * ratio;
    const availableAnnualPayment = maxAnnualPayment - currentDebt;

    if (availableAnnualPayment <= 0) return 0;

    const availableMonthly = availableAnnualPayment / 12;
    const monthlyRate = bank.stressRate / 100 / 12;
    const numPayments = years * 12;

    const loanAmount = availableMonthly * (1 - Math.pow(1 + monthlyRate, -numPayments)) / monthlyRate;

    // Cap at 10x Annual Income
    const maxCap = income * 10;
    const finalAmount = Math.min(loanAmount, maxCap);

    return Math.floor(finalAmount / 10000) * 10000;
};

// Event Handler
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const incomeMan = parseFloat(document.getElementById('income').value);
        const debtMan = parseFloat(document.getElementById('debt').value) || 0;
        const years = parseInt(document.getElementById('years').value);

        if (!incomeMan || !years) return;

        const income = incomeMan * 10000;
        const currentDebt = debtMan * 10000;

        resultContainer.innerHTML = '';
        if (emptyState) emptyState.style.display = 'none';

        // Load latest settings
        const banks = getBanks();

        // Calculate and Sort by Amount (Descending)
        const results = banks.map(bank => {
            const ratio = bank.getRepaymentRatio(income);
            return {
                bank,
                ratio,
                amount: calculateMaxLoan(income, currentDebt, years, bank)
            };
        }).sort((a, b) => b.amount - a.amount);

        results.forEach((item, index) => {
            const { bank, amount, ratio } = item;

            const card = document.createElement('div');
            card.className = 'result-card';
            card.style.animationDelay = `${index * 50}ms`;
            card.style.borderLeft = `4px solid ${bank.color}`;

            card.innerHTML = `
                <div class="bank-info">
                    <div class="bank-name">${bank.name}</div>
                    <div class="bank-details">
                        <span class="badge" style="background: ${bank.color}33; color: ${bank.color}">${bank.type}</span>
                        <span class="badge">審査金利 ${bank.stressRate}%</span>
                        <span class="badge" style="opacity: 0.7;">${(ratio * 100).toFixed(1)}%上限</span>
                    </div>
                </div>
                <div class="loan-amount">
                    ${formatMoney(amount)} <span>万円</span>
                </div>
            `;

            resultContainer.appendChild(card);
        });
    });
}
window.getBanks = getBanks; // Expose for settings page
