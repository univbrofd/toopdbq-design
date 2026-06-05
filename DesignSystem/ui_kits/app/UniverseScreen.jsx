/* Universe — 3D-ish globe of story pins. Tap a pin → Hero into the Story Viewer. */
const { useMemo: useMemoU } = React;

function Starfield() {
  const stars = useMemoU(() => Array.from({ length: 70 }, () => ({
    x: Math.random() * 100, y: Math.random() * 100,
    s: Math.random() * 1.8 + 0.4, o: Math.random() * 0.7 + 0.3,
    d: Math.random() * 3,
  })), []);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {stars.map((st, i) => (
        <span key={i} style={{ position: 'absolute', left: st.x + '%', top: st.y + '%',
          width: st.s, height: st.s, borderRadius: '50%', background: '#fff', opacity: st.o,
          boxShadow: '0 0 ' + (st.s * 2) + 'px #fff',
          animation: `twinkle 3.5s ${st.d}s ease-in-out infinite` }} />
      ))}
    </div>
  );
}

function Pin({ x, y, avatar, main, onClick }) {
  const size = main ? 58 : 40;
  return (
    <div className="noselect" onClick={onClick} style={{ position: 'absolute', left: x + '%', top: y + '%',
      transform: 'translate(-50%,-50%)', cursor: 'pointer', zIndex: main ? 5 : 3 }}>
      <div style={{ position: 'relative', width: size, height: size,
        animation: `floaty ${main ? 4 : 5}s ease-in-out infinite` }}>
        {main && <div style={{ position: 'absolute', inset: -7, borderRadius: '50%',
          background: 'var(--gradient-colorful)', filter: 'blur(7px)', opacity: .9 }} />}
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', padding: main ? 2.5 : 1.5,
          background: main ? 'var(--gradient-colorful)' : 'linear-gradient(135deg,#211c1c,rgba(255,255,255,.64))' }}>
          <img src={avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%',
            objectFit: 'cover', background: '#333', display: 'block' }} />
        </div>
        {/* pointer */}
        <div style={{ position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%) rotate(45deg)',
          width: 9, height: 9, background: main ? '#ff3e88' : 'rgba(255,255,255,.64)' }} />
      </div>
    </div>
  );
}

function UniverseScreen({ onOpenStory, onMenu }) {
  const data = window.TOOPDATA;
  return (
    <div className="layer fade-in" style={{ background: 'radial-gradient(130% 110% at 50% 38%, #1a2546 0%, #0a0c1c 45%, #05060d 100%)' }}>
      <Starfield />
      {/* globe */}
      <div style={{ position: 'absolute', left: '50%', top: '46%', transform: 'translate(-50%,-50%)',
        width: 360, height: 360 }}>
        <div style={{ position: 'absolute', inset: -40, borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 50%, rgba(80,130,220,.35), transparent 62%)' }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden',
          background: 'radial-gradient(circle at 36% 32%, #2e5aa8 0%, #19386f 34%, #0c1c3e 64%, #060d22 100%)',
          boxShadow: 'inset -28px -24px 70px rgba(0,0,0,.75), inset 18px 14px 50px rgba(120,170,255,.25), 0 0 60px rgba(60,110,210,.35)' }}>
          {/* drifting landmass texture */}
          <div style={{ position: 'absolute', top: '-25%', left: '-25%', width: '150%', height: '150%',
            background: 'radial-gradient(40px 30px at 30% 40%, rgba(70,150,120,.5), transparent 60%), radial-gradient(60px 40px at 62% 55%, rgba(60,140,110,.45), transparent 60%), radial-gradient(34px 30px at 50% 72%, rgba(80,160,130,.4), transparent 60%), radial-gradient(48px 34px at 74% 30%, rgba(60,130,110,.4), transparent 60%)',
            animation: 'spin 40s linear infinite', opacity: .9 }} />
          {/* specular highlight */}
          <div style={{ position: 'absolute', top: '12%', left: '20%', width: '34%', height: '26%',
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,.4), transparent 70%)', filter: 'blur(6px)' }} />
        </div>
        {/* pins sit in the globe's coordinate box */}
        {data.map((c) => (
          <Pin key={c.id} x={c.pin.x} y={c.pin.y} avatar={c.stories[0].avatar}
            main={c.pin.role === 'main'} onClick={() => onOpenStory(c.id)} />
        ))}
        {window.EXTRA_PINS.map((p, i) => (
          <div key={i} style={{ position: 'absolute', left: p.x + '%', top: p.y + '%',
            transform: 'translate(-50%,-50%)', width: 22, height: 22, borderRadius: '50%', zIndex: 2,
            padding: 1.2, background: 'linear-gradient(135deg,#211c1c,rgba(255,255,255,.5))',
            animation: `floaty ${5 + i * 0.4}s ease-in-out infinite`, opacity: .8 }}>
            <img src={p.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', background: '#333' }} />
          </div>
        ))}
      </div>

      <div className="veil-top" />
      <StatusBar />
      {/* top-left user block */}
      <div style={{ position: 'absolute', top: 58, left: 12, right: 12, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar src={window.AV.pixel} size={40} badge="edit" />
          <span style={{ fontFamily: 'var(--font-jp)', fontWeight: 700, fontSize: 15, color: '#fff',
            textShadow: '0 1px 6px rgba(0,0,0,.8)' }}>あなた</span>
        </div>
        <IconButton name="menu" variant="simple" onClick={onMenu} />
      </div>

      {/* bottom hint + nearby search */}
      <div style={{ position: 'absolute', bottom: 36, left: 16, right: 16, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 9,
          padding: '10px 16px', borderRadius: 99, background: 'var(--glass-fill)',
          backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }}>
          <Icon name="explore" size={16} />
          <span style={{ fontFamily: 'var(--font-jp)', fontWeight: 500, fontSize: 12 }}>ピンをタップして世界を覗く</span>
        </div>
        <IconButton name="near" variant="color" size={55} onClick={() => onOpenStory('circle1')} />
      </div>
      <div className="home-indicator" />
    </div>
  );
}
window.UniverseScreen = UniverseScreen;
