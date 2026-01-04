// Main Application JavaScript

class BloodStrikeApp {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        // Check authentication state
        await this.checkAuth();
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Load initial data
        await this.loadInitialData();
        
        // Initialize theme
        this.initTheme();
    }

    async checkAuth() {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        
        if (error) {
            console.error('Auth error:', error);
            return;
        }
        
        if (user) {
            this.currentUser = user;
            this.showUserMenu();
        } else {
            this.showAuthButtons();
        }
    }

    showUserMenu() {
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        
        if (authButtons) authButtons.classList.add('hidden');
        if (userMenu) userMenu.classList.remove('hidden');
        
        // Update user info if needed
        const userDropdownBtn = document.getElementById('userDropdownBtn');
        if (userDropdownBtn) {
            userDropdownBtn.innerHTML = `<i class="fas fa-user"></i>`;
        }
    }

    showAuthButtons() {
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        
        if (authButtons) authButtons.classList.remove('hidden');
        if (userMenu) userMenu.classList.add('hidden');
    }

    initEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // User dropdown
        const userDropdownBtn = document.getElementById('userDropdownBtn');
        const userDropdown = document.getElementById('userDropdown');
        if (userDropdownBtn && userDropdown) {
            userDropdownBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('hidden');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!userDropdown.contains(e.target) && !userDropdownBtn.contains(e.target)) {
                    userDropdown.classList.add('hidden');
                }
            });
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.logout();
            });
        }

        // Close mobile menu when clicking a link
        document.querySelectorAll('.neu-nav-link-mobile').forEach(link => {
            link.addEventListener('click', () => {
                if (mobileMenu) mobileMenu.classList.add('hidden');
            });
        });
    }

    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.classList.toggle('dark-mode', savedTheme === 'dark');
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.innerHTML = savedTheme === 'dark' ? 
                '<i class="fas fa-sun"></i>' : 
                '<i class="fas fa-moon"></i>';
        }
    }

    toggleTheme() {
        const isDark = document.documentElement.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.innerHTML = isDark ? 
                '<i class="fas fa-sun"></i>' : 
                '<i class="fas fa-moon"></i>';
        }
    }

    async logout() {
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            this.showToast('Error logging out', 'error');
            console.error('Logout error:', error);
            return;
        }
        
        this.currentUser = null;
        this.showAuthButtons();
        this.showToast('Logged out successfully', 'success');
        
        // Redirect to home page if not already there
        if (!window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
        }
    }

    async loadInitialData() {
        // Load featured mods on home page
        if (document.getElementById('featuredMods')) {
            await this.loadFeaturedMods();
        }
        
        // Load stats on home page
        if (document.getElementById('totalDownloads')) {
            await this.loadStats();
        }
    }

    async loadFeaturedMods() {
        try {
            const { data: mods, error } = await supabaseClient
                .from('mods')
                .select('*')
                .eq('featured', true)
                .eq('approved', true)
                .limit(3)
                .order('download_count', { ascending: false });
            
            if (error) throw error;
            
            const container = document.getElementById('featuredMods');
            if (!container) return;
            
            // Clear skeleton loaders
            container.innerHTML = '';
            
            if (!mods || mods.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-8">
                        <div class="neu-card-inner py-8">
                            <i class="fas fa-box-open text-4xl neu-text-accent mb-4"></i>
                            <p class="neu-text-gray">No featured mods available yet</p>
                        </div>
                    </div>
                `;
                return;
            }
            
            // Render featured mods
            mods.forEach(mod => {
                const modCard = this.createModCard(mod);
                container.appendChild(modCard);
            });
            
        } catch (error) {
            console.error('Error loading featured mods:', error);
            this.showToast('Error loading featured mods', 'error');
        }
    }

    createModCard(mod) {
        const div = document.createElement('div');
        div.className = 'neu-mod-card';
        
        // Determine mod type badge
        const type = mod.type && mod.type.length > 0 ? mod.type[0] : 'Mod';
        const typeColors = {
            'Aimbot': 'bg-red-500',
            'Wallhack': 'bg-blue-500',
            'ESP': 'bg-green-500',
            'Speed': 'bg-purple-500',
            'Other': 'bg-gray-500'
        };
        
        div.innerHTML = `
            ${mod.featured ? `<span class="neu-mod-card-badge ${typeColors[type] || 'bg-gray-500'}">Featured</span>` : ''}
            
            <div class="neu-mod-card-image">
                <div class="w-full h-full flex items-center justify-center neu-bg">
                    <i class="fas fa-gamepad text-4xl neu-text-accent"></i>
                </div>
            </div>
            
            <h3 class="neu-mod-card-title">${this.escapeHtml(mod.title)}</h3>
            <p class="neu-mod-card-desc">${this.escapeHtml(mod.description?.substring(0, 100) || 'No description')}...</p>
            
            <div class="neu-mod-card-meta">
                <div class="flex items-center space-x-2">
                    <span class="neu-badge">${type}</span>
                    <span class="neu-text-light">${mod.cpu_arch || 'All'}</span>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="neu-rating">
                        ${this.generateStars(mod.rating || 0)}
                    </span>
                    <span class="neu-text-light">(${mod.rating_count || 0})</span>
                </div>
            </div>
            
            <div class="flex justify-between items-center mt-4">
                <div class="flex items-center space-x-2 neu-text-light text-sm">
                    <i class="fas fa-download"></i>
                    <span>${mod.download_count || 0}</span>
                </div>
                <button class="neu-btn-sm neu-btn-primary view-mod-btn" data-mod-id="${mod.id}">
                    <i class="fas fa-eye mr-1"></i> View
                </button>
            </div>
        `;
        
        // Add click event to view button
        const viewBtn = div.querySelector('.view-mod-btn');
        if (viewBtn) {
            viewBtn.addEventListener('click', () => {
                window.location.href = `pages/details.html?id=${mod.id}`;
            });
        }
        
        // Make entire card clickable
        div.addEventListener('click', (e) => {
            if (!e.target.closest('.view-mod-btn') && !e.target.closest('.neu-mod-card-badge')) {
                window.location.href = `pages/details.html?id=${mod.id}`;
            }
        });
        
        return div;
    }

    generateStars(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars += '<i class="fas fa-star neu-star active"></i>';
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars += '<i class="fas fa-star-half-alt neu-star active"></i>';
            } else {
                stars += '<i class="far fa-star neu-star"></i>';
            }
        }
        
        return stars;
    }

    async loadStats() {
        try {
            // In a real app, you would fetch these from your database
            // For now, we'll use static values
            const stats = {
                totalDownloads: '10,000+',
                totalMods: '150+',
                totalUsers: '5,000+',
                avgRating: '4.8'
            };
            
            // Update DOM elements
            Object.keys(stats).forEach(stat => {
                const element = document.getElementById(stat);
                if (element) {
                    element.textContent = stats[stat];
                }
            });
            
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `neu-toast ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="${icons[type] || icons.info} text-${type === 'success' ? 'green' : type === 'error' ? 'red' : type === 'warning' ? 'yellow' : 'blue'}-500"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 5000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Utility function to handle file uploads
    async uploadFile(file, bucket = 'mod-files') {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            
            const { data, error } = await supabaseClient
                .storage
                .from(bucket)
                .upload(fileName, file);
            
            if (error) throw error;
            
            // Get public URL
            const { data: { publicUrl } } = supabaseClient
                .storage
                .from(bucket)
                .getPublicUrl(fileName);
            
            return publicUrl;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BloodStrikeApp();
});

// Utility functions for other pages
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Markdown renderer (simple version)
function renderMarkdown(markdown) {
    if (!markdown) return '';
    
    return markdown
        .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/`(.*)`/gim, '<code class="bg-gray-800 text-gray-100 px-2 py-1 rounded">$1</code>')
        .replace(/\n\n/gim, '</p><p>')
        .replace(/\n/gim, '<br>');
}

// Download counter increment
async function incrementDownloadCount(modId) {
    try {
        // Get current count
        const { data: mod, error: fetchError } = await supabaseClient
            .from('mods')
            .select('download_count')
            .eq('id', modId)
            .single();
        
        if (fetchError) throw fetchError;
        
        // Increment count
        const { error: updateError } = await supabaseClient
            .from('mods')
            .update({ 
                download_count: (mod.download_count || 0) + 1 
            })
            .eq('id', modId);
        
        if (updateError) throw updateError;
        
        return true;
    } catch (error) {
        console.error('Error incrementing download count:', error);
        return false;
    }
}