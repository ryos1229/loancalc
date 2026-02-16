// --- データ定義 & 管理 ---
const DEFAULT_BANKS = [
    { id: 'mufg', name: '三菱UFJ銀行', type: '都市銀行', color: '#dc2626', stressRate: 4.0, actualRate: 0.670, ratioConfig: { threshold: 400, below: 0.30, above: 0.35 } },
    { id: 'smbc', name: '三井住友銀行', type: '都市銀行', color: '#16a34a', stressRate: 4.0, actualRate: 0.595, ratioConfig: { threshold: 400, below: 0.30, above: 0.35 } },
    { id: 'mizuho', name: 'みずほ銀行', type: '都市銀行', color: '#2563eb', stressRate: 3.5, actualRate: 0.525, ratioConfig: { threshold: 400, below: 0.30, above: 0.35 } },
    { id: 'resona', name: 'りそな銀行', type: '都市銀行', color: '#65a30d', stressRate: 3.5, actualRate: 0.640, ratioConfig: { threshold: 400, below: 0.30, above: 0.35 } },
    { id: 'yokohama', name: '横浜銀行', type: '地方銀行', color: '#005BAA', stressRate: 3.2, actualRate: 0.780, ratioConfig: { threshold: 400, below: 0.35, above: 0.4 } },
    { id: 'shizuoka', name: '静岡銀行', type: '地方銀行', color: '#f68b1e', stressRate: 3.0, actualRate: 0.900, ratioConfig: { threshold: 400, below: 0.35, above: 0.4 } },
    { id: 'gunma', name: '群馬銀行', type: '地方銀行', color: '#00A040', stressRate: 3.35, actualRate: 1.145, ratioConfig: { threshold: 400, below: 0.35, above: 0.4 } },
    { id: 'ja', name: 'JAバンク', type: '協同組合', color: '#009944', stressRate: 1.5, actualRate: 0.875, ratioConfig: { threshold: 400, below: 0.35, above: 0.4 } },
    { id: 'rokin_member', name: '中央労金（組合員）', type: '労働金庫', color: '#f5cd00', stressRate: 0.965, actualRate: 0.875, ratioConfig: { threshold: 400, below: 0.35, above: 0.4 } },
    { id: 'rokin_coop', name: '中央労金（生協会員）', type: '労働金庫', color: '#f5cd00', stressRate: 1.195, actualRate: 1.055, ratioConfig: { threshold: 500, below: 0.35, above: 0.4 } },
    { id: 'sib_net', name: '住信SBIネット銀行', type: 'ネット銀行', color: '#0284c7', stressRate: 3.2, actualRate: 0.698, ratioConfig: { threshold: 0, below: 0.35, above: 0.35 } },
    { id: 'shinsei', name: 'SBI新生銀行', type: 'ネット銀行', color: '#003F6C', stressRate: 3.0, actualRate: 0.640, ratioConfig: { threshold: 300, below: 0, above: 0.4 } },
    { id: 'au_jibun', name: 'auじぶん銀行', type: 'ネット銀行', color: '#f97316', stressRate: 3.2, actualRate: 0.679, ratioConfig: { threshold: 0, below: 0.35, above: 0.35 } },
    { id: 'aeon', name: 'イオン銀行', type: 'ネット銀行', color: '#D0006F', stressRate: 3.5, actualRate: 0.780, ratioConfig: { threshold: 400, below: 0.4, above: 0.45 } },
    { id: 'flat35', name: 'フラット35', type: 'その他', color: '#84cc16', stressRate: 2.26, actualRate: 2.26, ratioConfig: { threshold: 400, below: 0.30, above: 0.35 } },
    { id: 'chunan', name: '中南信用金庫', type: '信用金庫・組合', color: '#E60012', stressRate: 0.945, actualRate: 0.945, ratioConfig: { threshold: 400, below: 0.35, above: 0.4 } }
];

const STORAGE_KEY = 'custom_banks_v4';

const hydrateBank = (bank) => {
    bank.getRepaymentRatio = (income) => {
        const thresholdYen = (bank.ratioConfig?.threshold || 400) * 10000;
        return (income < thresholdYen) ? (bank.ratioConfig?.below || 0.30) : (bank.ratioConfig?.above || 0.35);
    };
    return bank;
};

