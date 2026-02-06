// --- データ定義 ---
const DEFAULT_BANKS = [
    { id: 'mufg', name: '三菱UFJ銀行', type: '都市銀行', color: '#dc2626', stressRate: 4.0, ratioConfig: { threshold: 400, below: 0.30, above: 0.35 }, description: '審査金利 4.0% / 厳格審査' },
    { id: 'smbc', name: '三井住友銀行', type: '都市銀行', color: '#16a34a', stressRate: 4.0, ratioConfig: { threshold: 400, below: 0.30, above: 0.35 }, description: '審査金利 4.0% / 安定重視' },
    { id: 'mizuho', name: 'みずほ銀行', type: '都市銀行', color: '#2563eb', stressRate: 3.5, ratioConfig: { threshold: 400, below: 0.30, above: 0.35 }, description: '審査金利 3.5% / バランス' },
    { id: 'resona', name: 'りそな銀行', type: '都市銀行', color: '#65a30d', stressRate: 3.5, ratioConfig: { threshold: 400, below: 0.30, above: 0.35 }, description: '審査金利 3.5% / 柔軟対応' },
    { id: 'resona_plus', name: 'りそな銀行（諸費用込み）', type: '都市銀行', color: '#65a30d', stressRate: 4.0, ratioConfig: { threshold: 400, below: 0.30, above: 0.35 }, description: '審査金利 4.0% / 諸費用込' },
    { id: 'smzb_trust', name: '三井住友信託銀行', type: '信託銀行', color: '#0f4c81', stressRate: 3.25, ratioConfig: { threshold: 400, below: 0.30, above: 0.35 }, description: '審査金利 3.25% / 独自基準' },
    { id: 'yokohama', name: '横浜銀行', type: '地方銀行', color: '#005BAA', stressRate: 4.0, ratioConfig: { threshold: 400, below: 0.30, above: 0.35 }, description: '審査金利 4.0% / 地域No.1' },
    { id: 'shizuoka', name: '静岡銀行', type: '地方銀行', color: '#f68b1e', stressRate: 3.8, ratioConfig: { threshold: 400, below: 0.30, above: 0.35 }, description: '審査金利 3.8%(推定) / 柔軟' },
    { id: 'gunma', name: '群馬銀行', type: '地方銀行', color: '#00A040', stressRate: 3.8, ratioConfig: { threshold: 400, below: 0.30, above: 0.35 }, description: '審査金利 3.8%(推定) / 地域密着' },
    { id: 'ja', name: 'JAバンク', type: '協同組織', color: '#009944', stressRate: 3.5, ratioConfig: { threshold: 800, below: 0.35, above: 0.40 }, description: '審査金利 3.5%(推定) / 高年収優遇' },
    { id: 'rokin_member', name: '中央労金（組合員）', type: '労働金庫', color: '#f5cd00', stressRate: 3.0, ratioConfig: { threshold: 400, below: 0.30, above: 0.35 }, description: '審査金利 3.0%(推定) / 組合員優遇' },
    { id: 'rokin_coop', name: '中央労金（生協会員）', type: '労働金庫', color: '#f5cd00', stressRate: 3.2, ratioConfig: { threshold: 400, below: 0.30, above: 0.35 }, description: '審査金利 3.2%(推定) / 生協優遇' },
    { id: 'sib_net', name: '住信SBIネット銀行', type: 'ネット銀行', color: '#0284c7', stressRate: 3.0, ratioConfig: { threshold: 0, below: 0.35, above: 0.35 }, description: '審査金利 3.0% / 返済比率 35%' },
    { id: 'shinsei', name: 'SBI新生銀行', type: 'ネット銀行', color: '#003F6C', stressRate: 3.0, ratioConfig: { threshold: 0, below: 0.35, above: 0.35 }, description: '審査金利 3.0% / 諸費用対応' },
    { id: 'au_jibun', name: 'auじぶん銀行', type: 'ネット銀行', color: '#f97316', stressRate: 3.0, ratioConfig: { threshold: 0, below: 0.35, above: 0.35 }, description: '審査金利 3.0% / 返済比率 35%' },
    { id: 'aeon', name: 'イオン銀行', type: '流通系', color: '#D0006F', stressRate: 3.5, ratioConfig: { threshold: 400, below: 0.30, above: 0.35 }, description: '審査金利 3.5% / お買物優遇' },
    { id: 'flat35', name: 'フラット35', type: '固定金利', color: '#84cc16', stressRate: 1.95, ratioConfig: { threshold: 400, below: 0.30, above: 0.35 }, description: '審査金利 1.95% (実質) / 固定' },
    { id: 'chunan', name: '中南信用金庫', type: '信用金庫', color: '#E60012', stressRate: 3.5, ratioConfig: { threshold: 400, below: 0.30, above: 0.35 }, description: '審査金利 3.5%(推定) / 地域密着' }
];

