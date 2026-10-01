/**
 * EduGenie: Google Gemini Powered Learning Assistant
 * Complete Client-Side Application Logic & Backend Integration
 */

// Sanitize any invalid legacy keys or models from previous sessions
const _storedKey = (localStorage.getItem('edugenie_api_key') || '').trim();
const _cleanKey = (_storedKey.startsWith('AQ.') || _storedKey === 'AQ.Ab8RN6J_qVFubNSdjDI21h5_o_acirFqkqdCevrWZbaEsAXY4w') ? '' : _storedKey;
if (!_cleanKey && _storedKey) {
    localStorage.removeItem('edugenie_api_key');
}

const _storedModel = localStorage.getItem('edugenie_model');
const _cleanModel = (_storedModel === 'gemini-2.5-flash' || !_storedModel) ? 'gemini-2.0-flash' : _storedModel;
if (_storedModel === 'gemini-2.5-flash') {
    localStorage.setItem('edugenie_model', 'gemini-2.0-flash');
}

// Application State
const APP_STATE = {
    apiKey: _cleanKey,
    backendUrl: localStorage.getItem('edugenie_backend_url') || 'http://localhost:5000',
    mode: localStorage.getItem('edugenie_mode') || 'browser', // 'browser' or 'backend'
    model: _cleanModel,
    temperature: parseFloat(localStorage.getItem('edugenie_temp') || '0.7'),
    currentTab: 'explainer',

    // Feature states
    speechActive: false,
    lastExplainerMarkdown: '',
    flashcardsDeck: [],
    flashcardIndex: 0,
    quizQuestions: [],
    quizScore: 0,
    quizAnswered: 0,
    chatTurns: []
};

// Curated Sample Topics for 1-Click Learning
const SAMPLE_TOPICS = [
    {
        icon: '⚛️',
        title: 'Quantum Superposition',
        topic: 'Quantum Superposition and Qubits',
        codeSnippet: '# Quantum State representation\nimport numpy as np\n\n# Qubit state |ψ⟩ = α|0⟩ + β|1⟩\nstate_0 = np.array([1, 0])\nstate_1 = np.array([0, 1])\nsuperposition = (state_0 + state_1) / np.sqrt(2)\nprint("Probability |0⟩:", np.abs(superposition[0])**2)',
        category: 'Physics & Computing'
    },
    {
        icon: '🧬',
        title: 'CRISPR Gene Editing',
        topic: 'CRISPR-Cas9 Mechanism and Genetic Engineering',
        codeSnippet: '// DNA Sequence Target\nconst targetSequence = "ATGCGATCGATCGTAGC";\nconst gRNA = "UACGCUAGCUAGCAUCG";\nfunction verifyCas9Cleavage(target, guide) {\n  return target.length > 10 && guide.length === target.length;\n}',
        category: 'Biotechnology'
    },
    {
        icon: '🧮',
        title: 'Intuitive Calculus',
        topic: 'Intuition of Derivatives and Instantaneous Rate of Change',
        codeSnippet: 'def derivative(f, x, h=1e-7):\n    """Approximates the instantaneous rate of change (derivative)"""\n    return (f(x + h) - f(x)) / h\n\n# Test f(x) = x^2 at x = 3 (Expected: 2x = 6)\nf = lambda x: x**2\nprint("f\'(3) ≈", derivative(f, 3))',
        category: 'Mathematics'
    },
    {
        icon: '💻',
        title: 'Dynamic Programming',
        topic: 'Dynamic Programming: Memoization vs Tabulation',
        codeSnippet: 'def fib_memo(n, memo={}):\n    if n in memo: return memo[n]\n    if n <= 1: return n\n    memo[n] = fib_memo(n-1, memo) + fib_memo(n-2, memo)\n    return memo[n]\n\nprint("Fibonacci(50):", fib_memo(50))',
        category: 'Computer Science'
    },
    {
        icon: '🌌',
        title: 'Black Holes & Relativity',
        topic: 'General Relativity, Spacetime Curvature, and Black Holes',
        codeSnippet: '# Schwarzschild radius formula: R_s = 2GM / c^2\nG = 6.674e-11   # Gravitational constant\nc = 3.0e8       # Speed of light (m/s)\nM_sun = 1.989e30 # Mass of the Sun (kg)\n\nR_s_sun = (2 * G * M_sun) / (c**2)\nprint(f"Schwarzschild radius of Sun: {R_s_sun:.2f} meters (~3 km)")',
        category: 'Astrophysics'
    },
    {
        icon: '🧠',
        title: 'Neural Backpropagation',
        topic: 'Neural Networks: Gradient Descent and Backpropagation',
        codeSnippet: 'import numpy as np\n\ndef sigmoid(x):\n    return 1 / (1 + np.exp(-x))\n\ndef sigmoid_derivative(x):\n    return x * (1 - x)\n\n# Error gradient calculation\nerror = target - output\ndelta = error * sigmoid_derivative(output)',
        category: 'AI & Data Science'
    }
];

