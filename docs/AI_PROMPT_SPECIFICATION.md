# AI Prompt Specification

## Overview

This document outlines the AI prompts and analysis focus areas for insurance contract analysis. The AI should be configured to identify potential issues, gaps, and concerning clauses, with special attention to roofing and siding coverage.

## Analysis Focus Areas

### 1. Standard Coverage Analysis
- **Deductibles**: Amount, structure, per-claim vs. annual
- **Coverage Limits**: Maximum payout amounts, sub-limits
- **Premiums**: Cost, payment schedule, increases
- **Coverage Types**: What is covered (health, property, liability, etc.)
- **Exclusions**: What is explicitly not covered

### 2. Missed Coverage Detection
- Identify areas that should typically be covered but are not
- Compare against industry standards for the coverage type
- Flag missing coverage that could be problematic

### 3. Coverage Gaps Identification
- Identify gaps between what the user might expect and what is actually covered
- Highlight partial coverage scenarios
- Identify coverage limitations that create gaps

### 4. Hidden Clauses & Concerning Terms
- Identify clauses buried in fine print
- Flag concerning cancellation policies
- Highlight restrictive terms
- Identify clauses that limit claims or coverage in unexpected ways
- Flag clauses that may be difficult for consumers to understand

### 5. Common Issues
- Identify common problems experienced with this type of coverage
- Industry-specific issues
- Consumer protection concerns
- Claims handling issues

### 6. Roofing & Siding Coverage (Special Focus)
- **Critical Analysis**: Special attention to roofing and siding coverage
- **Coverage Changes**: Identify any changes or restrictions in roofing/siding coverage
- **Depreciation**: Analyze how depreciation is applied to roofing/siding
- **Replacement Cost**: Check if replacement cost coverage applies to roofing/siding
- **Age Restrictions**: Identify age-based restrictions on roofing/siding claims
- **Material Restrictions**: Check for restrictions on roofing/siding materials
- **Recent Trends**: Note that insurance companies have been making roofing/siding coverage worse in recent times
- **Red Flags**: Flag any concerning clauses specifically related to roofing/siding

## Prompt Structure

### Contract Analysis Prompt

```
You are an expert insurance analyst. Analyze the following insurance contract and provide a comprehensive analysis focusing on:

1. **Standard Coverage Elements**:
   - Deductibles (amount, structure)
   - Coverage limits (maximum payouts, sub-limits)
   - Premiums (cost, payment schedule)
   - Coverage types included
   - Exclusions list

2. **Missed Coverage**:
   - Areas that should typically be covered but are not
   - Compare against industry standards

3. **Coverage Gaps**:
   - Gaps between expected and actual coverage
   - Partial coverage scenarios
   - Coverage limitations

4. **Hidden Clauses & Concerning Terms**:
   - Clauses buried in fine print
   - Concerning cancellation policies
   - Restrictive terms
   - Clauses that limit claims unexpectedly
   - Difficult-to-understand clauses

5. **Common Issues**:
   - Common problems with this type of coverage
   - Industry-specific issues
   - Consumer protection concerns

6. **ROOFING & SIDING COVERAGE (CRITICAL FOCUS)**:
   - Detailed analysis of roofing and siding coverage
   - Coverage changes or restrictions
   - Depreciation application
   - Replacement cost coverage
   - Age-based restrictions
   - Material restrictions
   - Any concerning clauses specifically related to roofing/siding
   - Note: Insurance companies have been making roofing/siding coverage worse in recent times - be especially vigilant

Contract Text:
[INSERT EXTRACTED PDF TEXT]

Provide your analysis in a structured format with clear sections for each focus area.
```

### Comparison Prompt

```
You are an expert insurance analyst. Compare the following two insurance contracts (previous year vs. current year) and identify all changes, with special attention to:

1. **Premium Changes**: Amount, percentage change
2. **Deductible Changes**: Amount, structure changes
3. **Coverage Changes**: Added or removed coverage
4. **Term Changes**: Policy term modifications
5. **Exclusion Changes**: New or modified exclusions
6. **ROOFING & SIDING COVERAGE CHANGES (CRITICAL)**:
   - Any changes to roofing/siding coverage
   - New restrictions or limitations
   - Changes to depreciation or replacement cost
   - Age or material restrictions
   - Any deterioration in coverage (this is a major concern)

Previous Year Contract:
[INSERT PREVIOUS YEAR TEXT]

Current Year Contract:
[INSERT CURRENT YEAR TEXT]

Provide a detailed comparison highlighting all changes, especially those that represent a reduction in coverage or new restrictions.
```

## Response Format

### Structured JSON Response

```json
{
  "summary": "High-level summary of the contract",
  "keyTerms": {
    "deductible": { "amount": 1000, "currency": "USD", "type": "per-claim" },
    "coverageLimit": { "amount": 1000000, "currency": "USD" },
    "premium": { "monthly": 500, "currency": "USD" },
    "coverageTypes": ["property", "liability"]
  },
  "coverageDetails": {
    "property": { ... },
    "liability": { ... }
  },
  "exclusions": ["Act of war", "Intentional damage"],
  "missedCoverage": [
    "Flood coverage not included (may be needed)",
    "Earthquake coverage not included"
  ],
  "coverageGaps": [
    "Gap between replacement cost and actual cash value",
    "Partial coverage for detached structures"
  ],
  "hiddenClauses": [
    {
      "clause": "Cancellation with 30 days notice",
      "concern": "Very short notice period",
      "location": "Section 12.3"
    }
  ],
  "commonIssues": [
    "Claims handling delays common with this insurer",
    "Depreciation calculations may be disputed"
  ],
  "roofingSidingAnalysis": {
    "coverage": "Covered",
    "depreciation": "Applied based on age",
    "replacementCost": "Only if roof is less than 10 years old",
    "ageRestrictions": "Roofs over 15 years may have reduced coverage",
    "materialRestrictions": "Premium materials may require additional coverage",
    "concerns": [
      "Age-based restrictions may limit coverage for older roofs",
      "Replacement cost only applies to roofs under 10 years - significant limitation",
      "Recent trend shows insurance companies reducing roofing coverage"
    ],
    "redFlags": [
      "Roof age restriction of 10 years for full replacement cost",
      "Depreciation schedule may significantly reduce payout"
    ]
  },
  "premiums": {
    "monthly": 500,
    "annual": 6000,
    "paymentSchedule": "monthly"
  }
}
```

## Configuration

### Model Selection
- **Primary**: GPT-4 Turbo (for detailed analysis)
- **Alternative**: GPT-4 (if cost is a concern)
- **Fallback**: GPT-3.5 Turbo (for simple analysis, not recommended for complex contracts)

### Temperature Settings
- **Analysis**: 0.2 (low temperature for factual analysis)
- **Comparison**: 0.3 (slightly higher for change detection)

### Token Limits
- **Input**: 16,000 tokens (for large PDFs)
- **Output**: 4,000 tokens (structured response)

### Prompt Versioning
- Store prompts in configuration file
- Version control prompts
- A/B test different prompt variations
- Track which prompts produce best results

## Future Enhancements

1. **Custom Prompts**: Allow users to specify focus areas
2. **Industry-Specific Prompts**: Different prompts for different insurance types
3. **Learning from Reviews**: Incorporate feedback from human reviews
4. **Prompt Optimization**: Continuously improve prompts based on results

