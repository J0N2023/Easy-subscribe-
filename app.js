// In-memory data storage
let currentUser = null;
let users = [
  {
    username: 'john_creator',
    password: 'pass123',
    email: 'john@example.com',
    coins: 250,
    role: 'user',
    joinDate: '2025-01-15',
    completedCampaigns: []
  },
  {
    username: 'sarah_vlogger',
    password: 'pass123',
    email: 'sarah@example.com',
    coins: 180,
    role: 'user',
    joinDate: '2025-02-20',
    completedCampaigns: []
  },
  {
    username: 'mike_gamer',
    password: 'pass123',
    email: 'mike@example.com',
    coins: 320,
    role: 'user',
    joinDate: '2025-03-10',
    completedCampaigns: []
  },
  {
    username: 'emma_beauty',
    password: 'pass123',
    email: 'emma@example.com',
    coins: 150,
    role: 'user',
    joinDate: '2025-04-05',
    completedCampaigns: []
  },
  {
    username: 'admin',
    password: 'admin123',
    email: 'admin@easysubscribe.com',
    coins: 9999,
    role: 'admin',
    joinDate: '2025-01-01',
    completedCampaigns: []
  }
];

let campaigns = [
  {
    id: 1,
    creatorUsername: 'john_creator',
    channelUrl: 'https://youtube.com/@johncreator',
    videoUrl: 'https://youtube.com/watch?v=abc123',
    title: 'Tech Review Channel - Subscribe for Gadget Reviews',
    coinsOffered: 20,
    status: 'active',
    createdDate: '2025-10-20'
  },
  {
    id: 2,
    creatorUsername: 'sarah_vlogger',
    channelUrl: 'https://youtube.com/@sarahvlogs',
    videoUrl: 'https://youtube.com/watch?v=xyz789',
    title: 'Daily Vlog Channel - Join My Journey',
    coinsOffered: 25,
    status: 'active',
    createdDate: '2025-10-22'
  },
  {
    id: 3,
    creatorUsername: 'mike_gamer',
    channelUrl: 'https://youtube.com/@mikegaming',
    videoUrl: 'https://youtube.com/watch?v=game456',
    title: 'Gaming Channel - Epic Gameplay & Tutorials',
    coinsOffered: 30,
    status: 'active',
    createdDate: '2025-10-23'
  },
  {
    id: 4,
    creatorUsername: 'emma_beauty',
    channelUrl: 'https://youtube.com/@emmabeauty',
    videoUrl: 'https://youtube.com/watch?v=beauty789',
    title: 'Beauty & Makeup Tutorials - Weekly Content',
    coinsOffered: 22,
    status: 'active',
    createdDate: '2025-10-24'
  }
];

let nextCampaignId = 5;
let currentWatchingCampaign = null;
let watchTimer = null;
let watchSeconds = 0;

// Utility Functions
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function updateUserCoins(username, amount) {
  const user = users.find(u => u.username === username);
  if (user) {
    user.coins += amount;
    if (currentUser && currentUser.username === username) {
      currentUser.coins = user.coins;
      updateHeaderCoins();
    }
  }
}

function updateHeaderCoins() {
  const coinElements = document.querySelectorAll('#headerCoins, #statCoins, #dashCoins');
  coinElements.forEach(el => {
    el.textContent = currentUser.coins;
  });
}

function getUserStats() {
  const userCampaigns = campaigns.filter(c => c.creatorUsername === currentUser.username);
  const completedCount = currentUser.completedCampaigns ? currentUser.completedCampaigns.length : 0;
  
  return {
    coins: currentUser.coins,
    campaigns: userCampaigns.length,
    completed: completedCount
  };
}

// Login
document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    currentUser = user;
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('appPage').classList.add('active');
    
    // Update UI
    document.getElementById('headerUsername').textContent = user.username;
    document.getElementById('welcomeUsername').textContent = user.username;
    updateHeaderCoins();
    
    // Show admin link if admin
    if (user.role === 'admin') {
      document.getElementById('adminNavLink').style.display = 'block';
    }
    
    // Load home page
    loadHomePage();
    showToast('Welcome back, ' + user.username + '!', 'success');
  } else {
    showToast('Invalid username or password', 'error');
  }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  currentUser = null;
  document.getElementById('appPage').classList.remove('active');
  document.getElementById('loginPage').classList.add('active');
  document.getElementById('loginForm').reset();
  showToast('Logged out successfully', 'success');
});

