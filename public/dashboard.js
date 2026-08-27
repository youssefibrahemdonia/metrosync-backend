async function loadStations() {
    const container = document.getElementById('stations-container');
    try {
      const res = await fetch('/api/v1/stations');
      const stations = await res.json();
  
      if (stations.length === 0) {
        container.innerHTML = '<div class="panel"><p>// No stations available in database.</p></div>';
        return;
      }
  
      container.innerHTML = '';
      stations.forEach(station => {
        const card = document.createElement('div');
        card.className = 'panel';
        card.innerHTML = `
          <h2 style="color: var(--accent-yellow);">${station.name}</h2>
          <p style="margin: 5px 0; color: var(--accent-cyan);">Line Group: ${station.lineGroup}</p>
          <p style="font-size: 0.85rem; margin-bottom: 1rem;">Location Node: ${station.location}</p>
          <button onclick="joinStation('${station._id}')" style="width: 100%; background: var(--accent-cyan); color: var(--bg-dark);">JOIN STATION</button>
        `;
        container.appendChild(card);
      });
    } catch (err) {
      container.innerHTML = '<div class="panel"><p>ERROR: Failed to load transit network.</p></div>';
    }
  }
  
  function joinStation(stationId) {
    localStorage.setItem('selectedStationId', stationId);
    window.location.href = 'station.html';
  }
  
  function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
  }
  
  loadStations();