// Avatar Management Functionality - Support custom image upload and replacement
class AvatarManager {
    constructor() {
        this.initializeAvatarManager();
    }

    initializeAvatarManager() {
        // Initialize avatar manager
        const claraAvatar = document.getElementById('clara-avatar');
        const ethanAvatar = document.getElementById('ethan-avatar');

        if (claraAvatar) {
            this.addClickHandler(claraAvatar, 'clara');
        }

        if (ethanAvatar) {
            this.addClickHandler(ethanAvatar, 'ethan');
        }
    }

    addClickHandler(avatarElement, personName) {
        // Click functionality has been disabled
        // Avatar display functionality remains intact
        // No click events, hover effects, or cursor changes
    }

    openImageSelector(avatarElement, personName) {
        // Open image selector
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';

        // Add file selection event
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                this.handleImageUpload(file, avatarElement, personName);
            }
        });

        // Trigger file selection
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    }

    handleImageUpload(file, avatarElement, personName) {
        // Handle image upload
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file!');
            return;
        }

        // Validate file size
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            alert('Image file is too large, please select an image smaller than 5MB!');
            return;
        }

        // Create FileReader to read image
        const reader = new FileReader();
        reader.onload = (e) => {
            // Update avatar display
            avatarElement.src = e.target.result;
            
            // Save to local storage
            this.saveAvatarToStorage(personName, e.target.result);
            
            // Show success message
            this.showSuccessMessage('Avatar updated successfully!');
        };

        reader.onerror = () => {
            alert('Failed to read image, please try again!');
        };

        // Read file as DataURL
        reader.readAsDataURL(file);
    }

    saveAvatarToStorage(personName, imageData) {
        // Save avatar to local storage
        try {
            localStorage.setItem(`avatar_${personName}`, imageData);
        } catch (error) {
            console.error('Failed to save avatar:', error);
        }
    }

    loadAvatarsFromStorage() {
        // Load avatar from local storage
        try {
            const claraAvatar = localStorage.getItem('avatar_clara');
            const ethanAvatar = localStorage.getItem('avatar_ethan');

            if (claraAvatar) {
                const claraElement = document.getElementById('clara-avatar');
                if (claraElement) {
                    claraElement.src = claraAvatar;
                }
            }

            if (ethanAvatar) {
                const ethanElement = document.getElementById('ethan-avatar');
                if (ethanElement) {
                    ethanElement.src = ethanAvatar;
                }
            }
        } catch (error) {
            console.error('Failed to load avatar:', error);
        }
    }

    showSuccessMessage(message) {
        // Show success message
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4ade80;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(toast);

        // Show animation
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Auto hide
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    resetAvatars() {
        // Reset avatar
        const claraElement = document.getElementById('clara-avatar');
        const ethanElement = document.getElementById('ethan-avatar');

        if (claraElement) {
            claraElement.src = 'https://via.placeholder.com/300x300/f04299/ffffff?text=Clara';
        }

        if (ethanElement) {
            ethanElement.src = 'https://via.placeholder.com/300x300/482336/ffffff?text=Ethan';
        }

        // Clear local storage
        localStorage.removeItem('avatar_clara');
        localStorage.removeItem('avatar_ethan');

        this.showSuccessMessage('Avatar has been reset to default image!');
    }
}

// Initialize avatar manager after page load
document.addEventListener('DOMContentLoaded', () => {
    const avatarManager = new AvatarManager();
    
    // Load saved avatars
    avatarManager.loadAvatarsFromStorage();
    
    // Add avatar manager instance to global scope for debugging and manual operations
    window.avatarManager = avatarManager;
});