'use strict';

const accounts = [
  {
    owner: 'Jonas Schmedtmann',
    movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
    movementsDates: [
      '2026-05-20T09:15:00.000Z',
      '2026-05-22T14:30:00.000Z',
      '2026-05-25T10:10:00.000Z',
      '2026-05-30T16:45:00.000Z',
      '2026-06-03T08:35:00.000Z',
      '2026-06-07T12:10:00.000Z',
      '2026-06-15T15:20:00.000Z',
      '2026-06-18T10:00:00.000Z',
    ],
    interestRate: 1.2,
    pin: 1111,
    currency: 'USD',
    locale: 'en-US',
  },
  {
    owner: 'Jessica Davis',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    movementsDates: [
      '2026-04-01T11:01:00.000Z',
      '2026-04-08T10:17:00.000Z',
      '2026-04-22T14:11:00.000Z',
      '2026-05-02T17:02:00.000Z',
      '2026-05-13T09:25:00.000Z',
      '2026-05-29T13:41:00.000Z',
      '2026-06-12T08:32:00.000Z',
      '2026-06-17T20:10:00.000Z',
    ],
    interestRate: 1.5,
    pin: 2222,
    currency: 'USD',
    locale: 'en-US',
  },
  {
    owner: 'Steven Thomas Williams',
    movements: [200, -200, 340, -300, -20, 50, 400, -460],
    movementsDates: [
      '2026-04-14T07:20:00.000Z',
      '2026-04-21T09:40:00.000Z',
      '2026-05-01T15:30:00.000Z',
      '2026-05-14T11:18:00.000Z',
      '2026-05-26T14:54:00.000Z',
      '2026-06-04T10:22:00.000Z',
      '2026-06-11T19:03:00.000Z',
      '2026-06-16T08:45:00.000Z',
    ],
    interestRate: 0.7,
    pin: 3333,
    currency: 'USD',
    locale: 'en-US',
  },
  {
    owner: 'Sarah Smith',
    movements: [430, 1000, 700, 50, 90],
    movementsDates: [
      '2026-05-11T10:00:00.000Z',
      '2026-05-21T10:00:00.000Z',
      '2026-05-31T10:00:00.000Z',
      '2026-06-10T10:00:00.000Z',
      '2026-06-17T10:00:00.000Z',
    ],
    interestRate: 1,
    pin: 4444,
    currency: 'USD',
    locale: 'en-US',
  },
];

const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');
const labelMessage = document.querySelector('.message');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

let currentAccount;
let timer;
let sorted = false;

