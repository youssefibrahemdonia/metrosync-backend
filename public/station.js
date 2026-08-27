async function initStationView() {
    const stationId = localStorage.getItem('selectedStationId');
    if (!stationId) {
      window.location.href = 'dashboard.html';
      return;
    }
  
    try {
      const res = await fetch('/api/v1/stations');
      const stations = await res.json();
      const station = stations.find(s => s._id === stationId);
  
      if (!station) {
        alert('Station configuration not found.');
        window.location.href = 'dashboard.html';
        return;
      }
  
      document.getElementById('station-title').innerText = `STATION: ${station.name.toUpperCase()}`;
      document.getElementById('station-subtitle').innerText = `Group: ${station.lineGroup} | Node: ${station.location}`;
  
      const defaultLat = station.lat || 30.0444; 
      const defaultLng = station.lng || 31.2357;
      
      const map = L.map('map').setView([defaultLat, defaultLng], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
  
      L.marker([defaultLat, defaultLng]).addTo(map)
        .bindPopup(`<b>${station.name}</b><br>${station.location}`)
        .openPopup();
  
      const scheduleOutput = document.getElementById('schedule-output');
      if (station.schedules && station.schedules.length > 0) {
        scheduleOutput.innerText = JSON.stringify(station.schedules, null, 2);
      } else {
        scheduleOutput.innerText = '// No active departure schedules logged for this station node.';
      }
  
    } catch (err) {
      console.error(err);
    }
  }
  
  function goBack() {
    window.location.href = 'dashboard.html';
  }
  
  initStationView();