/* Login / onboarding — WdAuthCard over auth_background.png */
function LoginScreen({ onLogin }) {
  return (
    <div className="layer fade-in" style={{ background: '#000' }}>
      {/* dim full-bleed backdrop (same image, darkened) */}
      <img src="../../../assets/images/auth_background.png" alt="" aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: .5 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(10,8,18,.55),rgba(10,8,18,.82))' }} />
      <StatusBar />
      {/* auth card */}
      <div style={{ position: 'absolute', left: '50%', top: 117, transform: 'translateX(-50%)',
        width: 351, height: 640, borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 30px 70px rgba(0,0,0,.6)' }}>
        <img src="../../../assets/images/auth_background.png" alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        {/* protection scrim — guarantees ≥45% behind hero text & buttons (not text-shadow alone) */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.12) 38%, rgba(0,0,0,0.20) 62%, rgba(0,0,0,0.66) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, padding: '36px 24px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="noselect">
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, lineHeight: '37px',
              color: '#fff', textShadow: '0 0 8px rgba(0,0,0,.9)' }}>Toopdbq</div>
            <div style={{ fontFamily: 'var(--font-jp)', fontWeight: 700, fontSize: 22, lineHeight: '37px',
              color: '#fff', textShadow: '0 0 8px rgba(0,0,0,.9)' }}>で新しい世界を<br/>見つけてください</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0 8px' }}>
            <div className="login-btn google" onClick={onLogin}>
              <div className="inner"><img src="../../../assets/images/logo_google.png" alt="" />Googleアカウントで始める</div>
            </div>
            <div className="login-btn apple" onClick={onLogin}>
              <div className="inner" style={{ color: '#141414' }}><img src="../../../assets/images/logo_apple.png" alt="" />Appleアカウントで始める</div>
            </div>
          </div>
        </div>
      </div>
      <div className="home-indicator" />
    </div>
  );
}
window.LoginScreen = LoginScreen;
