---
status: testing
phase: 04-affiliate-integration
source: [04-01-SUMMARY.md]
started: 2026-01-28T12:30:00Z
updated: 2026-01-28T12:30:00Z
---

## Current Test

number: 1
name: Shop on Amazon Button Visible
expected: |
  Open a trend modal by clicking on any bubble.
  You should see an orange "Shop on Amazon" button at the bottom of the modal.
  The button text should include the trend name (e.g., "Shop 'baggy jeans' on Amazon").
awaiting: user response

## Tests

### 1. Shop on Amazon Button Visible
expected: Open a trend modal by clicking on any bubble. An orange "Shop on Amazon" button appears at the bottom of the modal with the trend name in the text.
result: [pending]

### 2. Amazon Link Opens Correctly
expected: Click the "Shop on Amazon" button. A new browser tab opens to Amazon search results page showing fashion products matching the trend keyword.
result: [pending]

### 3. Affiliate Tag in URL
expected: Check the URL in the new Amazon tab. It should contain "tag=taavster-21" parameter (your affiliate tag).
result: [pending]

### 4. Associates Disclosure Visible
expected: Below the "Shop on Amazon" button, you should see small gray text: "As an Amazon Associate we earn from qualifying purchases."
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0

## Gaps

[none yet]
