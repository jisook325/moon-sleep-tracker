import Chart from 'chart.js/auto';
import { createClient } from '@supabase/supabase-js';

// --- State Management & Persistence ---
const state = {
    isSleeping: false,
    sleepStartTime: null,
    targetTime: new Date(),
    isManualTime: false,
    currentUser: '',
    settings: {
        supabaseUrl: '',
        supabaseKey: '',
        userList: ['지숙', '엄마', '아빠'],
        targetSleep: 7
    }
};

let supabase = null;

// --- DOM Elements ---
const navItems = document.querySelectorAll('.nav-item');
const tabs = document.querySelectorAll('.tab-content');
const currentTimeEl = document.getElementById('currentTime');
const userSelect = document.getElementById('userSelect');
const targetTimeEl = document.getElementById('targetTime');
const sleepBtn = document.getElementById('sleepBtn');
const wakeBtn = document.getElementById('wakeBtn');
const statusIcon = document.getElementById('statusIcon');
const statusText = document.getElementById('statusText');
const qualityModal = document.getElementById('qualityModal');
const ratingSlider = document.getElementById('ratingSlider');
const ratingDisplay = document.getElementById('ratingDisplay');
const memoInput = document.getElementById('memoInput');

// Settings Inputs
const supabaseUrlInput = document.getElementById('supabaseUrlInput');
const supabaseKeyInput = document.getElementById('supabaseKeyInput');
const userListInput = document.getElementById('userListInput');
const targetSleepInput = document.getElementById('targetSleepInput');

// --- Initialization ---
function init() {
    loadSettings();
    loadSession(); 
    initSupabase();
    syncSettingsToUI();
    startClock();
    setupEventListeners();
    renderUserSelect();
    updateUIState();
}

function initSupabase() {
    if (state.settings.supabaseUrl && state.settings.supabaseKey) {
        supabase = createClient(state.settings.supabaseUrl, state.settings.supabaseKey);
        console.log("Supabase Client Initialized");
    }
}

// --- Persistence ---
function loadSettings() {
    const saved = localStorage.getItem('moonSleepSettings');
    if (saved) {
        state.settings = { ...state.settings, ...JSON.parse(saved) };
    }
}

function saveSettings() {
    localStorage.setItem('moonSleepSettings', JSON.stringify(state.settings));
}

function syncSettingsToUI() {
    if (supabaseUrlInput) supabaseUrlInput.value = state.settings.supabaseUrl || '';
    if (supabaseKeyInput) supabaseKeyInput.value = state.settings.supabaseKey || '';
    if (userListInput) userListInput.value = state.settings.userList.join(' ') || '';
    if (targetSleepInput) targetSleepInput.value = state.settings.targetSleep || 7;
}

function loadSession() {
    const session = localStorage.getItem('moonSleepSession');
    if (session) {
        const parsed = JSON.parse(session);
        state.isSleeping = parsed.isSleeping;
        state.sleepStartTime = parsed.sleepStartTime ? new Date(parsed.sleepStartTime) : null;
        state.currentUser = parsed.currentUser || '지숙';
    } else {
        state.currentUser = '지숙';
    }
    state.targetTime = new Date();
}

function saveSession() {
    localStorage.setItem('moonSleepSession', JSON.stringify({
        isSleeping: state.isSleeping,
        sleepStartTime: state.sleepStartTime,
        currentUser: state.currentUser
    }));
}

// --- Core Logic ---
function startClock() {
    setInterval(() => {
        const now = new Date();
        currentTimeEl.textContent = now.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', minute: '2-digit', hour12: false 
        });

        if (!state.isManualTime) {
            state.targetTime = new Date();
            updateTargetDisplay();
        }
    }, 1000);
}

function updateTargetDisplay() {
    targetTimeEl.textContent = formatTime(state.targetTime);
}

function updateUIState() {
    if (state.isSleeping) {
        sleepBtn.disabled = true;
        sleepBtn.classList.add('disabled');
        wakeBtn.disabled = false;
        wakeBtn.classList.remove('disabled');
        statusIcon.textContent = '😴';
        statusIcon.classList.add('sleeping');
        
        const startStr = formatTime(state.sleepStartTime);
        statusText.innerHTML = `${state.currentUser}님은 수면 중...<br><small style="color:var(--text-dim)">(취침 시작: ${startStr})</small>`;
    } else {
        sleepBtn.disabled = false;
        sleepBtn.classList.remove('disabled');
        wakeBtn.disabled = true;
        wakeBtn.classList.add('disabled');
        statusIcon.textContent = '🌙';
        statusIcon.classList.remove('sleeping');
        statusText.textContent = `오늘 수면을 기록해보세요`;
    }
    updateTargetDisplay();
}

function formatTime(date) {
    if (!date) return "--:--";
    return date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', minute: '2-digit', hour12: false 
    });
}

function renderUserSelect() {
    userSelect.innerHTML = state.settings.userList.map(user => 
        `<option value="${user}" ${user === state.currentUser ? 'selected' : ''}>${user}</option>`
    ).join('');
}

