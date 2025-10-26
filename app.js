// Application State
const appState = {
    currentView: 'landing',
    currentUser: null,
    users: [
        {
            username: 'TechCreator99',
            email: 'tech@example.com',
            password: 'password123',
            coins: 500,
            total_earned: 1200,
            total_spent: 700,
            subscribers_gained: 14,
            exchanges_completed: 28,
            channel_url: 'https://youtube.com/@techreviews'
        },
        {
            username: 'GamingPro',
            email: 'gaming@example.com',
            password: 'password123',
            coins: 750,
            total_earned: 2000,
            total_spent: 1250,
            subscribers_gained: 25,
            exchanges_completed: 45,
            channel_url: 'https://youtube.com/@gaminghighlights'
        },
        {
            username: 'VlogMaster',
            email: 'vlog@example.com',
            password: 'password123',
            coins: 300,
            total_earned: 800,
            total_spent: 500,
            subscribers_gained: 10,
            exchanges_completed: 18,
            channel_url: 'https://youtube.com/@dailyvlogs'
        }
    ],
    campaigns: [
        {
            id: 1,
            channel_name: 'Tech Reviews Daily',
            channel_url: 'https://youtube.com/@techreviews',
            coins_offered: 75,
            total_needed: 10,
            current_count: 3,
            creator: 'TechCreator99'
        },
        {
            id: 2,
            channel_name: 'Gaming Highlights',
            channel_url: 'https://youtube.com/@gaminghighlights',
            coins_offered: 60,
            total_needed: 15,
            current_count: 7,
            creator: 'GamingPro'
        },
        {
            id: 3,
            channel_name: 'Daily Vlogs',
            channel_url: 'https://youtube.com/@dailyvlogs',
            coins_offered: 50,
            total_needed: 20,
            current_count: 12,
            creator: 'VlogMaster'
        }
    ],
    nextCampaignId: 4
};