const getBanks = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try { return JSON.parse(stored).map(hydrateBank); } catch (e) { console.error(e); }
    }
    return JSON.parse(JSON.stringify(DEFAULT_BANKS)).map(hydrateBank);
};

// --- ユーティリティ ---
const formatYen = (val) => Math.round(val).toLocaleString('ja-JP');
const formatMan = (val) => Math.floor(val / 10000).toLocaleString('ja-JP');

// --- 計算ロジック ---
const calculateMaxLoan = (income, currentDebt, years, bank) => {
    const ratio = bank.getRepaymentRatio(income);
    const maxAnnualPayment = income * ratio;
    const availableAnnualPayment = maxAnnualPayment - currentDebt;
    if (availableAnnualPayment <= 0) return 0;

    const monthlyRate = bank.stressRate / 100 / 12;
    const numPayments = years * 12;
    const availableMonthly = availableAnnualPayment / 12;

    const loanAmount = availableMonthly * (1 - Math.pow(1 + monthlyRate, -numPayments)) / monthlyRate;
    const finalAmount = Math.min(loanAmount, income * 10);
    return Math.floor(finalAmount / 10000) * 10000;
};

const calculateMonthlyPayment = (P_total, years, rateYear, B_man, repaymentType) => {
    const n = years * 12;
    const r = rateYear / 100 / 12;
    const B = B_man * 10000;
    const nBonus = years * 2;

    let monthly = 0;
    let total = 0;

    if (repaymentType === 'equal-total') {
        if (rateYear === 0) {
            monthly = (P_total - (B * nBonus)) / n;
        } else {
            const r6 = r * 6;
            let pBonusLimit = B * (Math.pow(1 + r6, nBonus) - 1) / (r6 * Math.pow(1 + r6, nBonus));
            const pMonthlyPart = P_total - pBonusLimit;
            monthly = pMonthlyPart * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        }
        total = (monthly * n) + (B * nBonus); // 簡易総額
    } else {
        const principalPerMonth = (P_total - (B * nBonus)) / n;
        monthly = principalPerMonth + (P_total * r);
        total = P_total + ((P_total - (B * nBonus)) * r * (n + 1) / 2) + ((B * nBonus) * (r * 6) * (nBonus + 1) / 2);
    }

    return { monthly, total, interest: total - P_total, bonus: B };
};