// Navigation
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const page = link.dataset.page;
    navigateToPage(page);
  });
});

document.querySelectorAll('.action-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const page = btn.dataset.page;
    navigateToPage(page);
  });
});

function navigateToPage(page) {
  // Update nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.page === page) {
      link.classList.add('active');
    }
  });
  
  // Hide all content pages
  document.querySelectorAll('.content-page').forEach(p => {
    p.classList.remove('active');
  });
  
  // Show selected page
  switch(page) {
    case 'home':
      document.getElementById('homePage').classList.add('active');
      loadHomePage();
      break;
    case 'earn':
      document.getElementById('earnPage').classList.add('active');
      loadEarnPage();
      break;
    case 'create':
      document.getElementById('createPage').classList.add('active');
      break;
    case 'dashboard':
      document.getElementById('dashboardPage').classList.add('active');
      loadDashboardPage();
      break;
    case 'admin':
      if (currentUser && currentUser.role === 'admin') {
        document.getElementById('adminPage').classList.add('active');
        loadAdminPage();
      }
      break;
  }
}

// Home Page
function loadHomePage() {
  const stats = getUserStats();
  document.getElementById('statCoins').textContent = stats.coins;
  document.getElementById('statCampaigns').textContent = stats.campaigns;
  document.getElementById('statCompleted').textContent = stats.completed;
  
  // Load recent campaigns
  const recentCampaigns = campaigns.filter(c => c.creatorUsername !== currentUser.username).slice(0, 3);
  renderCampaigns(recentCampaigns, 'homeRecentCampaigns', true);
}

// Earn Page
function loadEarnPage() {
  const availableCampaigns = campaigns.filter(c => {
    return c.creatorUsername !== currentUser.username && 
           c.status === 'active' &&
           (!currentUser.completedCampaigns || !currentUser.completedCampaigns.includes(c.id));
  });
  
  renderCampaigns(availableCampaigns, 'earnCampaignsList', true);
}

