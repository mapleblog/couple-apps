// Music Player Class
class MusicPlayer {
    constructor() {
        this.audio = document.getElementById('musicPlayer');
        this.isPlaying = false;
        this.currentSongIndex = 0;

        this.volume = 0.7;
        this.errorCount = 0; // Error counter
        this.maxRetries = 3; // Maximum retry attempts
        
        // Playlist
        this.playlist = [
            {
                title: 'Until I Found You',
                artist: 'Various Artists',
                src: 'music/UntilIFoundYou.mp3',
            },
        ];
        
        this.initializePlayer();
        this.bindEvents();
    }
    
    initializePlayer() {
        // Initialize player
        this.audio.volume = this.volume;
        
        // Load first song
        this.loadSong(this.currentSongIndex);
        
        // Update volume display
        this.updateVolumeDisplay();
    }
    
    bindEvents() {
        // Bind event listeners
        const mainPlayPauseBtn = document.getElementById('mainPlayPauseBtn');
        
        mainPlayPauseBtn.addEventListener('click', () => this.togglePlay());
        
        // Previous/Next buttons
        document.getElementById('prevBtn').addEventListener('click', () => this.previousSong());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextSong());
        

        
        // Progress bar control
        const progressSlider = document.getElementById('progressSlider');
        progressSlider.addEventListener('input', (e) => this.seekTo(e.target.value));
        
        // Volume control
        const volumeSlider = document.getElementById('volumeSlider');
        volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        
        // Mute button
        document.getElementById('muteBtn').addEventListener('click', () => this.toggleMute());
        