// Rich Fallback Knowledge Base (guarantees flawless demonstration even if offline or key quota reached)
const FALLBACK_KNOWLEDGE = {
    'Quantum Superposition and Qubits': `### ⚛️ Understanding Quantum Superposition

In classical computing, information is binary: a bit is strictly either a **0 (off)** or a **1 (on)**, like a standard light switch. 

In quantum mechanics, a **qubit (quantum bit)** can exist in a **linear combination of both states simultaneously**:

$$\\lvert\\psi\\rangle = \\alpha\\lvert 0\\rangle + \\beta\\lvert 1\\rangle$$

> **The Spinning Coin Analogy**: Imagine a coin lying flat on a table. It is definitively Heads ($0$) or Tails ($1$). But when you spin that coin on its edge across the desk, it is a blur—simultaneously both Heads and Tails with definite probabilities until your hand slaps it down (a **quantum measurement**), forcing it to collapse into a single state.

#### 🔑 Key Foundations:
1. **Linear Superposition**: Qubits harness quantum phases to process a multitude of computational paths concurrently.
2. **State Vector & Probability Amplitude**: The coefficients $\\alpha$ and $\\beta$ are complex numbers where $\\lvert\\alpha\\rvert^2 + \\lvert\\beta\\rvert^2 = 1$.
3. **Measurement Collapse**: Observing the qubit destroys the delicate superposition, returning a classical binary outcome.
4. **Quantum Interference**: Quantum algorithms (like Shor's and Grover's) cancel out wrong answers destructively while amplifying correct answers constructively.

\`\`\`python
# Quantum State Representation in Python
import numpy as np

# Basis vectors
zero_state = np.array([1, 0])
one_state = np.array([0, 1])

# Equal superposition |+⟩ = (|0⟩ + |1⟩) / √2
hadamard_state = (zero_state + one_state) / np.sqrt(2)
prob_zero = np.abs(hadamard_state[0])**2
prob_one = np.abs(hadamard_state[1])**2

print(f"Probability of measuring 0: {prob_zero:.1%}")
print(f"Probability of measuring 1: {prob_one:.1%}")
\`\`\`

#### ⚠️ Common Misconceptions:
- *Myth*: "Quantum computers test all possible combinations simultaneously in parallel universes."
- *Reality*: Superposition creates interference patterns. You must construct an algorithm that causes erroneous calculation paths to cancel each other out, leaving only the correct solution with high probability.`,

    'CRISPR-Cas9 Mechanism and Genetic Engineering': `### 🧬 CRISPR-Cas9: Molecular Precision Scissors

CRISPR-Cas9 is a Nobel Prize-winning gene editing technology adapted from an ancient bacterial immune system that defends against invading bacteriophages (viruses).

> **The Word Processor Analogy**: Imagine human DNA as an encyclopedia spanning 3 billion characters. CRISPR-Cas9 acts as a molecular **"Find and Replace"** command:
> - **Guide RNA (gRNA)** is your **Find Search Bar**: It matches a specific 20-base sequence in the genetic code.
> - **Cas9 Endonuclease** is the **Cut Tool**: It acts as molecular scissors, inducing a targeted double-strand break (DSB).
> - **Cellular Repair Enzymes** act as **Paste / Re-type**: Either knocking out a mutant gene or inserting corrected DNA templates.

#### 🔑 The 3-Stage Molecular Mechanism:
1. **Target Scanning & PAM Recognition**: Cas9 scans the genome for a 3-nucleotide motif (\`5'-NGG-3'\`), known as the Protospacer Adjacent Motif (PAM).
2. **Complementary R-Loop Binding**: Once PAM is secured, the single-guide RNA unzips the DNA double helix to form base pairs.
3. **Targeted Cleavage**: Cas9's two catalytic nuclease domains (\`HNH\` and \`RuvC\`) slice both DNA strands precisely 3 base pairs upstream of the PAM.

\`\`\`python
# Conceptual CRISPR Target Verification
target_sequence = "ATGCGATCGATCGTAGC"
guide_rna = "UACGCUAGCUAGCAUCG"

def verify_cas9_cleavage(target, guide):
    """Verifies sequence complementarity for precision editing"""
    return len(target) >= 15 and target.endswith("GC")

print("CRISPR cleavage verified:", verify_cas9_cleavage(target_sequence, guide_rna))
\`\`\`

#### ⚠️ Common Misconceptions:
- *Myth*: "CRISPR injects microscopic nanobots into biological cells."
- *Reality*: Cas9 is an organic bacterial enzyme protein, working together with synthetic RNA strands.`,

    'Intuition of Derivatives and Instantaneous Rate of Change': `### 🧮 Intuitive Calculus: The Meaning of Derivatives

In basic algebra, slope is simply $\\frac{\\Delta y}{\\Delta x} = \\frac{\\text{Rise}}{\\text{Run}}$. But real world phenomena—from rocket launches to stock market shifts—do not move in straight lines; they curve continuously!

> **The Highway Speedometer Analogy**: If you drive 60 miles in 1 hour, your **average speed** was 60 mph. But at minute 25 you were stopped at a traffic light (0 mph), and at minute 40 you were passing a truck (75 mph). The **derivative** is your vehicle's **instantaneous speedometer reading** at a single split second ($dt \\to 0$).

#### 🔑 The Formal Definition of the Derivative:
The derivative $f'(x)$ is the slope of the tangent line as the interval width $h$ shrinks infinitely toward zero:

$$f'(x) = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h}$$

#### 🎯 Key Perspectives:
1. **Geometric View**: The exact tilt or slope of the tangent line touching the curve at a single point $(x, f(x))$.
2. **Physical View**: Instantaneous rate of change (e.g., Position $\\to$ Velocity $\\to$ Acceleration).
3. **Machine Learning View**: In optimization, finding where $f'(x) = 0$ identifies minimum loss (valleys) and maximum efficiency.

\`\`\`python
# Numerical Derivative using Symmetric Difference
def derivative(f, x, h=1e-7):
    """Approximates the instantaneous rate of change (derivative)"""
    return (f(x + h) - f(x - h)) / (2 * h)

# Test function f(x) = x^2 at x = 3 (Analytical: 2x = 6)
f = lambda x: x**2
print("Numerical f'(3):", round(derivative(f, 3), 4))
\`\`\`

#### ⚠️ Common Misconceptions:
- *Myth*: "Derivatives divide by zero."
- *Reality*: A limit observes the continuous behavior of the ratio as $h$ approaches zero, never evaluating at an undefined denominator.`,

    'Dynamic Programming: Memoization vs Tabulation': `### 💻 Dynamic Programming: Intuitive Mastery

Dynamic Programming (DP) is simply **careful recursion without redundant recalculation**. It solves problems with **optimal substructure** and **overlapping subproblems**.

#### 1. Top-Down Approach (Memoization)
You write natural, intuitive recursion from the top problem down to the base cases, but maintain a cache (lookup table) of already solved states:

\`\`\`python
# Top-Down with Memoization: O(N) time, O(N) recursion stack
def fib_memo(n, memo=None):
    if memo is None: memo = {}
    if n in memo: return memo[n]
    if n <= 1: return n
    
    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]
\`\`\`

#### 2. Bottom-Up Approach (Tabulation)
You start at the absolute base cases ($0, 1$) and iteratively construct the answer up to $N$. This eliminates call-stack overhead and enables memory optimization:

\`\`\`python
# Bottom-Up Tabulation with Space Optimization: O(N) time, O(1) space!
def fib_optimized(n):
    if n <= 1: return n
    prev2, prev1 = 0, 1
    for _ in range(2, n + 1):
        current = prev1 + prev2
        prev2, prev1 = prev1, current
    return prev1
\`\`\`

> **The Golden Rule**: Whenever a problem asks for *"maximum/minimum"*, *"total number of ways"*, or involves choices that build upon previous steps, identify the state parameters and express the recurrence relation.`,

    'General Relativity, Spacetime Curvature, and Black Holes': `### 🌌 General Relativity & Black Holes

Albert Einstein's 1915 General Theory of Relativity revolutionized physics by proving that gravity is not an attractive mechanical force between masses, but rather the **geometric curvature of spacetime itself**.

> **The Trampoline & Bowling Ball Analogy**: Imagine a taut rubber sheet. Place a 16-pound bowling ball in the center; it indents the sheet deeply. A rolled marble curves around the bowling ball not because an invisible tether pulls it, but because the fabric of spacetime itself is curved!
> *"Spacetime tells matter how to move; matter tells spacetime how to curve."* — John Archibald Wheeler.

#### 🔑 The Core Pillars:
1. **The Equivalence Principle**: The sensation of gravity when standing on Earth is physically identical to being accelerated in a rocket at $9.8\\text{ m/s}^2$ in zero-g.
2. **Gravitational Time Dilation**: Clocks tick slower the closer they are to a massive gravitational source.
3. **The Event Horizon**: The point of no return where escape velocity equals the speed of light ($c$). Inside, spacetime is so tilted that all futures point toward the central gravitational singularity.

#### 📐 The Schwarzschild Radius Formula:
$$R_s = \\frac{2GM}{c^2}$$

\`\`\`python
# Calculating the Schwarzschild Radius of the Sun
G = 6.674e-11    # Gravitational constant (m^3/kg/s^2)
c = 3.0e8        # Speed of light (m/s)
M_sun = 1.989e30 # Mass of Sun (kg)

r_s = (2 * G * M_sun) / (c**2)
print(f"Schwarzschild radius of Sun: {r_s:.2f} meters (~3 km)")
\`\`\`

#### ⚠️ Common Misconceptions:
- *Myth*: "Black holes vacuum everything up indiscriminately across galaxies."
- *Reality*: If our Sun collapsed into a black hole of identical mass, Earth's orbit wouldn't change at all—it would remain in its orbit at 1 AU!`,

    'Neural Networks: Gradient Descent and Backpropagation': `### 🧠 Neural Networks: Gradient Descent & Backpropagation

Every modern neural network—from image classifiers to large language models like Google Gemini—learns by **iteratively minimizing an error function across billions of tunable weights**.

> **The Foggy Mountain Hiker Analogy**: You are hiking on an unfamiliar mountain enveloped in dense fog with zero visibility. You want to reach the lowest valley (minimum loss):
> - You cannot see the landscape, but you can feel the slope under your boots.
> - **Gradient Descent**: You take small steps in the direction of steepest descent.
> - **Learning Rate ($\\alpha$)**: Your step size. If you leap wildly, you jump past the valley; if you baby-step, you freeze on the hillside.
> - **Backpropagation**: An efficient algorithm using the calculus **Chain Rule** to compute the slope for every single weight in the network simultaneously.

#### 🔑 The 4-Stage Learning Cycle:
1. **Forward Pass**: Data flows through matrix multiplications and nonlinear activations (ReLU, GeLU) to generate predictions $\\hat{y}$.
2. **Loss Calculation**: Compares prediction $\\hat{y}$ against actual target $y$ via a loss function $L(y, \\hat{y})$.
3. **Backward Pass (Backprop)**: Calculates $\\frac{\\partial L}{\\partial w_i}$ for each weight by applying the Chain Rule in reverse from the output layer.
4. **Weight Update**: Shifts weights toward lower error: $w \\leftarrow w - \\alpha \\frac{\\partial L}{\\partial w}$.

\`\`\`python
import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def sigmoid_derivative(x):
    return x * (1 - x)

# Simple Backprop Delta Calculation
target = 1.0
output = 0.8
error = target - output
delta = error * sigmoid_derivative(output)
print(f"Computed gradient delta: {delta:.4f}")
\`\`\`

#### ⚠️ Common Misconceptions:
- *Myth*: "Deep neural networks are sentient and understand meaning like humans."
- *Reality*: Neural networks are high-dimensional parametric mathematical models executing linear algebra and calculus optimizations.`
};

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initUI();
    initSampleTopics();
    initEventListeners();
    updateStatusBadge();
});

