import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    // Basic authentication logic (replace with your actual authentication)
    if (username === 'user' && password === 'password') {
      onLogin({ role: 'user', username: 'user' });
      navigate('/user');
    } else if (username === 'admin' && password === 'admin') {
      onLogin({ role: 'admin', username: 'admin' });
      navigate('/admin');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div style={{position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)'}}>
      <span>
		  <input
		    type="text"
		    placeholder="Username"
		    value={username}
		    onChange={(e) => setUsername(e.target.value)}
		    style={{margin: '2%'}}
		  />
		  <input
		    type="password"
		    placeholder="Password"
		    value={password}
		    onChange={(e) => setPassword(e.target.value)}
		    style={{margin: '2%'}}
		  />
      </span>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default LoginPage;