const STORAGE_KEY = 'custom_banks_v2';

// --- データ管理ロジック ---
const hydrateBank = (bank) => {
    if (bank.ratioConfig) {
        bank.getRepaymentRatio = (income) => {
            const thresholdYen = bank.ratioConfig.threshold * 10000;
            return income < thresholdYen ? bank.ratioConfig.below : bank.ratioConfig.above;
        };
    } else {
        bank.getRepaymentRatio = (income) => (income < 4000000 ? 0.30 : 0.35);
    }
    return bank;
};

const getBanks = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored).map(hydrateBank);
        } catch (e) {
            console.error('Failed to parse stored banks', e);
        }
    }
    return JSON.parse(JSON.stringify(DEFAULT_BANKS)).map(hydrateBank);
};

const saveBanks = (banks) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(banks));
    if (typeof showSaveBanner === 'function') showSaveBanner();
};

// --- 計算ロジック ---
const calculateMaxLoan = (income, currentDebt, years, bank) => {
    const ratio = bank.getRepaymentRatio(income);
    const maxAnnualPayment = income * ratio;
    const availableAnnualPayment = maxAnnualPayment - currentDebt;
    if (availableAnnualPayment <= 0) return 0;

    const availableMonthly = availableAnnualPayment / 12;
    const monthlyRate = bank.stressRate / 100 / 12;
    const numPayments = years * 12;
    const loanAmount = availableMonthly * (1 - Math.pow(1 + monthlyRate, -numPayments)) / monthlyRate;

    const maxCap = income * 10;
    return Math.min(Math.floor(loanAmount / 10000) * 10000, maxCap);
};

// --- UI制御 (共通) ---
const formatMoney = (amount) => (Math.floor(amount / 10000)).toLocaleString();

const showSaveBanner = () => {
    const banner = document.getElementById('save-banner');
    if (banner) {
        banner.classList.add('show');
        setTimeout(() => banner.classList.remove('show'), 2000);
    }
};

