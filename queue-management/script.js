// Global State Management
const state = {
    queue: [],
    served: [],
    currentTicket: null,
    ticketCounter: 1,
    isPaused: false
};

// Service Type Configuration
const serviceTypes = {
    general: { 
        name: 'Emergency Cases', 
        color: '#3b82f6', 
        colorClass: 'service-general',
        estimatedTime: 5 
    },
    technical: { 
        name: 'Disability', 
        color: '#a855f7',
        colorClass: 'service-technical',
        estimatedTime: 15 
    },
    billing: { 
        name: 'Elderly Patients', 
        color: '#22c55e',
        colorClass: 'service-billing',
        estimatedTime: 10 
    },
    complaint: { 
        name: 'Regular Check-Up', 
        color: '#ef4444',
        colorClass: 'service-complaint',
        estimatedTime: 20 
    }
};

// Initialize Application
function init() {
    updateUI();
    updateStats();
}

// Add Customer to Queue
function addToQueue(serviceType) {
    const service = serviceTypes[serviceType];
    
    const newTicket = {
        id: state.ticketCounter,
        ticketNumber: `${serviceType[0].toUpperCase()}${String(state.ticketCounter).padStart(3, '0')}`,
        serviceType: service.name,
        color: service.color,
        colorClass: service.colorClass,
        estimatedTime: service.estimatedTime,
        joinTime: new Date(),
        status: 'waiting'
    };
    
    state.queue.push(newTicket);
    state.ticketCounter++;
    
    updateUI();
    updateStats();
}

// Call Next Customer
function callNext() {
    if (state.queue.length === 0 || state.isPaused) {
        return;
    }
    
    // Complete current ticket if exists
    if (state.currentTicket) {
        completeCurrentTicket();
    }
    
    // Get next ticket from queue
    const nextTicket = state.queue.shift();
    nextTicket.startTime = new Date();
    nextTicket.status = 'serving';
    state.currentTicket = nextTicket;
    
    updateUI();
    updateStats();
}

// Complete Current Ticket
function completeCurrentTicket() {
    if (!state.currentTicket) return;
    
    const completedTicket = {
        ...state.currentTicket,
        status: 'completed',
        endTime: new Date(),
        waitTime: calculateWaitTime(state.currentTicket.startTime)
    };
    
    state.served.unshift(completedTicket);
    state.currentTicket = null;
    
    updateUI();
    updateStats();
}

// Skip Current Customer
function skipCurrentTicket() {
    if (!state.currentTicket) return;
    
    const skippedTicket = {
        ...state.currentTicket,
        status: 'skipped',
        endTime: new Date(),
        waitTime: 0
    };
    
    state.served.unshift(skippedTicket);
    state.currentTicket = null;
    
    updateUI();
    updateStats();
}

// Remove from Queue
function removeFromQueue(ticketId) {
    state.queue = state.queue.filter(ticket => ticket.id !== ticketId);
    updateUI();
    updateStats();
}

// Toggle Pause/Resume
function togglePause() {
    state.isPaused = !state.isPaused;
    const pauseBtn = document.getElementById('pauseBtn');
    
    if (state.isPaused) {
        pauseBtn.classList.add('paused');
        pauseBtn.innerHTML = `
            <svg class="icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Resume Service
        `;
    } else {
        pauseBtn.classList.remove('paused');
        pauseBtn.innerHTML = `
            <svg class="icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Pause Service
        `;
    }
    
    updateUI();
}

// Calculate Wait Time in Minutes
function calculateWaitTime(startTime) {
    const minutes = Math.round((new Date() - startTime) / 60000);
    return minutes;
}

// Format Wait Time Display
function formatWaitTime(joinTime) {
    const minutes = Math.round((new Date() - joinTime) / 60000);
    return minutes < 1 ? '< 1 min' : `${minutes} min`;
}

