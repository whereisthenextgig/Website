// venue.js

// --- Venue Profile & Calendar Logic ---
const VENUE_PROFILE_KEY = 'venueProfile';
const VENUE_DATES_KEY = 'venueDates';
const VENUE_APPLICATIONS_KEY = 'venueApplications';

// --- Multi-venue helpers ---
function getCurrentVenueId() { return localStorage.getItem('currentVenueId') || ''; }
function getAllVenues() { return JSON.parse(localStorage.getItem('allVenues') || '[]'); }
function setAllVenues(v) { localStorage.setItem('allVenues', JSON.stringify(v)); }
function saveVenueProfileFor(id, profile) {
  let venues = getAllVenues();
  const idx = venues.findIndex(v => v.id === id);
  if (idx >= 0) { venues[idx] = {...venues[idx], ...profile}; } else { venues.push({...profile, id}); }
  setAllVenues(venues);
}
function getVenueProfileFor(id) {
  const v = getAllVenues().find(x => x.id === id);
  return v || {};
}
function keyForDates(id) { return `venue:${id}:dates`; }
function keyForApps(id) { return `venue:${id}:applications`; }
function getVenueDatesFor(id) { return JSON.parse(localStorage.getItem(keyForDates(id)) || '[]'); }
function setVenueDatesFor(id, dates) { localStorage.setItem(keyForDates(id), JSON.stringify(dates)); }
function getVenueAppsFor(id) { return JSON.parse(localStorage.getItem(keyForApps(id)) || '{}'); }
function setVenueAppsFor(id, apps) { localStorage.setItem(keyForApps(id), JSON.stringify(apps)); }

// Migration from old single-venue keys
(function migrateIfNeeded(){
  const legacyDates = localStorage.getItem('venueDates');
  const legacyApps = localStorage.getItem('venueApplications');
  const legacyProfile = localStorage.getItem('venueProfile');
  const currentId = getCurrentVenueId();
  if (currentId && (legacyDates || legacyApps || legacyProfile)) {
    if (legacyDates) { setVenueDatesFor(currentId, JSON.parse(legacyDates)); localStorage.removeItem('venueDates'); }
    if (legacyApps) { setVenueAppsFor(currentId, JSON.parse(legacyApps)); localStorage.removeItem('venueApplications'); }
    if (legacyProfile) {
      const p = JSON.parse(legacyProfile);
      saveVenueProfileFor(currentId, p);
      localStorage.removeItem('venueProfile');
    }
  }
})();

function renderVenueProfileForm() {
  const id = getCurrentVenueId();
  const data = getVenueProfileFor(id);
  document.getElementById('venue-name').value = data.name || '';
  document.getElementById('venue-location').value = data.location || '';
  document.getElementById('venue-desc').value = data.desc || '';
  const photoPreview = document.getElementById('venue-photo-preview');
  photoPreview.innerHTML = data.photo ? `<img src="${data.photo}" alt="Venue Photo">` : '';
}

// --- Artists Tab Logic ---
function renderVenueArtistList() {
  const allArtists = JSON.parse(localStorage.getItem('allArtists') || '[]');
  const searchVal = document.getElementById('venue-artist-search-input').value.trim().toLowerCase();
  const filtered = allArtists.filter(a => a.name.toLowerCase().includes(searchVal));
  const listDiv = document.getElementById('venue-artist-list');
  listDiv.innerHTML = '';
  filtered.forEach(artist => {
    const card = document.createElement('div');
    card.className = 'artist-card';
    card.innerHTML = `
      <img src="${artist.profilePhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(artist.name)}" alt="Profile">
      <div class="artist-name">${artist.name}</div>
      <div class="artist-bio">${artist.bio || ''}</div>
      <button class="view-profile-btn"><i class="fa-solid fa-eye"></i> View Profile</button>
    `;
    card.querySelector('.view-profile-btn').onclick = function() {
      showVenueArtistModal(artist);
    };
    listDiv.appendChild(card);
  });
}
function showVenueArtistModal(artist) {
  let modal = document.createElement('div');
  modal.className = 'venue-artist-modal';
  modal.innerHTML = `
    <div class="venue-artist-modal-content">
      <button class="close-modal-btn"><i class="fa-solid fa-xmark"></i></button>
      <h4>${artist.name}</h4>
      <div class="artist-bio">${artist.bio || ''}</div>
      <div><strong>Past Events:</strong> ${artist.past || '-'}</div>
      <div class="artist-links"><strong>Links:</strong>
        ${(artist.links && artist.links.length) ? artist.links.map(l => `<a href="${l}" target="_blank">${l}</a>`).join('<br>') : '<span style="color:#888;">None</span>'}
      </div>
      <div class="artist-gallery"><strong>Gallery:</strong>
        ${(artist.photos && artist.photos.length) ? artist.photos.map(img => `<img src="${img}" alt="Gallery">`).join('') : '<span style="color:#888;">None</span>'}
      </div>
      <div class="artist-videos"><strong>Videos:</strong>
        ${(artist.videos && artist.videos.length) ? artist.videos.map(l => `<a href="${l}" target="_blank">${l}</a>`).join('<br>') : '<span style="color:#888;">None</span>'}
      </div>
    </div>
  `;
  modal.querySelector('.close-modal-btn').onclick = function() {
    modal.remove();
  };
  modal.onclick = function(e) {
    if (e.target === modal) modal.remove();
  };
  document.body.appendChild(modal);
}

