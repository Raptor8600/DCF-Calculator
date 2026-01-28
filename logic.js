/**
 * DCF Logic Engine v1.0
 * Calibrated against Mergers & Inquisitions standards for UFCF/LFCF.
 */

const DCFLite = {
    /**
     * Parses pasted spreadsheet data (tabs or commas)
     */
    parseSpreadsheetData: (text) => {
        if (!text) return [];
        const rows = text.split(/\r?\n/);
        return rows.map(row => {
            const cells = row.split(/\t|,/);
            return cells.map(cell => {
                const num = parseFloat(cell.trim().replace(/[\$,%]/g, ''));
                return isNaN(num) ? cell.trim() : num;
            });
        }).filter(row => row.length > 0 && row[0] !== "");
    },

    /**
     * Calculates WACC
     */
    calculateWACC: (equity, debt, costOfEquity, costOfDebt, taxRate) => {
        const totalValue = equity + debt;
        if (totalValue === 0) return 0;
        const weightEquity = equity / totalValue;
        const weightDebt = debt / totalValue;
        return (weightEquity * costOfEquity) + (weightDebt * costOfDebt * (1 - taxRate));
    },

    /**
     * Calculates Cost of Equity (CAPM)
     */
    calculateCostOfEquity: (riskFreeRate, beta, equityRiskPremium) => {
        return (riskFreeRate / 100) + (beta * (equityRiskPremium / 100));
    },

    /**
     * Basic projection helper
     */
    projectFCF: (currentFCF, growthRate, years) => {
        const projections = [];
        let runningFCF = currentFCF;
        for (let i = 1; i <= years; i++) {
            runningFCF *= (1 + growthRate);
            projections.push({ year: i, fcf: runningFCF });
        }
        return projections;
    },

    /**
     * Advanced: Full P&L and FCF Bridge
     */
    projectDetailedFinancials: (params) => {
        const {
            years,
            units, price, unitGrowth, priceGrowth,
            cogsPct, sgaPct, daPct, taxRate,
            capexPct, nwcPct,
            interestExpense, netBorrowing
        } = params;

        const projections = [];
        let currentUnits = units;
        let currentPrice = price;
        let prevRevenue = units * price;

        for (let i = 1; i <= years; i++) {
            currentUnits *= (1 + unitGrowth);
            currentPrice *= (1 + priceGrowth);

            const revenue = currentUnits * currentPrice;
            const cogs = revenue * (cogsPct / 100);
            const grossProfit = revenue - cogs;
            const sga = revenue * (sgaPct / 100);
            const ebitda = grossProfit - sga;
            const da = revenue * (daPct / 100);
            const ebit = ebitda - da;
            const taxes = ebit * (taxRate / 100);
            const nopat = ebit - taxes;

            const capex = revenue * (capexPct / 100);
            const deltaNWC = (revenue - prevRevenue) * (nwcPct / 100);

            // Unlevered Free Cash Flow (UFCF)
            const ufcf = nopat + da - capex - deltaNWC;

            // Levered Free Cash Flow (LFCF) 
            const ebt = ebit - interestExpense;
            const leveredTaxes = Math.max(0, ebt * (taxRate / 100));
            const netIncome = ebt - leveredTaxes;
            const lfcf = netIncome + da - capex - deltaNWC + netBorrowing;

            projections.push({
                year: i, revenue, cogs, grossProfit, sga, ebitda, ebit, taxes, nopat,
                da, capex, deltaNWC, ufcf, netIncome, lfcf
            });

            prevRevenue = revenue;
        }
        return projections;
    },

    /**
     * Credit Metrics
     */
    calculateCreditMetrics: (ebit, interest, totalDebt, ebitda) => {
        return {
            interestCoverage: interest !== 0 ? ebit / interest : 99,
            debtToEbitda: ebitda > 0 ? totalDebt / ebitda : 0
        };
    },

    /**
     * Terminal Value (Gordon Growth)
     */
    calculateTVGrowth: (finalYearFCF, longTermGrowth, discountRate) => {
        if (discountRate <= longTermGrowth) return 0;
        return (finalYearFCF * (1 + longTermGrowth)) / (discountRate - longTermGrowth);
    },

    /**
     * Terminal Value (Exit Multiple)
     */
    calculateTVMultiple: (finalYearMetric, multiple) => {
        return finalYearMetric * multiple;
    },

    /**
     * NPV Helper
     */
    calculatePV: (futureValue, discountRate, year, midYear = false) => {
        const discountPeriod = midYear ? year - 0.5 : year;
        return futureValue / Math.pow(1 + discountRate, discountPeriod);
    },

    /**
     * IRR Solver (Newton-Raphson)
     * Finds the discount rate that makes NPV of cash flows + TV equal to a target price.
     */
    calculateIRR: (cashFlows, terminalValue, targetPrice, midYear = false) => {
        if (targetPrice <= 0 || cashFlows.length === 0) return 0;

        let irr = 0.1; // Initial guess 10%
        const maxIterations = 100;
        const precision = 0.00001;

        for (let i = 0; i < maxIterations; i++) {
            let npv = -targetPrice;
            let dNpv = 0;

            cashFlows.forEach((cf, index) => {
                const year = index + 1;
                const period = midYear ? year - 0.5 : year;
                const factor = Math.pow(1 + irr, period);
                npv += cf / factor;
                dNpv -= (period * cf) / (factor * (1 + irr));
            });

            // Terminal Value part
            const lastPeriod = midYear ? cashFlows.length : cashFlows.length; // TV usually at end of period
            const tvFactor = Math.pow(1 + irr, lastPeriod);
            npv += terminalValue / tvFactor;
            dNpv -= (lastPeriod * terminalValue) / (tvFactor * (1 + irr));

            if (Math.abs(npv) < precision) return irr;
            if (dNpv === 0) break;

            irr = irr - npv / dNpv;
        }
        return irr;
    },

    /**
     * Assessment Helper
     */
    getInvestmentVerdict: (upside, irr, wacc) => {
        if (upside > 0.3 && irr > wacc + 0.05) return { label: "Strong Buy", color: "#10b981" };
        if (upside > 0.1) return { label: "Buy / Accumulate", color: "#34d399" };
        if (upside > -0.1) return { label: "Hold / Fair Value", color: "#94a3b8" };
        return { label: "Sell / Overvalued", color: "#ef4444" };
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DCFLite;
}
