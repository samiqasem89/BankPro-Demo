# BankPro Demo

A cleaned-up and improved JavaScript banking demo based on the original unfinished practice project.

## Demo login accounts

| User | PIN | Owner |
|---|---:|---|
| js | 1111 | Jonas Schmedtmann |
| jd | 2222 | Jessica Davis |
| stw | 3333 | Steven Thomas Williams |
| ss | 4444 | Sarah Smith |

## What was improved

- Fixed broken transaction rendering.
- Fixed incorrect `updateUI()` argument usage.
- Removed unrelated lecture/practice code from the production script.
- Replaced fake auto-login with real demo login behavior.
- Added transaction dates and formatted transaction history.
- Added currency formatting with `Intl.NumberFormat`.
- Added validation messages for login, transfer, loan, sort, and close-account actions.
- Added working auto-logout security timer.
- Added responsive layout updates for desktop, tablet, and mobile.
- Updated HTML title, accessibility labels, input types, and demo user instructions.

## How to run

Open `index.html` in a browser. No server or build tools are required.

## Important note

This is a front-end demo only. It does not use a real backend, database, authentication service, encryption, or payment network. Do not use it for real banking data.
