// main.js

// --- Multi-User Login Logic ---
function getAllUsers() {
  return JSON.parse(localStorage.getItem('allUsers') || '[]');
}
function setAllUsers(users) {
  localStorage.setItem('allUsers', JSON.stringify(users));
}
function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser') || '{}');
}
function showUserLoginModal() {
  const modal = document.getElementById('user-login-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  const form = document.getElementById('user-login-form');
  form.onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('login-user-name').value.trim();
    const email = document.getElementById('login-user-email').value.trim().toLowerCase();
    const phone = document.getElementById('login-user-phone').value.trim();
    let users = getAllUsers();
    let user = users.find(u => u.email === email);
    if (!user) {
      user = {name, email, phone, id: 'U' + Math.random().toString(36).substr(2, 8)};
      users.push(user);
      setAllUsers(users);
    }
    setCurrentUser(user);
    modal.style.display = 'none';
    window.location.href = 'user.html';
  };
  const demoBtn = document.getElementById('demo-user-login-btn');
  if (demoBtn) {
    demoBtn.onclick = function() {
      let users = getAllUsers();
      const demoEmail = 'demo.user' + Math.floor(Math.random()*10000) + '@email.com';
      const user = {name: 'Demo User', email: demoEmail, phone: '+91-90000-00000', id: 'U' + Math.random().toString(36).substr(2, 8)};
      users.push(user);
      setAllUsers(users);
      setCurrentUser(user);
      modal.style.display = 'none';
      window.location.href = 'user.html';
    };
  }
}

