// artist.js

function getProfileData() {
  return JSON.parse(localStorage.getItem('userData') || '{}');
}
function setProfileData(data) {
  localStorage.setItem('userData', JSON.stringify(data));
}
function renderProfileForm() {
  const data = getProfileData();
  document.getElementById('artist-name').value = data.name || '';
  document.getElementById('artist-bio').value = data.bio || '';
  document.getElementById('artist-past').value = data.past || '';
  // Profile photo
  const photoPreview = document.getElementById('profile-photo-preview');
  photoPreview.innerHTML = data.profilePhoto ? `<img src="${data.profilePhoto}" alt="Profile Photo">` : '';
  // Links
  const linksList = document.getElementById('artist-links-list');
  linksList.innerHTML = '';
  (data.links || []).forEach((link, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${link}" target="_blank">${link}</a> <button type="button" data-index="${i}" title="Remove"><i class="fa-solid fa-xmark"></i></button>`;
    linksList.appendChild(li);
  });
  // Gallery photos
  const photosPreview = document.getElementById('artist-photos-preview');
  photosPreview.innerHTML = '';
  (data.photos || []).forEach((img, i) => {
    const el = document.createElement('div');
    el.innerHTML = `<img src="${img}" alt="Gallery Photo"><button type="button" data-index="${i}" title="Remove"><i class="fa-solid fa-xmark"></i></button>`;
    el.style.position = 'relative';
    el.querySelector('button').style.position = 'absolute';
    el.querySelector('button').style.top = '2px';
    el.querySelector('button').style.right = '2px';
    el.querySelector('button').style.background = 'rgba(255,255,255,0.7)';
    el.querySelector('button').style.borderRadius = '50%';
    el.querySelector('button').style.border = 'none';
    el.querySelector('button').style.cursor = 'pointer';
    photosPreview.appendChild(el);
  });
  // Videos
  const videosList = document.getElementById('artist-videos-list');
  videosList.innerHTML = '';
  (data.videos || []).forEach((link, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${link}" target="_blank">${link}</a> <button type="button" data-index="${i}" title="Remove"><i class="fa-solid fa-xmark"></i></button>`;
    videosList.appendChild(li);
  });
}

// --- Collaboration & Chat Logic ---
const ARTIST_DB_KEY = 'allArtists';
const COLLAB_DB_KEY = 'collabRequests';
const CHAT_DB_KEY = 'artistChats';