// Update Statistics
function updateStats() {
    const completedTickets = state.served.filter(t => t.status === 'completed');
    
    let avgWait = 0;
    if (completedTickets.length > 0) {
        const totalWait = completedTickets.reduce((sum, t) => sum + t.waitTime, 0);
        avgWait = Math.round(totalWait / completedTickets.length);
    }
    
    document.getElementById('waitingCount').textContent = state.queue.length;
    document.getElementById('avgWaitTime').textContent = `${avgWait} min`;
    document.getElementById('totalServed').textContent = completedTickets.length;
    document.getElementById('queueCount').textContent = state.queue.length;
}

// Update UI Components
function updateUI() {
    updateCurrentCustomerDisplay();
    updateQueueList();
    updateHistoryTable();
}

// Update Current Customer Display
function updateCurrentCustomerDisplay() {
    const container = document.getElementById('currentCustomer');
    
    if (!state.currentTicket) {
        container.innerHTML = `
            <div class="empty-state">
                <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <p class="empty-text">No customer being served</p>
                <button class="call-next-btn" onclick="callNext()" ${state.queue.length === 0 || state.isPaused ? 'disabled' : ''}>
                    Call Next Customer
                </button>
            </div>
        `;
        return;
    }
    
    const ticket = state.currentTicket;
    container.innerHTML = `
        <div class="ticket-display" style="background: linear-gradient(135deg, ${ticket.color} 0%, ${adjustColor(ticket.color, -20)} 100%);">
            <p class="ticket-label">Ticket Number</p>
            <p class="ticket-number">${ticket.ticketNumber}</p>
            <p class="ticket-type">${ticket.serviceType}</p>
        </div>
        
        <div class="ticket-info">
            <div class="info-row">
                <span class="info-label">Estimated Time:</span>
                <span class="info-value">${ticket.estimatedTime} min</span>
            </div>
            <div class="info-row">
                <span class="info-label">Service Started:</span>
                <span class="info-value">${ticket.startTime.toLocaleTimeString()}</span>
            </div>
        </div>
        
        <div class="action-buttons">
            <button class="action-btn btn-complete" onclick="completeCurrentTicket()">
                <svg class="icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Complete
            </button>
            <button class="action-btn btn-skip" onclick="skipCurrentTicket()">
                <svg class="icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Skip
            </button>
        </div>
    `;
}

// Update Queue List
function updateQueueList() {
    const container = document.getElementById('queueList');
    
    if (state.queue.length === 0) {
        container.innerHTML = `
            <div class="empty-state-small">
                <svg class="empty-icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p>No customers waiting</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = state.queue.map((ticket, index) => `
        <div class="queue-item">
            <div class="queue-item-left">
                <div class="color-indicator" style="background: ${ticket.color};"></div>
                <div class="queue-item-info">
                    <h3>${ticket.ticketNumber}</h3>
                    <p>${ticket.serviceType}</p>
                    <p class="wait-time">
                        <svg class="wait-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Waiting: ${formatWaitTime(ticket.joinTime)}
                    </p>
                </div>
            </div>
            <div class="queue-item-right">
                <span class="position-number">#${index + 1}</span>
                <button class="remove-btn" onclick="removeFromQueue(${ticket.id})">
                    <svg class="remove-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

// Update History Table
function updateHistoryTable() {
    const tbody = document.getElementById('historyTable');
    
    if (state.served.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-history">No service history yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = state.served.slice(0, 10).map(ticket => `
        <tr>
            <td>${ticket.ticketNumber}</td>
            <td style="color: #cbd5e1;">${ticket.serviceType}</td>
            <td>
                <span class="status-badge status-${ticket.status}">
                    ${ticket.status}
                </span>
            </td>
            <td style="color: #cbd5e1;">${ticket.waitTime} min</td>
            <td style="color: #94a3b8; font-size: 0.875rem;">
                ${ticket.endTime.toLocaleTimeString()}
            </td>
        </tr>
    `).join('');
}

// Utility: Adjust Color Brightness
function adjustColor(color, amount) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// Auto-update wait times every minute
setInterval(() => {
    if (state.queue.length > 0) {
        updateQueueList();
    }
}, 60000);

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
