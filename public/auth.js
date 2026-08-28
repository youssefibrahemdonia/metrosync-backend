const API_BASE = '/api/v1';

function extractErrorMessage(data) {
  if (data.message) return data.message;
  if (data.error) return data.error;
  if (data.errors && data.errors.length > 0) {
    return data.errors.map(e => e.message).join(' ');
  }
  return 'Request failed.';
}

// Custom terminal-style text-scramble reveal — no external libraries.
function announceRole(role) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('role-announcement');
    const textEl = document.getElementById('role-announcement-text');
    const finalText = role === 'admin' ? 'ACCESS GRANTED :: ADMIN' : 'ACCESS GRANTED :: USER';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ01#$%&*';

    overlay.classList.toggle('role-admin', role === 'admin');
    overlay.classList.toggle('role-user', role !== 'admin');
    overlay.classList.add('visible');

    let frame = 0;
    const totalFrames = finalText.length * 3;

    const interval = setInterval(() => {
      let output = '';
      for (let i = 0; i < finalText.length; i++) {
        const revealAt = i * 3;
        if (finalText[i] === ' ' || finalText[i] === ':') {
          output += finalText[i];
        } else if (frame >= revealAt + 6) {
          output += finalText[i];
        } else if (frame >= revealAt) {
          output += chars[Math.floor(Math.random() * chars.length)];
        } else {
          output += ' ';
        }
      }
      textEl.innerText = output;
      frame++;

      if (frame > totalFrames) {
        clearInterval(interval);
        textEl.innerText = finalText;
        setTimeout(() => {
          overlay.classList.remove('visible');
          resolve();
        }, 500);
      }
    }, 40);
  });
}

async function registerUser() {
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  const output = document.getElementById('auth-output');

  if (!email || !password) {
    output.innerText = 'ERROR: Enter email and password.';
    return;
  }

  output.innerText = '// Registering...';

  try {
    const res = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      output.innerText = `ERROR: ${extractErrorMessage(data)}`;
      return;
    }

    output.innerText = '// Registered successfully. You can now log in.';
  } catch (err) {
    console.error('Register error:', err);
    output.innerText = 'ERROR: Network request failed.';
  }
}

async function loginUser() {
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  const output = document.getElementById('auth-output');

  if (!email || !password) {
    output.innerText = 'ERROR: Enter email and password.';
    return;
  }

  output.innerText = '// Authenticating...';

  try {
    let res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', 'admin');
      output.innerText = '// Identity confirmed.';
      await announceRole('admin');
      window.location.href = 'admin-dashboard.html';
      return;
    }

    res = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', 'user');
      output.innerText = '// Identity confirmed.';
      await announceRole('user');
      window.location.href = 'dashboard.html';
      return;
    }

    const data = await res.json();
    output.innerText = `ERROR: ${extractErrorMessage(data)}`;
  } catch (err) {
    console.error('Login error:', err);
    output.innerText = 'ERROR: Network request failed.';
  }
}