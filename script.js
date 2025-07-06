class VikingCalendar {
    constructor() {
        this.currentDate = new Date();
        this.displayMonth = this.currentDate.getMonth();
        this.displayYear = this.currentDate.getFullYear();
        
        // Viking months (Old Norse)
        this.vikingMonths = [
            'Jólmánuðr', 'Þorri', 'Góa', 'Einmánuðr', 
            'Harpa', 'Skerpla', 'Sólmánuðr', 'Heyannir',
            'Tvímánuðr', 'Haustmánuðr', 'Gormánuðr', 'Ýlir'
        ];
        
        // Viking days of the week (Old Norse)
        this.vikingDays = [
            'Sunnudagr', 'Mánadagr', 'Týsdagr', 'Óðinsdagr',
            'Þórsdagr', 'Frjádagr', 'Laugardagr'
        ];
        
        // Moon phases (Old Norse)
        this.moonPhases = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
        this.moonNames = [
            'Nýmáni', 'Vaxandi máni', 'Hálfmáni', 'Vaxandi túnglfull',
            'Fullmáni', 'Minnkandi túnglfull', 'Minnkandi hálfmáni', 'Gamall máni'
        ];
        
        // Notification state
        this.notificationsEnabled = false;
        
        this.init();
    }
    
    init() {
        this.registerServiceWorker();
        this.bindEvents();
        this.addTouchEvents();
        this.initNotifications();
        this.render();
        this.updateCurrentDate();
    }
    
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                    this.swRegistration = registration;
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        }
    }
    
    bindEvents() {
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.navigateMonth(-1);
        });
        
        document.getElementById('nextMonth').addEventListener('click', () => {
            this.navigateMonth(1);
        });
        
        document.getElementById('notificationToggle').addEventListener('click', () => {
            this.toggleNotifications();
        });
    }
    
    addTouchEvents() {
        // Add touch events for better mobile interaction
        let touchStartX = 0;
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY) return;
            
            let touchEndX = e.changedTouches[0].clientX;
            let touchEndY = e.changedTouches[0].clientY;
            
            let deltaX = touchEndX - touchStartX;
            let deltaY = touchEndY - touchStartY;
            
            // Only handle horizontal swipes that are significantly more horizontal than vertical
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    this.navigateMonth(-1); // Swipe right = previous month
                } else {
                    this.navigateMonth(1); // Swipe left = next month
                }
            }
            
            touchStartX = 0;
            touchStartY = 0;
        });
    }
    
    navigateMonth(direction) {
        this.displayMonth += direction;
        if (this.displayMonth < 0) {
            this.displayMonth = 11;
            this.displayYear--;
        } else if (this.displayMonth > 11) {
            this.displayMonth = 0;
            this.displayYear++;
        }
        this.render();
    }
    
    render() {
        this.renderMonthYear();
        this.renderCalendar();
        this.renderMoonPhase();
    }
    
    renderMonthYear() {
        const monthYearElement = document.getElementById('monthYear');
        const vikingYear = this.convertToVikingYear(this.displayYear);
        monthYearElement.textContent = `${this.vikingMonths[this.displayMonth]} ${vikingYear}`;
    }
    
    renderCalendar() {
        const daysContainer = document.getElementById('daysContainer');
        daysContainer.innerHTML = '';
        
        const firstDay = new Date(this.displayYear, this.displayMonth, 1);
        const lastDay = new Date(this.displayYear, this.displayMonth + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const today = new Date();
        
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dayCell = document.createElement('div');
            dayCell.className = 'day-cell';
            
            if (date.getMonth() !== this.displayMonth) {
                dayCell.classList.add('other-month');
            }
            
            if (date.toDateString() === today.toDateString()) {
                dayCell.classList.add('today');
            }
            
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = date.getDate();
            
            const vikingDay = document.createElement('div');
            vikingDay.className = 'viking-day';
            vikingDay.textContent = this.getVikingDayName(date);
            
            dayCell.appendChild(dayNumber);
            dayCell.appendChild(vikingDay);
            
            daysContainer.appendChild(dayCell);
        }
    }
    
    updateCurrentDate() {
        const currentVikingDateElement = document.getElementById('currentVikingDate');
        const now = new Date();
        const vikingDate = this.formatVikingDate(now);
        currentVikingDateElement.textContent = vikingDate;
    }
    
    formatVikingDate(date) {
        const vikingYear = this.convertToVikingYear(date.getFullYear());
        const vikingMonth = this.vikingMonths[date.getMonth()];
        const vikingDayName = this.getVikingDayName(date);
        const dayNumber = date.getDate();
        
        return `${vikingDayName}, ${dayNumber}. ${vikingMonth} ${vikingYear}`;
    }
    
    getVikingDayName(date) {
        const dayNames = ['Sun', 'Mán', 'Týs', 'Óðin', 'Þór', 'Frjá', 'Laug'];
        return dayNames[date.getDay()];
    }
    
    convertToVikingYear(modernYear) {
        // Convert modern year to Viking Age equivalent
        // Viking Age roughly 793-1066 CE, so we'll map modern years to this period
        const vikingStartYear = 793;
        const vikingEndYear = 1066;
        const vikingRange = vikingEndYear - vikingStartYear;
        
        // Use a cycling approach to map modern years to Viking years
        const cyclePosition = (modernYear - 2000) % vikingRange;
        const vikingYear = vikingStartYear + Math.abs(cyclePosition);
        
        return vikingYear;
    }
    
    renderMoonPhase() {
        const moonPhaseElement = document.getElementById('moonPhase');
        const moonPhaseNameElement = document.getElementById('moonPhaseName');
        
        // Calculate moon phase based on current date
        const now = new Date();
        const moonPhase = this.calculateMoonPhase(now);
        
        moonPhaseElement.textContent = this.moonPhases[moonPhase];
        moonPhaseNameElement.textContent = this.moonNames[moonPhase];
    }
    
    calculateMoonPhase(date) {
        // Simplified moon phase calculation
        const knownNewMoon = new Date(2000, 0, 6, 18, 14);
        const secondsSinceKnownNewMoon = (date - knownNewMoon) / 1000;
        const daysSinceKnownNewMoon = secondsSinceKnownNewMoon / 86400;
        const moonCycles = daysSinceKnownNewMoon / 29.53058867;
        const currentMoonCycle = moonCycles - Math.floor(moonCycles);
        
        return Math.floor(currentMoonCycle * 8);
    }
    
    async initNotifications() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            this.disableNotificationButton();
            return;
        }
        
        // Check if notifications are already enabled
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            this.notificationsEnabled = true;
            this.updateNotificationButton();
            this.scheduleDailyNotification();
        } else {
            this.updateNotificationButton();
        }
    }
    
    async toggleNotifications() {
        if (!('Notification' in window)) {
            alert('Þinn vafri styður eigi tilkynningar');
            return;
        }
        
        if (this.notificationsEnabled) {
            // Disable notifications
            this.notificationsEnabled = false;
            this.cancelNotifications();
            this.updateNotificationButton();
        } else {
            // Request permission and enable notifications
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.notificationsEnabled = true;
                this.updateNotificationButton();
                this.scheduleDailyNotification();
                this.showWelcomeNotification();
            } else {
                alert('Tilkynningar váru hafnaðar. Þú getur virkjað þær í stillingum vafrans.');
            }
        }
    }
    
    updateNotificationButton() {
        const button = document.getElementById('notificationToggle');
        const icon = document.getElementById('notificationIcon');
        const text = document.getElementById('notificationText');
        
        if (this.notificationsEnabled) {
            icon.textContent = '🔔';
            text.textContent = 'Tilkynningar virkar';
            button.classList.remove('disabled');
        } else {
            icon.textContent = '🔕';
            text.textContent = 'Vekja tilkynningar';
            button.classList.add('disabled');
        }
    }
    
    disableNotificationButton() {
        const button = document.getElementById('notificationToggle');
        const icon = document.getElementById('notificationIcon');
        const text = document.getElementById('notificationText');
        
        icon.textContent = '🚫';
        text.textContent = 'Tilkynningar eigi studdar';
        button.classList.add('disabled');
        button.disabled = true;
    }
    
    showWelcomeNotification() {
        const now = new Date();
        const vikingDate = this.formatVikingDate(now);
        
        new Notification('Dagatalr - Tilkynningar virkjaðar', {
            body: `Góðan dag! Í þessum degi er ${vikingDate}`,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: 'welcome',
            requireInteraction: false
        });
    }
    
    scheduleDailyNotification() {
        // Cancel any existing notifications
        this.cancelNotifications();
        
        // Schedule daily notification at 9 AM
        const now = new Date();
        const nextNotification = new Date();
        nextNotification.setHours(9, 0, 0, 0);
        
        // If it's already past 9 AM today, schedule for tomorrow
        if (now.getTime() > nextNotification.getTime()) {
            nextNotification.setDate(nextNotification.getDate() + 1);
        }
        
        const timeUntilNotification = nextNotification.getTime() - now.getTime();
        
        this.notificationTimeout = setTimeout(() => {
            this.sendDailyNotification();
            // Schedule recurring daily notifications
            this.dailyNotificationInterval = setInterval(() => {
                this.sendDailyNotification();
            }, 24 * 60 * 60 * 1000); // 24 hours
        }, timeUntilNotification);
    }
    
    sendDailyNotification() {
        if (!this.notificationsEnabled) return;
        
        const now = new Date();
        const vikingDate = this.formatVikingDate(now);
        const vikingDayName = this.getVikingDayName(now);
        const moonPhase = this.calculateMoonPhase(now);
        const moonName = this.moonNames[moonPhase];
        
        new Notification('Dagatalr - Dagligt upprifjun', {
            body: `${vikingDayName}dagr - ${vikingDate}\n🌙 ${moonName}`,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: 'daily-reminder',
            requireInteraction: false,
            actions: [
                {
                    action: 'open',
                    title: 'Opna Dagatalr'
                }
            ]
        });
    }
    
    cancelNotifications() {
        if (this.notificationTimeout) {
            clearTimeout(this.notificationTimeout);
            this.notificationTimeout = null;
        }
        
        if (this.dailyNotificationInterval) {
            clearInterval(this.dailyNotificationInterval);
            this.dailyNotificationInterval = null;
        }
    }
}

// Initialize the Viking Calendar when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new VikingCalendar();
});