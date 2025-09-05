// 音乐播放器功能实现
class MusicPlayer {
    constructor() {
        this.audio = document.getElementById('musicPlayer');
        this.isPlaying = false;
        this.currentSongIndex = 0;

        this.volume = 0.7;
        this.errorCount = 0; // 错误计数器
        this.maxRetries = 3; // 最大重试次数
        
        // 播放列表
        this.playlist = [
            {
                title: 'Romantic Music',
                artist: 'Various Artists',
                src: 'music/romantic.mp3',
                duration: 180
            },
            {
                title: 'Love Song',
                artist: 'Sweet Melody',
                src: 'music/love.mp3',
                duration: 210
            },
            {
                title: 'Together Forever',
                artist: 'Couple Dreams',
                src: 'music/together.mp3',
                duration: 195
            }
        ];
        
        this.initializePlayer();
        this.bindEvents();
    }
    
    initializePlayer() {
        // 设置初始音量
        this.audio.volume = this.volume;
        
        // 加载第一首歌
        this.loadSong(this.currentSongIndex);
        
        // 更新音量显示
        this.updateVolumeDisplay();
    }
    
    bindEvents() {
        // 播放/暂停按钮事件
        const mainPlayPauseBtn = document.getElementById('mainPlayPauseBtn');
        
        mainPlayPauseBtn.addEventListener('click', () => this.togglePlay());
        
        // 上一首/下一首按钮
        document.getElementById('prevBtn').addEventListener('click', () => this.previousSong());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextSong());
        

        
        // 进度条控制
        const progressSlider = document.getElementById('progressSlider');
        progressSlider.addEventListener('input', (e) => this.seekTo(e.target.value));
        
        // 音量控制
        const volumeSlider = document.getElementById('volumeSlider');
        volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        
        // 静音按钮
        document.getElementById('muteBtn').addEventListener('click', () => this.toggleMute());
        
        // 音频事件监听
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
        
        // 更新音频源
        this.audio.src = song.src;
        
        // 更新UI显示
        document.getElementById('currentSongTitle').textContent = song.title;
        document.getElementById('currentArtist').textContent = song.artist;
        
        // 重置进度条
        this.updateProgress();
        
