# DCF Super Calculator v1.0

A professional-grade, multi-stage Discounted Cash Flow (DCF) modeling suite designed for granular financial analysis, equity research, and credit assessment.

## 🚀 The 4-Step Workflow

### 1. Raw Data Input
The starting point for any model. 
- **Action**: Paste unstructured data directly from Excel, PDF exports, or CSVs.
- **Logic**: The internal parser recognizes keywords like "Units", "Price", and "Debt" to auto-populate the baseline variables, saving minutes of manual entry.

### 2. Variable Drivers
Unlike basic calculators that use a single growth percentage, this tool uses a **Unit-Driver Model**.
- **Revenue Drivers**: Split into **Unit Volume** and **Price per Unit**. This allows you to model cases where volume grows while prices remain flat (or vice versa).
- **Efficiency**: Define COGS, SG&A, and D&A as percentages of revenue to see how operating leverage scales with growth.
- **Investment**: Project CapEx and Net Working Capital (NWC) requirements to calculate true cash flow.

### 3. FCF Valuation Model
The core valuation engine.
- **Valuation Base**: Toggle between **Unlevered** (Enterprise Value) and **Levered** (Equity Value).
- **WACC / Cost of Equity**: Input your required rate of return.
- **Terminal Value**: Choose between **Gordon Growth** (perpetual growth) or **Exit Multiples** (EBITDA multiple).
- **Optional Sensitivity**: Toggle a heat map to see how the share price changes with different WACC and Growth assumptions.

### 4. NCF & Credit Model
Evaluate the capital structure and financial health.
- **NCF (Net Cash Flow)**: Calculates the actual cash left in the bank after interest payments and debt repayments.
- **Credit Metrics**: Real-time monitoring of **Interest Coverage (EBIT/Int)** and **Debt/EBITDA**.
- **Covenant Status**: Automated feedback on whether the company looks like an "Investment Grade" candidate or a high-leverage risk.

---

## 📖 Input Glossary

| Input | Description |
| :--- | :--- |
| **Units / Volume** | The total number of products/services sold (the physical driver). |
| **Price per Unit** | The average selling price (the monetary driver). |
| **COGS %** | Cost of Goods Sold; measures direct production efficiency. |
| **SG&A %** | Selling, General & Administrative; measures corporate overhead. |
| **D&A %** | Depreciation & Amortization; non-cash expenses added back to cash flow. |
| **CapEx %** | Capital Expenditures; cash reinvested into the business for growth. |
| **NWC Change %** | Δ in Net Working Capital; reflects cash tied up in operations (Inventory, A/R). |
| **Discount Rate (WACC)** | The "Hurdle Rate" representing the risk-adjusted cost of capital. |
| **LT Growth** | The rate at which the company will grow forever after the projection period. |

---

## 🧠 Financial Logic: How it Works
A **Discounted Cash Flow (DCF)** model operates on the principle of the **Time Value of Money**. 

1. **Projection**: We project the cash the company will generate over the next 5 years based on your drivers.
2. **Terminal Value**: Since companies exist beyond 5 years, we estimate their "Final Value" at the end of the projection.
3. **Discounting**: Because $100 today is worth more than $100 in five years, we "pull back" all future cash flows to the present using the **Discount Rate**.
4. **Summation**: The sum of these present values gives us the **Intrinsic Value**.
5. **Equity Conversion**: We subtract **Net Debt** to find the total value belonging to shareholders, then divide by **Shares Outstanding** to get the **Implied Share Price**.

---
*Created for professional financial modeling and educational analysis.*
