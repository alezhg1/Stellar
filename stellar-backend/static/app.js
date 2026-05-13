const API_BASE = '/api';
let currentSessionId = null;

function showSection(id) {
    document.querySelectorAll('.section').forEach(el => {
        el.classList.remove('active');
        el.classList.add('hidden');
    });
    
    const target = document.getElementById(id);
    target.classList.remove('hidden');
    target.classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

async function fetchTopics() {
    const grid = document.getElementById('topics-grid');
    try {
        const res = await fetch(`${API_BASE}/topics/`);
        const topics = await res.json();
        
        grid.innerHTML = '';
        if(topics.length === 0) {
            grid.innerHTML = '<div class="loader">No topics found. Click "Initialize DB" button.</div>';
            document.getElementById('init-db-btn').style.display = 'block';
            return;
        }

        topics.forEach(topic => {
            const score = topic.progress_score || 0;
            const colorClass = score < 50 ? 'low-score' : '';
            
            const card = document.createElement('div');
            card.className = 'topic-card glass-panel';
            card.onclick = () => startChat(topic.name);
            card.innerHTML = `
                <h3>${topic.name}</h3>
                <small style="color:var(--text-secondary)">${topic.subject}</small>
                <div class="progress-bar">
                    <div class="progress-fill ${colorClass}" style="width: ${score}%"></div>
                </div>
                <small>${score}% Mastery</small>
            `;
            grid.appendChild(card);
        });
    } catch (e) {
        grid.innerHTML = `<div class="loader" style="color:red">Error loading topics: ${e.message}</div>`;
    }
}

async function initDB() {
    await fetch(`${API_BASE}/init/`);
    alert('Database initialized! Refreshing...');
    location.reload();
}

function startChat(topicName) {
    showSection('chat');
    addMessage('ai', `Давай начнем разбирать тему: ${topicName}. Что именно вызывает трудности?`);
}

function addMessage(role, text) {
    const list = document.getElementById('messages-list');
    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.innerHTML = `<div class="bubble">${text}</div>`;
    list.appendChild(div);
    list.scrollTop = list.scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    if (!text) return;

    addMessage('user', text);
    input.value = '';

    const loadingId = 'loading-' + Date.now();
    const list = document.getElementById('messages-list');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai';
    loadingDiv.id = loadingId;
    loadingDiv.innerHTML = `<div class="bubble">...</div>`;
    list.appendChild(loadingDiv);

    try {
        const res = await fetch(`${API_BASE}/chat/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: text,
                session_id: currentSessionId
            })
        });
        const data = await res.json();
        
        document.getElementById(loadingId).remove();

        currentSessionId = data.id;

        const aiMsg = data.messages[data.messages.length - 1];
        addMessage(aiMsg.role, aiMsg.content);

    } catch (e) {
        document.getElementById(loadingId).innerHTML = `<div class="bubble" style="color:red">Error: ${e.message}</div>`;
    }
}

document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

window.addEventListener('DOMContentLoaded', () => {
    fetchTopics();
});
