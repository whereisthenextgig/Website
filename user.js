// user.js

// --- Multi-User Dashboard Logic ---
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser') || '{}');
}
function getUserBookings() {
  const currentUser = getCurrentUser();
  const allBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
  return allBookings.filter(b => b.userId === currentUser.id);
}
function setUserBookings(bookings) {
  const currentUser = getCurrentUser();
  let allBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
  // Remove this user's old bookings
  allBookings = allBookings.filter(b => b.userId !== currentUser.id);
  // Add new ones
  allBookings = allBookings.concat(bookings.map(b => ({...b, userId: currentUser.id})));
  localStorage.setItem('userBookings', JSON.stringify(allBookings));
}
function renderUserEvents() {
  const dates = JSON.parse(localStorage.getItem('venueDates') || '[]');
  const apps = JSON.parse(localStorage.getItem('venueApplications') || '{}');
  const allArtists = JSON.parse(localStorage.getItem('allArtists') || '[]');
  const venue = JSON.parse(localStorage.getItem('venueProfile') || '{}');
  const now = new Date();
  const events = dates.filter(d => d.closed);
  const bookings = getUserBookings();
  const listDiv = document.getElementById('user-events-list');
  listDiv.innerHTML = '';
  events.forEach(dateObj => {
    const appList = (apps[dateObj.date] || []);
    const selected = appList.find(a => a.status === 'selected');
    if (!selected) return;
    const artist = allArtists.find(a => (a.id || a.name) === selected.artistId);
    if (!artist) return;
    const eventDate = new Date(dateObj.date);
    const isPast = eventDate < now.setHours(0,0,0,0);
    const isBooked = bookings.find(b => b.date === dateObj.date);
    const card = document.createElement('div');
    card.className = 'user-event-card';
    card.innerHTML = `
      <div class="user-event-header">
        <span><i class="fa-solid fa-calendar-days"></i> ${dateObj.date}</span>
        <span class="user-event-status${isPast ? ' past' : ''}">${isPast ? 'Past' : 'Upcoming'}</span>
      </div>
      <div class="user-event-venue">
        <img src="${venue.photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(venue.name)}" alt="Venue">
        <div>
          <div class="venue-name">${venue.name}</div>
          <div class="venue-location">${venue.location || ''}</div>
        </div>
      </div>
      <div class="user-event-artist">
        <img src="${artist.profilePhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(artist.name)}" alt="Artist">
        <div>
          <div class="artist-name">${artist.name}</div>
          <div class="artist-bio">${artist.bio || ''}</div>
        </div>
      </div>
    `;
    if (!isPast) {
      if (isBooked) {
        card.innerHTML += `<div class="user-event-status selected">Booked</div>`;
      } else {
        const bookBtn = document.createElement('button');
        bookBtn.className = 'user-event-book-btn';
        bookBtn.textContent = 'Book Ticket';
        bookBtn.onclick = function() {
          const bookings = getUserBookings();
          bookings.push({date: dateObj.date, artistId: artist.id || artist.name, venueName: venue.name});
          setUserBookings(bookings);
          renderUserEvents();
          renderUserBookings();
        };
        card.appendChild(bookBtn);
      }
    }
    listDiv.appendChild(card);
  });
}
function renderUserVenues() {
  const venue = JSON.parse(localStorage.getItem('venueProfile') || '{}');
  const dates = JSON.parse(localStorage.getItem('venueDates') || '[]');
  const apps = JSON.parse(localStorage.getItem('venueApplications') || '{}');
  const allArtists = JSON.parse(localStorage.getItem('allArtists') || '[]');
  const now = new Date();
  const listDiv = document.getElementById('user-venues-list');
  listDiv.innerHTML = '';
  if (!venue.name) return;
  const card = document.createElement('div');
  card.className = 'user-venue-card';
  card.innerHTML = `
    <div class="user-venue-header">
      <img src="${venue.photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(venue.name)}" alt="Venue">
      <div>
        <div class="venue-name">${venue.name}</div>
        <div class="venue-location">${venue.location || ''}</div>
      </div>
    </div>
    <div>${venue.desc || ''}</div>
    <div class="user-venue-events"></div>
  `;
  const eventsDiv = card.querySelector('.user-venue-events');
  dates.filter(d => d.closed).forEach(dateObj => {
    const appList = (apps[dateObj.date] || []);
    const selected = appList.find(a => a.status === 'selected');
    if (!selected) return;
    const artist = allArtists.find(a => (a.id || a.name) === selected.artistId);
    if (!artist) return;
    const eventDate = new Date(dateObj.date);
    const isPast = eventDate < now.setHours(0,0,0,0);
    const eventCard = document.createElement('div');
    eventCard.className = 'user-event-card';
    eventCard.innerHTML = `
      <div class="user-event-header">
        <span><i class="fa-solid fa-calendar-days"></i> ${dateObj.date}</span>
        <span class="user-event-status${isPast ? ' past' : ''}">${isPast ? 'Past' : 'Upcoming'}</span>
      </div>
      <div class="user-event-artist">
        <img src="${artist.profilePhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(artist.name)}" alt="Artist">
        <div>
          <div class="artist-name">${artist.name}</div>
          <div class="artist-bio">${artist.bio || ''}</div>
        </div>
      </div>
    `;
    eventsDiv.appendChild(eventCard);
  });
  listDiv.appendChild(card);
}
function renderUserBookings() {
  const bookings = getUserBookings();
  const dates = JSON.parse(localStorage.getItem('venueDates') || '[]');
  const apps = JSON.parse(localStorage.getItem('venueApplications') || '{}');
  const allArtists = JSON.parse(localStorage.getItem('allArtists') || '[]');
  const venue = JSON.parse(localStorage.getItem('venueProfile') || '{}');
  const now = new Date();
  const listDiv = document.getElementById('user-bookings-list');
  listDiv.innerHTML = '';
  bookings.forEach(b => {
    const dateObj = dates.find(d => d.date === b.date);
    if (!dateObj) return;
    const appList = (apps[b.date] || []);
    const selected = appList.find(a => a.status === 'selected');
    if (!selected) return;
    const artist = allArtists.find(a => (a.id || a.name) === selected.artistId);
    if (!artist) return;
    const eventDate = new Date(b.date);
    const isPast = eventDate < now.setHours(0,0,0,0);
    const card = document.createElement('div');
    card.className = 'user-booking-card';
    card.innerHTML = `
      <div class="user-event-header">
        <span><i class="fa-solid fa-calendar-days"></i> ${b.date}</span>
        <span class="user-event-status${isPast ? ' past' : ''}">${isPast ? 'Past' : 'Upcoming'}</span>
      </div>
      <div class="user-event-venue">
        <img src="${venue.photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(venue.name)}" alt="Venue">
        <div>
          <div class="venue-name">${venue.name}</div>
          <div class="venue-location">${venue.location || ''}</div>
        </div>
      </div>
      <div class="user-event-artist">
        <img src="${artist.profilePhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(artist.name)}" alt="Artist">
        <div>
          <div class="artist-name">${artist.name}</div>
          <div class="artist-bio">${artist.bio || ''}</div>
        </div>
      </div>
    `;
    listDiv.appendChild(card);
  });
}