// --- 返済予定表描画 ---
window.renderSchedule = () => {
    const body = document.getElementById('schedule-body');
    if (!body) return;

    const P_total = parseFloat(document.getElementById('loan-amount').value) * 10000;
    const years = parseFloat(document.getElementById('loan-years').value);
    const rateYear = parseFloat(document.getElementById('interest-rate').value);
    const bonusMan = parseFloat(document.getElementById('bonus-payment').value);
    const type = document.querySelector('input[name="repayment-type"]:checked').value;
    const freq = document.querySelector('input[name="schedule-freq"]:checked').value;

    body.innerHTML = '';
    const n = years * 12;
    const r = rateYear / 100 / 12;
    const B = bonusMan * 10000;
    let balance = P_total;

    let monthlyPrincipal = (P_total - (B * years * 2)) / n;
    let monthlyFull = 0;
    if (type === 'equal-total') {
        const r6 = r * 6;
        let pB = (rateYear === 0) ? (B * years * 2) : (B * (Math.pow(1 + r6, years * 2) - 1) / (r6 * Math.pow(1 + r6, years * 2)));
        monthlyFull = (rateYear === 0) ? ((P_total - pB) / n) : ((P_total - pB) * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    }

    let yT = 0, yP = 0, yI = 0, yB = 0;

    for (let i = 1; i <= n; i++) {
        let interest = balance * r;
        let principal = (type === 'equal-total') ? (monthlyFull - interest) : monthlyPrincipal;
        let bAdd = (i % 6 === 0) ? B : 0;

        if (i === n) { principal = balance; bAdd = 0; }
        balance -= principal;
        if (balance < 0) balance = 0;

        yT += (principal + interest + bAdd); yP += principal; yI += interest; yB += bAdd;

        if (freq === 'monthly') {
            const tr = document.createElement('tr');
            if (i % 12 === 0) tr.className = 'year-row';
            tr.innerHTML = `<td>${i}</td><td>${formatYen(principal + interest + bAdd)}</td><td>${formatYen(principal)}</td><td>${formatYen(interest)}</td><td>${bAdd ? formatYen(bAdd) : '-'}</td><td>${formatYen(balance)}</td>`;
            body.appendChild(tr);
        } else if (i % 12 === 0 || i === n) {
            const tr = document.createElement('tr');
            tr.className = 'year-row';
            tr.innerHTML = `<td>${Math.ceil(i / 12)}年目</td><td>${formatYen(yT)}</td><td>${formatYen(yP)}</td><td>${formatYen(yI)}</td><td>${yB ? formatYen(yB) : '-'}</td><td>${formatYen(balance)}</td>`;
            body.appendChild(tr);
            yT = 0; yP = 0; yI = 0; yB = 0;
        }
        if (balance <= 0) break;
    }
};

// --- メイン更新関数 ---
window.updatePayment = () => {
    const amountEl = document.getElementById('loan-amount');
    if (!amountEl) return;

    const amount = parseFloat(amountEl.value) * 10000;
    const years = parseFloat(document.getElementById('loan-years').value);
    const rate = parseFloat(document.getElementById('interest-rate').value);
    const bonus = parseFloat(document.getElementById('bonus-payment').value);
    const type = document.querySelector('input[name="repayment-type"]:checked').value;

    const res = calculateMonthlyPayment(amount, years, rate, bonus, type);

    document.getElementById('monthly-payment').innerHTML = `${formatYen(res.monthly)}<span>円${type === 'equal-principal' ? '(初回)' : ''}</span>`;
    document.getElementById('total-payment').innerHTML = `${formatYen(res.total)}<span>円</span>`;
    document.getElementById('total-interest').innerHTML = `${formatYen(res.interest)}<span>円</span>`;

    const bonusItem = document.getElementById('bonus-item');
    if (bonusItem) {
        if (res.bonus > 0) {
            bonusItem.style.display = 'block';
            document.getElementById('bonus-added').innerHTML = `${formatYen(res.bonus)}<span>円</span>`;
        } else {
            bonusItem.style.display = 'none';
        }
    }

    window.renderSchedule();
};

// --- 初期化 ---
// --- 初期化 ---
document.addEventListener('DOMContentLoaded', () => {
    // 自動更新ロジック (その日の初回起動時)
    const runAutoUpdate = async () => {
        const today = new Date().toLocaleDateString('ja-JP');
        const lastUpdate = localStorage.getItem('last_auto_update_date');

        if (lastUpdate === today) return;

        try {
            const res = await fetch('latest_rates.json?t=' + Date.now());
            if (!res.ok) return;
            const newRates = await res.json();
            if (!Array.isArray(newRates)) return;

            let currentBanks = getBanks();
            let updated = false;
            const bankMap = new Map(currentBanks.map(b => [b.id, b]));

            newRates.forEach(newBank => {
                if (bankMap.has(newBank.id)) {
                    // 既存銀行の更新（マージ）
                    const existing = bankMap.get(newBank.id);
                    // 重要な数値が変わっていたら更新
                    if (existing.stressRate !== newBank.stressRate ||
                        existing.actualRate !== newBank.actualRate ||
                        JSON.stringify(existing.ratioConfig) !== JSON.stringify(newBank.ratioConfig)) {

                        Object.assign(existing, newBank);
                        updated = true;
                    }
                } else {
                    // 新規/復活銀行の追加
                    currentBanks.push(hydrateBank(newBank));
                    updated = true;
                }
            });

            if (updated) {
                const dataToSave = currentBanks.map(({ getRepaymentRatio, ...rest }) => rest);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));

                // 通知の表示
                const msg = document.createElement('div');
                msg.textContent = '最新の金利情報を自動適用しました';
                msg.style.cssText = 'position:fixed; top:20px; right:20px; background:var(--primary); color:white; padding:12px 24px; border-radius:8px; z-index:9999; box-shadow:0 4px 12px rgba(0,0,0,0.15); font-weight:bold; animation: fadeOut 0.5s ease-in 4s forwards;';
                document.body.appendChild(msg);
                setTimeout(() => msg.remove(), 5000);

                // 設定画面ならリロード、そうでなければ再計算
                if (document.getElementById('settings-list')) {
                    setTimeout(() => location.reload(), 1000);
                } else {
                    if (typeof window.updatePayment === 'function') window.updatePayment();
                }
            }
            localStorage.setItem('last_auto_update_date', today);
        } catch (e) {
            console.error('Auto update failed:', e);
        }
    };
    runAutoUpdate();

    // タブ
    // タブ
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            if (!btn.dataset.tab) return; // data-tab属性がないボタン（印刷ボタンなど）は無視
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            // 全てのtab-btnからactiveを消すと、印刷ボタンや設定ボタンのスタイルも変わるかもしれないが、
            // 印刷ボタンは常時非activeでよいならOK。
            // ただし、nav-tabs内のボタンだけを制御したいなら、クラスで絞るか、親要素で絞るべき。
            // ここでは簡易的に、data-tabを持つものだけを「タブ」として扱う。
            // さらに、activeクラスの付与は「data-tabを持つボタン」間で行うべき。

            // 修正: activeクラスの操作も data-tab を持つ要素に限定する
            document.querySelectorAll('.tab-btn[data-tab]').forEach(t => t.classList.remove('active'));

            btn.classList.add('active');
            const target = document.getElementById(btn.dataset.tab);
            if (target) target.classList.add('active');

            if (btn.dataset.tab === 'tab-payment') window.updatePayment();
        };
    });

    // 借入
    const bForm = document.getElementById('borrow-form');
    if (bForm) {
        bForm.onsubmit = (e) => {
            e.preventDefault();
            const income = parseFloat(document.getElementById('income').value) * 10000;
            const debt = parseFloat(document.getElementById('debt').value) * 10000 || 0;
            const years = parseInt(document.getElementById('borrow-years').value);
            const banks = getBanks();
            const results = banks.map(bank => ({ bank, amount: calculateMaxLoan(income, debt, years, bank) })).sort((a, b) => b.amount - a.amount);

            const container = document.getElementById('borrow-results');
            container.innerHTML = '';
            results.forEach(({ bank, amount }) => {
                const actualRate = bank.actualRate ?? bank.stressRate;
                const card = document.createElement('div');
                card.className = 'result-card';
                card.style.borderLeft = `4px solid ${bank.color}`;
                card.innerHTML = `
                    <div class="bank-name">${bank.name} <span class="bank-type" style="background:${bank.color}22; color:${bank.color}">${bank.type}</span></div>
                    <div class="loan-amount">${formatMan(amount)} <span>万円</span></div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top:0.3rem;">審査金利: ${bank.stressRate}% / 適用金利: ${actualRate}%</div>
                    <button class="btn-apply" onclick="applyToPayment(${amount}, ${actualRate}, ${years})">この金額でシミュレーションへ</button>
                `;
                container.appendChild(card);
            });
            document.getElementById('borrow-results-actions').style.display = 'flex';
        };
    }

    // 返済
    const sync = (id1, id2) => {
        const el1 = document.getElementById(id1), el2 = document.getElementById(id2);
        if (!el1 || !el2) return;
        el1.oninput = () => { el2.value = el1.value; window.updatePayment(); };
        el2.oninput = () => { el1.value = el2.value; window.updatePayment(); };
    };
    sync('loan-amount', 'loan-amount-range');
    sync('loan-years', 'loan-years-range');
    sync('interest-rate', 'interest-rate-range');
    sync('bonus-payment', 'bonus-payment-range');

    document.querySelectorAll('input[name="repayment-type"], input[name="schedule-freq"]').forEach(i => {
        i.onchange = () => window.updatePayment();
    });

    if (document.getElementById('settings-list')) {
        initSettings();
    } else if (document.getElementById('loan-amount')) {
        window.updatePayment();
    }

    // Print Buttons
    const handlePrint = () => {
        const d = new Date();
        const dateStr = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
        document.getElementById('print-date').setAttribute('data-date', dateStr);
        window.print();
    };

    document.getElementById('borrow-print-btn')?.addEventListener('click', handlePrint);
    document.getElementById('payment-print-btn')?.addEventListener('click', handlePrint);
});

