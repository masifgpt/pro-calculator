/**
 * NeoCalc - Advanced Calculator Logic
 */

class Calculator {
    constructor(upperDisplay, mainDisplay) {
        this.upperDisplay = upperDisplay;
        this.mainDisplay = mainDisplay;
        this.history = JSON.parse(localStorage.getItem('calc-history')) || [];
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
        this.updateDisplay();
    }

    delete() {
        if (this.currentOperand === '0') return;
        if (this.currentOperand.length === 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.toString().slice(0, -1);
        }
        this.updateDisplay();
    }

    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
        this.updateDisplay();
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
        this.updateDisplay();
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+': computation = prev + current; break;
            case '-': computation = prev - current; break;
            case '*': computation = prev * current; break;
            case '/': 
                computation = current === 0 ? 'Error' : prev / current; 
                break;
            case '%': computation = prev % current; break;
            default: return;
        }

        const fullExpression = `${this.previousOperand} ${this.operation} ${this.currentOperand}`;
        this.addToHistory(fullExpression, computation);
        
        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
        this.updateDisplay();
    }

    sqrt() {
        const val = parseFloat(this.currentOperand);
        if (val < 0) {
            this.currentOperand = "Error";
        } else {
            const result = Math.sqrt(val);
            this.addToHistory(`√(${val})`, result);
            this.currentOperand = result.toString();
        }
        this.shouldResetScreen = true;
        this.updateDisplay();
    }

    addToHistory(expression, result) {
        const item = { expression, result };
        this.history.unshift(item);
        if (this.history.length > 10) this.history.pop();
        localStorage.setItem('calc-history', JSON.stringify(this.history));
        this.renderHistory();
    }

    renderHistory() {
        const list = document.getElementById('history-list');
        list.innerHTML = '';
        this.history.forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.innerHTML = `
                <div class="history-exp">${item.expression} =</div>
                <div class="history-res">${item.result}</div>
            `;
            list.appendChild(li);
        });
    }

    getDisplayNumber(number) {
        if (number === 'Error') return 'Error';
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.mainDisplay.innerText = this.getDisplayNumber(this.currentOperand);
        if (this.operation != null) {
            this.upperDisplay.innerText = `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.upperDisplay.innerText = '';
        }
    }
}

// --- DOM Initialization ---
const upperDisplay = document.getElementById('upper-display');
const mainDisplay = document.getElementById('main-display');
const calculator = new Calculator(upperDisplay, mainDisplay);

// Event Listeners
document.querySelectorAll('[data-number]').forEach(button => {
    button.addEventListener('click', () => calculator.appendNumber(button.dataset.number));
});

document.querySelectorAll('[data-operator]').forEach(button => {
    button.addEventListener('click', () => calculator.chooseOperation(button.dataset.operator));
});

document.getElementById('equals').addEventListener('click', () => calculator.compute());
document.querySelector('[data-action="clear"]').addEventListener('click', () => calculator.clear());
document.querySelector('[data-action="delete"]').addEventListener('click', () => calculator.delete());
document.querySelector('[data-action="sqrt"]').addEventListener('click', () => calculator.sqrt());

// History Toggle
const historyPanel = document.getElementById('history-panel');
document.getElementById('history-toggle').addEventListener('click', () => {
    historyPanel.classList.toggle('active');
    calculator.renderHistory();
});

document.getElementById('clear-history').addEventListener('click', () => {
    calculator.history = [];
    localStorage.removeItem('calc-history');
    calculator.renderHistory();
});

// Theme Toggle
const themeBtn = document.getElementById('theme-toggle');
themeBtn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeBtn.innerHTML = isDark ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
});

// Keyboard Support
document.addEventListener('keydown', (e) => {
    if ((e.key >= 0 && e.key <= 9) || e.key === '.') calculator.appendNumber(e.key);
    if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/' || e.key === '%') calculator.chooseOperation(e.key);
    if (e.key === 'Enter' || e.key === '=') calculator.compute();
    if (e.key === 'Backspace') calculator.delete();
    if (e.key === 'Escape') calculator.clear();
});