// --- Payment Simulation Logic ---
let paymentEventData = null;
function showPaymentModal(eventData) {
  paymentEventData = eventData;
  document.getElementById('payment-modal').style.display = 'flex';
  document.getElementById('payment-success-msg').textContent = '';
  document.getElementById('payment-event-summary').innerHTML = `
    <div><strong>Date:</strong> ${eventData.date}</div>
    <div><strong>Venue:</strong> ${eventData.venueName}</div>
    <div><strong>Artist:</strong> ${eventData.artistName}</div>
  `;
}
function closePaymentModal() {
  document.getElementById('payment-modal').style.display = 'none';
  paymentEventData = null;
}

// --- Ticket Download & Confirmation Simulation ---
function showTicketActions(eventData) {
  document.getElementById('ticket-actions').style.display = 'flex';
  document.getElementById('download-ticket-btn').onclick = function() {
    // Load jsPDF if not present
    if (typeof window.jspdf === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = function() { downloadTicketPDF(eventData); };
      document.body.appendChild(script);
    } else {
      downloadTicketPDF(eventData);
    }
  };
  document.getElementById('view-confirmation-link').onclick = function(e) {
    e.preventDefault();
    showConfirmationModal(eventData);
  };
}
// --- User Info Logic ---
function getUserProfile() {
  return JSON.parse(localStorage.getItem('userProfile') || '{}');
}
function setUserProfile(profile) {
  localStorage.setItem('userProfile', JSON.stringify(profile));
}
function showUserInfoModal(next) {
  document.getElementById('user-info-modal').style.display = 'flex';
  const form = document.getElementById('user-info-form');
  const profile = getUserProfile();
  document.getElementById('user-info-name').value = profile.name || '';
  document.getElementById('user-info-email').value = profile.email || '';
  document.getElementById('user-info-phone').value = profile.phone || '';
  form.onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('user-info-name').value.trim();
    const email = document.getElementById('user-info-email').value.trim();
    const phone = document.getElementById('user-info-phone').value.trim();
    setUserProfile({name, email, phone});
    document.getElementById('user-info-modal').style.display = 'none';
    if (typeof next === 'function') next();
  };
}
// Patch showPaymentModal to require user info
const origShowPaymentModal = showPaymentModal;
showPaymentModal = function(eventData) {
  const profile = getUserProfile();
  if (!profile.name || !profile.email || !profile.phone) {
    showUserInfoModal(() => origShowPaymentModal(eventData));
    return;
  }
  origShowPaymentModal(eventData);
};
// --- QR Code & Booking ID Logic ---
function generateBookingId(eventData, userProfile) {
  return (
    'BK' +
    Math.random().toString(36).substr(2, 6).toUpperCase() +
    '_' + eventData.date.replace(/-/g, '') +
    '_' + (userProfile.email || 'user')
  );
}
function downloadTicketPDF(eventData) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const userProfile = getUserProfile();
  const bookingId = generateBookingId(eventData, userProfile);
  // Load qrious if not present
  function addQRAndSave(doc) {
    const qrText = `BookingID:${bookingId}|Date:${eventData.date}|Venue:${eventData.venueName}|Artist:${eventData.artistName}|User:${userProfile.name}|Email:${userProfile.email}`;
    if (typeof window.QRious === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
      script.onload = function() {
        const qr = new window.QRious({value: qrText, size: 100});
        doc.addImage(qr.toDataURL(), 'PNG', 140, 20, 40, 40);
        doc.save(`Ticket_${eventData.date}_${eventData.artistName}.pdf`);
      };
      document.body.appendChild(script);
    } else {
      const qr = new window.QRious({value: qrText, size: 100});
      doc.addImage(qr.toDataURL(), 'PNG', 140, 20, 40, 40);
      doc.save(`Ticket_${eventData.date}_${eventData.artistName}.pdf`);
    }
  }
  doc.setFont('helvetica','bold');
  doc.setFontSize(18);
  doc.text('Concert Ticket', 20, 20);
  doc.setFontSize(12);
  doc.setFont('helvetica','normal');
  doc.text(`Booking ID: ${bookingId}`, 20, 35);
  doc.text(`Event Date: ${eventData.date}`, 20, 45);
  doc.text(`Venue: ${eventData.venueName}`, 20, 55);
  doc.text(`Artist: ${eventData.artistName}`, 20, 65);
  doc.text(`User: ${userProfile.name}`, 20, 75);
  doc.text(`Email: ${userProfile.email}`, 20, 85);
  doc.text(`Phone: ${userProfile.phone}`, 20, 95);
  doc.text(`Ticket Price: ₹499`, 20, 105);
  doc.text('Enjoy the show!', 20, 120);
  addQRAndSave(doc);
}
// Patch confirmation modal to use real user info and booking ID
function showConfirmationModal(eventData) {
  const userProfile = getUserProfile();
  const bookingId = generateBookingId(eventData, userProfile);
  document.getElementById('confirmation-modal').style.display = 'flex';
  document.getElementById('confirmation-content').innerHTML = `
    <div style="margin-bottom:10px;"><strong>Email sent to:</strong> ${userProfile.email}</div>
    <div style="margin-bottom:10px;"><strong>SMS sent to:</strong> ${userProfile.phone}</div>
    <div style="background:#f5f7fa;padding:12px 10px;border-radius:8px;">
      <div><strong>Booking ID:</strong> ${bookingId}</div>
      <div><strong>Subject:</strong> Your Concert Ticket for ${eventData.date}</div>
      <div><strong>Message:</strong><br>
        Hi ${userProfile.name},<br>
        Your ticket for the concert on <b>${eventData.date}</b> at <b>${eventData.venueName}</b> featuring <b>${eventData.artistName}</b> is confirmed.<br>
        Ticket Price: ₹499<br>
        Show this ticket at the venue entrance.<br>
        Enjoy the show!
      </div>
    </div>
  `;
}
function closeConfirmationModal() {
  document.getElementById('confirmation-modal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
  // sidebar tab wiring for user
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

  // Patch logout to clear currentUser
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      localStorage.removeItem('currentUser');
      window.location.href = 'index.html';
    });
  }

  if (document.getElementById('user-events-list')) {
    renderUserEvents();
  }
  if (document.getElementById('user-venues-list')) {
    renderUserVenues();
  }
  if (document.getElementById('user-bookings-list')) {
    renderUserBookings();
  }

  // Payment modal close
  const paymentModal = document.getElementById('payment-modal');
  const closePaymentBtn = document.querySelector('.close-payment-modal-btn');
  if (paymentModal && closePaymentBtn) {
    closePaymentBtn.onclick = closePaymentModal;
    paymentModal.onclick = function(e) {
      if (e.target === paymentModal) closePaymentModal();
    };
  }
  // Patch payment logic to show ticket actions
  const payBtn = document.getElementById('pay-and-book-btn');
  if (payBtn) {
    payBtn.onclick = function() {
      if (!paymentEventData) return;
      payBtn.disabled = true;
      const successMsg = document.getElementById('payment-success-msg');
      if (successMsg) successMsg.textContent = 'Processing payment...';
      setTimeout(() => {
        const bookings = getUserBookings();
        if (!bookings.find(b => b.date === paymentEventData.date)) {
          bookings.push({date: paymentEventData.date, artistId: paymentEventData.artistId, venueName: paymentEventData.venueName});
          setUserBookings(bookings);
        }
        if (successMsg) successMsg.textContent = 'Payment successful! Ticket booked.';
        payBtn.disabled = false;
        if (typeof renderUserEvents === 'function') renderUserEvents();
        if (typeof renderUserBookings === 'function') renderUserBookings();
        showTicketActions(paymentEventData);
        setTimeout(() => {
          if (successMsg) successMsg.textContent = 'Payment successful! Ticket booked. You can now download your ticket or view confirmation.';
        }, 600);
      }, 1200);
    };
  }

  if (document.querySelector('.close-confirmation-modal-btn')) {
    const confirmModal = document.getElementById('confirmation-modal');
    const closeConfirmBtn = document.querySelector('.close-confirmation-modal-btn');
    if (confirmModal && closeConfirmBtn) {
      closeConfirmBtn.onclick = closeConfirmationModal;
      confirmModal.onclick = function(e) {
        if (e.target === confirmModal) closeConfirmationModal();
      };
    }
  }
});
// Patch: update Book Ticket button to use payment modal
function patchBookTicketButtons() {
  const dates = JSON.parse(localStorage.getItem('venueDates') || '[]');
  const apps = JSON.parse(localStorage.getItem('venueApplications') || '{}');
  const allArtists = JSON.parse(localStorage.getItem('allArtists') || '[]');
  const venue = JSON.parse(localStorage.getItem('venueProfile') || '{}');
  const now = new Date();
  const events = dates.filter(d => d.closed);
  const bookings = getUserBookings();
  const listDiv = document.getElementById('user-events-list');
  if (!listDiv) return;
  const btns = listDiv.querySelectorAll('.user-event-book-btn');
  let idx = 0;
  events.forEach(dateObj => {
    const appList = (apps[dateObj.date] || []);
    const selected = appList.find(a => a.status === 'selected');
    if (!selected) return;
    const artist = allArtists.find(a => (a.id || a.name) === selected.artistId);
    if (!artist) return;
    const eventDate = new Date(dateObj.date);
    const isPast = eventDate < now.setHours(0,0,0,0);
    const isBooked = bookings.find(b => b.date === dateObj.date);
    if (!isPast && !isBooked && btns[idx]) {
      btns[idx].onclick = function() {
        showPaymentModal({
          date: dateObj.date,
          venueName: venue.name,
          artistName: artist.name,
          artistId: artist.id || artist.name
        });
      };
      idx++;
    } else if (btns[idx]) {
      idx++;
    }
  });
}
// Patch after rendering events
const origRenderUserEvents = renderUserEvents;
renderUserEvents = function() {
  origRenderUserEvents();
  patchBookTicketButtons();
}; 