const createUsernames = accs => {
  accs.forEach(acc => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

const formatCurrency = (value, acc) =>
  new Intl.NumberFormat(acc.locale, {
    style: 'currency',
    currency: acc.currency,
  }).format(value);

const formatMovementDate = (date, locale) => {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const setMessage = (text, type = 'info') => {
  labelMessage.textContent = text;
  labelMessage.className = `message ${type}`;
};

const displayMovements = (acc, sort = false) => {
  containerMovements.innerHTML = '';

  const movements = acc.movements.map((amount, index) => ({
    amount,
    date: acc.movementsDates[index],
  }));

  const displayedMovements = sort
    ? movements.slice().sort((a, b) => a.amount - b.amount)
    : movements;

  if (!displayedMovements.length) {
    containerMovements.innerHTML = '<div class="empty-state">No transactions yet.</div>';
    return;
  }

  displayedMovements.forEach((mov, index) => {
    const type = mov.amount > 0 ? 'deposit' : 'withdrawal';
    const date = formatMovementDate(new Date(mov.date), acc.locale);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${index + 1} ${type}</div>
        <div class="movements__date">${date}</div>
        <div class="movements__value">${formatCurrency(mov.amount, acc)}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = acc => {
  acc.balance = acc.movements.reduce((sum, mov) => sum + mov, 0);
  labelBalance.textContent = formatCurrency(acc.balance, acc);
};

const calcDisplaySummary = acc => {
  const income = acc.movements
    .filter(mov => mov > 0)
    .reduce((sum, mov) => sum + mov, 0);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((sum, mov) => sum + Math.abs(mov), 0);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(interestAmount => interestAmount >= 1)
    .reduce((sum, interestAmount) => sum + interestAmount, 0);

  labelSumIn.textContent = formatCurrency(income, acc);
  labelSumOut.textContent = formatCurrency(out, acc);
  labelSumInterest.textContent = formatCurrency(interest, acc);
};

const updateUI = acc => {
  displayMovements(acc, sorted);
  calcDisplayBalance(acc);
  calcDisplaySummary(acc);
};

const clearInputs = (...inputs) => {
  inputs.forEach(input => {
    input.value = '';
    input.blur();
  });
};

const startLogoutTimer = () => {
  let time = 300;

  const tick = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, '0');
    const sec = String(time % 60).padStart(2, '0');
    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      currentAccount = undefined;
      containerApp.classList.remove('active');
      labelWelcome.textContent = 'Log in to get started';
      setMessage('You were logged out for security. Please log in again.', 'info');
    }

    time--;
  };

  tick();
  return setInterval(tick, 1000);
};

const resetTimer = () => {
  clearInterval(timer);
  timer = startLogoutTimer();
};

createUsernames(accounts);
labelDate.textContent = new Intl.DateTimeFormat(navigator.language, {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
}).format(new Date());

btnLogin.addEventListener('click', event => {
  event.preventDefault();

  currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value.trim().toLowerCase());

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`;
    containerApp.classList.add('active');
    sorted = false;
    updateUI(currentAccount);
    clearInputs(inputLoginUsername, inputLoginPin);
    setMessage('Login successful. You can now transfer money, request a loan, sort transactions, or close the account.', 'success');
    resetTimer();
  } else {
    setMessage('Invalid username or PIN. Try a demo account such as js / 1111.', 'error');
    clearInputs(inputLoginPin);
  }
});

btnTransfer.addEventListener('click', event => {
  event.preventDefault();

  if (!currentAccount) return setMessage('Please log in before making a transfer.', 'error');

  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(acc => acc.username === inputTransferTo.value.trim().toLowerCase());

  if (!receiverAcc) {
    setMessage('Transfer failed: recipient username does not exist.', 'error');
  } else if (receiverAcc.username === currentAccount.username) {
    setMessage('Transfer failed: you cannot transfer money to your own account.', 'error');
  } else if (!Number.isFinite(amount) || amount <= 0) {
    setMessage('Transfer failed: enter a positive amount.', 'error');
  } else if (amount > currentAccount.balance) {
    setMessage('Transfer failed: insufficient funds.', 'error');
  } else {
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    const now = new Date().toISOString();
    currentAccount.movementsDates.push(now);
    receiverAcc.movementsDates.push(now);
    updateUI(currentAccount);
    setMessage(`Transfer completed to ${receiverAcc.owner}.`, 'success');
    resetTimer();
  }

  clearInputs(inputTransferTo, inputTransferAmount);
});

btnLoan.addEventListener('click', event => {
  event.preventDefault();

  if (!currentAccount) return setMessage('Please log in before requesting a loan.', 'error');

  const amount = Math.floor(Number(inputLoanAmount.value));
  const hasQualifyingDeposit = currentAccount.movements.some(mov => mov >= amount * 0.1);

  if (!Number.isFinite(amount) || amount <= 0) {
    setMessage('Loan request failed: enter a positive whole-dollar amount.', 'error');
  } else if (!hasQualifyingDeposit) {
    setMessage('Loan request denied: at least one deposit must be 10% of the requested amount.', 'error');
  } else {
    setTimeout(() => {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUI(currentAccount);
      setMessage('Loan approved and deposited into your account.', 'success');
      resetTimer();
    }, 700);
  }

  clearInputs(inputLoanAmount);
});

btnClose.addEventListener('click', event => {
  event.preventDefault();

  if (!currentAccount) return setMessage('Please log in before closing an account.', 'error');

  const confirmUser = inputCloseUsername.value.trim().toLowerCase();
  const confirmPin = Number(inputClosePin.value);

  if (confirmUser === currentAccount.username && confirmPin === currentAccount.pin) {
    const index = accounts.findIndex(acc => acc.username === currentAccount.username);
    accounts.splice(index, 1);
    clearInterval(timer);
    containerApp.classList.remove('active');
    labelWelcome.textContent = 'Account closed';
    setMessage('The account was closed and removed from the demo session.', 'success');
    currentAccount = undefined;
  } else {
    setMessage('Close account failed: username or PIN confirmation is incorrect.', 'error');
  }

  clearInputs(inputCloseUsername, inputClosePin);
});

btnSort.addEventListener('click', event => {
  event.preventDefault();

  if (!currentAccount) return setMessage('Please log in before sorting transactions.', 'error');

  sorted = !sorted;
  displayMovements(currentAccount, sorted);
  btnSort.textContent = sorted ? 'Unsort transactions' : 'Sort transactions';
  resetTimer();
});