function getCurrentArtist() {
  return JSON.parse(localStorage.getItem('userData') || '{}');
}
function getAllArtists() {
  // Demo: if not present, seed with demo artists
  let artists = JSON.parse(localStorage.getItem(ARTIST_DB_KEY) || '[]');
  if (!artists.length) {
    artists = [
      {id: 'demo1', name: 'Demo Artist', bio: 'This is a demo artist profile.', profilePhoto: '', links: [], photos: [], videos: [], past: 'Performed at Demo Fest 2023'},
      {id: 'demo2', name: 'Alice Wonder', bio: 'Indie singer-songwriter.', profilePhoto: '', links: [], photos: [], videos: [], past: 'Opened for The Big Band'},
      {id: 'demo3', name: 'Bob Groove', bio: 'Jazz saxophonist.', profilePhoto: '', links: [], photos: [], videos: [], past: 'Played at Jazz Nights'},
      {id: 'demo4', name: 'Clara Beats', bio: 'Electronic music producer.', profilePhoto: '', links: [], photos: [], videos: [], past: 'Headlined at Electro Fest'}
    ];
    localStorage.setItem(ARTIST_DB_KEY, JSON.stringify(artists));
  }
  return artists;
}
function saveAllArtists(artists) {
  localStorage.setItem(ARTIST_DB_KEY, JSON.stringify(artists));
}
function getCollabRequests() {
  return JSON.parse(localStorage.getItem(COLLAB_DB_KEY) || '[]');
}
function saveCollabRequests(reqs) {
  localStorage.setItem(COLLAB_DB_KEY, JSON.stringify(reqs));
}
function getArtistChats() {
  return JSON.parse(localStorage.getItem(CHAT_DB_KEY) || '[]');
}
function saveArtistChats(chats) {
  localStorage.setItem(CHAT_DB_KEY, JSON.stringify(chats));
}
function getArtistId(artist) {
  // Use name as ID for demo, but in real app use a unique ID
  return artist.id || artist.name;
}
function renderArtistSearch() {
  const me = getCurrentArtist();
  const all = getAllArtists().filter(a => getArtistId(a) !== getArtistId(me));
  const searchVal = document.getElementById('artist-search-input').value.trim().toLowerCase();
  const filtered = all.filter(a => a.name.toLowerCase().includes(searchVal));
  const reqs = getCollabRequests();
  const myId = getArtistId(me);
  const outgoing = reqs.filter(r => r.from === myId);
  const incoming = reqs.filter(r => r.to === myId);
  const resultsDiv = document.getElementById('artist-search-results');
  resultsDiv.innerHTML = '';
  filtered.forEach(artist => {
    const card = document.createElement('div');
    card.className = 'artist-card';
    card.innerHTML = `
      <img src="${artist.profilePhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(artist.name)}" alt="Profile">
      <div class="artist-name">${artist.name}</div>
      <div class="artist-bio">${artist.bio || ''}</div>
    `;
    // Collab button logic
    const alreadySent = outgoing.find(r => r.to === getArtistId(artist));
    const alreadyReceived = incoming.find(r => r.from === getArtistId(artist));
    const alreadyCollab = reqs.find(r => ((r.from === myId && r.to === getArtistId(artist)) || (r.to === myId && r.from === getArtistId(artist))) && r.status === 'accepted');
    let btn = document.createElement('button');
    if (alreadyCollab) {
      btn.textContent = 'Collaborating';
      btn.disabled = true;
    } else if (alreadySent) {
      btn.textContent = 'Request Sent';
      btn.disabled = true;
    } else if (alreadyReceived) {
      btn.textContent = 'Requested You';
      btn.disabled = true;
    } else {
      btn.textContent = 'Send Collab Request';
      btn.onclick = function() {
        const reqs = getCollabRequests();
        reqs.push({from: myId, to: getArtistId(artist), status: 'pending'});
        saveCollabRequests(reqs);
        renderArtistSearch();
        renderCollabRequests();
      };
    }
    card.appendChild(btn);
    resultsDiv.appendChild(card);
  });
}
function renderCollabRequests() {
  const me = getCurrentArtist();
  const myId = getArtistId(me);
  const reqs = getCollabRequests();
  const all = getAllArtists();
  // Incoming
  const incomingDiv = document.getElementById('incoming-collab-requests');
  incomingDiv.innerHTML = '';
  reqs.filter(r => r.to === myId && r.status === 'pending').forEach(r => {
    const artist = all.find(a => getArtistId(a) === r.from);
    if (!artist) return;
    const card = document.createElement('div');
    card.className = 'collab-request-card';
    card.innerHTML = `
      <img src="${artist.profilePhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(artist.name)}" alt="Profile">
      <span class="artist-name">${artist.name}</span>
    `;
    let acceptBtn = document.createElement('button');
    acceptBtn.textContent = 'Accept';
    acceptBtn.onclick = function() {
      const reqs = getCollabRequests();
      const req = reqs.find(x => x.from === r.from && x.to === r.to && x.status === 'pending');
      if (req) req.status = 'accepted';
      saveCollabRequests(reqs);
      renderCollabRequests();
      renderArtistSearch();
      renderChatList();
    };
    let declineBtn = document.createElement('button');
    declineBtn.textContent = 'Decline';
    declineBtn.onclick = function() {
      let reqs = getCollabRequests();
      reqs = reqs.filter(x => !(x.from === r.from && x.to === r.to && x.status === 'pending'));
      saveCollabRequests(reqs);
      renderCollabRequests();
      renderArtistSearch();
    };
    card.appendChild(acceptBtn);
    card.appendChild(declineBtn);
    incomingDiv.appendChild(card);
  });
  // Outgoing
  const outgoingDiv = document.getElementById('outgoing-collab-requests');
  outgoingDiv.innerHTML = '';
  reqs.filter(r => r.from === myId).forEach(r => {
    const artist = all.find(a => getArtistId(a) === r.to);
    if (!artist) return;
    const card = document.createElement('div');
    card.className = 'collab-request-card';
    card.innerHTML = `
      <img src="${artist.profilePhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(artist.name)}" alt="Profile">
      <span class="artist-name">${artist.name}</span>
      <span style="color:#888;font-size:0.92rem;">${r.status === 'pending' ? 'Pending' : r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span>
    `;
    outgoingDiv.appendChild(card);
  });
}
function renderChatList() {
  const me = getCurrentArtist();
  const myId = getArtistId(me);
  const reqs = getCollabRequests();
  const all = getAllArtists();
  const accepted = reqs.filter(r => (r.from === myId || r.to === myId) && r.status === 'accepted');
  const collabIds = accepted.map(r => r.from === myId ? r.to : r.from);
  const collabArtists = all.filter(a => collabIds.includes(getArtistId(a)));
  const chatListDiv = document.getElementById('collab-chat-list');
  chatListDiv.innerHTML = '';
  collabArtists.forEach(artist => {
    const card = document.createElement('div');
    card.className = 'collab-chat-card';
    card.innerHTML = `
      <img src="${artist.profilePhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(artist.name)}" alt="Profile">
      <span class="artist-name">${artist.name}</span>
    `;
    card.onclick = function() {
      openChatWith(artist);
    };
    chatListDiv.appendChild(card);
  });
}
let currentChatWith = null;
function openChatWith(artist) {
  currentChatWith = artist;
  document.getElementById('chat-window-area').style.display = 'flex';
  document.getElementById('chat-with-header').textContent = 'Chat with ' + artist.name;
  renderChatMessages();
}
function renderChatMessages() {
  const me = getCurrentArtist();
  const myId = getArtistId(me);
  const otherId = getArtistId(currentChatWith);
  const chats = getArtistChats();
  let chat = chats.find(c => (c.a1 === myId && c.a2 === otherId) || (c.a2 === myId && c.a1 === otherId));
  const chatDiv = document.getElementById('chat-messages');
  chatDiv.innerHTML = '';
  if (chat && chat.messages.length) {
    chat.messages.forEach(msg => {
      const msgDiv = document.createElement('div');
      msgDiv.className = 'chat-message' + (msg.from === myId ? ' me' : '');
      msgDiv.innerHTML = `<div class="msg">${msg.text}</div><div class="msg-time">${new Date(msg.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>`;
      chatDiv.appendChild(msgDiv);
    });
    chatDiv.scrollTop = chatDiv.scrollHeight;
  }
}
document.getElementById('chat-form').onsubmit = function(e) {
  e.preventDefault();
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text || !currentChatWith) return;
  const me = getCurrentArtist();
  const myId = getArtistId(me);
  const otherId = getArtistId(currentChatWith);
  let chats = getArtistChats();
  let chat = chats.find(c => (c.a1 === myId && c.a2 === otherId) || (c.a2 === myId && c.a1 === otherId));
  if (!chat) {
    chat = {a1: myId, a2: otherId, messages: []};
    chats.push(chat);
  }
  chat.messages.push({from: myId, text, time: Date.now()});
  saveArtistChats(chats);
  input.value = '';
  renderChatMessages();
};

