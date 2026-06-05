/* Circle Timeline — bottom sheet: circle profile, members, map, story grid. */
function MemberStatus({ count, avatars }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex' }}>
        {avatars.map((a, i) => (
          <img key={i} src={a} alt="" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover',
            border: '1.5px solid #16131f', marginLeft: i ? -8 : 0, background: '#333' }} />
        ))}
      </div>
      <span style={{ fontFamily: 'var(--font-latin)', fontWeight: 600, fontSize: 11, color: 'rgba(255,255,255,.85)' }}>＋{count}人が参加中</span>
    </div>
  );
}

function CircleTimelineSheet({ circle, onClose, onOpenStory, onPost }) {
  const thumbs = [circle.cover, circle.stories[0].image, circle.stories[1].image,
    circle.stories[1].image, circle.cover, circle.stories[0].image];
  return (
    <div className="layer" style={{ zIndex: 80 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'var(--scrim-strong)',
        animation: 'fade .25s ease both' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '82%',
        background: 'linear-gradient(180deg,#1b1726,#0e0c16)', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        boxShadow: '0 -20px 60px rgba(0,0,0,.6)', animation: 'sheetUp .34s var(--ease-out) both',
        display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ width: 40, height: 5, borderRadius: 99, background: 'rgba(255,255,255,.3)',
          margin: '12px auto 0' }} />
        {/* header */}
        <div style={{ padding: '22px 20px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', padding: 2.5, background: 'var(--gradient-colorful)', flex: 'none' }}>
            <img src={circle.cover} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', background: '#333' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-jp)', fontWeight: 700, fontSize: 17, color: '#fff' }}>{circle.name}</div>
            <div style={{ fontFamily: 'var(--font-jp)', fontWeight: 400, fontSize: 11, color: 'rgba(255,255,255,.7)', marginBottom: 8 }}>{circle.desc}</div>
            <MemberStatus count={circle.members} avatars={[window.AV.sunny, window.AV.pixel, window.AV.star]} />
          </div>
          <IconButton name="close" variant="standart" size={40} onClick={onClose} />
        </div>
        {/* map preview */}
        <div style={{ margin: '0 20px 16px', height: 96, borderRadius: 14, position: 'relative', overflow: 'hidden',
          background: 'radial-gradient(120% 120% at 30% 20%, #20407a, #0a1530 70%)', border: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: .25,
            backgroundImage: 'linear-gradient(rgba(120,170,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(120,170,255,.4) 1px, transparent 1px)',
            backgroundSize: '22px 22px' }} />
          <div style={{ position: 'absolute', left: '46%', top: '44%', transform: 'translate(-50%,-50%)' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(76,175,80,.18)', border: '1px solid rgba(120,255,160,.5)' }} />
          </div>
          <div style={{ position: 'absolute', left: 14, bottom: 12 }}><StatusChip distance={circle.distance} unit={circle.unit} /></div>
        </div>
        {/* story grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 16px' }}>
          <div style={{ fontFamily: 'var(--font-latin)', fontWeight: 600, fontSize: 11, letterSpacing: '.12em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', marginBottom: 10 }}>ストーリー</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            {thumbs.map((t, i) => (
              <div key={i} onClick={() => onOpenStory(circle.stories[i % circle.stories.length].id)}
                style={{ aspectRatio: '134/200', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', background: '#222' }}>
                <img src={t} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>
        {/* CTA */}
        <div style={{ padding: '12px 20px 30px', display: 'flex', justifyContent: 'center',
          background: 'linear-gradient(0deg,#0e0c16 60%,transparent)' }}>
          <button className="cta" style={{ width: '100%' }} onClick={onPost}>ポストする</button>
        </div>
      </div>
    </div>
  );
}
window.CircleTimelineSheet = CircleTimelineSheet;
