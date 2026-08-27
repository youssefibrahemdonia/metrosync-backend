// Handle User Login
async function loginUser() {
  const emailInput = document.getElementById('auth-email');
  const passwordInput = document.getElementById('auth-password');
  const output = document.getElementById('auth-output');

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    output.innerText = 'ERROR: Email and password are required.';
    return;
  }

  try {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      // Save token and user role to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);

      output.innerText = `SUCCESS! Redirecting to ${data.role} dashboard...`;

      setTimeout(() => {
        if (data.role === 'admin') {
          window.location.href = 'admin-dashboard.html';
        } else {
          window.location.href = 'dashboard.html';
        }
      }, 1000);
    } else {
      output.innerText = `ERROR: ${data.error || 'Login failed.'}`;
    }
  } catch (err) {
    console.error('Login request error:', err);
    output.innerText = 'ERROR: Network request failed.';
  }
}

// Handle User Registration
async function registerUser() {
  const emailInput = document.getElementById('auth-email');
  const passwordInput = document.getElementById('auth-password');
  const output = document.getElementById('auth-output');

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    output.innerText = 'ERROR: Email and password are required.';
    return;
  }

  try {
    const res = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      output.innerText = 'SUCCESS! Account registered. You can now login.';
    } else {
      output.innerText = `ERROR: ${data.error || 'Registration failed.'}`;
    }
  } catch (err) {
    console.error('Registration request error:', err);
    output.innerText = 'ERROR: Network request failed.';
  }
}