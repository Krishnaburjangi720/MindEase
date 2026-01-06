// API Configuration
const API_CONFIG = {
    chat: "https://magicloops.dev/api/loop/f9dd8d93-3d6c-4874-a3d7-6b0821a0e877/run",
    recovery: "https://magicloops.dev/api/loop/62affb5d-2d7f-4649-a056-fd5c373b8f83/run"
};

// SAFETY: Crisis keywords to trigger circuit breaker
const CRISIS_KEYWORDS = ['suicide', 'kill myself', 'want to die', 'harm myself', 'end it all', 'no reason to live'];

// UI Logic
function switchView(viewId, btn) {
    // Hide all views
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
        v.style.display = 'none';
    });
    
    // Deactivate buttons
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    
    // Activate selected
    const activeView = document.getElementById(viewId);
    activeView.style.display = 'flex';
    setTimeout(() => activeView.classList.add('active'), 10);
    
    btn.classList.add('active');
}

function createTypingIndicator() {
    const div = document.createElement('div');
    div.className = 'typing-indicator';
    div.id = 'typingIndicator';
    div.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    return div;
}

function appendMessage(text, isUser) {
    const container = document.getElementById('chatMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isUser ? 'user-msg' : 'bot-msg'}`;
    msgDiv.innerHTML = text; // Changed to innerHTML to support bolding/line breaks if needed
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

// NEW: Function to handle Quick Chip clicks
function sendChip(text) {
    const input = document.getElementById('chatInput');
    input.value = text;
    processChat();
    // Optional: Hide chips after use to declutter
    // document.getElementById('quickChips').style.display = 'none'; 
}

// Chat Feature
async function processChat() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    const lowerText = text.toLowerCase();
    
    if (!text) return;

    appendMessage(text, true);
    input.value = '';

    // --- 1. SAFETY CIRCUIT BREAKER ---
    // If the user mentions self-harm, stop AI and show resources.
    const isCrisis = CRISIS_KEYWORDS.some(keyword => lowerText.includes(keyword));

    if (isCrisis) {
        const container = document.getElementById('chatMessages');
        const safetyDiv = document.createElement('div');
        safetyDiv.className = 'message bot-msg';
        safetyDiv.style.borderLeft = "4px solid var(--accent-warn)";
        safetyDiv.style.backgroundColor = "#fff5f5";
        safetyDiv.innerHTML = `
            <strong>I'm hearing that you are in a lot of pain.</strong><br>
            Please reach out to a human who can help immediately.<br><br>
            📞 <strong>AASRA:</strong> 9820466726<br>
            📞 <strong>Emergency:</strong> 112<br>
            <br>You are not alone. Please call one of these numbers now.
        `;
        container.appendChild(safetyDiv);
        container.scrollTop = container.scrollHeight;
        return; // STOP EXECUTION HERE
    }

    // --- 2. Normal AI Flow ---
    const container = document.getElementById('chatMessages');
    container.appendChild(createTypingIndicator());
    container.scrollTop = container.scrollHeight;

    try {
        const response = await fetch(API_CONFIG.chat, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: text })
        });
        const data = await response.json();
        
        document.getElementById('typingIndicator').remove();
        
        // Fallback text if API is silent
        appendMessage(data.answer || "I am here for you. Please tell me more.", false);
    } catch (error) {
        if(document.getElementById('typingIndicator')) {
            document.getElementById('typingIndicator').remove();
        }
        appendMessage("I'm having trouble connecting right now, but I'm still listening. Please check your internet connection.", false);
    }
}

function handleKeyPress(e) {
    if (e.key === 'Enter') processChat();
}

// Recovery Feature
async function generateGuidance() {
    const input = document.getElementById('reflectInput');
    const outputBox = document.getElementById('suggestionBox');
    const outputText = document.getElementById('suggestionContent');
    const text = input.value.trim();

    if (!text) {
        alert("Please describe your situation first.");
        return;
    }

    outputText.innerText = "Generating supportive guidance based on your input...";
    outputBox.style.display = "block";

    try {
        const response = await fetch(API_CONFIG.recovery, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: text })
        });
        const data = await response.json();
        outputText.innerText = data.summary || "Take a deep breath. Focus on small steps. You are doing your best.";
    } catch (error) {
        outputText.innerText = "Unable to generate specific tips right now. Please remember to be kind to yourself.";
    }
}