// --- Venues Tab Logic ---
function renderArtistVenues() {
  // For demo, only one venue (from venueProfile)
  const venues = [];
  const venueProfile = JSON.parse(localStorage.getItem('venueProfile') || '{}');
  if (venueProfile.name) venues.push(venueProfile);
  // Add more venues here if multi-venue support is needed
  const venueDates = JSON.parse(localStorage.getItem('venueDates') || '[]');
  const venueApps = JSON.parse(localStorage.getItem('venueApplications') || '{}');
  const me = getCurrentArtist();
  const myId = getArtistId(me);
  const listDiv = document.getElementById('artist-venues-list');
  listDiv.innerHTML = '';
  venues.forEach(venue => {
    const card = document.createElement('div');
    card.className = 'artist-venue-card';
    card.innerHTML = `
      <div class="artist-venue-header">
        <img src="${venue.photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(venue.name)}" alt="Venue">
        <div>
          <div class="venue-name">${venue.name}</div>
          <div class="venue-location">${venue.location || ''}</div>
        </div>
      </div>
      <div>${venue.desc || ''}</div>
      <div class="artist-venue-dates"></div>
    `;
    const datesDiv = card.querySelector('.artist-venue-dates');
    venueDates.forEach(dateObj => {
      if (dateObj.closed) return; // Only open dates
      const dateCard = document.createElement('div');
      dateCard.className = 'artist-venue-date-card';
      dateCard.innerHTML = `<span><i class="fa-solid fa-calendar-days"></i> ${dateObj.date}</span>`;
      // Check if already applied
      const apps = venueApps[dateObj.date] || [];
      const myApp = apps.find(a => a.artistId === myId);
      if (myApp) {
        let status = 'Pending';
        let statusClass = '';
        if (myApp.status === 'selected') { status = 'Selected'; statusClass = 'selected'; }
        else if (myApp.status === 'applied') { status = 'Pending'; }
        else { status = 'Not Selected'; statusClass = 'not-selected'; }
        dateCard.innerHTML += `<span class="artist-venue-date-status ${statusClass}">${status}</span>`;
      } else {
        const applyBtn = document.createElement('button');
        applyBtn.className = 'artist-venue-date-btn';
        applyBtn.textContent = 'Apply';
        applyBtn.onclick = function() {
          const venueApps = JSON.parse(localStorage.getItem('venueApplications') || '{}');
          venueApps[dateObj.date] = venueApps[dateObj.date] || [];
          venueApps[dateObj.date].push({artistId: myId, status: 'applied'});
          localStorage.setItem('venueApplications', JSON.stringify(venueApps));
          renderArtistVenues();
        };
        dateCard.appendChild(applyBtn);
      }
      datesDiv.appendChild(dateCard);
    });
    listDiv.appendChild(card);
  });
}