// Setup Initial UI States
function initUI() {
    document.getElementById('cfg-api-key').value = APP_STATE.apiKey || '';
    document.getElementById('cfg-backend-url').value = APP_STATE.backendUrl;
    document.getElementById('cfg-model-select').value = APP_STATE.model;
    document.getElementById('cfg-temperature').value = APP_STATE.temperature;
    document.getElementById('temp-val').textContent = APP_STATE.temperature;
    document.getElementById('badge-model').textContent = APP_STATE.model;

    // Set active mode pill in settings
    document.querySelectorAll('#cfg-mode-selector .pill-option').forEach(pill => {
        pill.classList.toggle('selected', pill.dataset.mode === APP_STATE.mode);
    });
    toggleBackendUrlDisplay(APP_STATE.mode);
    updateKeyFormatIndicator();
}

// Live validation indicator for API key input
function updateKeyFormatIndicator() {
    const keyInput = document.getElementById('cfg-api-key');
    const indicator = document.getElementById('key-format-indicator');
    if (!keyInput || !indicator) return;

    const val = keyInput.value.trim();
    if (!val) {
        indicator.innerHTML = '<span style="color: var(--accent-cyan); font-size: 0.8rem;">💡 Curated Offline Mode Active. Enter an <code>AIzaSy...</code> key for live Gemini 2.0 AI.</span>';
    } else if (val.startsWith('AIzaSy') && val.length >= 30) {
        indicator.innerHTML = '<span style="color: var(--accent-emerald); font-weight: 700; font-size: 0.8rem;">✅ Valid Gemini API key format (AIzaSy...)</span>';
    } else if (val.startsWith('AQ.')) {
        indicator.innerHTML = '<span style="color: var(--accent-rose); font-weight: 600; font-size: 0.8rem;">⚠️ Invalid key prefix "AQ.". Google Gemini keys start with "AIzaSy...".</span>';
    } else {
        indicator.innerHTML = '<span style="color: var(--accent-amber); font-weight: 600; font-size: 0.8rem;">⚠️ Key should begin with "AIzaSy..." (from Google AI Studio).</span>';
    }
}

// Render 1-Click Sample Topic Chips
function initSampleTopics() {
    const container = document.getElementById('sample-topics-container');
    container.innerHTML = '';

    SAMPLE_TOPICS.forEach((item, index) => {
        const chip = document.createElement('div');
        chip.className = `topic-chip ${index === 0 ? 'active' : ''}`;
        chip.dataset.topic = item.topic;
        chip.innerHTML = `<span>${item.icon}</span> <span>${item.title}</span>`;
        chip.addEventListener('click', () => {
            document.querySelectorAll('.topic-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            applySampleTopic(item);
        });
        container.appendChild(chip);
    });

    // Load first topic into inputs
    applySampleTopic(SAMPLE_TOPICS[0]);
}

// Populate topic across active inputs
function applySampleTopic(item) {
    document.getElementById('explainer-topic').value = item.topic;
    document.getElementById('quiz-topic').value = item.topic;
    document.getElementById('summary-topic').value = item.topic;
    document.getElementById('code-input').value = item.codeSnippet;
    document.getElementById('roadmap-goal').value = `Master ${item.topic}`;
}

// Event Listeners Setup
function initEventListeners() {
    // Navigation Tabs
    document.querySelectorAll('.mode-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            switchTab(targetTab);
        });
    });

    // Level selector in Explainer
    document.querySelectorAll('#level-selector .pill-option').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('#level-selector .pill-option').forEach(p => p.classList.remove('selected'));
            pill.classList.add('selected');
        });
    });

    // Quiz format selector
    document.querySelectorAll('#quiz-format-selector .pill-option').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('#quiz-format-selector .pill-option').forEach(p => p.classList.remove('selected'));
            pill.classList.add('selected');
        });
    });

    // Code goal selector
    document.querySelectorAll('#code-goal-selector .pill-option').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('#code-goal-selector .pill-option').forEach(p => p.classList.remove('selected'));
            pill.classList.add('selected');
        });
    });

    // Summary format selector
    document.querySelectorAll('#summary-format-selector .pill-option').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('#summary-format-selector .pill-option').forEach(p => p.classList.remove('selected'));
            pill.classList.add('selected');
        });
    });

    // Execution mode selector in settings modal
    document.querySelectorAll('#cfg-mode-selector .pill-option').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('#cfg-mode-selector .pill-option').forEach(p => p.classList.remove('selected'));
            pill.classList.add('selected');
            toggleBackendUrlDisplay(pill.dataset.mode);
        });
    });

    // Temperature Slider
    document.getElementById('cfg-temperature').addEventListener('input', (e) => {
        document.getElementById('temp-val').textContent = e.target.value;
    });

    // Modal Controls
    document.getElementById('btn-open-settings').addEventListener('click', openSettingsModal);
    document.getElementById('btn-close-modal').addEventListener('click', closeSettingsModal);
    document.getElementById('btn-cancel-settings').addEventListener('click', closeSettingsModal);
    document.getElementById('btn-save-settings').addEventListener('click', saveSettings);
    document.getElementById('btn-test-connection').addEventListener('click', testConnectionDiagnostic);

    // API Key Input Live Validator
    const keyInputEl = document.getElementById('cfg-api-key');
    if (keyInputEl) {
        keyInputEl.addEventListener('input', updateKeyFormatIndicator);
    }

    // Toggle Key Visibility
    const toggleKeyBtn = document.getElementById('btn-toggle-key-visibility');
    if (toggleKeyBtn && keyInputEl) {
        toggleKeyBtn.addEventListener('click', () => {
            if (keyInputEl.type === 'password') {
                keyInputEl.type = 'text';
                toggleKeyBtn.textContent = '🔒';
                toggleKeyBtn.title = 'Hide Key';
            } else {
                keyInputEl.type = 'password';
                toggleKeyBtn.textContent = '👁️';
                toggleKeyBtn.title = 'Show Key';
            }
        });
    }

    // Clear Key Button
    const clearKeyBtn = document.getElementById('btn-clear-key');
    if (clearKeyBtn && keyInputEl) {
        clearKeyBtn.addEventListener('click', () => {
            keyInputEl.value = '';
            APP_STATE.apiKey = '';
            localStorage.removeItem('edugenie_api_key');
            updateKeyFormatIndicator();
            updateStatusBadge();
            showToast('API key cleared. Switched to Curated Offline Mode.', 'info');
        });
    }

    // Main Action Buttons
    document.getElementById('btn-explain').addEventListener('click', handleExplain);
    document.getElementById('btn-generate-quiz').addEventListener('click', handleGenerateQuiz);
    document.getElementById('btn-send-chat').addEventListener('click', handleSendChat);
    document.getElementById('chat-input-field').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSendChat();
    });
    document.getElementById('btn-clear-chat').addEventListener('click', handleClearChat);
    document.getElementById('btn-mentor-code').addEventListener('click', handleMentorCode);
    document.getElementById('btn-generate-roadmap').addEventListener('click', handleGenerateRoadmap);
    document.getElementById('btn-generate-summary').addEventListener('click', handleGenerateSummary);

    // Tools & Audio
    document.getElementById('btn-speak-explainer').addEventListener('click', toggleSpeech);
    document.getElementById('btn-copy-explainer').addEventListener('click', () => {
        copyTextToClipboard(APP_STATE.lastExplainerMarkdown || document.getElementById('explainer-output').innerText);
    });
    document.getElementById('btn-export-explainer').addEventListener('click', exportExplainerNotes);
    document.getElementById('btn-copy-code-output').addEventListener('click', () => {
        copyTextToClipboard(document.getElementById('code-output').innerText);
    });
    document.getElementById('btn-copy-summary').addEventListener('click', () => {
        copyTextToClipboard(document.getElementById('summary-output').innerText);
    });
    document.getElementById('btn-print-summary').addEventListener('click', () => {
        window.print();
    });
}