// Application Object
const app = {
    // Initialize app
    init() {
        this.showView('landing');
    },

    // View Management
    showView(viewName) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show requested page
        const page = document.getElementById(`${viewName}-page`);
        if (page) {
            page.classList.add('active');
            appState.currentView = viewName;

            // Update content based on view
            if (viewName === 'dashboard' && appState.currentUser) {
                this.updateDashboard();
            }
        }
    },

    // Auth Tab Switching
    switchAuthTab(tab) {
        const tabs = document.querySelectorAll('.auth-tab');
        const forms = document.querySelectorAll('.auth-form');

        tabs.forEach(t => t.classList.remove('active'));
        forms.forEach(f => f.classList.remove('active'));

        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(`${tab}-form`).classList.add('active');
    },

    // Handle Signup
    handleSignup(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirm_password');

        // Validation
        if (password !== confirmPassword) {
            this.showToast('Passwords do not match!', 'error');
            return;
        }

        // Check if email already exists
        if (appState.users.find(u => u.email === email)) {
            this.showToast('Email already registered!', 'error');
            return;
        }

        // Create new user
        const newUser = {
            username,
            email,
            password,
            coins: 100, // Initial coins
            total_earned: 0,
            total_spent: 0,
            subscribers_gained: 0,
            exchanges_completed: 0,
            channel_url: ''
        };

        appState.users.push(newUser);
        appState.currentUser = newUser;

        this.showToast(`Welcome, ${username}! You received 100 free coins!`, 'success');
        form.reset();
        
        setTimeout(() => {
            this.showView('dashboard');
        }, 1000);
    },

    // Handle Login
    handleLogin(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        
        const email = formData.get('email');
        const password = formData.get('password');

        // Find user
        const user = appState.users.find(u => u.email === email && u.password === password);

        if (!user) {
            this.showToast('Invalid email or password!', 'error');
            return;
        }

        appState.currentUser = user;
        this.showToast(`Welcome back, ${user.username}!`, 'success');
        form.reset();
        
        setTimeout(() => {
            this.showView('dashboard');
        }, 1000);
    },

    // Logout
    logout() {
        appState.currentUser = null;
        this.showToast('Logged out successfully!', 'success');
        this.showView('landing');
    },

    // Update Dashboard
    updateDashboard() {
        const user = appState.currentUser;
        if (!user) return;

        // Update user info
        document.getElementById('user-name').textContent = user.username;
        document.getElementById('coin-balance').textContent = `🪙 ${user.coins}`;

        // Update stats
        document.getElementById('total-earned').textContent = user.total_earned;
        document.getElementById('total-spent').textContent = user.total_spent;
        document.getElementById('active-campaigns').textContent = this.getUserActiveCampaigns().length;
        document.getElementById('subscribers-gained').textContent = user.subscribers_gained;

        // Show channel if saved
        if (user.channel_url) {
            document.getElementById('channel-url').value = user.channel_url;
            document.getElementById('current-channel').style.display = 'block';
            document.getElementById('channel-info').textContent = user.channel_url;
            document.getElementById('campaign-channel-url').value = user.channel_url;
        }

        document.getElementById('user-active-campaigns').textContent = this.getUserActiveCampaigns().length;

        // Load available campaigns
        this.loadAvailableCampaigns();

        // Load user campaigns
        this.loadUserCampaigns();

        // Load leaderboard
        this.loadLeaderboard();

        // Update campaign cost
        this.calculateCampaignCost();
    },

    // Save Channel
    saveChannel() {
        const channelUrl = document.getElementById('channel-url').value.trim();

        if (!channelUrl) {
            this.showToast('Please enter a channel URL', 'error');
            return;
        }

        if (!this.isValidYouTubeUrl(channelUrl)) {
            this.showToast('Please enter a valid YouTube URL', 'error');
            return;
        }

        appState.currentUser.channel_url = channelUrl;
        document.getElementById('current-channel').style.display = 'block';
        document.getElementById('channel-info').textContent = channelUrl;
        document.getElementById('campaign-channel-url').value = channelUrl;

        this.showToast('Channel saved successfully!', 'success');
    },

    // Validate YouTube URL
    isValidYouTubeUrl(url) {
        return url.includes('youtube.com') || url.includes('youtu.be');
    },

    // Load Available Campaigns
    loadAvailableCampaigns() {
        const container = document.getElementById('available-campaigns');
        const availableCampaigns = appState.campaigns.filter(c => 
            c.creator !== appState.currentUser.username && 
            c.current_count < c.total_needed
        );

        if (availableCampaigns.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No campaigns available right now. Check back later!</p></div>';
            return;
        }

        container.innerHTML = availableCampaigns.map(campaign => `
            <div class="campaign-item">
                <div class="campaign-info">
                    <h4>${campaign.channel_name}</h4>
                    <p>Progress: ${campaign.current_count}/${campaign.total_needed}</p>
                </div>
                <div class="campaign-actions">
                    <span class="campaign-reward">+${campaign.coins_offered} 🪙</span>
                    <button class="btn btn-primary btn-small" onclick="app.subscribeToCampaign(${campaign.id})">
                        Subscribe
                    </button>
                </div>
            </div>
        `).join('');
    },

    // Subscribe to Campaign
    subscribeToCampaign(campaignId) {
        const campaign = appState.campaigns.find(c => c.id === campaignId);
        if (!campaign) return;

        // Open YouTube channel in new tab
        window.open(campaign.channel_url, '_blank');

        // Award coins
        appState.currentUser.coins += campaign.coins_offered;
        appState.currentUser.total_earned += campaign.coins_offered;
        appState.currentUser.exchanges_completed += 1;

        // Update campaign progress
        campaign.current_count += 1;

        // Update creator's subscribers
        const creator = appState.users.find(u => u.username === campaign.creator);
        if (creator) {
            creator.subscribers_gained += 1;
        }

        this.showToast(`You earned ${campaign.coins_offered} coins! 🪙`, 'success');
        this.updateDashboard();
    },

    // Calculate Campaign Cost
    calculateCampaignCost() {
        const coinsPerSub = parseInt(document.getElementById('coins-per-sub').value) || 50;
        const subscribersWanted = parseInt(document.getElementById('subscribers-wanted').value) || 10;
        const totalCost = coinsPerSub * subscribersWanted;

        document.getElementById('campaign-cost').innerHTML = `Total Cost: <strong>${totalCost} 🪙</strong>`;

        // Enable/disable create button based on balance
        const createBtn = document.getElementById('create-campaign-btn');
        if (totalCost > appState.currentUser.coins) {
            createBtn.disabled = true;
            createBtn.textContent = 'Insufficient Coins';
        } else {
            createBtn.disabled = false;
            createBtn.textContent = 'Create Campaign';
        }
    },

    // Create Campaign
    createCampaign() {
        const channelUrl = document.getElementById('campaign-channel-url').value.trim();
        const coinsPerSub = parseInt(document.getElementById('coins-per-sub').value);
        const subscribersWanted = parseInt(document.getElementById('subscribers-wanted').value);
        const totalCost = coinsPerSub * subscribersWanted;

        // Validation
        if (!channelUrl) {
            this.showToast('Please enter your channel URL', 'error');
            return;
        }

        if (!this.isValidYouTubeUrl(channelUrl)) {
            this.showToast('Please enter a valid YouTube URL', 'error');
            return;
        }

        if (coinsPerSub < 50) {
            this.showToast('Minimum 50 coins per subscriber', 'error');
            return;
        }

        if (totalCost > appState.currentUser.coins) {
            this.showToast('Insufficient coins!', 'error');
            return;
        }

        // Extract channel name from URL
        const channelName = this.extractChannelName(channelUrl);

        // Create campaign
        const newCampaign = {
            id: appState.nextCampaignId++,
            channel_name: channelName,
            channel_url: channelUrl,
            coins_offered: coinsPerSub,
            total_needed: subscribersWanted,
            current_count: 0,
            creator: appState.currentUser.username
        };

        appState.campaigns.push(newCampaign);

        // Deduct coins
        appState.currentUser.coins -= totalCost;
        appState.currentUser.total_spent += totalCost;

        this.showToast('Campaign created successfully!', 'success');
        this.updateDashboard();

        // Reset form
        document.getElementById('coins-per-sub').value = 50;
        document.getElementById('subscribers-wanted').value = 10;
    },

    // Extract Channel Name from URL
    extractChannelName(url) {
        const match = url.match(/@([^/]+)/);
        return match ? match[1] : 'My Channel';
    },

    // Get User Active Campaigns
    getUserActiveCampaigns() {
        return appState.campaigns.filter(c => 
            c.creator === appState.currentUser.username && 
            c.current_count < c.total_needed
        );
    },

    // Load User Campaigns
    loadUserCampaigns() {
        const container = document.getElementById('user-campaigns-list');
        const userCampaigns = this.getUserActiveCampaigns();

        if (userCampaigns.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No active campaigns</p></div>';
            return;
        }

        container.innerHTML = userCampaigns.map(campaign => {
            const progress = (campaign.current_count / campaign.total_needed) * 100;
            return `
                <div class="user-campaign-item">
                    <h4>${campaign.channel_name}</h4>
                    <p>Offering: ${campaign.coins_offered} 🪙 per subscriber</p>
                    <div class="campaign-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <p class="progress-text">${campaign.current_count}/${campaign.total_needed} subscribers</p>
                    </div>
                    <div class="campaign-delete">
                        <button class="btn btn-danger btn-small" onclick="app.deleteCampaign(${campaign.id})">
                            Delete Campaign
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    // Delete Campaign
    deleteCampaign(campaignId) {
        const campaign = appState.campaigns.find(c => c.id === campaignId);
        if (!campaign) return;

        // Confirm deletion
        if (!confirm('Are you sure you want to delete this campaign? Remaining coins will not be refunded.')) {
            return;
        }

        // Remove campaign
        appState.campaigns = appState.campaigns.filter(c => c.id !== campaignId);

        this.showToast('Campaign deleted', 'success');
        this.updateDashboard();
    },

    // Load Leaderboard
    loadLeaderboard() {
        const container = document.getElementById('leaderboard');
        
        // Sort users by exchanges completed
        const sortedUsers = [...appState.users].sort((a, b) => b.exchanges_completed - a.exchanges_completed);
        const topUsers = sortedUsers.slice(0, 10);

        container.innerHTML = topUsers.map((user, index) => {
            const rank = index + 1;
            let classes = 'leaderboard-item';
            let badge = '';
            
            if (rank === 1) {
                classes += ' top-1';
                badge = '🏆';
            } else if (rank === 2) {
                classes += ' top-2';
                badge = '🥈';
            } else if (rank === 3) {
                classes += ' top-3';
                badge = '🥉';
            }

            return `
                <div class="${classes}">
                    <div class="leaderboard-rank">${rank}</div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-name">${user.username}</div>
                        <div class="leaderboard-exchanges">${user.exchanges_completed} exchanges</div>
                    </div>
                    ${badge ? `<div class="leaderboard-badge">${badge}</div>` : ''}
                </div>
            `;
        }).join('');
    },

    // Show Toast Notification
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast show ${type}`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}