import { useEffect, useState, useRef } from 'react'
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
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [showStatus, setShowStatus] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get('token');

    if (tokenFromUrl) {
      localStorage.setItem('auth_token', tokenFromUrl);
      navigate('/main', { replace: true });
    }

    const token = tokenFromUrl || localStorage.getItem('auth_token');

    if (!token) {
      navigate('/');
      return;
    }

    fetch('https://api.questcity.cloud/myhamsteracademia/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          localStorage.removeItem('auth_token');
          navigate('/');
        } else {
          setUser(data);
          // Fetch queue position if user has a class and group
          if (data.class && data.group) {
            fetch(`https://api.questcity.cloud/myhamsteracademia/api/groups/queue/${data.class}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
              .then(r => r.json())
              .then(q => {
                const found = (q.queue || []).find((item: any) => item.name === data.group);
                setQueuePosition(found ? found.position : null);
              })
              .catch(() => {});
          }
        }
      })
      .catch(err => console.error(err));
  }, [navigate, location]);

  // Poll show status
  useEffect(() => {
    const fetchStatus = () => {
      fetch('https://api.questcity.cloud/myhamsteracademia/api/show/status')
        .then(res => res.json())
        .then(data => setShowStatus(data))
        .catch(err => console.error(err));
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (showStatus?.status === 'timer_running' && showStatus.timerStartedAt) {
      const start = Number(showStatus.timerStartedAt);
      const duration = (showStatus.timerDuration || 120) * 1000;
      
      const tick = () => {
        const now = Date.now();
        const diff = Math.max(0, Math.floor((start + duration - now) / 1000));
        setTimeLeft(diff);
      };
      
      tick();
      interval = setInterval(tick, 1000);
    } else {
      setTimeLeft(null);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [showStatus]);

  if (!user) return null;

  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator || '0') % 5}.png`;

  const classColors: Record<string, string> = {
    Starway: '#768dde',
    NSC: '#57c4a0',
    Staff: '#faa61a',
  };
  const classColor = classColors[user.class] || '#8f909c';

  const ordinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const bannerStyle: React.CSSProperties = {
    backgroundColor: 'rgba(39, 42, 48, 0.85)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(68, 70, 81, 0.6)',
    borderRadius: '16px',
    padding: '14px 20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  };

  const StockChart = ({ showStatus: ss, timeLeft: tl, currentGroupName: cgn, user, setUser }: { showStatus: any, timeLeft: number | null, currentGroupName: string | null, user: any, setUser: any }) => {
    const initData = () => {
      const data = [500];
      for (let i = 1; i < 50; i++) {
        const prev = data[i - 1];
        // Linear goes down initially strictly
        const change = -0.5;
        data.push(Math.max(10, parseFloat((prev + change).toFixed(2))));
      }
      return data;
    };
    const [priceData, setPriceData] = useState(initData);
    const [prevGroup, setPrevGroup] = useState(cgn);
    const [trading, setTrading] = useState(false);

    // Reset chart when group changes
    useEffect(() => {
      if (cgn !== prevGroup) {
        setPriceData(initData());
        setPrevGroup(cgn);
      }
    }, [cgn]);

    // Stop updating when timer runs out (timeLeft === 0)
    const timerExpired = tl !== null && tl <= 0;

    const boostAt = ss?.stockBoostAt ? Number(ss.stockBoostAt) : 0;
    const lastBoostRef = useRef(0);
    const boostTicksRef = useRef(0);
    const [isBoosted, setIsBoosted] = useState(false);

    useEffect(() => {
      if (boostAt > lastBoostRef.current && !timerExpired) {
        boostTicksRef.current = 10; // Rise for exactly 10 ticks (4.0 seconds at 400ms)
        lastBoostRef.current = boostAt;
        setIsBoosted(true);
      }
    }, [boostAt, timerExpired]);

    useEffect(() => {
      if (timerExpired) return; // Don't start interval if timer expired
      const interval = setInterval(() => {
        setPriceData(prev => {
          const last = prev[prev.length - 1];
          let change: number;
          
          if (boostTicksRef.current > 0) {
            // High smooth spike linearly
            change = 8.0; 
            boostTicksRef.current -= 1;
            if (boostTicksRef.current === 0) setIsBoosted(false);
          } else {
            // Linear goes down (no bounces)
            change = -0.5; 
          }
          
          const next = Math.max(5, parseFloat((last + change).toFixed(2)));
          return [...prev.slice(1), next];
        });
      }, 400); // Super smooth 400ms tick rate
      return () => clearInterval(interval);
    }, [timerExpired]);

    const currentPrice = priceData[priceData.length - 1];
    const pctChange = (((currentPrice - 500) / 500) * 100).toFixed(2);
    const isUp = Number(pctChange) >= 0;
    const accentColor = isBoosted || isUp ? '#57c4a0' : '#ed4245';

    const handleTrade = async (action: 'buy' | 'sell' | 'sell_all') => {
      if (trading) return;
      setTrading(true);
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch('https://api.questcity.cloud/myhamsteracademia/api/show/trade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ action, price: currentPrice })
        });
        const data = await res.json();
        if (data.success) {
          setUser((u: any) => ({ ...u, coin: data.coin, shares: data.shares }));
        } else {
          console.error(data.error);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setTrading(false);
      }
    };

    // Auto sell-all when timer expires
    useEffect(() => {
      if (timerExpired && (user.shares || 0) > 0) {
        handleTrade('sell_all');
      }
    }, [timerExpired, user.shares]);

    // Map price data to SVG Y coords
    const maxP = Math.max(...priceData);
    const minP = Math.min(...priceData);
    const range = maxP - minP || 1;
    const xStep = 600 / (priceData.length - 1);
    const points = priceData.map((d, i) => `${i * xStep},${160 - ((d - minP) / range) * 140}`).join(' ');

    return (
      <div style={{ 
        padding: '32px', backgroundColor: 'rgba(30, 33, 38, 0.6)', borderRadius: '32px', 
        border: `1px solid ${isBoosted ? 'rgba(87, 196, 160, 0.2)' : 'rgba(255,255,255,0.08)'}`, backdropFilter: 'blur(20px)', 
        width: '660px', boxShadow: isBoosted ? '0 20px 50px rgba(87, 196, 160, 0.15)' : '0 20px 50px rgba(0,0,0,0.3)',
        animation: 'fadeIn 0.5s ease-out', transition: 'all 0.5s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '14px', color: '#8f909c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Hamster Index</span>
            <span style={{ fontSize: '36px', fontWeight: 900, color: '#e0e2ea', display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              ${currentPrice.toFixed(2)}
              <span style={{ fontSize: '16px', color: accentColor, fontWeight: 700, transition: 'color 0.3s' }}>{isUp ? '+' : ''}{pctChange}%</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: `${accentColor}18`, padding: '8px 16px', borderRadius: '12px', transition: 'all 0.3s' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: accentColor, animation: 'pulse 1.5s infinite', transition: 'background-color 0.3s' }} />
            <span style={{ color: accentColor, fontSize: '13px', fontWeight: 800, transition: 'color 0.3s' }}>{isBoosted ? '📈 RISING' : 'LIVE'}</span>
          </div>
        </div>
        <svg viewBox="0 0 600 180" style={{ width: '100%', height: '220px', overflow: 'visible' }}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accentColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline
            fill="url(#chartGradient)"
            stroke="none"
            points={`0,180 ${points} 600,180`}
            style={{ transition: 'all 0.4s linear' }}
          />
          <polyline
            fill="none"
            stroke={accentColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            style={{ filter: `drop-shadow(0 0 16px ${accentColor}99)`, transition: 'all 0.4s linear' }}
          />
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
          <span style={{ fontSize: '10px', color: '#444651', fontWeight: 600 }}>09:00</span>
          <span style={{ fontSize: '10px', color: '#444651', fontWeight: 600 }}>12:00</span>
          <span style={{ fontSize: '10px', color: '#444651', fontWeight: 600 }}>15:00</span>
          <span style={{ fontSize: '10px', color: '#444651', fontWeight: 600 }}>18:00</span>
        </div>

        {/* Trade Controls */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '12px', fontWeight: 700, color: '#8f909c' }}>
            <span>YOUR COINS: <span style={{ color: '#e0e2ea' }}>{Math.floor(user?.coin || 0)}</span></span>
            <span>SHARES: <span style={{ color: '#e0e2ea' }}>{user?.shares || 0}</span></span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => handleTrade('buy')}
              disabled={trading || timerExpired || (user?.coin || 0) < currentPrice}
              style={{
                flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                backgroundColor: 'rgba(87, 196, 160, 0.15)', color: '#57c4a0',
                fontSize: '14px', fontWeight: 800, cursor: (trading || timerExpired || (user?.coin || 0) < currentPrice) ? 'not-allowed' : 'pointer',
                opacity: (trading || timerExpired || (user?.coin || 0) < currentPrice) ? 0.5 : 1, transition: 'all 0.2s'
              }}
            >
              BUY 1 SHARE
            </button>
            <button 
              onClick={() => handleTrade('sell')}
              disabled={trading || timerExpired || (user?.shares || 0) <= 0}
              style={{
                flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                backgroundColor: 'rgba(237, 66, 69, 0.15)', color: '#ed4245',
                fontSize: '14px', fontWeight: 800, cursor: (trading || timerExpired || (user?.shares || 0) <= 0) ? 'not-allowed' : 'pointer',
                opacity: (trading || timerExpired || (user?.shares || 0) <= 0) ? 0.5 : 1, transition: 'all 0.2s'
              }}
            >
              SELL 1 SHARE
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#36393f', position: 'relative', overflow: 'hidden' }}>

      {/* Top-left: User banner */}
      <div style={{ position: 'absolute', top: '24px', left: '24px', display: 'flex', alignItems: 'center', gap: '16px', ...bannerStyle }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img
            src={avatarUrl}
            alt={user.username}
            style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${classColor}` }}
          />
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#57c44f', border: '2px solid #272a30' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#e0e2ea', lineHeight: 1 }}>{user.username}</span>
          {user.class ? (
            <span style={{ fontSize: '12px', fontWeight: 600, color: classColor, backgroundColor: `${classColor}22`, padding: '2px 10px', borderRadius: '20px', display: 'inline-block', marginTop: '2px' }}>{user.class}</span>
          ) : (
            <span style={{ fontSize: '12px', color: '#8f909c' }}>No Class</span>
          )}
          <span style={{ fontSize: '12px', color: '#faa61a', fontWeight: 700, marginTop: '2px' }}>🪙 {Math.floor(user.coin || 0)}</span>
        </div>
      </div>

      {/* Top-right: Queue position banner */}
      <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', ...bannerStyle }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#8f909c', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Queue</span>
        {queuePosition !== null ? (
          <>
            <span style={{ fontSize: '40px', fontWeight: 900, color: queuePosition === 1 ? '#768dde' : '#e0e2ea', lineHeight: 1 }}>
              {ordinal(queuePosition)}
            </span>
            <span style={{ fontSize: '12px', color: '#8f909c', marginTop: '4px' }}>Group {user.group}</span>
          </>
        ) : (
          <span style={{ fontSize: '40px', fontWeight: 900, color: '#444651', lineHeight: 1 }}>—</span>
        )}
      </div>

      {/* Admin Panel Button (Top-left, below user banner) */}
      {user.role === 'admin' && (
        <button
          onClick={() => navigate('/admin')}
          style={{
            position: 'absolute', top: '120px', left: '24px',
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 24px', borderRadius: '12px',
            backgroundColor: '#faa61a', color: '#fff',
            border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '14px',
            boxShadow: '0 4px 15px rgba(250, 166, 26, 0.3)',
            transition: 'all 0.2s',
            zIndex: 100
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#f19500';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#faa61a';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span style={{ fontSize: '18px' }}>⚙️</span>
          ADMIN PANEL
        </button>
      )}

      {/* Logout Button (Top-right, below queue banner) */}
      <button
        onClick={() => {
          localStorage.removeItem('auth_token');
          navigate('/');
        }}
        style={{
          position: 'absolute', top: '140px', right: '24px',
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 24px', borderRadius: '12px',
          backgroundColor: 'rgba(237, 66, 69, 0.15)', color: '#ed4245',
          border: '1px solid rgba(237, 66, 69, 0.3)', cursor: 'pointer', fontWeight: 700, fontSize: '14px',
          transition: 'all 0.2s',
          zIndex: 100
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(237, 66, 69, 0.25)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(237, 66, 69, 0.15)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <span style={{ fontSize: '18px' }}>🚪</span>
        LOGOUT
      </button>

      {/* Center: Show Manager Interaction */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        
        {/* Waiting for group to click start */}
        {showStatus?.status === 'waiting_for_group' && showStatus.activeClass === user.class && showStatus.currentGroupName === user.group && (
          <button
            onClick={async () => {
              try {
                const token = localStorage.getItem('auth_token');
                const res = await fetch('https://api.questcity.cloud/myhamsteracademia/api/show/trigger-timer', {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                  const statusRes = await fetch('https://api.questcity.cloud/myhamsteracademia/api/show/status');
                  const statusData = await statusRes.json();
                  setShowStatus(statusData);
                }
              } catch (err) {
                console.error(err);
              }
            }}
            style={{
              padding: '20px 60px', fontSize: '24px', fontWeight: 900, borderRadius: '50px',
              backgroundColor: '#57c4a0', color: '#fff', border: 'none', cursor: 'pointer',
              boxShadow: '0 0 40px rgba(87, 196, 160, 0.4)', transition: 'transform 0.1s'
            }}
          >
            START SHOW
          </button>
        )}

        {/* Timer is running */}
        {showStatus?.status === 'timer_running' && (
          showStatus.currentGroupName === user.group ? (
            // Active group sees timer
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#8f909c', textTransform: 'uppercase' }}>Show Time</span>
              <div style={{ fontSize: '120px', fontWeight: 900, color: (timeLeft || 0) < 30 ? '#ed4245' : '#e0e2ea', lineHeight: 1, fontFamily: 'monospace' }}>
                {timeLeft !== null ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}` : '--:--'}
              </div>
            </div>
          ) : (
            // Other groups see stock chart
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
               <div style={{ textAlign: 'center' }}>
                 <span style={{ fontSize: '14px', fontWeight: 800, color: '#faa61a', textTransform: 'uppercase', letterSpacing: '2px', backgroundColor: 'rgba(250, 166, 26, 0.1)', padding: '6px 20px', borderRadius: '30px' }}>
                   Ongoing Show
                 </span>
                 <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#e0e2ea', margin: '16px 0 8px 0' }}>Group {showStatus.currentGroupName} is Live</h2>
                 <p style={{ margin: 0, color: '#8f909c', fontSize: '16px' }}>Please wait for your turn. Analyzing market trends...</p>
               </div>
               <StockChart showStatus={showStatus} timeLeft={timeLeft} currentGroupName={showStatus.currentGroupName} user={user} setUser={setUser} />
            </div>
          )
        )}

        {showStatus?.status === 'idle' && (
          <div style={{ color: '#444651', fontSize: '24px', fontWeight: 700, opacity: 0.3 }}>
            NO SHOW ACTIVE
          </div>
        )}
        
        {/* If status is waiting but NOT user's group */}
        {showStatus?.status === 'waiting_for_group' && (showStatus.activeClass !== user.class || showStatus.currentGroupName !== user.group) && (
          <div style={{ textAlign: 'center', opacity: 0.5 }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#8f909c' }}>WAITING FOR GROUP {showStatus.currentGroupName} TO START</span>
          </div>
        )}
      </div>

      {/* Judge Boost Button */}
      {(user.role === 'judge' || user.role === 'admin') && showStatus?.status === 'timer_running' && (
        <button
          onClick={async () => {
            try {
              const token = localStorage.getItem('auth_token');
              await fetch('https://api.questcity.cloud/myhamsteracademia/api/show/boost-stock', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
              });
              // Immediately refresh status so chart reacts
              const statusRes = await fetch('https://api.questcity.cloud/myhamsteracademia/api/show/status');
              const statusData = await statusRes.json();
              setShowStatus(statusData);
            } catch (err) {
              console.error(err);
            }
          }}
          style={{
            position: 'absolute', bottom: '60px', left: '50%', transform: 'translateX(-50%)',
            width: '120px', height: '120px', borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 35%, #ff4444, #c0392b)',
            border: '5px solid rgba(255,100,100,0.3)',
            boxShadow: '0 0 50px rgba(255,68,68,0.4), 0 10px 30px rgba(0,0,0,0.4), inset 0 -6px 0 rgba(0,0,0,0.3)',
            cursor: 'pointer', fontSize: '14px', fontWeight: 900, color: '#fff',
            letterSpacing: '1px', textTransform: 'uppercase',
            transition: 'all 0.15s', zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '4px'
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateX(-50%) scale(1.08)'; e.currentTarget.style.boxShadow = '0 0 70px rgba(255,68,68,0.6), 0 10px 30px rgba(0,0,0,0.4), inset 0 -6px 0 rgba(0,0,0,0.3)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateX(-50%) scale(1)'; e.currentTarget.style.boxShadow = '0 0 50px rgba(255,68,68,0.4), 0 10px 30px rgba(0,0,0,0.4), inset 0 -6px 0 rgba(0,0,0,0.3)'; }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(1.08)'}
        >
          <span style={{ fontSize: '28px' }}>📈</span>
          <span>BOOST</span>
        </button>
      )}

      {/* Debug Footer (Temporary) */}
      <div style={{ position: 'absolute', bottom: '10px', left: '0', width: '100%', textAlign: 'center', fontSize: '10px', color: '#444651', pointerEvents: 'none' }}>
        Status: {showStatus?.status || 'none'} | Group: {user.group || 'none'} | Active: {showStatus?.currentGroupName || 'none'}
      </div>

    </div>
  );
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
  const [showManagerClass, setShowManagerClass] = useState<string>('');
  const [showStatus, setShowStatus] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Timer logic for Admin
  useEffect(() => {
    let interval: any;
    if (showStatus?.status === 'timer_running' && showStatus.timerStartedAt) {
      const start = Number(showStatus.timerStartedAt);
      const duration = (showStatus.timerDuration || 120) * 1000;
      
      const tick = () => {
        const now = Date.now();
        const diff = Math.max(0, Math.floor((start + duration - now) / 1000));
        setTimeLeft(diff);
      };
      
      tick();
      interval = setInterval(tick, 1000);
    } else {
      setTimeLeft(null);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [showStatus]);

  useEffect(() => {
    const fetchStatus = () => {
      fetch('https://api.questcity.cloud/myhamsteracademia/api/show/status')
        .then(res => res.json())
        .then(data => setShowStatus(data))
        .catch(() => {});
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

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
            coin: u.coin,
            shares: u.shares,
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

  const handleRoleChange = async (userId: string, currentRole: string) => {
    if (currentRole === 'admin') return;
    const newRole = currentRole === 'judge' ? 'user' : 'judge';
    
    // Optimistic UI update
    setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));

    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`https://api.questcity.cloud/myhamsteracademia/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ role: newRole })
      });
      if (!res.ok) {
        // Revert on failure
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: currentRole } : u));
      }
    } catch (err) {
      console.error('Failed to update role:', err);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: currentRole } : u));
    }
  };

  const roleColors: Record<string, { bg: string; text: string }> = {
    admin: { bg: 'rgba(250, 166, 26, 0.15)', text: '#faa61a' },
    judge: { bg: 'rgba(237, 66, 69, 0.15)', text: '#ed4245' },
    user: { bg: 'rgba(143, 144, 156, 0.15)', text: '#8f909c' },
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
          <span style={{ fontSize: '12px', color: '#8f909c' }}>Coins: {Math.floor(u.coin || 0)} | Shares: {u.shares || 0}</span>
        </div>
      </div>
      {/* Role badge */}
      <button
        onClick={(e) => { e.stopPropagation(); handleRoleChange(u._id, u.role); }}
        disabled={u.role === 'admin'}
        style={{
          padding: '4px 12px', borderRadius: '20px', border: 'none',
          backgroundColor: (roleColors[u.role] || roleColors.user).bg,
          color: (roleColors[u.role] || roleColors.user).text,
          fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
          cursor: u.role === 'admin' ? 'default' : 'pointer',
          transition: 'all 0.15s', pointerEvents: 'auto',
          opacity: u.role === 'admin' ? 0.6 : 1,
        }}
        title={u.role === 'admin' ? 'Cannot change admin role' : `Click to toggle role (current: ${u.role})`}
      >
        {u.role === 'admin' ? '🔒 Admin' : u.role === 'judge' ? '⚖️ Judge' : '👤 User'}
      </button>
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '36px', minHeight: '400px', paddingTop: '40px' }}>
            {(!showStatus || showStatus.status === 'idle') ? (
              <>
                {/* Class selector */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  {(['Staff', 'Starway', 'NSC'] as const).map(cls => (
                    <button
                      key={cls}
                      onClick={() => setShowManagerClass(cls)}
                      style={{
                        padding: '10px 28px', borderRadius: '10px', border: '2px solid',
                        borderColor: showManagerClass === cls ? '#57c4a0' : '#444651',
                        backgroundColor: showManagerClass === cls ? 'rgba(87, 196, 160, 0.15)' : '#1d2025',
                        color: showManagerClass === cls ? '#57c4a0' : '#8f909c',
                        fontSize: '15px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s'
                      }}
                    >
                      {cls}
                    </button>
                  ))}
                </div>

                {/* Big green button */}
                <button
                  onClick={async () => {
                    if (!showManagerClass) return;
                    try {
                      const token = localStorage.getItem('auth_token');
                      const res = await fetch('https://api.questcity.cloud/myhamsteracademia/api/show/start', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ class: showManagerClass })
                      });
                      const data = await res.json();
                      if (data.success) {
                        // success
                      } else {
                        alert(data.error || 'Failed to start show');
                      }
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  disabled={!showManagerClass}
                  style={{
                    width: '200px', height: '200px', borderRadius: '50%',
                    background: (!showManagerClass)
                      ? 'radial-gradient(circle at 40% 35%, #555, #333)'
                      : 'radial-gradient(circle at 40% 35%, #57c4a0, #2d6b57)',
                    border: '6px solid rgba(87, 196, 160, 0.3)',
                    boxShadow: !showManagerClass
                      ? 'none'
                      : '0 0 60px rgba(87, 196, 160, 0.5), 0 20px 40px rgba(0,0,0,0.5), inset 0 -8px 0 rgba(0,0,0,0.4)',
                    cursor: !showManagerClass ? 'not-allowed' : 'pointer',
                    fontSize: '24px', fontWeight: 900, color: '#fff',
                    letterSpacing: '2px', textTransform: 'uppercase',
                    transition: 'all 0.15s',
                    opacity: !showManagerClass ? 0.4 : 1,
                  }}
                >
                  START
                </button>

                {!showManagerClass && (
                  <p style={{ margin: 0, color: '#8f909c', fontSize: '14px' }}>Select a class above first</p>
                )}
                
                {showManagerClass && (
                  <p style={{ margin: 0, color: '#57c4a0', fontSize: '14px', fontWeight: 600 }}>Ready to start {showManagerClass} show</p>
                )}
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', width: '100%' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#faa61a', textTransform: 'uppercase', letterSpacing: '2px' }}>Live Session Active</span>
                  <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#e0e2ea', margin: '8px 0' }}>Class: {showStatus.activeClass}</h2>
                  
                  {timeLeft !== null && (
                    <div style={{ 
                      fontSize: '64px', fontWeight: 900, 
                      color: timeLeft < 30 ? '#ed4245' : '#57c4a0', 
                      fontFamily: 'monospace', margin: '20px 0',
                      textShadow: timeLeft < 30 ? '0 0 20px rgba(237, 66, 69, 0.4)' : '0 0 20px rgba(87, 196, 160, 0.4)'
                    }}>
                      {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </div>
                  )}

                  <div style={{ backgroundColor: 'rgba(118, 141, 222, 0.1)', padding: '16px 32px', borderRadius: '16px', border: '1px solid rgba(118, 141, 222, 0.2)', marginTop: '16px' }}>
                    <span style={{ fontSize: '14px', color: '#8f909c' }}>CURRENTLY PERFORMING</span>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#768dde' }}>Group {showStatus.currentGroupName}</div>
                  </div>

                  {showStatus.status === 'waiting_for_group' && (
                    <button
                      onClick={async () => {
                        const token = localStorage.getItem('auth_token');
                        await fetch('https://api.questcity.cloud/myhamsteracademia/api/show/force-trigger-timer', {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${token}` }
                        });
                      }}
                      style={{
                        marginTop: '20px', padding: '10px 24px', borderRadius: '8px',
                        backgroundColor: 'rgba(87, 196, 160, 0.1)', color: '#57c4a0',
                        border: '1px solid #57c4a0', cursor: 'pointer', fontWeight: 700, fontSize: '14px',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(87, 196, 160, 0.2)'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(87, 196, 160, 0.1)'}
                    >
                      FORCE START ⚡
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem('auth_token');
                      const res = await fetch('https://api.questcity.cloud/myhamsteracademia/api/show/next', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      if (!res.ok) {
                        const d = await res.json();
                        alert(d.error || 'Failed to move to next group');
                      }
                    }}
                    style={{
                      padding: '16px 32px', borderRadius: '12px', backgroundColor: '#5865f2', color: '#fff',
                      border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '16px',
                      boxShadow: '0 4px 15px rgba(88, 101, 242, 0.3)', transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    NEXT GROUP ➡️
                  </button>

                  <button
                    onClick={async () => {
                      if (!confirm('End the entire show?')) return;
                      const token = localStorage.getItem('auth_token');
                      await fetch('https://api.questcity.cloud/myhamsteracademia/api/show/end', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                    }}
                    style={{
                      padding: '16px 32px', borderRadius: '12px', backgroundColor: 'rgba(237, 66, 69, 0.1)', color: '#ed4245',
                      border: '1px solid rgba(237, 66, 69, 0.3)', cursor: 'pointer', fontWeight: 700, fontSize: '16px',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(237, 66, 69, 0.2)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(237, 66, 69, 0.1)'}
                  >
                    END SHOW ⏹️
                  </button>
                </div>
              </div>
            )}
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
