const chatToggleBtn = document.getElementById('chat-toggle-btn');
const closeChatBtn = document.getElementById('close-chat-btn');
const chatWindow = document.getElementById('chat-window');
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Replace this with your actual n8n webhook URL
const WEBHOOK_URL = 'https://n8n.srv1319269.hstgr.cloud/webhook/mcp-server/http';

let isChatOpen = false;

// Toggle Chat Window
function toggleChat() {
    isChatOpen = !isChatOpen;
    if (isChatOpen) {
        chatWindow.classList.remove('hidden');
        userInput.focus();
    } else {
        chatWindow.classList.add('hidden');
    }
}

chatToggleBtn.addEventListener('click', toggleChat);
closeChatBtn.addEventListener('click', toggleChat);

// Handle Enter Key
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

sendBtn.addEventListener('click', sendMessage);

// Message Handling
async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // Add User Message
    addMessage(text, 'user');
    userInput.value = '';

    // Show Typing Indicator
    const loadingId = showTypingIndicator();

    try {
        // Send to n8n Webhook
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text }) // Adjust key 'message' based on your n8n workflow
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();

        // Remove Typing Indicator
        removeMessage(loadingId);

        // Add Bot Message
        // Assuming the response JSON has a key 'output', 'reply', or 'text'. 
        // Adjust this based on your actual n8n response structure.
        const botReply = data.output || data.reply || data.text || JSON.stringify(data);
        addMessage(botReply, 'bot');

    } catch (error) {
        console.error('Error:', error);
        removeMessage(loadingId);
        addMessage('Sorry, something went wrong. Please check the connection or try again later.', 'bot');
    }
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function showTypingIndicator() {
    const id = 'typing-' + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('typing-indicator');
    loadingDiv.id = id;
    loadingDiv.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    chatMessages.appendChild(loadingDiv);
    scrollToBottom();
    return id;
}

function removeMessage(id) {
    const element = document.getElementById(id);
    if (element) {
        element.remove();
    }
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