// --- Event Handlers ---
function setupEventListeners() {
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.dataset.tab;
            navItems.forEach(n => n.classList.remove('active'));
            tabs.forEach(t => t.classList.remove('active'));
            item.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            
            if (tabId === 'dashboardSection') loadDashboardData();
        });
    });

    document.getElementById('plus10').addEventListener('click', () => {
        state.isManualTime = true;
        state.targetTime = new Date(state.targetTime.getTime() + 10 * 60000);
        updateTargetDisplay();
    });
    document.getElementById('minus10').addEventListener('click', () => {
        state.isManualTime = true;
        state.targetTime = new Date(state.targetTime.getTime() - 10 * 60000);
        updateTargetDisplay();
    });

    targetTimeEl.addEventListener('click', () => {
        state.isManualTime = false;
        state.targetTime = new Date();
        updateTargetDisplay();
    });

    userSelect.addEventListener('change', (e) => {
        state.currentUser = e.target.value;
        saveSession();
        updateUIState();
    });

    sleepBtn.addEventListener('click', () => {
        state.isSleeping = true;
        state.sleepStartTime = new Date(state.targetTime);
        state.isManualTime = false; 
        saveSession();
        updateUIState();
    });

    wakeBtn.addEventListener('click', () => {
        qualityModal.classList.add('active');
    });

    ratingSlider.addEventListener('input', (e) => {
        ratingDisplay.textContent = parseFloat(e.target.value).toFixed(1);
    });

    document.getElementById('confirmSaveBtn').addEventListener('click', () => saveRecord(true));
    document.getElementById('skipSaveBtn').addEventListener('click', () => saveRecord(false));

    document.getElementById('saveSettingsBtn').addEventListener('click', () => {
        state.settings.supabaseUrl = supabaseUrlInput.value.trim();
        state.settings.supabaseKey = supabaseKeyInput.value.trim();
        state.settings.userList = userListInput.value.trim().split(/\s+/);
        state.settings.targetSleep = parseInt(targetSleepInput.value);
        saveSettings();
        initSupabase(); // 설정 변경 시 클라이언트 재기동
        renderUserSelect();
        alert('설정이 저장되었습니다!');
    });

    document.getElementById('testConnBtn').addEventListener('click', async () => {
        if (!supabase) return alert('설정에서 Supabase 정보를 먼저 입력해주세요.');
        
        try {
            const { error } = await supabase.from('sleep_records').insert([
                { user_name: 'Test', sleep_time: new Date(), memo: 'Connection Test' }
            ]);
            if (error) throw error;
            alert('연결 테스트 성공! Supabase Table Editor에서 확인하세요.');
        } catch (err) {
            alert('오류: ' + err.message);
        }
    });
}

async function saveRecord(withDetails) {
    if (!supabase) return alert('설정에서 Supabase 정보를 먼저 입력해주세요.');

    const wakeTime = new Date(state.targetTime);
    const durationMs = wakeTime - state.sleepStartTime;
    const durationMin = Math.round(durationMs / (1000 * 60));
    
    try {
        const { error } = await supabase.from('sleep_records').insert([
            { 
                user_name: state.currentUser,
                sleep_time: state.sleepStartTime.toISOString(),
                wake_time: wakeTime.toISOString(),
                duration_minutes: durationMin,
                rating: withDetails ? parseFloat(ratingSlider.value) : 0,
                memo: withDetails ? memoInput.value.trim() : ""
            }
        ]);

        if (error) throw error;
        alert('데이터 저장 성공!');
    } catch (err) {
        console.error("Supabase Error:", err);
        alert('저장 실패: ' + err.message);
    }

    // Reset State
    state.isSleeping = false;
    state.sleepStartTime = null;
    state.isManualTime = false;
    state.targetTime = new Date();
    memoInput.value = "";
    qualityModal.classList.remove('active');
    saveSession();
    updateUIState();
}

// --- Dashboard Logic ---
let sleepChart = null;
let qualityChart = null;

async function loadDashboardData() {
    if (!supabase) return;

    try {
        const { data, error } = await supabase
            .from('sleep_records')
            .select('*')
            .eq('user_name', state.currentUser)
            .order('created_at', { ascending: false })
            .limit(14);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
            // 차트 표시를 위해 과거 순서로 뒤집기
            const sortedData = [...data].reverse();
            renderCharts(sortedData);
            renderMemos(sortedData);
            updateStats(sortedData);
        }
    } catch (err) {
        console.error("Dashboard Load Error:", err);
    }
}

function renderCharts(data) {
    const labels = data.map(d => new Date(d.created_at).toLocaleDateString('ko-KR', {month:'short', day:'numeric'}));
    const durations = data.map(d => (d.duration_minutes || 0) / 60);
    const ratings = data.map(d => d.rating || 0);

    if (sleepChart) sleepChart.destroy();
    const ctx = document.getElementById('sleepChart').getContext('2d');
    sleepChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: '수면 시간(h)',
                data: durations,
                backgroundColor: 'rgba(124, 58, 237, 0.6)',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { min: 0, max: 12, ticks: { color: '#94a3b8' } },
                x: { ticks: { color: '#94a3b8' } }
            },
            plugins: { legend: { display: false } }
        }
    });

    if (qualityChart) qualityChart.destroy();
    const ctx2 = document.getElementById('qualityChart').getContext('2d');
    qualityChart = new Chart(ctx2, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: '평점',
                data: ratings,
                borderColor: '#fbbf24',
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#fbbf24'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { min: 0, max: 5, ticks: { color: '#94a3b8', stepSize: 1 } },
                x: { ticks: { color: '#94a3b8' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function renderMemos(data) {
    const list = document.getElementById('memoList');
    list.innerHTML = data
        .filter(d => d.memo)
        .reverse()
        .map(d => `<li><small>${new Date(d.created_at).toLocaleDateString()}</small> • ${d.memo}</li>`)
        .join('');
}

function updateStats(data) {
    if (data.length === 0) return;
    const recordsWithDuration = data.filter(d => d.duration_minutes > 0);
    if (recordsWithDuration.length === 0) return;

    const avgMin = recordsWithDuration.reduce((acc, curr) => acc + curr.duration_minutes, 0) / recordsWithDuration.length;
    const hours = Math.floor(avgMin / 60);
    const mins = Math.round(avgMin % 60);
    document.getElementById('avgSleepTime').textContent = `${hours}h ${mins}m`;
}

init();
