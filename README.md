# DCF Super Calculator v1.0

A professional-grade, multi-stage Discounted Cash Flow (DCF) modeling suite designed for granular financial analysis, equity research, and investment decision-making.

## URL
https://raptor8600.github.io/DCF-Calculator/

### Note: This calculator is in beta testing, and is not confirmed to have accurate calculations yet.

## 🚀 The 4-Step Workflow

### 1. Raw Data Input
- **Action**: Paste unstructured data from Excel or financial reports.
- **Logic**: Auto-populates baseline variables through keyword recognition.

### 2. Variable Drivers
- **Revenue Drivers**: Granular **Units x Price** modeling with independent growth rates.
- **Efficiency**: Model COGS, SG&A, and D&A as % of revenue.
- **Investment**: Project CapEx and Δ Net Working Capital.

### 3. FCF Valuation Model
- **Unlevered (Enterprise Value)** vs **Levered (Equity Value)** modes.
- **Terminal Value**: Gordon Growth or Exit Multiple methods.
- **Target Mapping**: Compare Implied Price against **Current Market Price**.

### 4. NCF & Investment Insight
- **IRR Solver**: Calculates the Internal Rate of Return based on your price and cash flows.
- **Surplus Cash**: Breakdown of Net Cash Flow (NCF) after debt service.
- **Verdict Engine**: Real-time Buy/Hold/Sell assessment based on **Margin of Safety**.
- **Credit Metrics**: Interest Coverage and Debt/EBITDA ratios.

---

## 🧮 Key Financial Formulas

| Metric | Formula Logic |
| :--- | :--- |
| **UFCF** | `EBIT * (1 - Tax) + D&A - CapEx - ΔNWC` |
| **LFCF** | `Net Income + D&A - CapEx - ΔNWC + Net Borrowing` |
| **IRR** | Iterative solver finding `r` where `NPV(r) = 0` |
| **Upside** | `(Implied Price / Market Price) - 1` |

---

## ⚙️ Customization
The tool features **Optional Toggles** to show/hide advanced sections:
- **Sensitivity Matrix**: Compare WACC vs. Growth impact.
- **Credit Model**: Monitor leverage and covenants.
- **Investment Insight**: Access IRR and Verdict engine.

---
*Created for professional financial modeling and educational analysis.*

