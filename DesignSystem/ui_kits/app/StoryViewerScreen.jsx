/* Story Viewer — full-screen story browser with glass overlay UI. */
const { useState: useStateS } = React;

function ProgressBar({ segments, activeFill }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {Array.from({ length: segments }).map((_, i) => {
        const filled = i < activeFill;
        const active = i === activeFill;
        return (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: 'rgba(255,255,255,.3)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 99, background: 'rgba(255,255,255,.85)',
              width: filled ? '100%' : (active ? '55%' : '0%'), transition: 'width .4s var(--ease-out)' }} />
          </div>
        );
      })}
    </div>
  );
}

function StoryViewerScreen({ flat, startIndex, onClose, onOpenTimeline, onOpenComments, onPost }) {
  const [idx, setIdx] = useStateS(startIndex);
  const [liked, setLiked] = useStateS({});
  const cur = flat[idx];
  const circle = cur.circle;
  const isLiked = !!liked[cur.id];

  const go = (d) => { const n = idx + d; if (n >= 0 && n < flat.length) setIdx(n); else if (n >= flat.length) onClose(); };
  const toggleLike = () => setLiked((m) => ({ ...m, [cur.id]: !m[cur.id] }));

  return (
    <div className="layer" style={{ background: '#000' }}>
      {/* story image */}
      <img key={cur.id} src={cur.image} alt="" className="fade-in"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          background: 'linear-gradient(135deg,#3a2a52,#11131f)' }} />

      {/* tap zones */}
      <div onClick={() => go(-1)} style={{ position: 'absolute', top: 110, bottom: 220, left: 0, width: '32%', zIndex: 20 }} />
      <div onClick={() => go(1)} style={{ position: 'absolute', top: 110, bottom: 220, right: 0, width: '32%', zIndex: 20 }} />

      <div className="veil-top" style={{ height: 200 }} />
      <div className="veil-bottom" />

      {/* header: progress + user bar + close */}
      <div style={{ position: 'absolute', top: 50, left: 14, right: 14, zIndex: 40 }}>
        <ProgressBar segments={cur.segments} activeFill={Math.ceil(cur.segments / 2) - 1} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }} className="noselect">
            <Avatar src={cur.avatar} size={42} />
            <div>
              <div style={{ fontFamily: 'var(--font-latin)', fontWeight: 600, fontSize: 14, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,.8)' }}>{cur.user}</div>
              <div style={{ fontFamily: 'var(--font-latin)', fontWeight: 400, fontSize: 11, color: 'rgba(255,255,255,.8)', textShadow: '0 1px 4px rgba(0,0,0,.8)' }}>{cur.time}</div>
            </div>
          </div>
          <IconButton name="close" variant="simple" onClick={onClose} />
        </div>
      </div>

      {/* side rail */}
      <div style={{ position: 'absolute', right: 12, bottom: 210, zIndex: 40,
        display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
        <ActionButton name="like" count={cur.likes + (isLiked ? 1 : 0)} active={isLiked} onClick={toggleLike} />
        <ActionButton name="comment" count={cur.comments} onClick={onOpenComments} />
        <div className="ibtn-lab noselect"><button className="ibtn"><Icon name="share" size={20} /></button><span className="lab">共有</span></div>
      </div>

      {/* footer */}
      <div style={{ position: 'absolute', bottom: 32, left: 8, right: 8, zIndex: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14, paddingRight: 1 }}>
          <IconButton name="camera" variant="color" size={56} badge="add" badgeColor onClick={onPost} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CircleBar circle={circle} onClick={() => onOpenTimeline(circle)} />
          <IconButton name="search" size={55} badge="camera" onClick={onClose} />
        </div>
      </div>
      <div className="home-indicator" />
    </div>
  );
}
window.StoryViewerScreen = StoryViewerScreen;