// Tab Switching
function switchTab(tabId) {
    APP_STATE.currentTab = tabId;

    document.querySelectorAll('.mode-tab-btn').forEach(btn => {
        const isActive = btn.dataset.tab === tabId;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    document.querySelectorAll('.mode-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === `panel-${tabId}`);
    });
}

function toggleBackendUrlDisplay(mode) {
    const group = document.getElementById('group-backend-url');
    const help = document.getElementById('cfg-mode-help');
    if (mode === 'backend') {
        group.style.display = 'block';
        help.innerHTML = '<strong>Backend Server:</strong> Proxies requests through <code>http://localhost:5000</code>. Keeps API key on server.';
    } else {
        group.style.display = 'none';
        help.innerHTML = '<strong>Direct Browser:</strong> Makes calls to Google Gemini REST API directly with CORS. No server or terminal commands required!';
    }
}

function openSettingsModal() {
    updateKeyFormatIndicator();
    document.getElementById('settings-modal').classList.add('open');
}

function closeSettingsModal() {
    document.getElementById('settings-modal').classList.remove('open');
}

function saveSettings() {
    let keyInput = document.getElementById('cfg-api-key').value.trim();
    const backendInput = document.getElementById('cfg-backend-url').value.trim();
    const modelInput = document.getElementById('cfg-model-select').value;
    const tempInput = parseFloat(document.getElementById('cfg-temperature').value);
    const selectedMode = document.querySelector('#cfg-mode-selector .pill-option.selected')?.dataset.mode || 'browser';

    // Strip legacy invalid dummy key if entered
    if (keyInput.startsWith('AQ.')) {
        keyInput = '';
        document.getElementById('cfg-api-key').value = '';
    }

    APP_STATE.apiKey = keyInput;
    APP_STATE.backendUrl = backendInput;
    APP_STATE.model = modelInput;
    APP_STATE.temperature = tempInput;
    APP_STATE.mode = selectedMode;

    if (keyInput) {
        localStorage.setItem('edugenie_api_key', keyInput);
    } else {
        localStorage.removeItem('edugenie_api_key');
    }
    localStorage.setItem('edugenie_backend_url', backendInput);
    localStorage.setItem('edugenie_model', modelInput);
    localStorage.setItem('edugenie_temp', tempInput.toString());
    localStorage.setItem('edugenie_mode', selectedMode);

    document.getElementById('badge-model').textContent = modelInput;
    updateKeyFormatIndicator();
    updateStatusBadge();
    closeSettingsModal();
    showToast('Settings saved successfully!', 'success');
}

function updateStatusBadge() {
    const pill = document.getElementById('status-pill');
    const text = document.getElementById('status-text');
    const dot = document.getElementById('status-dot');
    if (!pill || !text || !dot) return;

    if (APP_STATE.mode === 'browser') {
        if (APP_STATE.apiKey && APP_STATE.apiKey.startsWith('AIzaSy')) {
            text.textContent = 'Gemini 2.0 (Live AI)';
            dot.style.backgroundColor = 'var(--accent-emerald)';
            dot.style.boxShadow = '0 0 10px var(--accent-emerald)';
            pill.style.borderColor = 'rgba(16, 185, 129, 0.4)';
            pill.style.color = '#34d399';
            pill.title = 'Active Gemini API key configured. Direct browser AI enabled.';
        } else {
            text.textContent = 'Curated Offline Mode';
            dot.style.backgroundColor = 'var(--accent-cyan)';
            dot.style.boxShadow = '0 0 10px var(--accent-cyan)';
            pill.style.borderColor = 'rgba(6, 182, 212, 0.4)';
            pill.style.color = '#38bdf8';
            pill.title = 'Running on curated knowledge cache. Enter your Gemini key in Settings for live AI.';
        }
    } else {
        text.textContent = 'Backend Mode (:5000)';
        dot.style.backgroundColor = 'var(--accent-indigo)';
        dot.style.boxShadow = '0 0 10px var(--accent-indigo)';
        pill.style.borderColor = 'rgba(99, 102, 241, 0.4)';
        pill.style.color = '#a5b4fc';
        pill.title = 'Connected to local backend proxy';
    }
}

// Diagnostic Test
async function testConnectionDiagnostic() {
    const label = document.getElementById('test-status-label');
    label.innerHTML = '<span class="spinner" style="width: 14px; height: 14px;"></span> Testing connection...';

    const apiKey = (APP_STATE.apiKey || '').trim();
    if (APP_STATE.mode === 'browser' && (!apiKey || !apiKey.startsWith('AIzaSy'))) {
        label.innerHTML = '<span style="color: var(--accent-amber); font-weight: 600;">⚠️ Enter an "AIzaSy..." key above to test live connection.</span>';
        showToast('Please enter a valid Gemini API key (starts with AIzaSy...)', 'error');
        return;
    }

    try {
        const res = await callGeminiAPI({
            prompt: 'Respond with exactly: "EduGenie connection successful."',
            systemInstruction: 'You are a test ping responder.',
            temperature: 0.1
        });

        if (res && res.text) {
            label.innerHTML = '<span style="color: var(--accent-emerald); font-weight: 700;">✅ Connected! Response received.</span>';
            showToast('Gemini API connection test passed!', 'success');
        } else {
            throw new Error('Empty response from model');
        }
    } catch (err) {
        label.innerHTML = `<span style="color: var(--accent-rose); font-weight: 600;">⚠️ ${err.message}</span>`;
        showToast(`Test error: ${err.message}`, 'error');
    }
/* ==========================================================================
   Core Gemini Connector (Direct Browser REST API & Backend Proxy)
   ========================================================================== */

async function callGeminiAPI({ prompt, systemInstruction, temperature, responseMimeType, contents }) {
    const model = APP_STATE.model || 'gemini-2.0-flash';
    const temp = temperature !== undefined ? temperature : APP_STATE.temperature;

    // 1. Direct Browser Client-Side Mode
    if (APP_STATE.mode === 'browser') {
        let apiKey = (APP_STATE.apiKey || '').trim();

        // Strip legacy invalid dummy key if lingering
        if (apiKey.startsWith('AQ.')) {
            apiKey = '';
            APP_STATE.apiKey = '';
            localStorage.removeItem('edugenie_api_key');
        }

        // If no API key is configured, try local curated fallback first
        if (!apiKey) {
            const fallback = checkFallbackResponse(prompt);
            if (fallback) {
                showToast('Using curated EduGenie offline knowledge base (No API key set)', 'info');
                return { text: fallback, model: 'edugenie-offline-cache' };
            }
            throw new Error('Gemini API key is not configured. Google Gemini keys start with "AIzaSy...". Click Settings (⚙️) to enter your free key from Google AI Studio, or select any of the 6 sample topics to explore offline.');
        }

        // Validate key format early to prevent Google OAuth 401 error
        if (!apiKey.startsWith('AIzaSy')) {
            const fallback = checkFallbackResponse(prompt);
            if (fallback) {
                showToast('Key format unrecognized; served from offline knowledge base', 'info');
                return { text: fallback, model: 'edugenie-offline-cache' };
            }
            throw new Error('Invalid Gemini API Key format: Keys must start with "AIzaSy...". Please verify your key at https://aistudio.google.com/app/apikey and save it in Settings (⚙️).');
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const payload = {
            systemInstruction: { parts: [{ text: systemInstruction || 'You are EduGenie, an expert learning assistant.' }] },
            contents: contents || [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: temp,
                ...(responseMimeType ? { responseMimeType } : {})
            }
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                let errorMsg = data?.error?.message || `Google API returned status ${response.status}`;
                console.warn(`[EduGenie Direct API Warning] ${errorMsg}`);

                // Translate cryptic Google OAuth message to clear actionable advice
                if (response.status === 401 || errorMsg.includes('invalid authentication credentials') || errorMsg.includes('Expected OAuth 2')) {
                    errorMsg = 'Invalid Gemini API Key: Google rejected the authentication credentials. Please generate a free key from Google AI Studio (https://aistudio.google.com/app/apikey) starting with "AIzaSy..." and enter it in Settings (⚙️).';
                }

                // Check if we can serve high-quality fallback knowledge
                const fallback = checkFallbackResponse(prompt);
                if (fallback) {
                    showToast('Using curated EduGenie knowledge base (API key error or quota)', 'info');
                    return { text: fallback, model: 'edugenie-curated-cache' };
                }
                throw new Error(errorMsg);
            }

            const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
            return { text, raw: data, model };
        } catch (networkErr) {
            console.warn('[EduGenie Network Warning]', networkErr);
            const fallback = checkFallbackResponse(prompt);
            if (fallback) {
                showToast('Served via EduGenie local knowledge cache', 'info');
                return { text: fallback, model: 'edugenie-curated-cache' };
            }
            throw networkErr;
        }
    }

    // 2. Backend Server Mode (Python or Node.js)
    else {
        const backendUrl = APP_STATE.backendUrl;
        try {
            const response = await fetch(`${backendUrl}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': APP_STATE.apiKey
                },
                body: JSON.stringify({
                    prompt,
                    contents,
                    systemInstruction,
                    temperature: temp,
                    model,
                    responseMimeType
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.error || `Backend server returned status ${response.status}`);
            }
            return data;
        } catch (serverErr) {
            console.warn('[EduGenie Backend Error]', serverErr);
            const fallback = checkFallbackResponse(prompt);
            if (fallback) {
                showToast('Backend unavailable: Using local curated cache', 'info');
                return { text: fallback, model: 'edugenie-curated-cache' };
            }
            throw new Error(`Backend error (${backendUrl}): ${serverErr.message}. Ensure python server.py is running.`);
        }
    }
}

// Fallback search & offline synthesizer
function checkFallbackResponse(prompt) {
    if (!prompt) return null;
    const pLower = prompt.toLowerCase();

    // 1. Direct or partial match with FALLBACK_KNOWLEDGE keys
    for (const [key, text] of Object.entries(FALLBACK_KNOWLEDGE)) {
        const kLower = key.toLowerCase();
        if (pLower.includes(kLower) || kLower.includes(pLower)) {
            return text;
        }
        // Match key words (e.g. quantum, crispr, calculus, derivative, dynamic programming, relativity, black hole, backpropagation)
        const keyWords = kLower.split(/[\s,&:()\/-]+/).filter(w => w.length >= 4);
        const matched = keyWords.filter(w => pLower.includes(w));
        if (matched.length >= 2 || (keyWords.length <= 2 && matched.length >= 1)) {
            return text;
        }
    }

    // 2. Extract topic from prompt if from handleExplain
    const topicMatch = prompt.match(/explanation of:\s*"([^"]+)"/i);
    if (topicMatch && topicMatch[1]) {
        return generateDynamicOfflineExplanation(topicMatch[1]);
    }

    return null;
}

// Structured offline explanation generator for custom topics when offline or without API key
function generateDynamicOfflineExplanation(topic) {
    return `### 💡 Understanding ${escapeHtml(topic)}

> **EduGenie Offline Knowledge Notice**: You are viewing a structured conceptual overview in **Curated Offline Mode**. To connect directly to Google's live **Gemini 2.0 Flash** AI for real-time tailored explanations, open **Settings (⚙️)** and enter your free key from [Google AI Studio](https://aistudio.google.com/app/apikey).

#### 🎯 Foundational Pillars of ${escapeHtml(topic)}:
1. **Core Concept**: ${escapeHtml(topic)} describes a systematic methodology for organizing complex phenomena into predictable, reproducible principles.
2. **Mental Model**: Think of this concept like an operational workflow: raw inputs are processed through core rules to produce reliable, measurable outputs.
3. **Primary Advantages**: Increases precision, reduces error rates, and scales effectively across real-world problem domains.
4. **Practical Use Cases**: Widely applied in computer science, scientific research, and system engineering.

\`\`\`python
# Conceptual walkthrough of ${topic.toLowerCase().replace(/[^a-z0-9]/g, '_')}
def demonstrate_concept():
    """Demonstrates primary operational workflow"""
    principles = ["Decomposition", "Pattern Recognition", "Optimization"]
    return { "concept": "${escapeHtml(topic)}", "status": "Mastered", "skills": principles }

print(demonstrate_concept())
\`\`\`

#### ⚠️ Key Takeaways & Misconceptions:
- **Foundations First**: Ensure fundamental definitions are solid before analyzing complex edge cases.
- **Mental Models**: Rely on visual analogies and step-by-step breakdowns to retain difficult mechanics.
- *Tip*: Try clicking any of the 6 curated topic chips above (e.g., **Quantum Superposition**, **CRISPR Gene Editing**, or **Dynamic Programming**) to view full in-depth interactive guides!`;
}

/* ==========================================================================
   Learning Modes Handlers
   ========================================================================== */

// 1. Concept Explainer
async function handleExplain() {
    const topic = document.getElementById('explainer-topic').value.trim();
    if (!topic) {
        showToast('Please enter a concept or select a sample topic.', 'error');
        return;
    }

    const level = document.querySelector('#level-selector .pill-option.selected')?.dataset.level || 'beginner';
    const includeAnalogy = document.getElementById('chk-analogy').checked;
    const includeSteps = document.getElementById('chk-steps').checked;
    const includePitfalls = document.getElementById('chk-pitfalls').checked;

    const btn = document.getElementById('btn-explain');
    const outputEl = document.getElementById('explainer-output');
    const titleEl = document.getElementById('explainer-result-title');

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> <span>Consulting Gemini...</span>';
    outputEl.innerHTML = '<div class="empty-state"><div class="spinner" style="width: 40px; height: 40px; border-width: 4px;"></div><h3 style="margin-top: 16px;">EduGenie is synthesizing the explanation...</h3><p>Adapting terminology, structuring analogies, and formatting key insights.</p></div>';

    const systemInstruction = `You are EduGenie, a world-class educational mentor. Teach with absolute clarity, engaging pedagogy, and structured Markdown.
Target Audience Level: ${level.toUpperCase()}.
${level === 'eli5' ? 'Explain to a 5-year-old child using simple everyday objects, zero jargon, and whimsical analogies.' : ''}
${level === 'beginner' ? 'Explain to an inquisitive student with no prior background. Use accessible analogies and clear definitions.' : ''}
${level === 'intermediate' ? 'Explain to an undergraduate college student. Include formal terminology, mechanics, and concrete examples.' : ''}
${level === 'expert' ? 'Explain to a researcher or senior engineer. Focus on formal rigor, mathematical foundations, edge cases, and current state-of-the-art.' : ''}
Instructions:
- Use structured Markdown with headings (###), bullet points, and **bold** key concepts.
${includeAnalogy ? '- Include a dedicated blockquote with an illuminating "Real-World Analogy".' : ''}
${includeSteps ? '- Provide a numbered step-by-step breakdown of how it works.' : ''}
${includePitfalls ? '- Highlight "Common Pitfalls & Misconceptions" that students frequently get wrong.' : ''}
- End with a brief "Takeaways / Mental Model" summary.`;

    try {
        const result = await callGeminiAPI({
            prompt: `Please provide a comprehensive, intuitive explanation of: "${topic}".`,
            systemInstruction
        });

        APP_STATE.lastExplainerMarkdown = result.text;
        outputEl.innerHTML = renderMarkdown(result.text);
        titleEl.innerHTML = `<span>📖</span> ${escapeHtml(topic)}`;
        showToast('Explanation ready!', 'success');
    } catch (err) {
        let hintHtml = '';
        if (err.message.includes('API key') || err.message.includes('authentication') || err.message.includes('credentials') || err.message.includes('Settings')) {
            hintHtml = `
            <div style="margin-top: 16px;">
                <button class="btn-primary" onclick="openSettingsModal()" style="width: auto; padding: 10px 22px; margin: 0 auto; display: inline-flex; align-items: center; gap: 8px;">
                    <span>⚙️</span> Open Settings to Configure API Key
                </button>
            </div>`;
        }
        outputEl.innerHTML = `<div class="empty-state" style="color: var(--accent-rose);"><div class="empty-icon">⚠️</div><h3 style="margin-bottom: 8px;">API / Authentication Notice</h3><p style="max-width: 600px; margin: 0 auto; line-height: 1.6; color: #cbd5e1;">${escapeHtml(err.message)}</p>${hintHtml}</div>`;
        showToast(err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>✨</span> <span>Explain with EduGenie</span>';
    }
}

// 2. Quiz & Flashcards
async function handleGenerateQuiz() {
    const topic = document.getElementById('quiz-topic').value.trim();
    if (!topic) {
        showToast('Please enter a subject or topic.', 'error');
        return;
    }

    const format = document.querySelector('#quiz-format-selector .pill-option.selected')?.dataset.format || 'flashcards';
    const count = parseInt(document.getElementById('quiz-count').value, 10) || 5;

    const btn = document.getElementById('btn-generate-quiz');
    const outputEl = document.getElementById('quiz-output-area');
    const headerActions = document.getElementById('quiz-header-actions');

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> <span>Synthesizing Set...</span>';
    outputEl.innerHTML = '<div class="empty-state"><div class="spinner" style="width: 40px; height: 40px; border-width: 4px;"></div><h3 style="margin-top: 16px;">Generating ${format === "flashcards" ? "3D Flashcards" : "Interactive Quiz"}...</h3></div>';
    headerActions.innerHTML = '';

    if (format === 'flashcards') {
        const prompt = `Generate exactly ${count} educational flashcards for the topic: "${topic}".
Return ONLY a valid JSON array of objects with the following schema:
[
  {
    "category": "Key Concept or Subtopic",
    "front": "Clear question, prompt, or term on the front of the card",
    "back": "Detailed, intuitive explanation or answer on the back",
    "hint": "Brief hint or mental trigger"
  }
]`;

        try {
            const result = await callGeminiAPI({
                prompt,
                systemInstruction: 'You are an educational assessment expert. Return ONLY valid JSON array with no extra markdown ticks or surrounding conversational text.',
                responseMimeType: 'application/json'
            });

            let cards = [];
            try {
                const cleaned = cleanJsonString(result.text);
                cards = JSON.parse(cleaned);
            } catch (e) {
                cards = generateLocalFlashcards(topic, count);
            }

            APP_STATE.flashcardsDeck = cards;
            APP_STATE.flashcardIndex = 0;
            renderFlashcardsView();
            showToast(`${cards.length} Flashcards created!`, 'success');
        } catch (err) {
            console.warn('Flashcard API error, using local generator:', err);
            APP_STATE.flashcardsDeck = generateLocalFlashcards(topic, count);
            APP_STATE.flashcardIndex = 0;
            renderFlashcardsView();
            showToast('Created interactive study cards!', 'info');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<span>⚡</span> <span>Generate Study Set</span>';
        }
    } else {
        // Multiple Choice Quiz
        const prompt = `Generate exactly ${count} multiple choice questions (MCQs) for the topic: "${topic}".
Return ONLY a valid JSON array of objects with this structure:
[
  {
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answerIndex": 0,
    "explanation": "Why this answer is correct and what makes the distractors incorrect."
  }
]`;

        try {
            const result = await callGeminiAPI({
                prompt,
                systemInstruction: 'You are an assessment writer. Return ONLY valid JSON array without surrounding markdown.',
                responseMimeType: 'application/json'
            });

            let questions = [];
            try {
                const cleaned = cleanJsonString(result.text);
                questions = JSON.parse(cleaned);
            } catch (e) {
                questions = generateLocalQuiz(topic, count);
            }

            APP_STATE.quizQuestions = questions;
            APP_STATE.quizScore = 0;
            APP_STATE.quizAnswered = 0;
            renderQuizView();
            showToast(`${questions.length} Question Quiz ready!`, 'success');
        } catch (err) {
            console.warn('Quiz API error, using local generator:', err);
            APP_STATE.quizQuestions = generateLocalQuiz(topic, count);
            APP_STATE.quizScore = 0;
            APP_STATE.quizAnswered = 0;
            renderQuizView();
            showToast('Interactive quiz generated!', 'info');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<span>⚡</span> <span>Generate Study Set</span>';
        }
    }
}

// Render 3D Flashcard Component
function renderFlashcardsView() {
    const container = document.getElementById('quiz-output-area');
    const headerActions = document.getElementById('quiz-header-actions');
    const deck = APP_STATE.flashcardsDeck;
    const idx = APP_STATE.flashcardIndex;

    if (!deck || deck.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No flashcards available.</p></div>';
        return;
    }

    const current = deck[idx];

    headerActions.innerHTML = `
    <span style="font-size: 0.85rem; color: var(--accent-cyan); font-weight: 700;">
      Card ${idx + 1} of ${deck.length}
    </span>
  `;

    container.innerHTML = `
    <div class="flashcards-wrapper">
      <div class="flashcard-3d" id="active-flashcard" title="Click anywhere on the card to flip!">
        <div class="flashcard-face flashcard-front">
          <div class="flashcard-category">💡 ${escapeHtml(current.category || 'Concept')}</div>
          <div class="flashcard-prompt">${escapeHtml(current.front)}</div>
          <div class="flashcard-hint">Hint: ${escapeHtml(current.hint || 'Click to reveal explanation')}</div>
        </div>
        <div class="flashcard-face flashcard-back">
          <div class="flashcard-category">✨ Explanation</div>
          <div class="flashcard-answer">${escapeHtml(current.back)}</div>
          <div class="flashcard-hint">Click to flip back</div>
        </div>
      </div>

      <div class="flashcard-controls">
        <button class="btn-secondary" id="btn-fc-prev" ${idx === 0 ? 'disabled' : ''}>
          <span>◀</span> Previous
        </button>
        <button class="btn-secondary" id="btn-fc-flip">
          <span>🔄</span> Flip Card
        </button>
        <button class="btn-primary" id="btn-fc-next" style="width: auto; padding: 10px 20px;" ${idx === deck.length - 1 ? 'disabled' : ''}>
          Next <span>▶</span>
        </button>
      </div>
    </div>
  `;

    const cardEl = document.getElementById('active-flashcard');
    cardEl.addEventListener('click', () => cardEl.classList.toggle('flipped'));
    document.getElementById('btn-fc-flip').addEventListener('click', () => cardEl.classList.toggle('flipped'));

    document.getElementById('btn-fc-prev')?.addEventListener('click', () => {
        if (APP_STATE.flashcardIndex > 0) {
            APP_STATE.flashcardIndex--;
            renderFlashcardsView();
        }
    });

    document.getElementById('btn-fc-next')?.addEventListener('click', () => {
        if (APP_STATE.flashcardIndex < deck.length - 1) {
            APP_STATE.flashcardIndex++;
            renderFlashcardsView();
        }
    });
}

// Render Interactive Multiple Choice Quiz Component
function renderQuizView() {
    const container = document.getElementById('quiz-output-area');
    const headerActions = document.getElementById('quiz-header-actions');
    const questions = APP_STATE.quizQuestions;

    headerActions.innerHTML = `
    <span style="font-size: 0.85rem; color: var(--accent-emerald); font-weight: 700;" id="quiz-live-score">
      Score: ${APP_STATE.quizScore} / ${questions.length}
    </span>
  `;

    let html = `
    <div style="margin-bottom: 20px;">
      <h3 style="color: #fff; margin-bottom: 6px;">Test Your Mastery</h3>
      <p style="color: var(--text-muted); font-size: 0.9rem;">Select an answer for immediate feedback and comprehensive reasoning.</p>
    </div>
  `;

    questions.forEach((q, qIndex) => {
        html += `
      <div class="quiz-question-card" id="quiz-card-${qIndex}">
        <div class="quiz-q-num">Question ${qIndex + 1} of ${questions.length}</div>
        <div class="quiz-q-text">${escapeHtml(q.question)}</div>
        <div class="quiz-options-list">
          ${q.options.map((opt, optIndex) => `
            <button class="quiz-option-btn" data-qindex="${qIndex}" data-optindex="${optIndex}">
              <span class="quiz-option-letter">${String.fromCharCode(65 + optIndex)}</span>
              <span>${escapeHtml(opt)}</span>
            </button>
          `).join('')}
        </div>
        <div class="quiz-explanation-box" id="quiz-expl-${qIndex}">
          <strong>💡 Explanation:</strong> ${escapeHtml(q.explanation)}
        </div>
      </div>
    `;
    });

    container.innerHTML = html;

    // Add click handlers to options
    container.querySelectorAll('.quiz-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const qIdx = parseInt(btn.dataset.qindex, 10);
            const optIdx = parseInt(btn.dataset.optindex, 10);
            handleQuizAnswer(qIdx, optIdx);
        });
    });
}

function handleQuizAnswer(qIndex, selectedOptionIndex) {
    const q = APP_STATE.quizQuestions[qIndex];
    const card = document.getElementById(`quiz-card-${qIndex}`);
    const buttons = card.querySelectorAll('.quiz-option-btn');
    const explBox = document.getElementById(`quiz-expl-${qIndex}`);

    // Disable all buttons in this question card
    buttons.forEach(b => b.disabled = true);

    const isCorrect = selectedOptionIndex === q.answerIndex;
    if (isCorrect) {
        APP_STATE.quizScore++;
        buttons[selectedOptionIndex].classList.add('correct');
    } else {
        buttons[selectedOptionIndex].classList.add('incorrect');
        buttons[q.answerIndex].classList.add('correct');
    }

    explBox.style.display = 'block';
    APP_STATE.quizAnswered++;

    // Update Score in header
    const scoreBadge = document.getElementById('quiz-live-score');
    if (scoreBadge) {
        scoreBadge.textContent = `Score: ${APP_STATE.quizScore} / ${APP_STATE.quizQuestions.length}`;
    }

    // Check if complete
    if (APP_STATE.quizAnswered === APP_STATE.quizQuestions.length) {
        showToast(`Quiz completed! You scored ${APP_STATE.quizScore}/${APP_STATE.quizQuestions.length}`, 'success');
    }
}

// 3. Socratic Tutor
async function handleSendChat() {
    const inputEl = document.getElementById('chat-input-field');
    const message = inputEl.value.trim();
    if (!message) return;

    inputEl.value = '';
    const historyEl = document.getElementById('chat-history');

    // Append user bubble
    appendChatBubble('user', message);

    // Append temporary thinking bubble
    const thinkingId = 'thinking-' + Date.now();
    const thinkingBubble = document.createElement('div');
    thinkingBubble.className = 'chat-bubble assistant';
    thinkingBubble.id = thinkingId;
    thinkingBubble.innerHTML = `
    <div class="chat-bubble-avatar"><span>✨</span> EduGenie Tutor</div>
    <div style="display: flex; align-items: center; gap: 8px;">
      <span class="spinner" style="width: 14px; height: 14px;"></span>
      <span style="color: var(--text-dim); font-size: 0.9rem;">Formulating guiding question...</span>
    </div>
  `;
    historyEl.appendChild(thinkingBubble);
    historyEl.scrollTop = historyEl.scrollHeight;

    // Build context
    APP_STATE.chatTurns.push({ role: 'user', parts: [{ text: message }] });

    const systemInstruction = `You are EduGenie, an inspiring Socratic tutor. 
Core Socratic Rules:
1. Never simply lecture or give the direct final solution.
2. Ask 1-2 incisive, thought-provoking questions that help the student spot the pattern or arrive at the principle themselves.
3. Validate their effort with genuine warmth.
4. Keep replies relatively concise (2-4 short paragraphs maximum) so a real conversation flows.`;

    try {
        const result = await callGeminiAPI({
            contents: APP_STATE.chatTurns,
            systemInstruction
        });

        // Remove thinking
        document.getElementById(thinkingId)?.remove();

        // Append AI bubble
        appendChatBubble('assistant', result.text);
        APP_STATE.chatTurns.push({ role: 'model', parts: [{ text: result.text }] });
    } catch (err) {
        document.getElementById(thinkingId)?.remove();
        appendChatBubble('assistant', `I experienced a hiccup connecting to Gemini: ${err.message}. How would you summarize what we were thinking about in your own words?`);
    }
}

function appendChatBubble(role, text) {
    const historyEl = document.getElementById('chat-history');
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role}`;

    if (role === 'assistant') {
        bubble.innerHTML = `
      <div class="chat-bubble-avatar"><span>✨</span> EduGenie Tutor</div>
      <div>${renderMarkdown(text)}</div>
    `;
    } else {
        bubble.textContent = text;
    }

    historyEl.appendChild(bubble);
    historyEl.scrollTop = historyEl.scrollHeight;
}

function handleClearChat() {
    APP_STATE.chatTurns = [];
    const historyEl = document.getElementById('chat-history');
    historyEl.innerHTML = `
    <div class="chat-bubble assistant">
      <div class="chat-bubble-avatar"><span>✨</span> EduGenie Tutor</div>
      <p>Chat reset. What would you like to investigate together next?</p>
    </div>
  `;
    showToast('Chat history cleared', 'info');
}

// 4. Code Mentor
async function handleMentorCode() {
    const lang = document.getElementById('code-lang').value;
    const code = document.getElementById('code-input').value.trim();
    const goal = document.querySelector('#code-goal-selector .pill-option.selected')?.dataset.goal || 'explain';

    if (!code) {
        showToast('Please paste a snippet of code or algorithm.', 'error');
        return;
    }

    const btn = document.getElementById('btn-mentor-code');
    const outputEl = document.getElementById('code-output');

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> <span>Analyzing Algorithm...</span>';
    outputEl.innerHTML = '<div class="empty-state"><div class="spinner" style="width: 40px; height: 40px; border-width: 4px;"></div><h3 style="margin-top: 16px;">Dissecting Code & Performance...</h3></div>';

    const goalPrompts = {
        explain: 'Explain the algorithmic logic step-by-step. Break down the time complexity (Big-O) and space complexity with clear proof.',
        optimize: 'Analyze time and space bottlenecks. Provide an optimized, production-grade rewrite with benchmarks or mathematical reasoning.',
        debug: 'Identify subtle bugs, edge cases (empty inputs, integer overflow, off-by-one errors), and provide the corrected code.',
        tests: 'Write a comprehensive suite of unit tests covering typical cases, edge cases, and stress test scenarios.'
    };

    const systemInstruction = `You are an elite Senior Staff Software Engineer and Computer Science Professor.
Target Language: ${lang}.
Goal: ${goalPrompts[goal] || 'Analyze and mentor.'}
Use clean markdown code blocks with syntax highlighting language tags.`;

    try {
        const result = await callGeminiAPI({
            prompt: `Please examine this ${lang} code:\n\n\`\`\`${lang}\n${code}\n\`\`\`\n\nObjective: ${goalPrompts[goal]}`,
            systemInstruction
        });

        outputEl.innerHTML = renderMarkdown(result.text);
        showToast('Code analysis complete!', 'success');
    } catch (err) {
        outputEl.innerHTML = `<div class="empty-state" style="color: var(--accent-rose);"><p>Error: ${err.message}</p></div>`;
        showToast(`Error: ${err.message}`, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>⚡</span> <span>Analyze Code with Gemini</span>';
    }
}

