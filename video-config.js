// Video Configuration File
// Used to configure custom video links and playback settings

// Video configuration object
const videoConfig = {
    // Default video URL (can be local file or network link)
    videoUrl: './videos/testvideos.mp4', // Leave empty for no default video
    
    // Supported video formats
    supportedFormats: ['mp4', 'webm', 'ogg'],
    
    // Playback settings
    settings: {
        autoplay: false,     // Auto play
        loop: false,         // Loop playback
        muted: false,        // Muted
        controls: true,      // Show controls
        preload: 'metadata'  // Preload setting: 'none', 'metadata', 'auto'
    },
    
    // Example video links (users can replace with their own videos)
    examples: {
        // Local video files
        // localVideo: './videos/my-video.mp4',
        
        // Network video links
        // networkVideo: 'https://example.com/video.mp4',
        
        // YouTube video (requires embed link)
        // youtubeVideo: 'https://www.youtube.com/embed/VIDEO_ID'
    }
};

// Convenience function: Set custom video
function setCustomVideo(url) {
    if (window.videoPlayer) {
        window.videoPlayer.setVideoUrl('./videos/' + 'testvideos.mp4');
        console.log('Video set to:', url);
    } else {
        console.warn('VideoPlayer not initialized, please try again later');
    }
}

// Convenience function: Use example video
function useExampleVideo(exampleKey) {
    const exampleUrl = videoConfig.examples[exampleKey];
    if (exampleUrl) {
        setCustomVideo(exampleUrl);
    } else {
        console.warn('Example video does not exist:', exampleKey);
    }
}

// Export configuration (if using module system)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { videoConfig, setCustomVideo, useExampleVideo };
}

// Usage instructions (in browser console)
console.log(`
=== Usage Instructions ===
1. Directly modify videoConfig.videoUrl to set default video

2. Call setCustomVideo('your-video-url') in JavaScript to dynamically set video

3. Use useExampleVideo(0) to use preset example videos

4. Supported formats: ${videoConfig.supportedFormats.join(', ')}
========================
`);