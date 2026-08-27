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
  
  async function loadStations() {
    const stationListElement = document.getElementById('station-list');
    if (!stationListElement) return;
  
    try {
      const res = await fetch('/api/v1/stations');
      const stations = await res.json();
  
      stationListElement.innerHTML = '';
      
      if (stations.length === 0) {
        stationListElement.innerHTML = '<li class="station-box"><span>No stations found in grid.</span></li>';
        return;
      }
  
      stations.forEach(station => {
        const li = document.createElement('li');
        li.className = 'station-box';
        
        const timesFormatted = station.metroTimes && station.metroTimes.length > 0 
          ? station.metroTimes.join(' | ') 
          : 'No scheduled times set';
  
        li.innerHTML = `
          <div class="station-info">
            <strong>${station.name}</strong>
            <span>Schedule (Arrival/Leave): ${timesFormatted}</span>
          </div>
          <div class="station-btn-row">
            <button class="btn-green" onclick="addMetroTimeToStation('${station._id}')">ADD TIME</button>
            <button class="btn-red" onclick="deleteStation('${station._id}')">DELETE</button>
          </div>
        `;
        stationListElement.appendChild(li);
      });
    } catch (err) {
      console.error('Error loading stations:', err);
    }
  }
  
  async function addStation(event) {
    event.preventDefault();
    
    const nameInput = document.getElementById('station-name');
    const timesInput = document.getElementById('metro-times');
    const output = document.getElementById('admin-output');
  
    const name = nameInput.value.trim();
    const metroTimes = timesInput.value.split(',').map(t => t.trim()).filter(t => t);
  
    if (!name) {
      output.innerText = 'ERROR: Station name is required.';
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
        body: JSON.stringify({ name, metroTimes })
      });
  
      const data = await res.json();
  
      if (res.ok) {
        output.innerText = 'SUCCESS: Station and schedule added!';
        nameInput.value = '';
        timesInput.value = '';
        loadStations();
      } else {
        output.innerText = `ERROR: ${data.error}`;
      }
    } catch (err) {
      console.error('Error adding station:', err);
      output.innerText = 'ERROR: Network request failed.';
    }
  }
  
  // Quick prompt to add a new metro time to an existing station
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
        alert(`ERROR: ${data.error}`);
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
        alert(`ERROR: ${data.error}`);
      }
    } catch (err) {
      console.error('Error deleting station:', err);
      alert('ERROR: Network request failed.');
    }
  }
  
  const addForm = document.getElementById('add-station-form');
  if (addForm) {
    addForm.addEventListener('submit', addStation);
  }