        // Audio event listeners
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('ended', () => {
            if (this.currentSongIndex < this.playlist.length - 1) {
                this.nextSong();
            } else {
                this.pause();
                this.updatePlayPauseIcons(false);
            }
        });
        this.audio.addEventListener('error', (e) => this.handleError(e));
    }
    
    loadSong(index) {
        if (index < 0 || index >= this.playlist.length) return;
        
        const song = this.playlist[index];
        this.currentSongIndex = index;
        
        // Load song
        this.audio.src = song.src;
        
        // Update UI display
        document.getElementById('currentSongTitle').textContent = song.title;
        document.getElementById('currentArtist').textContent = song.artist;
        
        // Reset progress bar
        this.updateProgress();
        
        // Check if audio file can be loaded
        this.checkAudioFile(song.src);
    }
    
    checkAudioFile(src) {
        // Create temporary audio object to check if file exists
        const testAudio = new Audio();
        testAudio.addEventListener('error', () => {
            console.warn(`Audio file does not exist or cannot be loaded: ${src}`);
        });
        testAudio.src = src;
    }
    
    // Toggle play/pause
    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    play() {
        this.audio.play().then(() => {
            this.isPlaying = true;
            this.updatePlayPauseIcons(true);
            // Play successful, reset error counter
            this.errorCount = 0;
        }).catch(error => {
            console.error('Play failed:', error);
            this.handlePlayError();
        });
    }
    
    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updatePlayPauseIcons(false);
    }
    
    previousSong() {
        this.currentSongIndex = (this.currentSongIndex - 1 + this.playlist.length) % this.playlist.length;
        this.loadSong(this.currentSongIndex);
        if (this.isPlaying) {
            this.play();
        }
    }
    
    nextSong() {
        this.currentSongIndex = (this.currentSongIndex + 1) % this.playlist.length;
        this.loadSong(this.currentSongIndex);
        if (this.isPlaying) {
            this.play();
        }
    }
    

    
    // Set progress
    seekTo(percentage) {
        const duration = this.audio.duration;
        if (duration) {
            this.audio.currentTime = (percentage / 100) * duration;
        }
    }
    
    // Update volume
    setVolume(volume) {
        this.volume = volume / 100;
        this.audio.volume = this.volume;
        this.updateVolumeDisplay();
    }
    
    // Toggle mute
    toggleMute() {
        if (this.audio.volume > 0) {
            this.audio.volume = 0;
            document.getElementById('volumeSlider').value = 0;
        } else {
            this.audio.volume = this.volume;
            document.getElementById('volumeSlider').value = this.volume * 100;
        }
        this.updateVolumeDisplay();
    }
    
    // Update progress bar
    updateProgress() {
        const currentTime = this.audio.currentTime;
        const duration = this.audio.duration;
        
        if (duration) {
            const percentage = (currentTime / duration) * 100;
            document.getElementById('progressBar').style.width = percentage + '%';
            document.getElementById('progressSlider').value = percentage;
        }
        
        // Update time display
        document.getElementById('currentTime').textContent = this.formatTime(currentTime);
    }
    
    updateDuration() {
        const duration = this.audio.duration;
        if (duration) {
            document.getElementById('totalTime').textContent = this.formatTime(duration);
        }
    }
    
    updateVolumeDisplay() {
        const volume = Math.round(this.audio.volume * 100);
        document.getElementById('volumeDisplay').textContent = volume + '%';
        document.getElementById('volumeBar').style.width = volume + '%';
        
        // Update volume icon
        const volumeIcon = document.getElementById('volumeIcon');
        if (volume === 0) {
            volumeIcon.innerHTML = '<path d="M155.51,24.81a8,8,0,0,0-8.42.88L77.25,80H32A16,16,0,0,0,16,96v64a16,16,0,0,0,16,16H77.25l69.84,54.31A8,8,0,0,0,160,224V32A8,8,0,0,0,155.51,24.81ZM144,207.64,81.25,161.69A8,8,0,0,0,76,160H32V96H76a8,8,0,0,0,5.25-1.69L144,48.36ZM213.66,82.34l-56,56a8,8,0,0,1-11.32-11.32L201.37,72,146.34,16.97a8,8,0,0,1,11.32-11.32l56,56A8,8,0,0,1,213.66,82.34Z"/>';
        } else {
            volumeIcon.innerHTML = '<path d="M155.51,24.81a8,8,0,0,0-8.42.88L77.25,80H32A16,16,0,0,0,16,96v64a16,16,0,0,0,16,16H77.25l69.84,54.31A8,8,0,0,0,160,224V32A8,8,0,0,0,155.51,24.81ZM144,207.64,81.25,161.69A8,8,0,0,0,76,160H32V96H76a8,8,0,0,0,5.25-1.69L144,48.36Zm54-106.08a24,24,0,0,1,0,36.88,8,8,0,0,1-12-10.58,8,8,0,0,0,0-15.72,8,8,0,0,1,12-10.58ZM248,128a79.9,79.9,0,0,1-20.37,53.34,8,8,0,0,1-11.92-10.67,64,64,0,0,0,0-85.33,8,8,0,1,1,11.92-10.67A79.83,79.83,0,0,1,248,128Z"/>';
        }
    }
    
    // Update play button icon
    updatePlayPauseIcons(isPlaying) {
        const playIcon = '<path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z"/>';
        const pauseIcon = '<path d="M216,48V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V48a16,16,0,0,1,16-16h32A16,16,0,0,1,216,48ZM88,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H88a16,16,0,0,0,16-16V48A16,16,0,0,0,88,32Z"/>';
        
        const icon = isPlaying ? pauseIcon : playIcon;
        document.getElementById('mainPlayPauseIcon').innerHTML = icon;
    }
    

    
    // Error handling
    handleError(error) {
        console.error('Audio playback error:', error);
        this.handlePlayError();
    }
    
    handlePlayError() {
        this.errorCount++;
        console.log(`Play error count: ${this.errorCount}/${this.maxRetries}`);
        
        if (this.errorCount >= this.maxRetries) {
            // Reached maximum retry attempts, stop playing and show error message
            this.pause();
            this.errorCount = 0;
            this.showErrorMessage('Audio files do not exist, please place audio files in the music folder');
            this.showMusicFolderInfo();
            return;
        }
        
        // Try to play next song, but avoid infinite loop
        const nextIndex = this.getNextValidSongIndex();
        if (nextIndex !== -1) {
            this.loadSong(nextIndex);
            if (this.isPlaying) {
                setTimeout(() => this.play(), 100); // Delay play to avoid immediate error
            }
        } else {
            // No playable songs
            this.pause();
            this.errorCount = 0;
            this.showErrorMessage('No playable audio files');
        }
    }
    
    getNextValidSongIndex() {
        // Simple next song logic, avoid complex random and loop logic in error handling
        let nextIndex = (this.currentSongIndex + 1) % this.playlist.length;
        let attempts = 0;
        
        // Try at most all songs in the playlist
        while (attempts < this.playlist.length) {
            if (nextIndex !== this.currentSongIndex) {
                return nextIndex;
            }
            nextIndex = (nextIndex + 1) % this.playlist.length;
            attempts++;
        }
        
        return -1; // No other songs found
    }
    
    showMusicFolderInfo() {
        const infoDiv = document.createElement('div');
        infoDiv.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            background: #2196F3;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1000;
            font-size: 12px;
            max-width: 300px;
            line-height: 1.4;
        `;
        infoDiv.innerHTML = `
            <strong>Audio File Instructions:</strong><br>
            Please place the following audio files in the music folder:<br>
            • romantic.mp3<br>
            • love.mp3<br>
            • together.mp3
        `;
        document.body.appendChild(infoDiv);
        
        // Auto remove info after 5 seconds
        setTimeout(() => {
            if (infoDiv.parentNode) {
                infoDiv.parentNode.removeChild(infoDiv);
            }
        }, 5000);
    }
    
    showErrorMessage(message) {
        // Display error message on page
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
            font-size: 14px;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        // Auto remove error message after 3 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 3000);
    }
    
    // Time formatting
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// Calendar Class
class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();
        this.today = new Date();
        
        this.monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        this.init();
    }
    
    init() {
        // Bind events
        document.getElementById('prevMonthBtn').addEventListener('click', () => {
            this.previousMonth();
        });
        
        document.getElementById('nextMonthBtn').addEventListener('click', () => {
            this.nextMonth();
        });
        
        // Initialize calendar
        this.updateCalendar();
    }
    
    previousMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.updateCalendar();
    }
    
    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.updateCalendar();
    }
    
    updateCalendar() {
        // Update month and year display
        const monthYearElement = document.getElementById('currentMonthYear');
        monthYearElement.textContent = `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
        
        // Generate calendar grid
        this.generateCalendarGrid();
    }
    
    generateCalendarGrid() {
        const calendarGrid = document.getElementById('calendarGrid');
        
        // Clear existing dates (keep weekday headers)
        const weekHeaders = calendarGrid.querySelectorAll('p');
        calendarGrid.innerHTML = '';
        
        // Re-add weekday headers
        weekHeaders.forEach(header => {
            calendarGrid.appendChild(header);
        });
        
        // Get which day of week the first day of month is (0=Sunday, 1=Monday...)
        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        // Get total days in current month
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        
        // Add empty cells (blanks before month start)
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'h-12 w-full';
            calendarGrid.appendChild(emptyCell);
        }
        
        // Add dates of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayButton = document.createElement('button');
            dayButton.className = 'h-12 w-full text-white text-sm font-medium leading-normal';
            
            const dayDiv = document.createElement('div');
            dayDiv.className = 'flex size-full items-center justify-center rounded-full';
            
            // Check if it's today
            const isToday = this.isToday(day);
            if (isToday) {
                dayDiv.classList.add('bg-[#f04299]');
            }
            
            dayDiv.textContent = day;
            dayButton.appendChild(dayDiv);
            calendarGrid.appendChild(dayButton);
            
            // Add click event (optional)
            dayButton.addEventListener('click', () => {
                this.selectDate(day);
            });
        }
    }
    
    // Check if today
    isToday(day) {
        return this.currentYear === this.today.getFullYear() &&
               this.currentMonth === this.today.getMonth() &&
               day === this.today.getDate();
    }
    
    // Select date
    selectDate(day) {
        // Remove previous selected date style
        const allDays = document.querySelectorAll('#calendarGrid button div');
        allDays.forEach(dayDiv => {
            if (!this.isToday(parseInt(dayDiv.textContent))) {
                dayDiv.classList.remove('bg-[#f04299]');
            }
        });
        
        // Add selected style to clicked date (if not today)
        const clickedDay = parseInt(day);
        if (!this.isToday(clickedDay)) {
            event.target.classList.add('bg-[#f04299]');
        }
        
        console.log(`Selected date: ${this.currentYear}-${this.currentMonth + 1}-${day}`);
    }
}

