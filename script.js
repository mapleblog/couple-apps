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

// Love Notes Manager Class
class LoveNotesManager {
    constructor() {
        this.notes = [];
        this.selectedColor = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        this.currentPage = 1;
        this.itemsPerPage = 4;
        this.init();
    }
    
    init() {
        // Load existing notes from localStorage
        this.loadNotes();
        
        // Bind modal events
        this.bindModalEvents();
        
        // Bind color selection events
        this.bindColorEvents();
        
        // Bind form events
        this.bindFormEvents();
        
        // Bind pagination events
        this.bindPaginationEvents();
    }
    
    bindModalEvents() {
        const addNoteBtn = document.getElementById('addNoteBtn');
        const modal = document.getElementById('loveNoteModal');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const emojiBtn = document.getElementById('emojiBtn');
        const emojiPicker = document.getElementById('emojiPicker');
        const emojiOptions = document.querySelectorAll('.emoji-option');
        const noteContent = document.getElementById('noteContent');
        
        // Show modal
        addNoteBtn.addEventListener('click', () => {
            this.showModal();
        });
        
        // Hide modal
        closeModalBtn.addEventListener('click', () => {
            this.hideModal();
        });
        
        cancelBtn.addEventListener('click', () => {
            this.hideModal();
        });
        
        // Hide modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal();
            }
        });
        
        // Emoji picker events
        emojiBtn.addEventListener('click', () => {
            emojiPicker.classList.toggle('hidden');
        });
        
        emojiOptions.forEach(option => {
            option.addEventListener('click', () => {
                const emoji = option.textContent;
                const cursorPos = noteContent.selectionStart;
                const textBefore = noteContent.value.substring(0, cursorPos);
                const textAfter = noteContent.value.substring(noteContent.selectionEnd);
                noteContent.value = textBefore + emoji + textAfter;
                noteContent.focus();
                noteContent.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
                emojiPicker.classList.add('hidden');
            });
        });
        
        // Close emoji picker when clicking outside
        document.addEventListener('click', (e) => {
            if (!emojiBtn.contains(e.target) && !emojiPicker.contains(e.target)) {
                emojiPicker.classList.add('hidden');
            }
        });
    }
    
    bindColorEvents() {
        const colorOptions = document.querySelectorAll('.color-option');
        const selectedColorInput = document.getElementById('selectedColor');
        
        colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove previous selection
                colorOptions.forEach(opt => opt.classList.remove('border-white'));
                
                // Add selection to clicked option
                option.classList.add('border-white');
                
                // Update selected color
                this.selectedColor = option.dataset.color;
                selectedColorInput.value = this.selectedColor;
            });
        });
        
        // Set default selection
        if (colorOptions.length > 0) {
            colorOptions[0].classList.add('border-white');
        }
    }
    
    bindFormEvents() {
        const form = document.getElementById('loveNoteForm');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Check if we're editing or creating
            if (this.currentEditingNote) {
                this.updateNote();
            } else {
                this.createNote();
            }
        });
    }
    
    bindPaginationEvents() {
        // Find pagination container
        const paginationContainer = document.querySelector('.flex.items-center.justify-center.p-4');
        if (!paginationContainer) {
            console.error('Pagination container not found');
            return;
        }
        
        // Get pagination elements
        const prevBtn = paginationContainer.querySelector('a[href="#"]:first-child');
        const nextBtn = paginationContainer.querySelector('a[href="#"]:last-child');
        const pageNumbers = paginationContainer.querySelectorAll('a[href="#"]:not(:first-child):not(:last-child)');
        
        // Previous button
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToPreviousPage();
            });
        }
        
        // Next button
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToNextPage();
            });
        }
        
        // Page number buttons
        pageNumbers.forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToPage(index + 1);
            });
        });
    }
    
    getTotalPages() {
        return Math.ceil(this.notes.length / this.itemsPerPage);
    }
    
    goToPage(page) {
        const totalPages = this.getTotalPages();
        if (page < 1 || page > totalPages) {
            return;
        }
        
        this.currentPage = page;
        this.renderNotes();
        this.updatePaginationUI();
    }
    
    goToPreviousPage() {
        if (this.currentPage > 1) {
            this.goToPage(this.currentPage - 1);
        }
    }
    
    goToNextPage() {
        const totalPages = this.getTotalPages();
        if (this.currentPage < totalPages) {
            this.goToPage(this.currentPage + 1);
        }
    }
    
    updatePaginationUI() {
        const paginationContainer = document.querySelector('.flex.items-center.justify-center.p-4');
        if (!paginationContainer) {
            return;
        }
        
        const totalPages = this.getTotalPages();
        const prevBtn = paginationContainer.querySelector('a[href="#"]:first-child');
        const nextBtn = paginationContainer.querySelector('a[href="#"]:last-child');
        const pageNumbers = paginationContainer.querySelectorAll('a[href="#"]:not(:first-child):not(:last-child)');
        
        // Update previous button state
        if (prevBtn) {
            if (this.currentPage <= 1) {
                prevBtn.style.opacity = '0.5';
                prevBtn.style.pointerEvents = 'none';
            } else {
                prevBtn.style.opacity = '1';
                prevBtn.style.pointerEvents = 'auto';
            }
        }
        
        // Update next button state
        if (nextBtn) {
            if (this.currentPage >= totalPages) {
                nextBtn.style.opacity = '0.5';
                nextBtn.style.pointerEvents = 'none';
            } else {
                nextBtn.style.opacity = '1';
                nextBtn.style.pointerEvents = 'auto';
            }
        }
        
        // Update page numbers
        pageNumbers.forEach((btn, index) => {
            const pageNum = index + 1;
            btn.textContent = pageNum;
            
            if (pageNum === this.currentPage) {
                btn.className = 'text-sm font-bold leading-normal tracking-[0.015em] flex size-10 items-center justify-center text-white rounded-full bg-[#482336]';
            } else {
                btn.className = 'text-sm font-normal leading-normal flex size-10 items-center justify-center text-white rounded-full';
            }
            
            // Hide page numbers beyond total pages
            if (pageNum > totalPages) {
                btn.style.display = 'none';
            } else {
                btn.style.display = 'flex';
            }
        });
        
        // Hide pagination if only one page or no notes
        if (totalPages <= 1) {
            paginationContainer.style.display = 'none';
        } else {
            paginationContainer.style.display = 'flex';
        }
    }
    
    showModal() {
        const modal = document.getElementById('loveNoteModal');
        modal.classList.remove('hidden');
        
        // Focus on title input
        setTimeout(() => {
            document.getElementById('noteTitle').focus();
        }, 100);
    }
    
    hideModal() {
        const modal = document.getElementById('loveNoteModal');
        modal.classList.add('hidden');
        
        // Reset form and editing state
        this.resetForm();
        this.currentEditingNote = null;
        
        // Reset modal title and button text
        document.querySelector('#loveNoteModal h3').textContent = 'Create Love Note';
        document.querySelector('#loveNoteForm button[type="submit"]').textContent = 'Create Note';
    }
    
    resetForm() {
        const form = document.getElementById('loveNoteForm');
        form.reset();
        
        // Reset color selection
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(opt => opt.classList.remove('border-white'));
        if (colorOptions.length > 0) {
            colorOptions[0].classList.add('border-white');
        }
        
        this.selectedColor = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        document.getElementById('selectedColor').value = this.selectedColor;
        
        // Reset editing state
        this.currentEditingNote = null;
    }
    
    createNote() {
        const title = document.getElementById('noteTitle').value.trim();
        const content = document.getElementById('noteContent').value.trim();
        
        if (!title || !content) {
            alert('Please fill in both title and content.');
            return;
        }
        
        const note = {
            id: Date.now(),
            title: title,
            content: content,
            backgroundColor: this.selectedColor,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.notes.push(note);
        
        // Calculate if we need to go to the last page for the new note
        const totalPages = this.getTotalPages();
        if (totalPages > this.currentPage) {
            this.currentPage = totalPages;
        }
        
        this.saveNotes();
        this.renderNotes();
        this.hideModal();
        
        console.log('New love note created:', note);
    }
    
    editNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) {
            console.error('Note not found:', noteId);
            return;
        }
        
        // Set current note for editing
        this.currentEditingNote = note;
        
        // Fill form with existing data
        document.getElementById('noteTitle').value = note.title || '';
        document.getElementById('noteContent').value = note.content || '';
        
        // Set background color
        this.selectedColor = note.backgroundColor;
        document.getElementById('selectedColor').value = this.selectedColor;
        
        // Update color selection UI
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(opt => {
            opt.classList.remove('border-white');
            if (opt.dataset.color === this.selectedColor) {
                opt.classList.add('border-white');
            }
        });
        
        // Change modal title and button text
        document.querySelector('#loveNoteModal h3').textContent = 'Edit Love Note';
        document.querySelector('#loveNoteForm button[type="submit"]').textContent = 'Update Note';
        
        this.showModal();
    }
    
    updateNote() {
        const title = document.getElementById('noteTitle').value.trim();
        const content = document.getElementById('noteContent').value.trim();
        
        if (!title || !content) {
            alert('Please fill in both title and content.');
            return;
        }
        
        // Update the note
        this.currentEditingNote.title = title;
        this.currentEditingNote.content = content;
        this.currentEditingNote.backgroundColor = this.selectedColor;
        this.currentEditingNote.updatedAt = new Date().toISOString();
        
        this.saveNotes();
        this.renderNotes();
        this.hideModal();
        
        console.log('Love note updated:', this.currentEditingNote);
        this.currentEditingNote = null;
    }
    
    deleteNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) {
            console.error('Note not found:', noteId);
            return;
        }
        
        // Show confirmation dialog
        const confirmed = confirm(`Are you sure you want to delete the note "${note.title || 'Untitled'}"?\n\nThis action cannot be undone.`);
        
        if (confirmed) {
            // Remove note from array
            this.notes = this.notes.filter(n => n.id !== noteId);
            
            // Adjust current page if necessary
            const totalPages = this.getTotalPages();
            if (this.currentPage > totalPages && totalPages > 0) {
                this.currentPage = totalPages;
            } else if (totalPages === 0) {
                this.currentPage = 1;
            }
            
            this.saveNotes();
            this.renderNotes();
            
            console.log('Love note deleted:', note);
        }
    }
    
    renderNotes() {
        // Find the love notes container by looking for the container after the Love Notes heading
        const loveNotesHeading = document.querySelector('h2');
        let notesContainer = null;
        
        // Find the next grid container after the Love Notes heading
        let currentElement = loveNotesHeading.parentElement.nextElementSibling;
        while (currentElement) {
            if (currentElement.classList.contains('grid') && 
                currentElement.classList.contains('gap-3') && 
                currentElement.classList.contains('p-4')) {
                notesContainer = currentElement;
                break;
            }
            currentElement = currentElement.nextElementSibling;
        }
        
        if (!notesContainer) {
            console.error('Love notes container not found');
            return;
        }
        
        // Clear existing user notes (keep original notes)
        const userNotes = notesContainer.querySelectorAll('.user-note');
        userNotes.forEach(note => note.remove());
        
        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentPageNotes = this.notes.slice(startIndex, endIndex);
        
        // Add user notes for current page before the invisible image element
        const invisibleImg = notesContainer.querySelector('img.invisible');
        currentPageNotes.forEach(note => {
            const noteElement = this.createNoteElement(note);
            if (invisibleImg) {
                notesContainer.insertBefore(noteElement, invisibleImg);
            } else {
                notesContainer.appendChild(noteElement);
            }
        });
        
        // Update pagination UI
        this.updatePaginationUI();
    }
    
    createNoteElement(note) {
        const noteDiv = document.createElement('div');
        noteDiv.className = 'bg-cover bg-center flex flex-col gap-3 rounded-lg justify-end p-4 aspect-square user-note relative group';
        noteDiv.style.background = note.backgroundColor;
        noteDiv.dataset.noteId = note.id;
        
        // Action buttons container (visible on hover)
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10';
        actionsDiv.style.pointerEvents = 'auto';
        
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'bg-black bg-opacity-50 text-white p-1.5 rounded-full hover:bg-opacity-70 transition-all duration-200 z-20';
        editBtn.style.pointerEvents = 'auto';
        editBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14px" height="14px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M227.31,73.37,182.63,28.69a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96A16,16,0,0,0,227.31,73.37ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.69,147.31,64l24-24L216,84.69Z"/>
            </svg>
        `;
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.editNote(note.id);
        });
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'bg-black bg-opacity-50 text-white p-1.5 rounded-full hover:bg-opacity-70 transition-all duration-200 z-20';
        deleteBtn.style.pointerEvents = 'auto';
        deleteBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14px" height="14px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"/>
            </svg>
        `;
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteNote(note.id);
        });
        
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        
        // Note content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'flex flex-col gap-2 h-full justify-between';
        
        // Top content (title and text)
        const topContent = document.createElement('div');
        topContent.className = 'flex flex-col gap-1';
        
        // Title (if exists)
        if (note.title) {
            const titleP = document.createElement('p');
            titleP.className = 'text-white text-sm font-bold leading-tight opacity-90';
            titleP.textContent = note.title;
            topContent.appendChild(titleP);
        }
        
        // Content
        const textP = document.createElement('p');
        textP.className = 'text-white text-base font-bold leading-tight w-4/5 line-clamp-2';
        textP.textContent = note.content;
        topContent.appendChild(textP);
        
        contentDiv.appendChild(topContent);
        
        // Date display at bottom
        const dateP = document.createElement('p');
        dateP.className = 'text-white/80 text-xs font-medium mt-auto';
        const date = new Date(note.createdAt);
        const formattedDate = date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        const formattedTime = date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        });
        dateP.textContent = `${formattedDate} ${formattedTime}`;
        contentDiv.appendChild(dateP);
        
        noteDiv.appendChild(actionsDiv);
        noteDiv.appendChild(contentDiv);
        
        return noteDiv;
    }
    
    saveNotes() {
        localStorage.setItem('loveNotes', JSON.stringify(this.notes));
    }
    
    loadNotes() {
        const savedNotes = localStorage.getItem('loveNotes');
        if (savedNotes) {
            this.notes = JSON.parse(savedNotes);
            this.renderNotes();
        }
    }
}

// Initialize all components after page load
document.addEventListener('DOMContentLoaded', function() {
    const musicPlayer = new MusicPlayer();
    const calendar = new Calendar();
    const loveNotesManager = new LoveNotesManager();
    
    // Create two days counter instances
    const daysCounter1 = new DaysCounter('daysCounter1', '2025-05-05');
    const daysCounter2 = new DaysCounter('daysCounter2', '2025-06-06');
    
    // Add instances to global scope for debugging and user configuration
    window.musicPlayer = musicPlayer;
    window.calendar = calendar;
    window.loveNotesManager = loveNotesManager;
    window.daysCounter1 = daysCounter1;
    window.daysCounter2 = daysCounter2;
    
    console.log('Music player, calendar, love notes manager and two days counters initialized');
});

console.log('Page loaded successfully');