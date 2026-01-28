/**
 * UI Controller for DCF Super Calculator v1.0
 */

document.addEventListener('DOMContentLoaded', () => {
    // State Management
    let currentStep = 1;
    let chart = null;
    let detailedProjections = [];

    // DOM Elements
    const steps = document.querySelectorAll('.step');
    const stepContents = document.querySelectorAll('.step-content');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const excelPaste = document.getElementById('excelPaste');
    const previewTable = document.getElementById('previewTable');
    const dataPreview = document.getElementById('dataPreview');

    // Initialization
    const init = () => {
        setupEventListeners();
        updateUI();
    };

    const setupEventListeners = () => {
        nextBtn.addEventListener('click', () => changeStep(1));
        prevBtn.addEventListener('click', () => changeStep(-1));

        excelPaste.addEventListener('input', () => {
            const data = DCFLite.parseSpreadsheetData(excelPaste.value);
            renderPreview(data);
            autoPopulateFromData(data);
        });

        document.querySelectorAll('input, select').forEach(el => {
            el.addEventListener('input', updateUI);
        });

        document.getElementById('modelType').addEventListener('change', (e) => {
            const label = document.getElementById('discountRateLabel');
            label.innerText = (e.target.value === 'levered') ? 'Cost of Equity (%)' : 'Discount Rate (WACC) (%)';
            updateUI();
        });

        document.getElementById('tvMethod').addEventListener('change', (e) => {
            const inputLabel = document.getElementById('tvInputLabel');
            const metricGroup = document.getElementById('metricGroup');
            if (e.target.value === 'growth') {
                inputLabel.innerText = 'LT Growth (%)';
                metricGroup.classList.add('hidden');
            } else {
                inputLabel.innerText = 'Exit EBITDA Multiple (x)';
                metricGroup.classList.remove('hidden');
            }
            updateUI();
        });

        document.getElementById('toggleSensitivity').addEventListener('change', (e) => {
            document.querySelector('.sensitivity-card').classList.toggle('hidden', !e.target.checked);
        });

        document.getElementById('toggleCredit').addEventListener('change', (e) => {
            const panel = document.getElementById('creditMetricsPanel');
            if (panel) panel.classList.toggle('hidden', !e.target.checked);
        });

        document.getElementById('toggleInvestment').addEventListener('change', (e) => {
            const panel = document.getElementById('investmentWorthinessPanel');
            if (panel) panel.classList.toggle('hidden', !e.target.checked);
        });

        document.getElementById('toggleExport').addEventListener('change', (e) => {
            const card = document.getElementById('exportCard');
            if (card) card.classList.toggle('hidden', !e.target.checked);
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            exportToExcel();
        });

        // Initialize visibility
        const toggleInv = document.getElementById('toggleInvestment');
        if (toggleInv) document.getElementById('investmentWorthinessPanel').classList.toggle('hidden', !toggleInv.checked);

        const toggleExp = document.getElementById('toggleExport');
        if (toggleExp) document.getElementById('exportCard').classList.toggle('hidden', !toggleExp.checked);
    };

    const changeStep = (dir) => {
        currentStep += dir;
        updateStepUI();
    };

    const updateStepUI = () => {
        steps.forEach((s, i) => s.classList.toggle('active', i + 1 === currentStep));
        stepContents.forEach((c, i) => c.classList.toggle('active', i + 1 === currentStep));

        prevBtn.classList.toggle('hidden', currentStep === 1);
        nextBtn.classList.toggle('hidden', currentStep === 4);

        if (currentStep === 1) nextBtn.innerText = 'Continue to Variables';
        else if (currentStep === 2) nextBtn.innerText = 'Continue to FCF Model';
        else if (currentStep === 3) nextBtn.innerText = 'Evaluate Credit & NCF';

        updateUI();
    };

    const renderPreview = (data) => {
        if (data.length === 0) {
            dataPreview.classList.add('hidden');
            return;
        }
        dataPreview.classList.remove('hidden');
        let html = "";
        data.slice(0, 5).forEach((row, rowIndex) => {
            html += "<tr>";
            row.forEach(cell => {
                html += rowIndex === 0 ? `<th>${cell}</th>` : `<td>${cell}</td>`;
            });
            html += "</tr>";
        });
        previewTable.innerHTML = html;
    };

    const autoPopulateFromData = (data) => {
        data.forEach(row => {
            const key = String(row[0]).toLowerCase();
            const val = row[row.length - 1];
            if (key.includes('unit') || key.includes('volume')) document.getElementById('units').value = val;
            if (key.includes('price')) document.getElementById('price').value = val;
            if (key.includes('debt')) document.getElementById('netDebt').value = val;
            if (key.includes('shares')) document.getElementById('shares').value = val;
        });
    };

    const updateUI = () => {
        const inputs = {
            units: parseFloat(document.getElementById('units').value) || 0,
            price: parseFloat(document.getElementById('price').value) || 0,
            unitGrowth: (parseFloat(document.getElementById('unitGrowth').value) || 0) / 100,
            priceGrowth: (parseFloat(document.getElementById('priceGrowth').value) || 0) / 100,
            cogsPct: parseFloat(document.getElementById('cogsPct').value) || 0,
            sgaPct: parseFloat(document.getElementById('sgaPct').value) || 0,
            daPct: parseFloat(document.getElementById('daPct').value) || 0,
            taxRate: parseFloat(document.getElementById('taxRate').value) || 0,
            capexPct: parseFloat(document.getElementById('capexPct').value) || 0,
            nwcPct: parseFloat(document.getElementById('nwcPct').value) || 0,
            interestExpense: parseFloat(document.getElementById('interestExpense').value) || 0,
            netBorrowing: parseFloat(document.getElementById('netBorrowing').value) || 0,
            netDebt: parseFloat(document.getElementById('netDebt').value) || 0,
            sharesOutstanding: parseFloat(document.getElementById('shares').value) || 1,
            discountRate: (parseFloat(document.getElementById('discountRate').value) || 0) / 100,
            marketPrice: parseFloat(document.getElementById('marketPrice').value) || 0,
            tvMethod: document.getElementById('tvMethod').value,
            tvInput: document.getElementById('tvMethod').value === 'growth'
                ? (parseFloat(document.getElementById('tvInput').value) || 0) / 100
                : (parseFloat(document.getElementById('tvInput').value) || 0),
            midYear: document.getElementById('midYear').checked,
            modelType: document.getElementById('modelType').value
        };

        detailedProjections = DCFLite.projectDetailedFinancials({ ...inputs, years: 5 });

        const lastYear = detailedProjections[detailedProjections.length - 1];

        let sumPV = 0;
        detailedProjections.forEach(p => {
            const val = (inputs.modelType === 'levered') ? p.lfcf : p.ufcf;
            p.pv = DCFLite.calculatePV(val, inputs.discountRate, p.year, inputs.midYear);
            sumPV += p.pv;
        });

        let terminalValue = 0;
        if (inputs.tvMethod === 'growth') {
            const finalCash = (inputs.modelType === 'levered') ? lastYear.lfcf : lastYear.ufcf;
            terminalValue = DCFLite.calculateTVGrowth(finalCash, inputs.tvInput, inputs.discountRate);
        } else {
            terminalValue = DCFLite.calculateTVMultiple(lastYear.ebitda, inputs.tvInput);
        }

        const pvOfTV = DCFLite.calculatePV(terminalValue, inputs.discountRate, 5, inputs.midYear);

        let equityValue, enterpriseValue;
        if (inputs.modelType === 'levered') {
            equityValue = sumPV + pvOfTV;
            enterpriseValue = equityValue + inputs.netDebt;
        } else {
            enterpriseValue = sumPV + pvOfTV;
            equityValue = enterpriseValue - inputs.netDebt;
        }

        const sharePrice = equityValue / inputs.sharesOutstanding;

        document.getElementById('impliedPrice').innerText = sharePrice.toFixed(2);
        document.getElementById('enterpriseValue').innerText = `$${enterpriseValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}M`;
        document.getElementById('equityValue').innerText = `$${equityValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}M`;

        const credit = DCFLite.calculateCreditMetrics(lastYear.ebit, inputs.interestExpense, inputs.netDebt, lastYear.ebitda);
        document.getElementById('intCoverage').innerText = `${credit.interestCoverage.toFixed(1)}x`;
        document.getElementById('debtEbitda').innerText = `${credit.debtToEbitda.toFixed(1)}x`;

        const creditStatus = document.getElementById('creditStatus');
        if (credit.interestCoverage > 3 && credit.debtToEbitda < 4) {
            creditStatus.innerHTML = '<p style="color: #10b981;">Strong Credit Profile: Investment Grade.</p>';
        } else {
            creditStatus.innerHTML = '<p style="color: #f59e0b;">Covenant Warning: High Leverage detected.</p>';
        }

        // 5. Investment Metrics (IRR, Upside, Verdict)
        const cfForIRR = detailedProjections.map(p => (inputs.modelType === 'levered' ? p.lfcf : p.ufcf));
        const tvForIRR = terminalValue;
        const targetValue = (inputs.modelType === 'levered')
            ? (inputs.marketPrice * inputs.sharesOutstanding)
            : (inputs.marketPrice * inputs.sharesOutstanding + inputs.netDebt);

        const irr = DCFLite.calculateIRR(cfForIRR, tvForIRR, targetValue, inputs.midYear);
        const upside = inputs.marketPrice > 0 ? (sharePrice / inputs.marketPrice) - 1 : 0;
        const mos = sharePrice > 0 ? (1 - (inputs.marketPrice / sharePrice)) * 100 : 0;
        const verdict = DCFLite.getInvestmentVerdict(upside, irr, inputs.discountRate);

        document.getElementById('irrValue').innerText = `${(irr * 100).toFixed(1)}%`;
        document.getElementById('upsideValue').innerText = `${(upside * 100).toFixed(1)}%`;
        document.getElementById('mosValue').innerText = `${mos.toFixed(1)}%`;

        const vValue = document.getElementById('verdictValue');
        vValue.innerText = verdict.label;
        vValue.style.color = verdict.color;

        document.getElementById('upsideValue').style.color = upside >= 0 ? "#10b981" : "#ef4444";

        renderChart(detailedProjections);
        renderSensitivity(inputs, (p) => {
            const tempProjs = DCFLite.projectDetailedFinancials({ ...p, years: 5 });
            let sPV = 0;
            tempProjs.forEach(tp => {
                const tv = (p.modelType === 'levered') ? tp.lfcf : tp.ufcf;
                sPV += DCFLite.calculatePV(tv, p.discountRate, tp.year, p.midYear);
            });
            const lY = tempProjs[tempProjs.length - 1];
            let tV = 0;
            if (p.tvMethod === 'growth') {
                const fc = (p.modelType === 'levered') ? lY.lfcf : lY.ufcf;
                tV = DCFLite.calculateTVGrowth(fc, p.tvInput, p.discountRate);
            } else {
                tV = DCFLite.calculateTVMultiple(lY.ebitda, p.tvInput);
            }
            const pTV = DCFLite.calculatePV(tV, p.discountRate, 5, p.midYear);
            const eq = (p.modelType === 'levered') ? (sPV + pTV) : (sPV + pTV - p.netDebt);
            return eq / p.sharesOutstanding;
        });

        renderNCFTable(detailedProjections);
    };

    const renderNCFTable = (projections) => {
        const table = document.getElementById('ncfTable');
        let html = `<tr><th>Metric ($M)</th>`;
        projections.forEach(p => html += `<th>Yr ${p.year}</th>`);
        html += `</tr>`;
        const rows = [
            { label: 'Revenue', key: 'revenue' },
            { label: 'EBITDA', key: 'ebitda' },
            { label: 'EBIT', key: 'ebit' },
            { label: 'UFCF (Unlevered)', key: 'ufcf' },
            { label: 'Net Income', key: 'netIncome' },
            { label: 'LFCF / NCF (Levered)', key: 'lfcf' }
        ];
        rows.forEach(row => {
            html += `<tr><td>${row.label}</td>`;
            projections.forEach(p => {
                html += `<td>${p[row.key].toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>`;
            });
            html += `</tr>`;
        });
        table.innerHTML = html;
    };

    const renderChart = (projections) => {
        const ctx = document.getElementById('fcfChart').getContext('2d');
        const labels = projections.map(p => `Year ${p.year}`);
        const data = projections.map(p => p.revenue);
        if (chart) {
            chart.data.labels = labels;
            chart.data.datasets[0].data = data;
            chart.update();
        } else {
            chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Projected Revenue ($M)',
                        data: data,
                        backgroundColor: 'rgba(56, 189, 248, 0.4)',
                        borderColor: '#38bdf8',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
                        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        }
    };

    const renderSensitivity = (params, calcFn) => {
        const table = document.getElementById('sensitivityTable');
        const waccRange = [-0.01, -0.005, 0, 0.005, 0.01];
        const growthRange = [-0.01, -0.005, 0, 0.005, 0.01];
        const baseGrowth = params.tvMethod === 'growth' ? params.tvInput : params.unitGrowth;
        const colLabel = params.tvMethod === 'growth' ? 'LT Growth' : 'Vol Growth';
        let html = `<tr><th>WACC \\ ${colLabel}</th>`;
        growthRange.forEach(g => html += `<th>${((baseGrowth + g) * 100).toFixed(1)}%</th>`);
        html += `</tr>`;
        waccRange.forEach(w => {
            const curWacc = params.discountRate + w;
            html += `<tr><td><strong>${(curWacc * 100).toFixed(1)}%</strong></td>`;
            growthRange.forEach(g => {
                const curGrowth = baseGrowth + g;
                const tempParams = { ...params, discountRate: curWacc };
                if (params.tvMethod === 'growth') tempParams.tvInput = curGrowth;
                else tempParams.unitGrowth = curGrowth;
                const price = calcFn(tempParams);
                const isBase = w === 0 && g === 0;
                html += `<td class="${isBase ? 'highlight' : ''}">$${price.toFixed(2)}</td>`;
            });
            html += `</tr>`;
        });
        table.innerHTML = html;
    };

    const exportToExcel = async () => {
        if (typeof ExcelJS === 'undefined') {
            alert("Excel library failed to load. Please check your internet connection.");
            return;
        }

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'DCF Super Calculator v1.0';

        // --- SHEET 1: EXECUTIVE SUMMARY ---
        const wsSummary = workbook.addWorksheet('Executive Summary');
        wsSummary.columns = [{ width: 30 }, { width: 20 }, { width: 40 }];

        const titleRow = wsSummary.addRow(['DCF Super Calculator v1.0 - Financial Report']);
        titleRow.font = { bold: true, size: 14 };
        wsSummary.addRow(['']);

        const headerRow = wsSummary.addRow(['Metric', 'Value', 'Context']);
        headerRow.font = { bold: true };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };

        wsSummary.addRows([
            ['Implied Share Price', '$' + document.getElementById('impliedPrice').innerText, 'Calculated Intrinsic Value'],
            ['Current Market Price', '$' + document.getElementById('marketPrice').value, 'Current Trading Quote'],
            ['IRR (Internal Rate of Return)', document.getElementById('irrValue').innerText, 'Annualized Projected Return'],
            ['Upside / Downside', document.getElementById('upsideValue').innerText, 'Value Relative to Market Price'],
            ['Margin of Safety', document.getElementById('mosValue').innerText, 'Risk Buffet Margin'],
            ['Model Verdict', document.getElementById('verdictValue').innerText, 'Automated Assessment']
        ]);

        // EMBED CHART
        try {
            const canvas = document.getElementById('fcfChart');
            const dataUrl = canvas.toDataURL('image/png');
            const imageId = workbook.addImage({
                base64: dataUrl,
                extension: 'png',
            });
            wsSummary.addImage(imageId, {
                tl: { col: 0, row: 12 },
                ext: { width: 550, height: 350 }
            });
        } catch (e) {
            console.warn("Chart export failed", e);
        }

        // --- SHEET 2: BALANCE SHEET & INPUTS ---
        const wsInputs = workbook.addWorksheet('Balance Sheet & Inputs');
        wsInputs.columns = [{ width: 30 }, { width: 25 }];

        wsInputs.addRow(['MODEL INPUT SNAPSHOT (BASELINE)']).font = { bold: true };
        wsInputs.addRow(['']);
        const inputRows = [
            ['Baseline Units', document.getElementById('units').value],
            ['Price per Unit', document.getElementById('price').value],
            ['Unit Growth Rate', document.getElementById('unitGrowth').value + '%'],
            ['Price Growth Rate', document.getElementById('priceGrowth').value + '%'],
            ['COGS % of Revenue', document.getElementById('cogsPct').value + '%'],
            ['SG&A % of Revenue', document.getElementById('sgaPct').value + '%'],
            ['D&A % of Revenue', document.getElementById('daPct').value + '%'],
            ['Tax Rate', document.getElementById('taxRate').value + '%'],
            ['CapEx % of Revenue', document.getElementById('capexPct').value + '%'],
            ['Δ NWC % of Revenue Δ', document.getElementById('nwcPct').value + '%'],
            [''],
            ['Current Net Debt ($M)', document.getElementById('netDebt').value],
            ['Shares Outstanding (M)', document.getElementById('shares').value],
            ['Annual Interest Expense ($M)', document.getElementById('interestExpense').value],
            ['Expected Net Borrowing ($M)', document.getElementById('netBorrowing').value]
        ];
        wsInputs.addRows(inputRows);

        // --- SHEET 3: FINANCIAL MODEL ---
        const wsModel = workbook.addWorksheet('5-Year Projection Model');
        const mHeader = ["Line Item ($M)", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"];
        const mhRow = wsModel.addRow(mHeader);
        mhRow.font = { bold: true };
        mhRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };

        const getRow = (label, key) => [label, ...detailedProjections.map(p => Math.round(p[key]))];

        wsModel.addRows([
            getRow("Revenue", "revenue"),
            getRow("COGS", "cogs"),
            getRow("Gross Profit", "grossProfit"),
            getRow("SG&A", "sga"),
            getRow("EBITDA", "ebitda"),
            getRow("D&A", "da"),
            getRow("EBIT", "ebit"),
            getRow("Taxes", "taxes"),
            getRow("NOPAT", "nopat"),
            [''],
            getRow("Unlevered FCF (UFCF)", "ufcf"),
            [''],
            getRow("Net Income", "netIncome"),
            getRow("Levered FCF (LFCF)", "lfcf")
        ]);
        wsModel.columns = [{ width: 25 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }];

        // TRIGGER DOWNLOAD
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `DCF_Advanced_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    init();
});
