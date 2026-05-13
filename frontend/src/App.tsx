import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'

function Login() {
  const handleDiscordLogin = () => {
    window.location.href = 'https://api.questcity.cloud/myhamsteracademia/api/auth/discord/login';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
      <div style={{ backgroundColor: '#2f3136', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center', width: '350px' }}>
        <h1 style={{ marginBottom: '10px', fontSize: '24px' }}>Welcome Back!</h1>
        <p style={{ color: '#b9bbbe', marginBottom: '30px', fontSize: '14px' }}>We're so excited to see you again!</p>
        
        <button 
          onClick={handleDiscordLogin}
          style={{ 
            backgroundColor: '#5865F2', 
            color: 'white', 
            border: 'none', 
            padding: '12px 24px', 
            borderRadius: '4px', 
            fontSize: '16px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4752C4'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#5865F2'}
        >
          <svg style={{ width: '24px', height: '24px', marginRight: '8px' }} fill="white" viewBox="0 0 127.14 96.36">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
          </svg>
          Log in with Discord
        </button>
      </div>
    </div>
  )
}

function Main() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check url for token
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get('token');
    
    if (tokenFromUrl) {
      localStorage.setItem('auth_token', tokenFromUrl);
      navigate('/main', { replace: true }); // clear url
    }

    const token = tokenFromUrl || localStorage.getItem('auth_token');
    
    if (!token) {
      navigate('/');
      return;
    }

    // Fetch user info
    fetch('https://api.questcity.cloud/myhamsteracademia/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          localStorage.removeItem('auth_token');
          navigate('/');
        } else {
          setUser(data);
        }
      })
      .catch(err => {
        console.error(err);
      });
  }, [navigate, location]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/');
  }

  if (!user) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>Loading...</div>;
  }

  const avatarUrl = user.avatar 
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
      <div style={{ backgroundColor: '#2f3136', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center', width: '350px' }}>
        <img src={avatarUrl} alt="Avatar" style={{ borderRadius: '50%', width: '100px', height: '100px', marginBottom: '20px' }} />
        <h2>{user.username}#{user.discriminator}</h2>
        <p style={{ color: '#b9bbbe', marginTop: '5px', marginBottom: '15px' }}>{user.email}</p>
        
        {user.role === 'admin' && (
          <div style={{ backgroundColor: '#faa61a', color: 'white', padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block', marginBottom: '20px' }}>
            ADMIN
          </div>
        )}

        {user.role === 'admin' && (
          <button 
            onClick={() => navigate('/admin')}
            style={{ 
              backgroundColor: '#5865F2', 
              color: 'white', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '4px', 
              marginBottom: '10px',
              cursor: 'pointer',
              width: '100%',
              fontWeight: 'bold'
            }}
          >
            Admin Panel
          </button>
        )}

        <button 
          onClick={handleLogout}
          style={{ 
            backgroundColor: '#ed4245', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '4px', 
            cursor: 'pointer',
            width: '100%',
            fontWeight: 'bold'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}

function Admin() {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: '#36393f', color: '#ffffff' }}>
      <div style={{ backgroundColor: '#2f3136', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center', width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h1 style={{ marginBottom: '20px', fontSize: '32px' }}>Admin Panel</h1>
        
        <div style={{ backgroundColor: '#202225', padding: '20px', borderRadius: '8px', marginTop: '20px', marginBottom: '30px', textAlign: 'left' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '15px', color: '#ffffff' }}>User Management</h2>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', color: '#b9bbbe', fontWeight: 'bold' }}>
            Filter by Class:
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              style={{ marginLeft: '15px', padding: '8px', backgroundColor: '#36393f', color: 'white', border: '1px solid #000000', borderRadius: '4px', outline: 'none', cursor: 'pointer' }}
            >
              <option value="">All Classes</option>
              <option value="Starway">Starway</option>
              <option value="NSC">NSC</option>
            </select>
          </label>
          <div style={{ backgroundColor: '#2f3136', padding: '20px', borderRadius: '4px', border: '1px solid #40444b', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#8e9297', fontSize: '14px', margin: 0 }}>Select a class to view users.</p>
          </div>
        </div>

        <button 
          onClick={() => navigate('/main')}
          style={{ 
            backgroundColor: '#4f545c', 
            color: 'white', 
            border: 'none', 
            padding: '12px 24px', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'background-color 0.2s',
            width: '100%'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#686d73'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4f545c'}
        >
          Return to Main Menu
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router basename="/myhamsteracademia">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/main" element={<Main />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  )
}

export default App