        // 检查音频文件是否可以加载
        this.checkAudioFile(song.src);
    }
    
    checkAudioFile(src) {
        // 创建一个临时音频对象来检查文件是否存在
        const testAudio = new Audio();
        testAudio.addEventListener('error', () => {
            console.warn(`音频文件不存在或无法加载: ${src}`);
        });
        testAudio.src = src;
    }
    
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
            // 播放成功，重置错误计数器
            this.errorCount = 0;
        }).catch(error => {
            console.error('播放失败:', error);
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
    

    
    seekTo(percentage) {
        const duration = this.audio.duration;
        if (duration) {
            this.audio.currentTime = (percentage / 100) * duration;
        }
    }
    
    setVolume(volume) {
        this.volume = volume / 100;
        this.audio.volume = this.volume;
        this.updateVolumeDisplay();
    }
    
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
    
    updateProgress() {
        const currentTime = this.audio.currentTime;
        const duration = this.audio.duration;
        
        if (duration) {
            const percentage = (currentTime / duration) * 100;
            document.getElementById('progressBar').style.width = percentage + '%';
            document.getElementById('progressSlider').value = percentage;
        }
        
        // 更新时间显示
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
        
        // 更新音量图标
        const volumeIcon = document.getElementById('volumeIcon');
        if (volume === 0) {
            volumeIcon.innerHTML = '<path d="M155.51,24.81a8,8,0,0,0-8.42.88L77.25,80H32A16,16,0,0,0,16,96v64a16,16,0,0,0,16,16H77.25l69.84,54.31A8,8,0,0,0,160,224V32A8,8,0,0,0,155.51,24.81ZM144,207.64,81.25,161.69A8,8,0,0,0,76,160H32V96H76a8,8,0,0,0,5.25-1.69L144,48.36ZM213.66,82.34l-56,56a8,8,0,0,1-11.32-11.32L201.37,72,146.34,16.97a8,8,0,0,1,11.32-11.32l56,56A8,8,0,0,1,213.66,82.34Z"/>';
        } else {
            volumeIcon.innerHTML = '<path d="M155.51,24.81a8,8,0,0,0-8.42.88L77.25,80H32A16,16,0,0,0,16,96v64a16,16,0,0,0,16,16H77.25l69.84,54.31A8,8,0,0,0,160,224V32A8,8,0,0,0,155.51,24.81ZM144,207.64,81.25,161.69A8,8,0,0,0,76,160H32V96H76a8,8,0,0,0,5.25-1.69L144,48.36Zm54-106.08a24,24,0,0,1,0,36.88,8,8,0,0,1-12-10.58,8,8,0,0,0,0-15.72,8,8,0,0,1,12-10.58ZM248,128a79.9,79.9,0,0,1-20.37,53.34,8,8,0,0,1-11.92-10.67,64,64,0,0,0,0-85.33,8,8,0,1,1,11.92-10.67A79.83,79.83,0,0,1,248,128Z"/>';
        }
    }
    
    updatePlayPauseIcons(isPlaying) {
        const playIcon = '<path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z"/>';
        const pauseIcon = '<path d="M216,48V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V48a16,16,0,0,1,16-16h32A16,16,0,0,1,216,48ZM88,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H88a16,16,0,0,0,16-16V48A16,16,0,0,0,88,32Z"/>';
        
        const icon = isPlaying ? pauseIcon : playIcon;
        document.getElementById('mainPlayPauseIcon').innerHTML = icon;
    }
    

    
    handleError(error) {
        console.error('音频播放错误:', error);
        this.handlePlayError();
    }
    
    handlePlayError() {
        this.errorCount++;
        console.log(`播放错误次数: ${this.errorCount}/${this.maxRetries}`);
        
        if (this.errorCount >= this.maxRetries) {
            // 达到最大重试次数，停止播放并显示错误信息
            this.pause();
            this.errorCount = 0;
            this.showErrorMessage('音频文件不存在，请将音频文件放入music文件夹中');
            this.showMusicFolderInfo();
            return;
        }
        
        // 尝试播放下一首歌曲，但要避免无限循环
        const nextIndex = this.getNextValidSongIndex();
        if (nextIndex !== -1) {
            this.loadSong(nextIndex);
            if (this.isPlaying) {
                setTimeout(() => this.play(), 100); // 延迟播放避免立即错误
            }
        } else {
            // 没有可播放的歌曲
            this.pause();
            this.errorCount = 0;
            this.showErrorMessage('没有可播放的音频文件');
        }
    }
    
    getNextValidSongIndex() {
        // 简单的下一首逻辑，避免复杂的随机和循环逻辑在错误处理中
        let nextIndex = (this.currentSongIndex + 1) % this.playlist.length;
        let attempts = 0;
        
        // 最多尝试播放列表中的所有歌曲
        while (attempts < this.playlist.length) {
            if (nextIndex !== this.currentSongIndex) {
                return nextIndex;
            }
            nextIndex = (nextIndex + 1) % this.playlist.length;
            attempts++;
        }
        
        return -1; // 没有找到其他歌曲
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
            <strong>音频文件说明：</strong><br>
            请将以下音频文件放入music文件夹：<br>
            • romantic.mp3<br>
            • love.mp3<br>
            • together.mp3
        `;
        document.body.appendChild(infoDiv);
        
        // 5秒后自动移除信息
        setTimeout(() => {
            if (infoDiv.parentNode) {
                infoDiv.parentNode.removeChild(infoDiv);
            }
        }, 5000);
    }
    
    showErrorMessage(message) {
        // 在页面上显示错误信息
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
        
        // 3秒后自动移除错误信息
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 3000);
    }
    
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// 日历类
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
        // 绑定导航按钮事件
        document.getElementById('prevMonthBtn').addEventListener('click', () => {
            this.previousMonth();
        });
        
        document.getElementById('nextMonthBtn').addEventListener('click', () => {
            this.nextMonth();
        });
        
        // 初始化日历显示
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
        // 更新月份年份显示
        const monthYearElement = document.getElementById('currentMonthYear');
        monthYearElement.textContent = `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
        
        // 生成日历网格
        this.generateCalendarGrid();
    }
    
    generateCalendarGrid() {
        const calendarGrid = document.getElementById('calendarGrid');
        
        // 清空现有日期（保留星期标题）
        const weekHeaders = calendarGrid.querySelectorAll('p');
        calendarGrid.innerHTML = '';
        
        // 重新添加星期标题
        weekHeaders.forEach(header => {
            calendarGrid.appendChild(header);
        });
        
        // 获取当月第一天是星期几（0=周日，1=周一...）
        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        // 获取当月总天数
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        
        // 添加空白格子（月初前的空白）
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'h-12 w-full';
            calendarGrid.appendChild(emptyCell);
        }
        
        // 添加当月的日期
        for (let day = 1; day <= daysInMonth; day++) {
            const dayButton = document.createElement('button');
            dayButton.className = 'h-12 w-full text-white text-sm font-medium leading-normal';
            
            const dayDiv = document.createElement('div');
            dayDiv.className = 'flex size-full items-center justify-center rounded-full';
            
            // 检查是否是今天
            const isToday = this.isToday(day);
            if (isToday) {
                dayDiv.classList.add('bg-[#f04299]');
            }
            
            dayDiv.textContent = day;
            dayButton.appendChild(dayDiv);
            calendarGrid.appendChild(dayButton);
            
            // 添加点击事件（可选）
            dayButton.addEventListener('click', () => {
                this.selectDate(day);
            });
        }
    }
    
    isToday(day) {
        return this.currentYear === this.today.getFullYear() &&
               this.currentMonth === this.today.getMonth() &&
               day === this.today.getDate();
    }
    
    selectDate(day) {
        // 移除之前选中的日期样式
        const allDays = document.querySelectorAll('#calendarGrid button div');
        allDays.forEach(dayDiv => {
            if (!this.isToday(parseInt(dayDiv.textContent))) {
                dayDiv.classList.remove('bg-[#f04299]');
            }
        });
        
        // 添加选中样式到点击的日期（如果不是今天）
        const clickedDay = parseInt(day);
        if (!this.isToday(clickedDay)) {
            event.target.classList.add('bg-[#f04299]');
        }
        
        console.log(`选中日期: ${this.currentYear}-${this.currentMonth + 1}-${day}`);
    }
}

// 页面加载完成后初始化音乐播放器和日历
document.addEventListener('DOMContentLoaded', function() {
    const musicPlayer = new MusicPlayer();
    const calendar = new Calendar();
    
    // 将实例添加到全局作用域，便于调试
    window.musicPlayer = musicPlayer;
    window.calendar = calendar;
    
    console.log('音乐播放器和日历已初始化');
});

console.log('页面已加载完成');