// --- Events Tab Logic ---
function renderVenueEvents() {
  const dates = JSON.parse(localStorage.getItem('venueDates') || '[]');
  const apps = JSON.parse(localStorage.getItem('venueApplications') || '{}');
  const allArtists = JSON.parse(localStorage.getItem('allArtists') || '[]');
  const now = new Date();
  const events = dates.filter(d => d.closed);
  const listDiv = document.getElementById('venue-events-list');
  listDiv.innerHTML = '';
  events.forEach(dateObj => {
    const appList = (apps[dateObj.date] || []);
    const selected = appList.find(a => a.status === 'selected');
    if (!selected) return;
    const artist = allArtists.find(a => (a.id || a.name) === selected.artistId);
    if (!artist) return;
    const eventDate = new Date(dateObj.date);
    const isPast = eventDate < now.setHours(0,0,0,0);
    const card = document.createElement('div');
    card.className = 'venue-event-card';
    card.innerHTML = `
      <div class="venue-event-header">
        <span><i class="fa-solid fa-calendar-days"></i> ${dateObj.date}</span>
        <span class="venue-event-status${isPast ? ' past' : ''}">${isPast ? 'Past' : 'Upcoming'}</span>
      </div>
      <div class="venue-event-artist">
        <img src="${artist.profilePhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(artist.name)}" alt="Profile">
        <div>
          <div class="artist-name">${artist.name}</div>
          <div class="artist-bio">${artist.bio || ''}</div>
        </div>
      </div>
    `;
    listDiv.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  // sidebar tab wiring
  const sideLinks = document.querySelectorAll('.sidebar .sidebar-link');
  const sections = document.querySelectorAll('.dashboard-section');
  sideLinks.forEach(link => {
    link.addEventListener('click', function() {
      const section = link.getAttribute('data-section');
      sections.forEach(sec => {
        sec.style.display = sec.id === section + '-section' ? 'block' : 'none';
      });
      sideLinks.forEach(l => l.setAttribute('aria-current', l === link ? 'true' : 'false'));
    });
  });

  const navBtns = document.querySelectorAll('nav button[data-section]');
  const logoutBtn = document.getElementById('logout');

  navBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const section = btn.getAttribute('data-section');
      sections.forEach(sec => {
        sec.style.display = sec.id === section + '-section' ? 'block' : 'none';
      });
      navBtns.forEach(b => b.setAttribute('aria-current', b === btn ? 'true' : 'false'));
    });
  });

  logoutBtn.addEventListener('click', function() {
    localStorage.clear();
    window.location.href = 'index.html';
  });

  const currentId = getCurrentVenueId();
  if (!currentId) {
    // No venue selected, redirect to index for selection
    window.location.href = 'index.html';
    return;
  }
  const switchBtn = document.getElementById('switch-venue');
  if (switchBtn) {
    switchBtn.onclick = function() {
      // Clear current and open venue selection on index
      localStorage.removeItem('currentVenueId');
      window.location.href = 'index.html';
    };
  }

  renderVenueProfileForm();
  document.getElementById('venue-profile-form').onsubmit = function(e) {
    e.preventDefault();
    const id = getCurrentVenueId();
    const data = getVenueProfileFor(id);
    const updated = {
      ...data,
      name: document.getElementById('venue-name').value.trim(),
      location: document.getElementById('venue-location').value.trim(),
      desc: document.getElementById('venue-desc').value.trim(),
    };
    saveVenueProfileFor(id, updated);
    document.getElementById('venue-profile-save-status').textContent = 'Profile saved!';
    setTimeout(() => {
      document.getElementById('venue-profile-save-status').textContent = '';
    }, 2000);
  };
  document.getElementById('venue-photo').onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        const id = getCurrentVenueId();
        const data = getVenueProfileFor(id);
        saveVenueProfileFor(id, {...data, photo: evt.target.result});
        renderVenueProfileForm();
      };
      reader.readAsDataURL(file);
    }
  };
  // Calendar logic per venue
  function renderVenueDates() {
    const id = getCurrentVenueId();
    const dates = getVenueDatesFor(id);
    const apps = getVenueAppsFor(id);
    const allArtists = JSON.parse(localStorage.getItem('allArtists') || '[]');
    const listDiv = document.getElementById('venue-dates-list');
    listDiv.innerHTML = '';
    dates.forEach(dateObj => {
      const card = document.createElement('div');
      card.className = 'venue-date-card';
      const isClosed = !!dateObj.closed;
      card.innerHTML = `
        <div class="venue-date-header">
          <span><i class="fa-solid fa-calendar-days"></i> ${dateObj.date}</span>
          <span class="date-status${isClosed ? ' closed' : ''}">${isClosed ? 'Closed' : 'Open'}</span>
          <button type="button" class="remove-date-btn"><i class="fa-solid fa-trash"></i></button>
        </div>
        <div class="venue-applications-list"></div>
      `;
      card.querySelector('.remove-date-btn').onclick = function() {
        let dates = getVenueDatesFor(id);
        dates = dates.filter(d => d.date !== dateObj.date);
        setVenueDatesFor(id, dates);
        renderVenueDates();
      };
      const appsList = card.querySelector('.venue-applications-list');
      const appList = (apps[dateObj.date] || []);
      if (!isClosed) {
        if (appList.length) {
          appList.forEach(app => {
            const artist = allArtists.find(a => (a.id || a.name) === app.artistId);
            if (!artist) return;
            const appCard = document.createElement('div');
            appCard.className = 'venue-applicant-card';
            appCard.innerHTML = `
              <img src="${artist.profilePhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(artist.name)}" alt="Profile">
              <span class="artist-name">${artist.name}</span>
              <span style="color:#888;font-size:0.92rem;">${app.status === 'selected' ? 'Selected' : 'Applied'}</span>
            `;
            if (app.status !== 'selected') {
              const selectBtn = document.createElement('button');
              selectBtn.textContent = 'Select';
              selectBtn.onclick = function() {
                const appsObj = getVenueAppsFor(id);
                appsObj[dateObj.date] = appsObj[dateObj.date].map(a => ({...a, status: a.artistId === app.artistId ? 'selected' : 'applied'}));
                setVenueAppsFor(id, appsObj);
                let dates = getVenueDatesFor(id);
                dates = dates.map(d => d.date === dateObj.date ? {...d, closed: true} : d);
                setVenueDatesFor(id, dates);
                renderVenueDates();
              };
              appCard.appendChild(selectBtn);
            }
            appsList.appendChild(appCard);
          });
        } else {
          appsList.innerHTML = '<span style="color:#888;">No applications yet.</span>';
        }
      } else {
        const selected = appList.find(a => a.status === 'selected');
        if (selected) {
          const artist = allArtists.find(a => (a.id || a.name) === selected.artistId);
          if (artist) {
            const appCard = document.createElement('div');
            appCard.className = 'venue-applicant-card';
            appCard.innerHTML = `
              <img src="${artist.profilePhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(artist.name)}" alt="Profile">
              <span class="artist-name">${artist.name}</span>
              <span style="color:#059669;font-size:0.92rem;">Selected</span>
            `;
            appsList.appendChild(appCard);
          }
        } else {
          appsList.innerHTML = '<span style="color:#888;">No artist selected.</span>';
        }
      }
      listDiv.appendChild(card);
    });
  }
  renderVenueDates();
  document.getElementById('add-date-form').onsubmit = function(e) {
    e.preventDefault();
    const id = getCurrentVenueId();
    const date = document.getElementById('venue-date-input').value;
    if (!date) return;
    let dates = getVenueDatesFor(id);
    if (!dates.find(d => d.date === date)) {
      dates.push({date});
      setVenueDatesFor(id, dates);
      renderVenueDates();
    }
    document.getElementById('venue-date-input').value = '';
  };
  if (document.getElementById('venue-artist-search-input')) {
    renderVenueArtistList();
    document.getElementById('venue-artist-search-input').oninput = renderVenueArtistList;
  }
  if (document.getElementById('venue-events-list')) {
    renderVenueEvents();
  }
}); 