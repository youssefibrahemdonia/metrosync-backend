document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || role !== 'admin') {
    alert('Access denied. Admins only.');
    window.location.href = 'index.html';
    return;
  }

  loadStations();
});

const socket = io();

socket.on('stationsChanged', () => {
  loadStations();
});

function extractErrorMessage(data) {
  if (data.message) return data.message;
  if (data.error) return data.error;
  if (data.errors && data.errors.length > 0) {
    return data.errors.map(e => e.message).join(' ');
  }
  return 'Request failed.';
}

async function loadStations() {
  const stationListElement = document.getElementById('station-list');
  const selectElement = document.getElementById('announcement-station-select');

  try {
    const res = await fetch('/api/v1/stations');
    const stations = await res.json();

    if (stationListElement) {
      stationListElement.innerHTML = '';

      if (stations.length === 0) {
        stationListElement.innerHTML = '<li class="station-box"><span>No stations found in grid.</span></li>';
      } else {
        stations.forEach((station, index) => {
          const li = document.createElement('li');
          li.className = 'station-box fade-in-item';
          li.style.animationDelay = `${index * 0.08}s`;

          const timesFormatted = station.metroTimes && station.metroTimes.length > 0
            ? station.metroTimes.join(' | ')
            : 'No scheduled times set';

          li.innerHTML = `
            <div class="station-info">
              <strong>${station.name}</strong>
              <span>Line: ${station.line} | Order: ${station.order}</span>
              <span>Schedule (Arrival/Leave): ${timesFormatted}</span>
            </div>
            <div class="station-btn-row">
              <button class="btn-green" onclick="addMetroTimeToStation('${station._id}')">ADD TIME</button>
              <button class="btn-red" onclick="deleteStation('${station._id}')">DELETE</button>
            </div>
          `;
          stationListElement.appendChild(li);
        });
      }
    }

    // Keep the announcement dropdown in sync with the current station list.
    if (selectElement) {
      const previousValue = selectElement.value;
      selectElement.innerHTML = '<option value="" disabled selected>Select a station...</option>';
      stations.forEach(station => {
        const option = document.createElement('option');
        option.value = station._id;
        option.innerText = `${station.name} (${station.line})`;
        selectElement.appendChild(option);
      });
      if (stations.some(s => s._id === previousValue)) {
        selectElement.value = previousValue;
      }
    }
  } catch (err) {
    console.error('Error loading stations:', err);
  }
}

async function addStation(event) {
  event.preventDefault();

  const nameInput = document.getElementById('station-name');
  const lineInput = document.getElementById('station-line');
  const orderInput = document.getElementById('station-order');
  const timesInput = document.getElementById('metro-times');
  const output = document.getElementById('admin-output');

  const name = nameInput.value.trim();
  const line = lineInput.value.trim();
  const order = Number(orderInput.value);
  const metroTimes = timesInput.value.split(',').map(t => t.trim()).filter(t => t);

  if (!name || !line || !orderInput.value) {
    output.innerText = 'ERROR: Station name, line, and order are all required.';
    return;
  }

  const token = localStorage.getItem('token');

  try {
    const res = await fetch('/api/v1/stations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, line, order, metroTimes })
    });

    const data = await res.json();

    if (res.ok) {
      output.innerText = 'SUCCESS: Station and schedule added!';
      nameInput.value = '';
      lineInput.value = '';
      orderInput.value = '';
      timesInput.value = '';
      loadStations();
    } else {
      output.innerText = `ERROR: ${extractErrorMessage(data)}`;
    }
  } catch (err) {
    console.error('Error adding station:', err);
    output.innerText = 'ERROR: Network request failed.';
  }
}

async function addMetroTimeToStation(id) {
  const newTime = prompt('Enter new metro time (e.g., 02:30 PM Arrival / 02:45 Departure):');
  if (!newTime) return;

  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`/api/v1/stations/${id}/times`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ time: newTime })
    });

    if (res.ok) {
      loadStations();
    } else {
      const data = await res.json();
      alert(`ERROR: ${extractErrorMessage(data)}`);
    }
  } catch (err) {
    console.error('Error adding time:', err);
    alert('ERROR: Network request failed.');
  }
}

async function deleteStation(id) {
  if (!confirm('Are you sure you want to delete this station from the grid?')) return;

  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`/api/v1/stations/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      loadStations();
    } else {
      const data = await res.json();
      alert(`ERROR: ${extractErrorMessage(data)}`);
    }
  } catch (err) {
    console.error('Error deleting station:', err);
    alert('ERROR: Network request failed.');
  }
}

async function postAnnouncement(event) {
  event.preventDefault();

  const stationSelect = document.getElementById('announcement-station-select');
  const textInput = document.getElementById('announcement-text');
  const output = document.getElementById('announcement-output');

  const stationId = stationSelect.value;
  const text = textInput.value.trim();

  if (!stationId) {
    output.innerText = 'ERROR: Please select a station.';
    return;
  }

  if (!text) {
    output.innerText = 'ERROR: Announcement text is required.';
    return;
  }

  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`/api/v1/stations/${stationId}/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ text })
    });

    const data = await res.json();

    if (res.ok) {
      output.innerText = 'SUCCESS: Announcement broadcast to live viewers.';
      textInput.value = '';
    } else {
      output.innerText = `ERROR: ${extractErrorMessage(data)}`;
    }
  } catch (err) {
    console.error('Error posting announcement:', err);
    output.innerText = 'ERROR: Network request failed.';
  }
}

const addForm = document.getElementById('add-station-form');
if (addForm) {
  addForm.addEventListener('submit', addStation);
}

const announcementForm = document.getElementById('add-announcement-form');
if (announcementForm) {
  announcementForm.addEventListener('submit', postAnnouncement);
}