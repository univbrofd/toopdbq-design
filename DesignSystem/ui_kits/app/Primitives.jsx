/* Shared primitives for the Toopdbq UI kit. Exposed on window for cross-file use. */
const { useState, useRef, useEffect } = React;

const Icon = ({ name, size = 24, style }) => (
  <img src={window.ICONS + 'icon_' + name + '.png'} alt={name}
    style={{ width: size, height: size, objectFit: 'contain', ...style }} />
);

// Glass / colorful circular icon button. variant: simple | standart | color
function IconButton({ name, variant = 'standart', size = 47, badge, badgeColor, onClick, style }) {
  const cls = 'ibtn' + (variant === 'simple' ? ' simple' : '') + (variant === 'color' ? ' color' : '');
  return (
    <button className={cls} style={{ width: size, height: size, ...style }} onClick={onClick}>
      <Icon name={name} size={Math.round(size * 0.44)} />
      {badge && (
        <span className={'badge' + (badgeColor ? ' color' : '')}>
          <Icon name={badge} size={11} />
        </span>
      )}
    </button>
  );
}

// Labelled action (like / comment) used on the story side rail.
function ActionButton({ name, count, active, onClick }) {
  return (
    <div className="ibtn-lab noselect" onClick={onClick}>
      <button className="ibtn" style={{ width: 47, height: 47 }}>
        <Icon name={name} size={21} style={active ? { filter: 'brightness(0) saturate(100%) invert(36%) sepia(82%) saturate(3000%) hue-rotate(312deg)' } : null} />
      </button>
      <span className="lab" style={active ? { color: 'var(--like)' } : null}>{count}</span>
    </div>
  );
}

function StatusBar({ dark }) {
  const c = dark ? '#000' : '#fff';
  return (
    <div className="statusbar" style={{ color: c }}>
      <span>9:41</span>
      <div className="right">
        <svg width="18" height="12" viewBox="0 0 18 12" fill={c}><rect x="0" y="7" width="3" height="5" rx="1"/><rect x="5" y="4.5" width="3" height="7.5" rx="1"/><rect x="10" y="2" width="3" height="10" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
        <svg width="17" height="12" viewBox="0 0 17 12" fill={c}><path d="M8.5 2.5c2.1 0 4 .8 5.4 2.1l1.3-1.4A10 10 0 0 0 8.5.5 10 10 0 0 0 1.8 3.2l1.3 1.4A8 8 0 0 1 8.5 2.5Z"/><path d="M8.5 6c1 0 2 .4 2.7 1.1l1.3-1.4A6 6 0 0 0 8.5 4 6 6 0 0 0 4 5.7l1.3 1.4A4 4 0 0 1 8.5 6Z"/><circle cx="8.5" cy="9.8" r="1.8"/></svg>
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none"><rect x="1" y="1" width="21" height="10" rx="2.5" stroke={c} strokeOpacity="0.5"/><rect x="2.5" y="2.5" width="16" height="7" rx="1.5" fill={c}/><rect x="23" y="4" width="2" height="4" rx="1" fill={c} fillOpacity="0.5"/></svg>
      </div>
    </div>
  );
}

// distance status (pin + value + unit)
function StatusChip({ distance, unit }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
      <Icon name="spot" size={12} style={{ marginBottom: 2 }} />
      <span style={{ fontFamily: 'var(--font-latin)', fontWeight: 600, fontSize: 15, lineHeight: 1, textShadow: '0 0 6px #000' }}>{distance}</span>
      <span style={{ fontFamily: 'var(--font-latin)', fontWeight: 600, fontSize: 7, marginBottom: 1, opacity: .85 }}>{unit}</span>
    </div>
  );
}

// circle identity bar (footer)
function CircleBar({ circle, onClick }) {
  return (
    <div className="circle-bar noselect" onClick={onClick}>
      <img className="cover" src={circle.cover} alt="" />
      <div className="meta">
        <div className="nm">{circle.name}</div>
        <div className="ds">{circle.desc}</div>
      </div>
    </div>
  );
}

function Avatar({ src, size = 40, badge }) {
  return (
    <div className="avatar" style={{ width: size, height: size }}>
      {src ? <img src={src} alt="" /> : <div className="ph"><Icon name="person" size={size * 0.5} /></div>}
      {badge && <span className="b"><Icon name={badge} size={11} /></span>}
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <div className={'toggle noselect' + (on ? ' on' : '')} onClick={() => onChange(!on)}>
      <span className={'lab ' + (on ? 'on' : 'off')}>{on ? 'ON' : 'OFF'}</span>
      <span className="pill" />
    </div>
  );
}

Object.assign(window, { Icon, IconButton, ActionButton, StatusBar, StatusChip, CircleBar, Avatar, Toggle });