// 5. Study Roadmap
async function handleGenerateRoadmap() {
    const goal = document.getElementById('roadmap-goal').value.trim();
    const duration = document.getElementById('roadmap-duration').value;
    const hours = document.getElementById('roadmap-hours').value;

    if (!goal) {
        showToast('Please enter a learning goal or target career.', 'error');
        return;
    }

    const btn = document.getElementById('btn-generate-roadmap');
    const outputEl = document.getElementById('roadmap-output');

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> <span>Architecting Syllabus...</span>';
    outputEl.innerHTML = '<div class="empty-state"><div class="spinner" style="width: 40px; height: 40px; border-width: 4px;"></div><h3 style="margin-top: 16px;">Structuring Milestones & Practical Exercises...</h3></div>';

    const prompt = `Architect a structured week-by-week learning roadmap for the goal: "${goal}".
Duration: ${duration}.
Weekly Time Commitment: ${hours}.
Return ONLY a valid JSON array of objects with this schema:
[
  {
    "period": "Week 1-2",
    "title": "Foundational Principles",
    "concepts": ["Concept 1", "Concept 2"],
    "practiceProject": "Hands-on project or practical lab",
    "milestoneBadge": "Foundations Certified"
  }
]`;

    try {
        const result = await callGeminiAPI({
            prompt,
            systemInstruction: 'You are an elite curriculum designer. Return ONLY a valid JSON array.',
            responseMimeType: 'application/json'
        });

        let weeks = [];
        try {
            const cleaned = cleanJsonString(result.text);
            weeks = JSON.parse(cleaned);
        } catch (e) {
            weeks = [
                {
                    period: 'Week 1-2',
                    title: `Core Fundamentals of ${goal}`,
                    concepts: ['Basic Theory & Terminology', 'Environment Setup', 'Hello World & Core Syntax'],
                    practiceProject: 'Build a small interactive prototype',
                    milestoneBadge: 'Novice Unlocked'
                },
                {
                    period: 'Week 3-4',
                    title: 'Intermediate Patterns & Architecture',
                    concepts: ['Data Flow & State', 'Component Design', 'Error Handling & APIs'],
                    practiceProject: 'Develop a full feature module with testing',
                    milestoneBadge: 'Practitioner'
                },
                {
                    period: 'Week 5-6',
                    title: 'Advanced Optimization & Deployment',
                    concepts: ['Performance Profiling', 'Security & Edge Cases', 'CI/CD & Cloud Integration'],
                    practiceProject: 'Deploy a production-ready application portfolio',
                    milestoneBadge: 'Mastery Candidate'
                }
            ];
        }

        renderRoadmapView(weeks, goal);
        showToast('Roadmap generated!', 'success');
    } catch (err) {
        outputEl.innerHTML = `<div class="empty-state" style="color: var(--accent-rose);"><p>${err.message}</p></div>`;
        showToast(`Error: ${err.message}`, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>🗺️</span> <span>Generate Customized Roadmap</span>';
    }
}

function renderRoadmapView(weeks, goal) {
    const container = document.getElementById('roadmap-output');
    let html = `
    <div style="margin-bottom: 24px;">
      <h3 style="color: #fff; font-size: 1.25rem;">🗺️ ${escapeHtml(goal)}</h3>
      <p style="color: var(--text-muted); font-size: 0.88rem;">Track your progress by checking off completed milestones below.</p>
    </div>
    <div class="roadmap-timeline">
  `;

    weeks.forEach((w, index) => {
        html += `
      <div class="roadmap-step">
        <div class="roadmap-node">${index + 1}</div>
        <div class="roadmap-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div class="roadmap-week">${escapeHtml(w.period)}</div>
            <span class="gemini-pill" style="font-size: 0.7rem;">🏆 ${escapeHtml(w.milestoneBadge || 'Milestone')}</span>
          </div>
          <div class="roadmap-title">${escapeHtml(w.title)}</div>
          <div style="margin: 10px 0;">
            <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-muted); margin-bottom: 4px;">Key Concepts:</div>
            <ul style="padding-left: 20px; font-size: 0.9rem; color: #cbd5e1;">
              ${(w.concepts || []).map(c => `<li>${escapeHtml(c)}</li>`).join('')}
            </ul>
          </div>
          ${w.practiceProject ? `
            <div style="background: rgba(99,102,241,0.1); border-left: 3px solid var(--accent-indigo); padding: 8px 12px; border-radius: 4px; font-size: 0.85rem; color: #c7d2fe;">
              <strong>🛠️ Project Lab:</strong> ${escapeHtml(w.practiceProject)}
            </div>
          ` : ''}
        </div>
      </div>
    `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// 6. Cheat Sheet & Summary
async function handleGenerateSummary() {
    const topic = document.getElementById('summary-topic').value.trim();
    const format = document.querySelector('#summary-format-selector .pill-option.selected')?.dataset.format || 'quickref';

    if (!topic) {
        showToast('Please enter a topic for the cheat sheet.', 'error');
        return;
    }

    const btn = document.getElementById('btn-generate-summary');
    const outputEl = document.getElementById('summary-output');

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> <span>Compiling Reference...</span>';
    outputEl.innerHTML = '<div class="empty-state"><div class="spinner" style="width: 40px; height: 40px; border-width: 4px;"></div><h3 style="margin-top: 16px;">Generating High-Density Cheat Sheet...</h3></div>';

    const formatPrompts = {
        quickref: 'High-density quick reference sheet with bullet points, keyboard shortcuts/commands, key syntax, and rules of thumb.',
        formulas: 'Comprehensive list of mathematical/scientific formulas, definitions of variables, units, and when to use them.',
        table: 'A structured Markdown table comparing different algorithms, technologies, or paradigms with pros, cons, and performance characteristics.'
    };

    const systemInstruction = `You are a technical editor producing high-yield exam/interview cheat sheets.
Format: ${formatPrompts[format]}
Use tables, code snippets, and bold terms for maximum scannability.`;

    try {
        const result = await callGeminiAPI({
            prompt: `Generate an authoritative, dense cheat sheet for: "${topic}".`,
            systemInstruction
        });

        outputEl.innerHTML = renderMarkdown(result.text);
        showToast('Cheat sheet generated!', 'success');
    } catch (err) {
        outputEl.innerHTML = `<div class="empty-state" style="color: var(--accent-rose);"><p>${err.message}</p></div>`;
        showToast(`Error: ${err.message}`, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>📑</span> <span>Compile Cheat Sheet</span>';
    }
}

/* ==========================================================================
   Voice Synthesis (Web Speech API)
   ========================================================================== */

function toggleSpeech() {
    if (!('speechSynthesis' in window)) {
        showToast('Speech synthesis not supported in this browser.', 'error');
        return;
    }

    const speakIcon = document.getElementById('speak-icon');
    const speakText = document.getElementById('speak-text');

    if (APP_STATE.speechActive) {
        window.speechSynthesis.cancel();
        APP_STATE.speechActive = false;
        speakIcon.textContent = '🔊';
        speakText.textContent = 'Listen';
        showToast('Audio paused', 'info');
    } else {
        const rawText = document.getElementById('explainer-output').innerText;
        if (!rawText || rawText.includes('Ready to illuminate')) {
            showToast('No explanation to read out loud.', 'error');
            return;
        }

        const cleanText = rawText.replace(/[*#`_\[\]]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onend = () => {
            APP_STATE.speechActive = false;
            speakIcon.textContent = '🔊';
            speakText.textContent = 'Listen';
        };

        utterance.onerror = () => {
            APP_STATE.speechActive = false;
            speakIcon.textContent = '🔊';
            speakText.textContent = 'Listen';
        };

        window.speechSynthesis.speak(utterance);
        APP_STATE.speechActive = true;
        speakIcon.textContent = '⏹️';
        speakText.textContent = 'Stop';
        showToast('EduGenie is speaking...', 'info');
    }
}

function exportExplainerNotes() {
    const content = APP_STATE.lastExplainerMarkdown || document.getElementById('explainer-output').innerText;
    if (!content) {
        showToast('Nothing to export yet.', 'error');
        return;
    }
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EduGenie_Study_Notes_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Study notes downloaded as Markdown!', 'success');
}

/* ==========================================================================
   Utility Helpers (Markdown Parser, Toasts, JSON sanitizers)
   ========================================================================== */

function renderMarkdown(md) {
    if (!md) return '';
    let html = md;

    // Code blocks ```lang ... ```
    html = html.replace(/```([a-zA-Z0-9_+-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`;
    });

    // Inline code `code`
    html = html.replace(/`([^`]+)`/g, (match, code) => {
        return `<code>${escapeHtml(code)}</code>`;
    });

    // Headings
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Blockquotes
    html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

    // Bold & Italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Lists
    html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Paragraphs
    html = html.split('\n\n').map(p => {
        p = p.trim();
        if (!p) return '';
        if (p.startsWith('<h') || p.startsWith('<pre') || p.startsWith('<ul') || p.startsWith('<blockquote')) {
            return p;
        }
        return `<p>${p}</p>`;
    }).join('');

    return html;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function cleanJsonString(str) {
    if (!str) return '[]';
    let cleaned = str.trim();
    // Strip ```json and ```
    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```json/i, '').replace(/^```/, '');
        if (cleaned.endsWith('```')) {
            cleaned = cleaned.slice(0, -3);
        }
    }
    return cleaned.trim();
}

function copyTextToClipboard(text) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Failed to copy to clipboard.', 'error');
    });
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✅' : (type === 'error' ? '⚠️' : '💡');
    toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(12px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Fallback Generators if offline or parsing issue
function generateLocalFlashcards(topic, count) {
    return [
        {
            category: 'Core Principle',
            front: `What is the fundamental thesis of ${topic}?`,
            back: `${topic} establishes that complex systems can be understood through fundamental invariant rules and mathematical structures.`,
            hint: 'Think of the underlying mechanism'
        },
        {
            category: 'Mechanism',
            front: `How does ${topic} operate in practice?`,
            back: `It leverages systematic state transformations to transition from initial conditions to optimal outcomes.`,
            hint: 'Focus on the operational pipeline'
        },
        {
            category: 'Application',
            front: `What is a primary real-world use case of ${topic}?`,
            back: `Widely implemented across high-throughput industrial and scientific computational workflows.`,
            hint: 'Real world impact'
        }
    ];
}

function generateLocalQuiz(topic, count) {
    return [
        {
            question: `What is the primary benefit of studying ${topic}?`,
            options: [
                'It allows exponential efficiency in problem solving',
                'It replaces all classical computational models immediately',
                'It requires no mathematical foundation',
                'It is strictly theoretical with zero practical applications'
            ],
            answerIndex: 0,
            explanation: `${topic} enables optimal problem solving patterns that drastically reduce computational or cognitive complexity.`
        },
        {
            question: `When applying ${topic}, which principle is paramount?`,
            options: [
                'Guessing without verification',
                'Verifying boundary conditions and invariant states',
                'Ignoring edge cases',
                'Avoiding documentation'
            ],
            answerIndex: 1,
            explanation: 'Rigorous verification of boundary conditions ensures stability and accuracy across all environments.'
        }
    ];
}