// Sidebar tab wiring
function initSidebarTabs() {
  const links = document.querySelectorAll('.sidebar .sidebar-link');
  const sections = document.querySelectorAll('.dashboard-section');
  links.forEach(link => {
    link.addEventListener('click', function() {
      const section = link.getAttribute('data-section');
      sections.forEach(sec => {
        sec.style.display = sec.id === section + '-section' ? 'block' : 'none';
      });
      links.forEach(l => l.setAttribute('aria-current', l === link ? 'true' : 'false'));
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  initSidebarTabs();

  const logoutBtn = document.getElementById('logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      localStorage.clear();
      window.location.href = 'index.html';
    });
  }

  renderProfileForm();
  // Add link
  document.getElementById('add-link-btn').onclick = function() {
    const input = document.getElementById('artist-link-input');
    const val = input.value.trim();
    if (val) {
      const data = getProfileData();
      data.links = data.links || [];
      data.links.push(val);
      setProfileData(data);
      input.value = '';
      renderProfileForm();
    }
  };
  // Remove link
  document.getElementById('artist-links-list').onclick = function(e) {
    if (e.target.closest('button')) {
      const idx = e.target.closest('button').dataset.index;
      const data = getProfileData();
      data.links.splice(idx, 1);
      setProfileData(data);
      renderProfileForm();
    }
  };
  // Add video
  document.getElementById('add-video-btn').onclick = function() {
    const input = document.getElementById('artist-video-input');
    const val = input.value.trim();
    if (val) {
      const data = getProfileData();
      data.videos = data.videos || [];
      data.videos.push(val);
      setProfileData(data);
      input.value = '';
      renderProfileForm();
    }
  };
  // Remove video
  document.getElementById('artist-videos-list').onclick = function(e) {
    if (e.target.closest('button')) {
      const idx = e.target.closest('button').dataset.index;
      const data = getProfileData();
      data.videos.splice(idx, 1);
      setProfileData(data);
      renderProfileForm();
    }
  };
  // Profile photo upload
  document.getElementById('profile-photo').onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        const data = getProfileData();
        data.profilePhoto = evt.target.result;
        setProfileData(data);
        renderProfileForm();
      };
      reader.readAsDataURL(file);
    }
  };
  // Gallery photos upload
  document.getElementById('artist-photos').onchange = function(e) {
    const files = Array.from(e.target.files);
    if (files.length) {
      const data = getProfileData();
      data.photos = data.photos || [];
      let loaded = 0;
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(evt) {
          data.photos.push(evt.target.result);
          loaded++;
          if (loaded === files.length) {
            setProfileData(data);
            renderProfileForm();
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };
  // Remove gallery photo
  document.getElementById('artist-photos-preview').onclick = function(e) {
    if (e.target.closest('button')) {
      const idx = e.target.closest('button').dataset.index;
      const data = getProfileData();
      data.photos.splice(idx, 1);
      setProfileData(data);
      renderProfileForm();
    }
  };
  // Save profile
  document.getElementById('artist-profile-form').onsubmit = function(e) {
    e.preventDefault();
    const data = getProfileData();
    data.name = document.getElementById('artist-name').value.trim();
    data.bio = document.getElementById('artist-bio').value.trim();
    data.past = document.getElementById('artist-past').value.trim();
    setProfileData(data);
    document.getElementById('profile-save-status').textContent = 'Profile saved!';
    setTimeout(() => {
      document.getElementById('profile-save-status').textContent = '';
    }, 2000);
  };
  document.getElementById('artist-search-input').oninput = renderArtistSearch;
  // On tab switch, rerender
  const collabNavBtn = document.querySelector('nav button[data-section="collab"]');
  if (collabNavBtn) collabNavBtn.addEventListener('click', function() {
    renderArtistSearch();
    renderCollabRequests();
  });
  const chatNavBtn = document.querySelector('nav button[data-section="chat"]');
  if (chatNavBtn) chatNavBtn.addEventListener('click', function() {
    renderChatList();
    document.getElementById('chat-window-area').style.display = 'none';
  });
  if (document.getElementById('artist-venues-list')) {
    renderArtistVenues();
  }
}); 