// Days Counter Class
class DaysCounter {
    constructor(elementId, startDateString) {
        // Set start date and corresponding element
        this.startDate = new Date(startDateString);
        this.counterElement = document.getElementById(elementId);
        this.elementId = elementId;
        
        this.init();
    }
    
    init() {
        // Calculate and update days display
        this.updateDaysCount();
        
        // Update days count at midnight daily (optional)
        this.scheduleNextUpdate();
    }
    
    // Calculate days
    calculateDays() {
        const today = new Date();
        const timeDifference = today.getTime() - this.startDate.getTime();
        const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));
        
        return Math.max(0, daysDifference); // Ensure no negative numbers
    }
    
    formatNumber(num) {
        // Use comma-separated number format
        return num.toLocaleString();
    }
    
    updateDaysCount() {
        const days = this.calculateDays();
        const formattedDays = this.formatNumber(days);
        
        if (this.counterElement) {
            this.counterElement.textContent = `${formattedDays} days`;
        }
        
        console.log(`${this.elementId} days updated: ${formattedDays} days`);
    }
    
    scheduleNextUpdate() {
        // Calculate milliseconds to next midnight
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const msUntilMidnight = tomorrow.getTime() - now.getTime();
        
        // Update days count at midnight
        setTimeout(() => {
            this.updateDaysCount();
            // Set update every 24 hours
            setInterval(() => {
                this.updateDaysCount();
            }, 24 * 60 * 60 * 1000);
        }, msUntilMidnight);
    }
}

// Initialize all components after page load
document.addEventListener('DOMContentLoaded', function() {
    const musicPlayer = new MusicPlayer();
    const calendar = new Calendar();
    
    // Create two days counter instances
    const daysCounter1 = new DaysCounter('daysCounter1', '2025-05-05');
    const daysCounter2 = new DaysCounter('daysCounter2', '2025-06-06');
    
    // Add instances to global scope for debugging and user configuration
    window.musicPlayer = musicPlayer;
    window.calendar = calendar;
    window.daysCounter1 = daysCounter1;
    window.daysCounter2 = daysCounter2;
    
    console.log('Music player, calendar and two days counters initialized');
});

console.log('Page loaded successfully');