function renderCampaigns(campaignList, containerId, showEarnBtn = false) {
  const container = document.getElementById(containerId);
  
  if (campaignList.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <p>No campaigns available</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = campaignList.map(campaign => `
    <div class="campaign-card">
      <div class="campaign-thumbnail">📺</div>
      <div class="campaign-content">
        <div class="campaign-title">${campaign.title}</div>
        <div class="campaign-creator">by @${campaign.creatorUsername}</div>
        <div class="campaign-coins">
          <span class="coin-icon">🪙</span>
          <span>${campaign.coinsOffered} coins</span>
        </div>
        <div class="campaign-actions">
          ${showEarnBtn ? `
            <button class="btn btn--primary" onclick="startWatching(${campaign.id})">
              Watch & Earn
            </button>
          ` : ''}
          <a href="${campaign.channelUrl}" target="_blank" class="btn btn--outline">
            View Channel
          </a>
        </div>
      </div>
    </div>
  `).join('');
}

// Watch Video Modal
function startWatching(campaignId) {
  const campaign = campaigns.find(c => c.id === campaignId);
  if (!campaign) return;
  
  currentWatchingCampaign = campaign;
  watchSeconds = 0;
  
  document.getElementById('watchVideoTitle').textContent = campaign.title;
  document.getElementById('watchTimer').textContent = '0';
  document.getElementById('watchProgress').style.width = '0%';
  document.getElementById('startWatchBtn').style.display = 'block';
  document.getElementById('completeWatchBtn').style.display = 'none';
  
  document.getElementById('watchModal').classList.add('show');
}

document.getElementById('startWatchBtn').addEventListener('click', () => {
  document.getElementById('startWatchBtn').disabled = true;
  
  watchTimer = setInterval(() => {
    watchSeconds++;
    const progress = (watchSeconds / 60) * 100;
    
    document.getElementById('watchTimer').textContent = watchSeconds;
    document.getElementById('watchProgress').style.width = progress + '%';
    
    if (watchSeconds >= 60) {
      clearInterval(watchTimer);
      document.getElementById('startWatchBtn').style.display = 'none';
      document.getElementById('completeWatchBtn').style.display = 'block';
    }
  }, 1000);
});

document.getElementById('completeWatchBtn').addEventListener('click', () => {
  if (currentWatchingCampaign) {
    // Add coins to user
    updateUserCoins(currentUser.username, currentWatchingCampaign.coinsOffered);
    
    // Mark campaign as completed
    if (!currentUser.completedCampaigns) {
      currentUser.completedCampaigns = [];
    }
    currentUser.completedCampaigns.push(currentWatchingCampaign.id);
    
    // Update creator's coins
    const creator = users.find(u => u.username === currentWatchingCampaign.creatorUsername);
    if (creator) {
      creator.coins -= currentWatchingCampaign.coinsOffered;
    }
    
    showToast(`Earned ${currentWatchingCampaign.coinsOffered} coins!`, 'success');
    
    // Close modal
    document.getElementById('watchModal').classList.remove('show');
    
    // Reload earn page
    loadEarnPage();
    loadHomePage();
  }
});

document.getElementById('closeWatchModal').addEventListener('click', () => {
  if (watchTimer) {
    clearInterval(watchTimer);
  }
  document.getElementById('watchModal').classList.remove('show');
});

// Create Campaign
document.getElementById('createCampaignForm').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const channelUrl = document.getElementById('channelUrl').value;
  const videoUrl = document.getElementById('videoUrl').value;
  const title = document.getElementById('campaignTitle').value;
  const coinsOffered = parseInt(document.getElementById('coinsOffer').value);
  
  if (coinsOffered < 20) {
    showToast('Minimum 20 coins required', 'error');
    return;
  }
  
  if (currentUser.coins < coinsOffered) {
    showToast('Insufficient coins', 'error');
    return;
  }
  
  // Create campaign
  const newCampaign = {
    id: nextCampaignId++,
    creatorUsername: currentUser.username,
    channelUrl,
    videoUrl,
    title,
    coinsOffered,
    status: 'active',
    createdDate: new Date().toISOString().split('T')[0]
  };
  
  campaigns.push(newCampaign);
  
  // Deduct coins from user
  updateUserCoins(currentUser.username, -coinsOffered);
  
  showToast('Campaign created successfully!', 'success');
  document.getElementById('createCampaignForm').reset();
  
  // Navigate to dashboard
  navigateToPage('dashboard');
});

// Dashboard Page
function loadDashboardPage() {
  const stats = getUserStats();
  document.getElementById('dashCoins').textContent = stats.coins;
  document.getElementById('dashCampaigns').textContent = stats.campaigns;
  
  const userCampaigns = campaigns.filter(c => c.creatorUsername === currentUser.username);
  renderMyCampaigns(userCampaigns);
}

