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
  const [activeTab, setActiveTab] = useState<'UserManagement' | 'RandomQueue' | 'ShowManager'>('UserManagement');
  const [searchQuery, setSearchQuery] = useState('');
  const [openSections, setOpenSections] = useState({
    Starway: true,
    NSC: true,
    Staff: true,
    Unassigned: true
  });
  const [groupView, setGroupView] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openGroupSections, setOpenGroupSections] = useState<Record<string, boolean>>({});
  const [randomQueues, setRandomQueues] = useState<any[]>([]);
  const [randomizing, setRandomizing] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/');
      return;
    }
    
    fetch('https://api.questcity.cloud/myhamsteracademia/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.error(data.error);
        } else {
          const mappedUsers = data.map((u: any) => ({
            _id: u._id,
            discordId: u.discordId,
            name: u.username,
            role: u.role,
            class: u.class || '',
            group: u.group || '',
            discriminator: u.discriminator,
            avatar: u.avatar,
            img: u.avatar 
              ? `https://cdn.discordapp.com/avatars/${u.discordId}/${u.avatar}.png` 
              : `https://cdn.discordapp.com/embed/avatars/${parseInt(u.discriminator || '0') % 5}.png`
          }));
          setUsers(mappedUsers);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [navigate]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section as keyof typeof openSections] }));
  };

  const toggleGroupSection = (groupKey: string) => {
    setOpenGroupSections(prev => ({ ...prev, [groupKey]: prev[groupKey] === undefined ? !groupKey.endsWith('-Ungrouped') : !prev[groupKey] }));
  };

  const handleDragStart = (e: any, userId: string, userName: string) => {
    e.dataTransfer.setData('userId', userId);
    e.dataTransfer.setData('userName', userName);
  };

  // Update group only (within same class)
  const handleDrop = async (e: any, targetClass: string, targetGroup: string) => {
    e.preventDefault();
    const userId = e.dataTransfer.getData('userId');
    const userName = e.dataTransfer.getData('userName');
    if (!userId) return;

    const newClass = targetClass === 'Unassigned' ? '' : targetClass;
    const newGroup = targetGroup === 'Ungrouped' ? '' : targetGroup;

    // Optimistic UI Update
    setUsers(prev => prev.map(u => u._id === userId ? { ...u, class: newClass, group: newGroup } : u));

    const token = localStorage.getItem('auth_token');
    try {
      await fetch(`https://api.questcity.cloud/myhamsteracademia/api/users/${userId}/class`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ class: newClass })
      });
      await fetch(`https://api.questcity.cloud/myhamsteracademia/api/users/${userId}/group`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ group: newGroup })
      });
    } catch (err) {
      console.error('Failed to update user:', userName, err);
    }
  };


  const handleDragOver = (e: any) => {
    e.preventDefault();
  };

  const renderUserCard = (u: any, i: number) => (
    <div 
      key={i} 
      draggable
      onDragStart={(e) => handleDragStart(e, u._id, u.name)}
      style={{ backgroundColor: '#272a30', border: '1px solid rgba(68, 70, 81, 0.3)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'grab', transition: 'background-color 0.2s', userSelect: 'none' }} 
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#32353b'} 
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#272a30'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', pointerEvents: 'none' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#1d2025', flexShrink: 0 }}>
          <img src={u.img} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', justifyContent: 'center' }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#e0e2ea', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</span>
        </div>
      </div>
    </div>
  );

  const renderClassSection = (className: string) => {
    const usersInClass = users.filter(u =>
      (className === 'Unassigned' ? !u.class : u.class === className) &&
      u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const isOpen = openSections[className as keyof typeof openSections];

    let content;
    if (usersInClass.length === 0) {
      content = (
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, className, 'Ungrouped')}
          style={{ textAlign: 'center', padding: '32px 0', color: '#8f909c', border: '2px dashed #444651', borderRadius: '8px' }}
        >
          Drop users here to add to {className}
        </div>
      );
    } else if (!groupView) {
      // Flat list — the whole grid is a class drop zone
      content = (
        <section
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, className, 'Ungrouped')}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', minHeight: '80px' }}
        >
          {usersInClass.map((u, i) => renderUserCard(u, i))}
        </section>
      );
    } else {
      const grouped = usersInClass.reduce((acc, user) => {
        const g = user.group || 'Ungrouped';
        if (!acc[g]) acc[g] = [];
        acc[g].push(user);
        return acc;
      }, {} as Record<string, any[]>);

      const groups = Object.keys(grouped).filter(g => g !== 'Ungrouped').sort();
      const ungrouped = grouped['Ungrouped'] || [];

      const renderGroupFoldout = (groupName: string, groupUsers: any[]) => {
        const groupKey = `${className}-${groupName}`;
        // Ungrouped open by default, others closed
        const isGroupOpen = groupName === 'Ungrouped'
          ? openGroupSections[groupKey] !== false
          : openGroupSections[groupKey] === true;

        return (
          <div
            key={groupKey}
            onDragOver={handleDragOver}
            onDrop={(e) => { e.stopPropagation(); handleDrop(e, className, groupName); }}
            style={{ backgroundColor: '#1d2025', borderRadius: '8px', border: '1px dashed #444651', overflow: 'hidden' }}
          >
            <button
              onClick={() => toggleGroupSection(groupKey)}
              style={{ width: '100%', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#23262b', border: 'none', cursor: 'pointer', outline: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: groupName === 'Ungrouped' ? '#8f909c' : '#e0e2ea' }}>
                  {groupName === 'Ungrouped' ? 'Ungrouped Users' : `Group ${groupName}`}
                </span>
                <span style={{ fontSize: '11px', color: '#8f909c', backgroundColor: '#191c21', padding: '2px 8px', borderRadius: '12px' }}>{groupUsers.length}</span>
              </div>
              <span style={{ transform: isGroupOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', fontSize: '12px', color: '#8f909c' }}>▼</span>
            </button>

            {isGroupOpen && (
              <div style={{ padding: '16px' }}>
                {groupUsers.length > 0 ? (
                  <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {groupUsers.map((u, i) => renderUserCard(u, i))}
                  </section>
                ) : (
                  <div style={{ color: '#8f909c', fontSize: '13px', textAlign: 'center', padding: '12px 0' }}>Drop users here</div>
                )}
              </div>
            )}
          </div>
        );
      };

      content = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {groups.map(g => renderGroupFoldout(g, grouped[g]))}
          {renderGroupFoldout('Ungrouped', ungrouped)}
        </div>
      );
    }

    return (
      <div style={{ backgroundColor: '#191c21', borderRadius: '12px', overflow: 'hidden', border: '1px solid #272a30' }}>
        {/* Class header — also a drop zone for quick class assignment */}
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, className, 'Ungrouped')}
          style={{ display: 'flex', alignItems: 'center', backgroundColor: '#1d2025' }}
        >
          <button
            onClick={() => toggleSection(className)}
            style={{ flex: 1, padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', outline: 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#e0e2ea' }}>{className === 'Unassigned' ? '⚠️ Unassigned' : className}</h2>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#b6c4ff', backgroundColor: 'rgba(118, 141, 222, 0.2)', padding: '4px 8px', borderRadius: '4px' }}>{usersInClass.length} Users</span>
            </div>
            <span style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', fontSize: '16px', color: '#c5c5d3' }}>▼</span>
          </button>
        </div>

        {isOpen && (
          <div style={{ padding: '20px', backgroundColor: '#191c21' }}>
            {content}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#36393f', color: '#e0e2ea', fontFamily: '"Inter", sans-serif', fontSize: '16px' }}>
        Loading users...
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#36393f', minHeight: '100vh', width: '100%', color: '#e0e2ea', fontFamily: '"Inter", sans-serif', paddingBottom: '80px', boxSizing: 'border-box', overflowY: 'auto' }}>
      {/* Header */}
      <header style={{ position: 'sticky', top: 0, backgroundColor: '#272a30', height: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', zIndex: 40, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
        {/* Left: Brand */}
        <div style={{ display: 'flex', alignItems: 'center', minWidth: '160px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#768dde', letterSpacing: '0.5px' }}>⚙ Admin Panel</h1>
        </div>

        {/* Center: Tab Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#1d2025', borderRadius: '10px', padding: '4px' }}>
          {(['UserManagement', 'RandomQueue', 'ShowManager'] as const).map(tab => {
            const labels: Record<string, string> = { UserManagement: 'User Management', RandomQueue: 'Random Queue', ShowManager: 'Show Manager' };
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{ padding: '7px 18px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: isActive ? 700 : 500, backgroundColor: isActive ? '#768dde' : 'transparent', color: isActive ? '#fff' : '#8f909c', transition: 'all 0.18s' }}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* Right: Group View toggle + Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '160px', justifyContent: 'flex-end' }}>
          {activeTab === 'UserManagement' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: groupView ? '#e0e2ea' : '#8f909c', fontWeight: 600, transition: 'color 0.2s' }}>Group View</span>
              <button
                onClick={() => setGroupView(v => !v)}
                style={{ width: '44px', height: '24px', borderRadius: '12px', backgroundColor: groupView ? '#768dde' : '#444651', border: 'none', position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s', flexShrink: 0 }}
              >
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#fff', position: 'absolute', top: '3px', left: groupView ? '23px' : '3px', transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
              </button>
            </div>
          )}
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #444651' }}>
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7tJGS7fdTyrmWAVD8MklMhf-KNzZxMb8u_0dXZuwiVWNpKX1_xOGQCh6b4RCFO7BU70FeQJGjZqwYJLxAZ8fuLGdp7igfuUUMG9yWV_72ZIguuetdGL9hoKaJC5fKU0FDx_F3_4aNkUJSumLf1b5yEn-r2sYbXjSGgyO3XYUNtg4lT3agzek5OpKG6-epHSbZmvdql7UGHKFwfEOlcDVMGiqDtAcIEStOLE1ecRHXOzKcYKDcxyQmC7SdW5ULwEsyuEWbCw3RfHPk" alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {activeTab === 'UserManagement' && (
          <>
            {/* Search */}
            <section style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ flex: '1 1 100%', position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search for users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', height: '48px', padding: '0 16px', backgroundColor: '#191c21', border: '1px solid #191c21', borderRadius: '8px', color: '#e0e2ea', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </section>

            {/* Class Foldouts */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {renderClassSection('Staff')}
              {renderClassSection('Starway')}
              {renderClassSection('NSC')}
              {renderClassSection('Unassigned')}
            </section>
          </>
        )}

        {activeTab === 'RandomQueue' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '36px', minHeight: '400px', paddingTop: '40px' }}>

            {/* Class selector */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {(['Staff', 'Starway', 'NSC'] as const).map(cls => (
                <button
                  key={cls}
                  onClick={async () => {
                    setSelectedClass(cls);
                    setRandomQueues([]);
                    try {
                      const token = localStorage.getItem('auth_token');
                      const res = await fetch(`https://api.questcity.cloud/myhamsteracademia/api/groups/queue/${cls}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      const data = await res.json();
                      setRandomQueues(data.queue || []);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  style={{
                    padding: '10px 28px', borderRadius: '10px', border: '2px solid',
                    borderColor: selectedClass === cls ? '#768dde' : '#444651',
                    backgroundColor: selectedClass === cls ? 'rgba(118,141,222,0.15)' : '#1d2025',
                    color: selectedClass === cls ? '#768dde' : '#8f909c',
                    fontSize: '15px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s'
                  }}
                >
                  {cls}
                </button>
              ))}
            </div>

            {/* Big red button */}
            <button
              onClick={async () => {
                if (!selectedClass) return;
                setRandomizing(true);
                try {
                  const token = localStorage.getItem('auth_token');
                  const res = await fetch('https://api.questcity.cloud/myhamsteracademia/api/groups/randomize-class', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ class: selectedClass })
                  });
                  const data = await res.json();
                  setRandomQueues(data.queue || []);
                } catch (err) {
                  console.error(err);
                } finally {
                  setRandomizing(false);
                }
              }}
              disabled={randomizing || !selectedClass}
              style={{
                width: '200px', height: '200px', borderRadius: '50%',
                background: (!selectedClass)
                  ? 'radial-gradient(circle at 40% 35%, #555, #333)'
                  : randomizing
                    ? 'radial-gradient(circle at 40% 35%, #c0392b, #7b241c)'
                    : 'radial-gradient(circle at 40% 35%, #ff4444, #c0392b)',
                border: '6px solid rgba(255,100,100,0.3)',
                boxShadow: !selectedClass
                  ? 'none'
                  : randomizing
                    ? '0 0 30px rgba(255,68,68,0.3), inset 0 -6px 0 rgba(0,0,0,0.4)'
                    : '0 0 60px rgba(255,68,68,0.5), 0 20px 40px rgba(0,0,0,0.5), inset 0 -8px 0 rgba(0,0,0,0.4)',
                cursor: (!selectedClass || randomizing) ? 'not-allowed' : 'pointer',
                fontSize: '18px', fontWeight: 900, color: '#fff',
                letterSpacing: '1px', textTransform: 'uppercase',
                transition: 'all 0.15s',
                transform: randomizing ? 'scale(0.95) translateY(4px)' : 'scale(1)',
                opacity: !selectedClass ? 0.4 : 1,
              }}
            >
              {randomizing ? '...' : '🎲 RANDOM'}
            </button>

            {!selectedClass && (
              <p style={{ margin: 0, color: '#8f909c', fontSize: '14px' }}>Select a class above first</p>
            )}

            {/* Results — group ORDER */}
            {randomQueues.length > 0 && (
              <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 style={{ margin: 0, textAlign: 'center', fontSize: '18px', fontWeight: 700, color: '#e0e2ea' }}>
                  {selectedClass} — Group Queue
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {randomQueues.map((item: any) => {
                    const isFirst = item.position === 1;
                    const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
                    return (
                      <div
                        key={item.name}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '16px',
                          padding: '14px 20px', borderRadius: '10px',
                          backgroundColor: isFirst ? 'rgba(118,141,222,0.12)' : '#1d2025',
                          border: `1px solid ${isFirst ? 'rgba(118,141,222,0.4)' : '#272a30'}`,
                          transition: 'all 0.2s',
                        }}
                      >
                        <span style={{ fontSize: '28px', minWidth: '36px', textAlign: 'center' }}>
                          {medals[item.position] || `#${item.position}`}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '18px', fontWeight: 700, color: isFirst ? '#768dde' : '#e0e2ea' }}>
                            Group {item.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#8f909c', marginTop: '2px' }}>
                            {item.memberCount} member{item.memberCount !== 1 ? 's' : ''}
                          </div>
                        </div>
                        {isFirst && (
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#768dde', backgroundColor: 'rgba(118,141,222,0.2)', padding: '4px 12px', borderRadius: '20px' }}>
                            GOES FIRST
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ShowManager' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: '#8f909c', gap: '16px' }}>
            <span style={{ fontSize: '48px' }}>🎬</span>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#e0e2ea' }}>Show Manager</h2>
            <p style={{ margin: 0, fontSize: '14px' }}>Coming soon...</p>
          </div>
        )}

        {/* Return button */}
        <button
          onClick={() => navigate('/main')}
          style={{ width: '100%', marginTop: '32px', padding: '16px', backgroundColor: '#768dde', color: '#00226e', fontSize: '16px', fontWeight: 700, border: 'none', borderRadius: '12px', cursor: 'pointer', transition: 'transform 0.1s' }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Return to Main Menu
        </button>
      </main>
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
