/* Story Comment Sheet — bottom sheet over the Story Viewer: comment list + composer.
   Matches CircleTimelineSheet's dark-glass idiom; comments follow WdUserComment
   (name = hero / --text-1, body = --text-2, time = --text-3). */
const { useState: useStateC, useRef: useRefC } = React;

function CommentRow({ c, liked, onLike }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <Avatar src={c.avatar} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-jp)', fontWeight: 700, fontSize: 13, color: 'var(--text-1)' }}>{c.user}</span>
          <span style={{ fontFamily: 'var(--font-latin)', fontWeight: 400, fontSize: 10, color: 'var(--text-3)' }}>{c.time}</span>
        </div>
        <div style={{ fontFamily: 'var(--font-jp)', fontWeight: 400, fontSize: 13, lineHeight: 1.5,
          color: 'var(--text-2)', marginTop: 2, wordBreak: 'break-word' }}>{c.text}</div>
      </div>
      <button onClick={onLike} className="noselect"
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 3, padding: '2px 0', flex: 'none', minWidth: 28 }}>
        <Icon name="like" size={16} style={liked ? { filter: 'brightness(0) saturate(100%) invert(36%) sepia(82%) saturate(3000%) hue-rotate(312deg)' } : { opacity: .65 }} />
        <span style={{ fontFamily: 'var(--font-latin)', fontWeight: 600, fontSize: 10,
          color: liked ? 'var(--like)' : 'var(--text-3)' }}>{c.likes + (liked ? 1 : 0)}</span>
      </button>
    </div>
  );
}

function StoryCommentSheet({ story, onClose, onSend }) {
  const base = (window.COMMENTS[story.id] || window.COMMENTS.DEFAULT);
  const [list, setList] = useStateC(base);
  const [liked, setLiked] = useStateC({});
  const [draft, setDraft] = useStateC('');
  const scrollRef = useRefC(null);

  const toggleLike = (i) => setLiked((m) => ({ ...m, [i]: !m[i] }));
  const submit = () => {
    const t = draft.trim();
    if (!t) return;
    setList((l) => [...l, { user: 'あなた', avatar: window.AV.sunny, text: t, time: 'たった今', likes: 0 }]);
    setDraft('');
    requestAnimationFrame(() => { const s = scrollRef.current; if (s) s.scrollTop = s.scrollHeight; });
    onSend && onSend();
  };

  return (
    <div className="layer" style={{ zIndex: 80 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'var(--scrim-strong)',
        animation: 'fade .25s ease both' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '74%',
        background: 'linear-gradient(180deg,#1b1726,#0e0c16)', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        boxShadow: '0 -20px 60px rgba(0,0,0,.6)', animation: 'sheetUp .34s var(--ease-out) both',
        display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ width: 40, height: 5, borderRadius: 99, background: 'rgba(255,255,255,.3)', margin: '12px auto 0' }} />

        {/* header */}
        <div style={{ padding: '18px 20px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontFamily: 'var(--font-jp)', fontWeight: 700, fontSize: 17, color: '#fff' }}>コメント</div>
          <div style={{ fontFamily: 'var(--font-latin)', fontWeight: 600, fontSize: 13, color: 'var(--text-3)' }}>{list.length}</div>
          <div style={{ flex: 1 }} />
          <IconButton name="close" variant="standart" size={40} onClick={onClose} />
        </div>
        <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(255,255,255,.04), rgba(255,255,255,.14) 50%, rgba(255,255,255,.04))' }} />

        {/* list */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 20px',
          display: 'flex', flexDirection: 'column', gap: 18 }}>
          {list.map((c, i) => (
            <CommentRow key={i} c={c} liked={!!liked[i]} onLike={() => toggleLike(i)} />
          ))}
        </div>

        {/* composer */}
        <div style={{ padding: '10px 16px', paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'linear-gradient(0deg,#0e0c16 70%,transparent)',
          borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <Avatar src={window.AV.sunny} size={36} />
          <div className="field" style={{ flex: 1, height: 44, paddingRight: 6 }}>
            <input value={draft} onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
              placeholder="コメントを追加..." />
            <button onClick={submit} disabled={!draft.trim()} className="ibtn color"
              style={{ width: 34, height: 34, opacity: draft.trim() ? 1 : .4,
                transition: 'opacity .15s var(--ease-standard)' }}>
              <Icon name="next" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
window.StoryCommentSheet = StoryCommentSheet;
