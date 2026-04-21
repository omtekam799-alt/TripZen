// ============================================================
//  Zeno AI — TripZen Travel Expert
//  Powered by Google Gemini API
//  ⚠️  API key should be moved to backend for production
// ============================================================

// TODO: Move this to backend proxy to hide the API key
// For production: call /api/ai/chat on your backend
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE'; // Replace with your key

const conversationHistory = [];

const SYSTEM_PROMPT = `You are Zeno — the AI travel expert for TripZen, a premium travel agency.

About you:
- You are a friendly, knowledgeable travel advisor
- You speak in clear, conversational English
- You give specific, actionable travel advice: itineraries, budget breakdowns, packing lists, local food tips, transport options
- When asked about a destination, you cover: best time to visit, local food, how to get there, must-see places, and hidden gems
- You suggest TripZen packages when relevant:
    • Goa Tour — 3 Days / 2 Nights — ₹7,999/person
    • Manali Trip — 5 Days / 4 Nights — ₹12,999/person
    • Kerala Backwaters — 4 Days / 3 Nights — ₹14,999/person
    • Shimla-Manali — 7 Days / 6 Nights — ₹18,999/person
    • Royal Rajasthan — 6 Days / 5 Nights — ₹22,999/person
    • Bali Escape (International) — 6 Days / 5 Nights — ₹49,999/person
    • Dubai Tour (International) — 5 Days / 4 Nights — ₹39,999/person
    • Thailand Adventure — 7 Days / 6 Nights — ₹54,999/person
- Use emojis sparingly but naturally
- Use Markdown: **bold** for important info, bullet points for lists
- Be concise and to the point
- If asked about non-travel topics, politely steer the conversation back to travel`;

async function sendMessage() {
  const input = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');
  const text = input.value.trim();

  if (!text || sendBtn.disabled) return;

  const wc = document.getElementById('welcomeCard');
  if (wc) wc.remove();

  appendMessage('user', text);
  conversationHistory.push({ role: 'user', parts: [{ text }] });

  input.value = '';
  input.style.height = 'auto';
  sendBtn.disabled = true;

  const typingId = showTyping();

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: conversationHistory,
        generationConfig: { maxOutputTokens: 1000, temperature: 0.7 }
      })
    });

    removeTyping(typingId);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Something went wrong. Please try again.';

    appendMessage('ai', reply);
    conversationHistory.push({ role: 'model', parts: [{ text: reply }] });

  } catch (err) {
    removeTyping(typingId);
    appendMessage('ai', `**Error:** ${err.message}\n\nPlease add your Gemini API key in ai.js to activate Zeno AI.`);
    console.error('Zeno AI Error:', err);
  }

  sendBtn.disabled = false;
  input.focus();
}

function appendMessage(role, text) {
  const chatArea = document.getElementById('chatArea') || document.getElementById('chatBox');

  const row = document.createElement('div');
  row.className = `msg-row ${role}`;

  const icon = document.createElement('div');
  icon.className = 'msg-icon';
  icon.textContent = role === 'ai' ? '🤖' : '👤';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = renderMarkdown(text);

  row.appendChild(icon);
  row.appendChild(bubble);
  chatArea.appendChild(row);

  setTimeout(() => { chatArea.scrollTop = chatArea.scrollHeight; }, 50);
  return bubble;
}

function renderMarkdown(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<strong style="color:#ffb703">$1</strong>')
    .replace(/^## (.+)$/gm, '<strong style="color:#ffb703;font-size:15px">$1</strong>')
    .replace(/^# (.+)$/gm, '<strong style="color:#ffb703;font-size:16px">$1</strong>')
    .replace(/^\- (.+)$/gm, '&nbsp;&nbsp;• $1')
    .replace(/\n/g, '<br>');
}

function showTyping() {
  const chatArea = document.getElementById('chatArea') || document.getElementById('chatBox');
  const id = 'typing-' + Date.now();
  const row = document.createElement('div');
  row.className = 'msg-row ai';
  row.id = id;
  row.innerHTML = `
    <div class="msg-icon" style="background:linear-gradient(135deg,rgba(255,183,3,0.15),rgba(255,183,3,0.05));border:1px solid rgba(255,183,3,0.15);">🤖</div>
    <div class="msg-bubble" style="padding:10px 14px;">
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>`;
  chatArea.appendChild(row);
  chatArea.scrollTop = chatArea.scrollHeight;
  return id;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function useChip(el) {
  const input = document.getElementById('userInput');
  input.value = el.textContent;
  sendMessage();
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 140) + 'px';
}