// --- 設定画面モジュール ---
const initSettings = () => {
    const listContainer = document.getElementById('settings-list');
    if (!listContainer) return;

    const BANK_TYPES = ['都市銀行', '地方銀行', '信託銀行', '協同組合', '労働金庫', 'ネット銀行', '信用金庫・組合', 'その他'];

    const showSaveBanner = () => {
        const banner = document.getElementById('save-banner');
        if (banner) {
            banner.classList.add('show');
            setTimeout(() => banner.classList.remove('show'), 2000);
        }
    };

    const saveBanks = (banks) => {
        const dataToSave = banks.map(({ getRepaymentRatio, ...rest }) => rest);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        showSaveBanner();
    };

    const render = () => {
        const scrollPos = window.scrollY;
        listContainer.innerHTML = '';
        const banks = getBanks();

        banks.forEach((bank, index) => {
            const card = document.createElement('div');
            card.className = 'bank-setting-card';
            card.style.borderLeft = `4px solid ${bank.color}`;

            card.innerHTML = `
                <div style="grid-column: 1/-1; display: flex; gap: 1rem; margin-bottom: 0.5rem; flex-wrap: wrap;">
                    <div class="form-group" style="flex: 2; min-width: 200px;">
                        <label>銀行名</label>
                        <input type="text" value="${bank.name}" class="name-input">
                    </div>
                    <div class="form-group" style="flex: 1; min-width: 120px;">
                        <label>種別</label>
                        <select class="type-select" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid var(--border); color:white; padding:0.5rem; border-radius:8px;">
                            ${BANK_TYPES.map(t => `<option value="${t}" ${t === bank.type ? 'selected' : ''} style="background:#1e293b">${t}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group" style="flex: 0.5;">
                        <label>カラー</label>
                        <input type="color" value="${bank.color}" style="height:40px; padding:2px; background:transparent; border:none; width:100%;">
                    </div>
                </div>
                <div style="grid-column: 1/-1; display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; background: rgba(0,0,0,0.1); padding: 1rem; border-radius: 8px;">
                    <div class="form-group">
                        <label>審査金利 (%)</label>
                        <input type="number" value="${bank.stressRate}" step="0.001">
                    </div>
                    <div class="form-group">
                        <label style="color: #60a5fa;">適用金利 (%)</label>
                        <input type="number" value="${bank.actualRate ?? bank.stressRate}" step="0.001" style="border-color: #60a5fa;">
                    </div>
                    <div class="form-group">
                        <label>基準年収 (万円)</label>
                        <input type="number" value="${bank.ratioConfig?.threshold || 400}">
                    </div>
                    <div class="form-group">
                        <label>基準未満比率 (%)</label>
                        <input type="number" value="${(bank.ratioConfig?.below || 0.3) * 100}">
                    </div>
                    <div class="form-group">
                        <label>基準以上比率 (%)</label>
                        <input type="number" value="${(bank.ratioConfig?.above || 0.35) * 100}">
                    </div>
                </div>
            `;

            const delBtn = document.createElement('button');
            delBtn.className = 'delete-btn';
            delBtn.innerHTML = '×';
            delBtn.title = '削除';
            delBtn.onclick = () => {
                if (confirm(`「${bank.name}」を一覧から削除してもよろしいですか？`)) {
                    const currentBanks = getBanks();
                    currentBanks.splice(index, 1);
                    saveBanks(currentBanks);
                    render();
                }
            };
            card.appendChild(delBtn);

            const inputs = card.querySelectorAll('input, select');
            inputs[0].onchange = (e) => { const b = getBanks(); b[index].name = e.target.value; saveBanks(b); };
            inputs[1].onchange = (e) => { const b = getBanks(); b[index].type = e.target.value; saveBanks(b); };
            inputs[2].onchange = (e) => { const b = getBanks(); b[index].color = e.target.value; saveBanks(b); render(); };
            inputs[3].onchange = (e) => { const b = getBanks(); b[index].stressRate = parseFloat(e.target.value); saveBanks(b); };
            inputs[4].onchange = (e) => { const b = getBanks(); b[index].actualRate = parseFloat(e.target.value); saveBanks(b); };
            inputs[5].onchange = (e) => { const b = getBanks(); b[index].ratioConfig.threshold = parseInt(e.target.value); saveBanks(b); };
            inputs[6].onchange = (e) => { const b = getBanks(); b[index].ratioConfig.below = parseFloat(e.target.value) / 100; saveBanks(b); };
            inputs[7].onchange = (e) => { const b = getBanks(); b[index].ratioConfig.above = parseFloat(e.target.value) / 100; saveBanks(b); };

            listContainer.appendChild(card);
        });
        window.scrollTo(0, scrollPos);
    };

    // イベント登録
    document.getElementById('toggle-add-form')?.addEventListener('click', () => {
        const sect = document.getElementById('add-bank-section');
        if (sect) sect.style.display = sect.style.display === 'none' ? 'block' : 'none';
    });

    document.getElementById('reset-defaults')?.addEventListener('click', () => {
        if (confirm('すべての設定を初期状態に戻しますか？')) {
            localStorage.removeItem(STORAGE_KEY);
            render();
            showSaveBanner();
        }
    });

    document.getElementById('apply-latest-rates')?.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!confirm('最新の金利ファイルで上書きしますか？')) return;
        try {
            const res = await fetch('latest_rates.json?t=' + Date.now());
            const data = await res.json();
            saveBanks(data);
            render();
            alert('最新データを適用しました。');
        } catch (err) { alert('失敗しました。'); }
    });

    // マスター更新用JSONのダウンロード
    document.getElementById('download-master-json')?.addEventListener('click', () => {
        if (!confirm('現在の設定を「latest_rates.json」としてダウンロードしますか？\n（このファイルをGitHubへアップロードすると、全ユーザーのデフォルト設定が更新されます）')) return;

        const data = getBanks();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'latest_rates.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // 設定のエクスポート（書き出し）
    document.getElementById('export-settings')?.addEventListener('click', () => {
        const data = getBanks();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `loancalc_settings_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // 設定のインポート（読み込み）ボタン
    document.getElementById('import-settings')?.addEventListener('click', () => {
        document.getElementById('import-file').click();
    });

    // ファイル選択時の処理
    document.getElementById('import-file')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                if (!Array.isArray(importedData)) {
                    throw new Error('無効なデータ形式です。');
                }
                if (confirm('現在の設定を上書きして読み込みますか？')) {
                    saveBanks(importedData);
                    render();

                    if (confirm('このデータを本日の最新金利情報として登録しますか？\n（OKを押すと、本日の自動更新済みとして扱われます）')) {
                        const today = new Date().toLocaleDateString('ja-JP');
                        localStorage.setItem('last_auto_update_date', today);
                        alert('設定を読み込み、本日の最新情報として登録しました。');
                    } else {
                        alert('設定を読み込みました。');
                    }
                }
            } catch (err) {
                console.error(err);
                alert('ファイルの読み込みに失敗しました。正しいJSONファイルを選択してください。');
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // 同じファイルを再度選択できるようにリセット
    });

    const addForm = document.getElementById('add-bank-form');
    if (addForm) {
        addForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newBank = {
                id: 'custom_' + Date.now(),
                name: document.getElementById('new-name').value,
                type: document.getElementById('new-type').value,
                color: document.getElementById('new-color').value,
                stressRate: parseFloat(document.getElementById('new-stress').value),
                actualRate: parseFloat(document.getElementById('new-actual-rate').value),
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
            addForm.reset();
            const sect = document.getElementById('add-bank-section');
            if (sect) sect.style.display = 'none';
        });
    }

    render();
};

// --- 引き継ぎ ---
window.applyToPayment = (amount, rate, years) => {
    document.getElementById('loan-amount').value = Math.floor(amount / 10000);
    document.getElementById('loan-amount-range').value = Math.floor(amount / 10000);
    document.getElementById('interest-rate').value = rate;
    document.getElementById('interest-rate-range').value = rate;
    document.getElementById('loan-years').value = years;
    document.getElementById('loan-years-range').value = years;

    const btn = document.querySelector('.tab-btn[data-tab="tab-payment"]');
    if (btn) btn.click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};