function renderMyCampaigns(campaignList) {
  const container = document.getElementById('myCampaignsList');
  
  if (campaignList.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <p>You haven't created any campaigns yet</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = campaignList.map(campaign => `
    <div class="campaign-card">
      <div class="campaign-thumbnail">📺</div>
      <div class="campaign-content">
        <div class="campaign-title">${campaign.title}</div>
        <div class="campaign-creator">Created on ${campaign.createdDate}</div>
        <div class="campaign-coins">
          <span class="coin-icon">🪙</span>
          <span>${campaign.coinsOffered} coins</span>
        </div>
        <div class="status-badge ${campaign.status}">${campaign.status}</div>
        <div class="campaign-actions" style="margin-top: 12px;">
          <button class="btn btn--outline" onclick="deleteCampaign(${campaign.id})">
            Delete
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function deleteCampaign(campaignId) {
  if (confirm('Are you sure you want to delete this campaign?')) {
    const campaignIndex = campaigns.findIndex(c => c.id === campaignId);
    if (campaignIndex !== -1) {
      const campaign = campaigns[campaignIndex];
      
      // Refund coins if it's the user's campaign
      if (campaign.creatorUsername === currentUser.username) {
        updateUserCoins(currentUser.username, campaign.coinsOffered);
      }
      
      campaigns.splice(campaignIndex, 1);
      showToast('Campaign deleted', 'success');
      loadDashboardPage();
    }
  }
}

// Admin Page
function loadAdminPage() {
  if (currentUser.role !== 'admin') return;
  
  // Update stats
  const totalUsers = users.filter(u => u.role === 'user').length;
  const totalCoins = users.reduce((sum, u) => sum + u.coins, 0);
  const totalCampaigns = campaigns.filter(c => c.status === 'active').length;
  
  document.getElementById('adminTotalUsers').textContent = totalUsers;
  document.getElementById('adminTotalCoins').textContent = totalCoins;
  document.getElementById('adminTotalCampaigns').textContent = totalCampaigns;
  
  // Render users table
  renderAdminUsers();
  renderAdminCampaigns();
}

function renderAdminUsers() {
  const tbody = document.getElementById('adminUsersBody');
  tbody.innerHTML = users.map(user => `
    <tr>
      <td>${user.username}</td>
      <td>${user.email}</td>
      <td>${user.coins}</td>
      <td><span class="status-badge ${user.role === 'admin' ? 'active' : ''}">${user.role}</span></td>
      <td>${user.joinDate}</td>
      <td>
        <div class="admin-actions">
          <button class="btn btn--sm btn--primary" onclick="openCoinModal('${user.username}')">
            Manage Coins
          </button>
          ${user.role !== 'admin' ? `
            <button class="btn btn--sm btn--outline" onclick="deleteUser('${user.username}')">
              Delete
            </button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

function renderAdminCampaigns() {
  const tbody = document.getElementById('adminCampaignsBody');
  tbody.innerHTML = campaigns.map(campaign => `
    <tr>
      <td>${campaign.id}</td>
      <td>${campaign.creatorUsername}</td>
      <td>${campaign.title}</td>
      <td>${campaign.coinsOffered}</td>
      <td><span class="status-badge ${campaign.status}">${campaign.status}</span></td>
      <td>${campaign.createdDate}</td>
      <td>
        <div class="admin-actions">
          <button class="btn btn--sm btn--outline" onclick="adminDeleteCampaign(${campaign.id})">
            Delete
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openCoinModal(username) {
  const user = users.find(u => u.username === username);
  if (!user) return;
  
  document.getElementById('adminCoinUsername').textContent = username;
  document.getElementById('adminCoinCurrent').textContent = user.coins;
  document.getElementById('adminCoinModal').dataset.username = username;
  document.getElementById('adminCoinModal').classList.add('show');
}

document.getElementById('closeAdminCoinModal').addEventListener('click', () => {
  document.getElementById('adminCoinModal').classList.remove('show');
});

document.getElementById('cancelAdminCoin').addEventListener('click', () => {
  document.getElementById('adminCoinModal').classList.remove('show');
});

document.getElementById('adminCoinForm').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const username = document.getElementById('adminCoinModal').dataset.username;
  const amount = parseInt(document.getElementById('adminCoinAmount').value);
  
  updateUserCoins(username, amount);
  
  document.getElementById('adminCoinModal').classList.remove('show');
  document.getElementById('adminCoinForm').reset();
  
  showToast('Coins updated successfully', 'success');
  loadAdminPage();
});

function deleteUser(username) {
  if (confirm(`Are you sure you want to delete user: ${username}?`)) {
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex !== -1) {
      users.splice(userIndex, 1);
      
      // Remove user's campaigns
      campaigns = campaigns.filter(c => c.creatorUsername !== username);
      
      showToast('User deleted', 'success');
      loadAdminPage();
    }
  }
}

function adminDeleteCampaign(campaignId) {
  if (confirm('Are you sure you want to delete this campaign?')) {
    const campaignIndex = campaigns.findIndex(c => c.id === campaignId);
    if (campaignIndex !== -1) {
      campaigns.splice(campaignIndex, 1);
      showToast('Campaign deleted', 'success');
      loadAdminPage();
    }
  }
}

// Initialize
if (currentUser) {
  loadHomePage();
}