// --- 初期化: シミュレーター画面 ---
const initCalculator = () => {
    const form = document.getElementById('calc-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const incomeMan = parseFloat(document.getElementById('income').value);
        const debtMan = parseFloat(document.getElementById('debt').value) || 0;
        const years = parseInt(document.getElementById('years').value);
        const resultContainer = document.getElementById('results-container');
        const emptyState = document.getElementById('empty-state');

        if (!incomeMan || !years || !resultContainer) return;

        const income = incomeMan * 10000;
        const currentDebt = debtMan * 10000;
        resultContainer.innerHTML = '';
        if (emptyState) emptyState.style.display = 'none';

        const banks = getBanks();
        const results = banks.map(bank => ({
            bank,
            ratio: bank.getRepaymentRatio(income),
            amount: calculateMaxLoan(income, currentDebt, years, bank)
        })).sort((a, b) => b.amount - a.amount);

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
                <div class="loan-amount">${formatMoney(amount)} <span>万円</span></div>
            `;
            resultContainer.appendChild(card);
        });
    });
};

// --- 初期化: 設定画面 ---
const initSettings = () => {
    const listContainer = document.getElementById('settings-list');
    if (!listContainer) return;

    const BANK_TYPES = ['都市銀行', '地方銀行', '信託銀行', '協同組合', '労働金庫', 'ネット銀行', '信用金庫・組合', 'その他'];

    const createInputGroup = (label, value, suffix, step, onChange) => {
        const group = document.createElement('div');
        group.className = 'form-group';
        group.innerHTML = `<label>${label}</label><div class="input-wrapper"><input type="number" value="${value}" step="${step}"><span class="unit">${suffix}</span></div>`;
        group.querySelector('input').addEventListener('change', (e) => onChange(e.target.value));
        return group;
    };

    const render = () => {
        const scrollPos = window.scrollY;
        listContainer.innerHTML = '';
        const banks = getBanks();

        banks.forEach((bank, index) => {
            const card = document.createElement('div');
            card.className = 'bank-setting-card';

            // 基本情報
            const topRow = document.createElement('div');
            topRow.className = 'row';
            topRow.style.gridColumn = '1/-1';
            topRow.style.marginBottom = '0.5rem';
            topRow.style.paddingRight = '2.5rem';

            // 銀行名
            const nameGrp = document.createElement('div');
            nameGrp.className = 'form-group';
            nameGrp.innerHTML = `<label>銀行名</label><div class="input-wrapper"><input type="text" value="${bank.name}"></div>`;
            nameGrp.querySelector('input').addEventListener('change', (e) => {
                const currentBanks = getBanks();
                currentBanks[index].name = e.target.value;
                saveBanks(currentBanks);
            });
            topRow.appendChild(nameGrp);

            // 種別
            const typeGrp = document.createElement('div');
            typeGrp.className = 'form-group';
            let optionsHtml = BANK_TYPES.map(t => `<option value="${t}" ${t === bank.type ? 'selected' : ''} style="background:#1e293b">${t}</option>`).join('');
            typeGrp.innerHTML = `<label>種別</label><div class="input-wrapper"><select style="width:100%;background:transparent;border:none;color:var(--text-main);font-size:1.1rem;font-weight:500;outline:none;">${optionsHtml}</select></div>`;
            typeGrp.querySelector('select').addEventListener('change', (e) => {
                const currentBanks = getBanks();
                currentBanks[index].type = e.target.value;
                saveBanks(currentBanks);
            });
            topRow.appendChild(typeGrp);
            card.appendChild(topRow);

            // 削除ボタン
            const delBtn = document.createElement('button');
            delBtn.className = 'delete-btn';
            delBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
            delBtn.onclick = () => {
                if (confirm(`${bank.name} を削除しますか？`)) {
                    const currentBanks = getBanks();
                    currentBanks.splice(index, 1);
                    saveBanks(currentBanks);
                    render();
                }
            };
            card.appendChild(delBtn);

            // 審査金利
            const stressRow = document.createElement('div');
            stressRow.style.gridColumn = '1/-1';
            stressRow.appendChild(createInputGroup('審査金利', bank.stressRate, '%', '0.001', (val) => {
                const currentBanks = getBanks();
                currentBanks[index].stressRate = parseFloat(val);
                saveBanks(currentBanks);
            }));
            card.appendChild(stressRow);

            // 返済比率設定
            const config = bank.ratioConfig || { threshold: 400, below: 0.3, above: 0.35 };
            const ratioSection = document.createElement('div');
            ratioSection.className = 'ratio-config-section'; // CSSでスタイル調整可能
            ratioSection.style = 'grid-column:1/-1; background:rgba(0,0,0,0.2); padding:1rem; border-radius:12px; margin-top:0.5rem;';
            ratioSection.innerHTML = '<h4 style="margin-bottom:0.75rem; color:var(--text-muted); font-size:0.9rem;">返済比率設定</h4>';
            const ratioGrid = document.createElement('div');
            ratioGrid.style = 'display:grid; grid-template-columns:repeat(auto-fit, minmax(140px,1fr)); gap:1rem;';
            
            ratioGrid.appendChild(createInputGroup('基準年収', config.threshold, '万円', '1', (val) => {
                const currentBanks = getBanks();
                currentBanks[index].ratioConfig.threshold = parseInt(val);
                saveBanks(currentBanks);
            }));
            ratioGrid.appendChild(createInputGroup('基準未満', config.below * 100, '%', '1', (val) => {
                const currentBanks = getBanks();
                currentBanks[index].ratioConfig.below = parseFloat(val) / 100;
                saveBanks(currentBanks);
            }));
            ratioGrid.appendChild(createInputGroup('基準以上', config.above * 100, '%', '1', (val) => {
                const currentBanks = getBanks();
                currentBanks[index].ratioConfig.above = parseFloat(val) / 100;
                saveBanks(currentBanks);
            }));
            ratioSection.appendChild(ratioGrid);
            card.appendChild(ratioSection);

            listContainer.appendChild(card);
        });
        window.scrollTo(0, scrollPos);
    };

    // 初期化イベント
    document.getElementById('reset-defaults').onclick = () => {
        if (confirm('すべての設定を初期値に戻しますか？')) {
            localStorage.removeItem(STORAGE_KEY);
            render();
            showSaveBanner();
        }
    };

    document.getElementById('add-bank-form').onsubmit = (e) => {
        e.preventDefault();
        const newBank = {
            id: 'custom_' + Date.now(),
            name: document.getElementById('new-name').value,
            type: document.getElementById('new-type').value,
            color: document.getElementById('new-color').value,
            stressRate: parseFloat(document.getElementById('new-stress').value),
            ratioConfig: {
                threshold: parseInt(document.getElementById('new-threshold').value),
                below: parseFloat(document.getElementById('new-ratio-below').value) / 100,
                above: parseFloat(document.getElementById('new-ratio-above').value) / 100
            }
        };
        const currentBanks = getBanks();
        currentBanks.push(newBank);
        saveBanks(currentBanks);
        render();
        e.target.reset();
        window.scrollTo(0, document.body.scrollHeight);
    };

    render();
};

// --- 実行 ---
document.addEventListener('DOMContentLoaded', () => {
    initCalculator();
    initSettings();
});
