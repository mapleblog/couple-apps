// 头像管理功能 - 支持自定义图片上传和更换
class AvatarManager {
    constructor() {
        this.initializeAvatarManager();
    }

    initializeAvatarManager() {
        // 为每个头像添加点击事件，支持图片更换
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
        // 添加鼠标悬停效果
        avatarElement.style.cursor = 'pointer';
        avatarElement.title = `点击更换${personName === 'clara' ? 'Clara' : 'Ethan'}的头像`;

        // 添加点击事件
        avatarElement.addEventListener('click', () => {
            this.openImageSelector(avatarElement, personName);
        });

        // 添加悬停效果
        avatarElement.addEventListener('mouseenter', () => {
            avatarElement.style.opacity = '0.8';
            avatarElement.style.transform = 'scale(1.02)';
            avatarElement.style.transition = 'all 0.3s ease';
        });

        avatarElement.addEventListener('mouseleave', () => {
            avatarElement.style.opacity = '1';
            avatarElement.style.transform = 'scale(1)';
        });
    }

    openImageSelector(avatarElement, personName) {
        // 创建文件输入元素
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';

        // 添加文件选择事件
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                this.handleImageUpload(file, avatarElement, personName);
            }
        });

        // 触发文件选择
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    }

    handleImageUpload(file, avatarElement, personName) {
        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            alert('请选择有效的图片文件！');
            return;
        }

        // 验证文件大小（限制为5MB）
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            alert('图片文件大小不能超过5MB！');
            return;
        }

        // 使用FileReader读取文件
        const reader = new FileReader();
        reader.onload = (e) => {
            // 更新头像图片
            avatarElement.src = e.target.result;
            
            // 保存到本地存储
            this.saveAvatarToStorage(personName, e.target.result);
            
            // 显示成功提示
            this.showSuccessMessage(`${personName === 'clara' ? 'Clara' : 'Ethan'}的头像已更新！`);
        };

        reader.onerror = () => {
            alert('图片读取失败，请重试！');
        };

        reader.readAsDataURL(file);
    }

    saveAvatarToStorage(personName, imageData) {
        // 将头像数据保存到localStorage
        try {
            localStorage.setItem(`avatar_${personName}`, imageData);
        } catch (error) {
            console.warn('无法保存头像到本地存储:', error);
        }
    }

    loadAvatarsFromStorage() {
        // 从localStorage加载保存的头像
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
            console.warn('无法从本地存储加载头像:', error);
        }
    }

    showSuccessMessage(message) {
        // 创建成功提示
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

        // 显示动画
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // 自动隐藏
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
        // 重置头像为默认图片
        const claraElement = document.getElementById('clara-avatar');
        const ethanElement = document.getElementById('ethan-avatar');

        if (claraElement) {
            claraElement.src = 'https://via.placeholder.com/300x300/f04299/ffffff?text=Clara';
        }

        if (ethanElement) {
            ethanElement.src = 'https://via.placeholder.com/300x300/482336/ffffff?text=Ethan';
        }

        // 清除本地存储
        localStorage.removeItem('avatar_clara');
        localStorage.removeItem('avatar_ethan');

        this.showSuccessMessage('头像已重置为默认图片！');
    }
}

// 页面加载完成后初始化头像管理器
document.addEventListener('DOMContentLoaded', () => {
    const avatarManager = new AvatarManager();
    
    // 加载保存的头像
    avatarManager.loadAvatarsFromStorage();
    
    // 将头像管理器实例添加到全局作用域，方便调试和手动操作
    window.avatarManager = avatarManager;
});