// --- Multi-Venue Logic ---
function getAllVenues() {
  return JSON.parse(localStorage.getItem('allVenues') || '[]');
}
function setAllVenues(venues) {
  localStorage.setItem('allVenues', JSON.stringify(venues));
}
function setCurrentVenueId(id) {
  localStorage.setItem('currentVenueId', id);
}
function getCurrentVenueId() {
  return localStorage.getItem('currentVenueId') || '';
}
function openVenueLoginModal() {
  const modal = document.getElementById('venue-login-modal');
  const select = document.getElementById('venue-select');
  if (!modal || !select) return;
  const venues = getAllVenues();
  select.innerHTML = '';
  if (!venues.length) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'No venues yet';
    select.appendChild(opt);
  } else {
    venues.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.id;
      opt.textContent = v.name + (v.location ? ' - ' + v.location : '');
      select.appendChild(opt);
    });
  }
  modal.style.display = 'flex';
  const selectBtn = document.getElementById('select-venue-btn');
  if (selectBtn) {
    selectBtn.onclick = function() {
      const id = select.value;
      if (!id) return;
      setCurrentVenueId(id);
      modal.style.display = 'none';
      window.location.href = 'venue.html';
    };
  }
  const createForm = document.getElementById('venue-create-form');
  if (createForm) {
    createForm.onsubmit = function(e) {
      e.preventDefault();
      const name = document.getElementById('create-venue-name').value.trim();
      const location = document.getElementById('create-venue-location').value.trim();
      const desc = document.getElementById('create-venue-desc').value.trim();
      let venues = getAllVenues();
      const id = 'V' + Math.random().toString(36).substr(2, 8);
      const venue = {id, name, location, desc, photo: ''};
      venues.push(venue);
      setAllVenues(venues);
      setCurrentVenueId(id);
      modal.style.display = 'none';
      window.location.href = 'venue.html';
    };
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const loginMethods = document.querySelector('.login-methods');
  const backBtn = document.querySelector('.back-btn');
  let selectedType = null;

  // Clickable cards container
  const cards = document.querySelector('.cards');
  if (cards) {
    function handleType(type) {
      selectedType = type;
      if (type === 'artist') {
        if (loginMethods) loginMethods.style.display = 'block';
      } else if (type === 'venue') {
        openVenueLoginModal();
      } else if (type === 'user') {
        showUserLoginModal();
      }
    }
    cards.addEventListener('click', function(e) {
      const demoBtn = e.target.closest('.demo-card-btn');
      if (demoBtn) return; // handled separately
      const card = e.target.closest('[data-type]');
      if (!card) return;
      handleType(card.getAttribute('data-type'));
    });
    cards.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        const card = e.target.closest('[data-type]');
        if (!card) return;
        e.preventDefault();
        handleType(card.getAttribute('data-type'));
      }
    });
    // demo buttons within cards
    cards.querySelectorAll('.demo-card-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const demoType = btn.getAttribute('data-demo');
        if (demoType === 'artist') {
          localStorage.setItem('userType', 'artist');
          localStorage.setItem('loginMethod', 'demo');
          localStorage.setItem('userData', JSON.stringify({
            name: 'Demo Artist',
            bio: 'This is a demo artist profile.',
            links: ['https://open.spotify.com/demo', 'https://drive.google.com/demo'],
            photos: [], videos: [], past: 'Performed at Demo Fest 2023',
          }));
          window.location.href = 'artist.html';
        } else if (demoType === 'venue') {
          let venues = getAllVenues();
          const id = 'VDEMO' + Math.random().toString(36).substr(2, 5);
          const venue = {id, name: 'Demo Venue', location: '123 Demo St', desc: 'A cozy venue for live performances', photo: ''};
          venues.push(venue);
          setAllVenues(venues);
          setCurrentVenueId(id);
          window.location.href = 'venue.html';
        } else if (demoType === 'user') {
          let users = getAllUsers();
          const demoEmail = 'demo.user' + Math.floor(Math.random()*10000) + '@email.com';
          const user = {name: 'Demo User', email: demoEmail, phone: '+91-90000-00000', id: 'U' + Math.random().toString(36).substr(2, 8)};
          users.push(user);
          setAllUsers(users);
          setCurrentUser(user);
          window.location.href = 'user.html';
        }
      });
    });
  }

  // Retain buttons for flows in other places
  document.querySelectorAll('.user-type-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const type = btn.getAttribute('data-type');
      selectedType = type;
      if (type === 'artist') {
        if (loginMethods) loginMethods.style.display = 'block';
      } else if (type === 'venue') {
        openVenueLoginModal();
      } else if (type === 'user') {
        showUserLoginModal();
      }
    });
  });

  if (backBtn) {
    backBtn.addEventListener('click', function() {
      if (loginMethods) loginMethods.style.display = 'none';
      selectedType = null;
    });
  }

  if (loginMethods) {
    loginMethods.addEventListener('click', function(e) {
      if (e.target.classList.contains('login-btn')) {
        const method = e.target.getAttribute('data-method');
        if (!selectedType) return;
        localStorage.setItem('userType', selectedType);
        localStorage.setItem('loginMethod', method);
        if (selectedType === 'artist') {
          window.location.href = 'artist.html';
        }
      }
    });
  }

  // Demo login handlers (cards)
  const demoArtist = document.getElementById('demo-artist');
  if (demoArtist) demoArtist.addEventListener('click', function() {
    localStorage.setItem('userType', 'artist');
    localStorage.setItem('loginMethod', 'demo');
    localStorage.setItem('userData', JSON.stringify({
      name: 'Demo Artist',
      bio: 'This is a demo artist profile.',
      links: ['https://open.spotify.com/demo', 'https://drive.google.com/demo'],
      photos: [],
      videos: [],
      past: 'Performed at Demo Fest 2023',
    }));
    window.location.href = 'artist.html';
  });

  const demoVenue = document.getElementById('demo-venue');
  if (demoVenue) demoVenue.addEventListener('click', function() {
    let venues = getAllVenues();
    const id = 'VDEMO' + Math.random().toString(36).substr(2, 5);
    const venue = {id, name: 'Demo Venue', location: '123 Demo St', desc: 'A cozy venue for live performances', photo: ''};
    venues.push(venue);
    setAllVenues(venues);
    setCurrentVenueId(id);
    window.location.href = 'venue.html';
  });

  const demoUser = document.getElementById('demo-user');
  if (demoUser) demoUser.addEventListener('click', function() {
    let users = getAllUsers();
    const demoEmail = 'demo.user' + Math.floor(Math.random()*10000) + '@email.com';
    const user = {name: 'Demo User', email: demoEmail, phone: '+91-90000-00000', id: 'U' + Math.random().toString(36).substr(2, 8)};
    users.push(user);
    setAllUsers(users);
    setCurrentUser(user);
    window.location.href = 'user.html';
  });
}); 