/* @ds-bundle: {"format":3,"namespace":"ToopdbqDesignSystem_af3394","components":[],"sourceHashes":{"ui_kits/app/CircleTimelineSheet.jsx":"f49101667441","ui_kits/app/LoginScreen.jsx":"9bf3bfe3ed94","ui_kits/app/Primitives.jsx":"d9fd2cd95e62","ui_kits/app/StoryCommentSheet.jsx":"4d5bf6dc4d81","ui_kits/app/StoryViewerScreen.jsx":"f0505230016c","ui_kits/app/UniverseScreen.jsx":"0f93a858c42e","ui_kits/app/data.js":"d9bf056f27f7"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.ToopdbqDesignSystem_af3394 = window.ToopdbqDesignSystem_af3394 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// ui_kits/app/CircleTimelineSheet.jsx
try { (() => {
/* Circle Timeline — bottom sheet: circle profile, members, map, story grid. */
function MemberStatus({
  count,
  avatars
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex'
    }
  }, avatars.map((a, i) => /*#__PURE__*/React.createElement("img", {
    key: i,
    src: a,
    alt: "",
    style: {
      width: 22,
      height: 22,
      borderRadius: '50%',
      objectFit: 'cover',
      border: '1.5px solid #16131f',
      marginLeft: i ? -8 : 0,
      background: '#333'
    }
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-latin)',
      fontWeight: 600,
      fontSize: 11,
      color: 'rgba(255,255,255,.85)'
    }
  }, "\uFF0B", count, "\u4EBA\u304C\u53C2\u52A0\u4E2D"));
}
function CircleTimelineSheet({
  circle,
  onClose,
  onOpenStory,
  onPost
}) {
  const thumbs = [circle.cover, circle.stories[0].image, circle.stories[1].image, circle.stories[1].image, circle.cover, circle.stories[0].image];
  return /*#__PURE__*/React.createElement("div", {
    className: "layer",
    style: {
      zIndex: 80
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--scrim-strong)',
      animation: 'fade .25s ease both'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: '82%',
      background: 'linear-gradient(180deg,#1b1726,#0e0c16)',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      boxShadow: '0 -20px 60px rgba(0,0,0,.6)',
      animation: 'sheetUp .34s var(--ease-out) both',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 5,
      borderRadius: 99,
      background: 'rgba(255,255,255,.3)',
      margin: '12px auto 0'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '22px 20px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 64,
      height: 64,
      borderRadius: '50%',
      padding: 2.5,
      background: 'var(--gradient-colorful)',
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: circle.cover,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      objectFit: 'cover',
      background: '#333'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-jp)',
      fontWeight: 700,
      fontSize: 17,
      color: '#fff'
    }
  }, circle.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-jp)',
      fontWeight: 400,
      fontSize: 11,
      color: 'rgba(255,255,255,.7)',
      marginBottom: 8
    }
  }, circle.desc), /*#__PURE__*/React.createElement(MemberStatus, {
    count: circle.members,
    avatars: [window.AV.sunny, window.AV.pixel, window.AV.star]
  })), /*#__PURE__*/React.createElement(IconButton, {
    name: "close",
    variant: "standart",
    size: 40,
    onClick: onClose
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 20px 16px',
      height: 96,
      borderRadius: 14,
      position: 'relative',
      overflow: 'hidden',
      background: 'radial-gradient(120% 120% at 30% 20%, #20407a, #0a1530 70%)',
      border: '1px solid rgba(255,255,255,.08)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      opacity: .25,
      backgroundImage: 'linear-gradient(rgba(120,170,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(120,170,255,.4) 1px, transparent 1px)',
      backgroundSize: '22px 22px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '46%',
      top: '44%',
      transform: 'translate(-50%,-50%)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 60,
      height: 60,
      borderRadius: '50%',
      background: 'rgba(76,175,80,.18)',
      border: '1px solid rgba(120,255,160,.5)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 14,
      bottom: 12
    }
  }, /*#__PURE__*/React.createElement(StatusChip, {
    distance: circle.distance,
    unit: circle.unit
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '0 20px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-latin)',
      fontWeight: 600,
      fontSize: 11,
      letterSpacing: '.12em',
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,.5)',
      marginBottom: 10
    }
  }, "\u30B9\u30C8\u30FC\u30EA\u30FC"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 6
    }
  }, thumbs.map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    onClick: () => onOpenStory(circle.stories[i % circle.stories.length].id),
    style: {
      aspectRatio: '134/200',
      borderRadius: 8,
      overflow: 'hidden',
      cursor: 'pointer',
      background: '#222'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: t,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 20px 30px',
      display: 'flex',
      justifyContent: 'center',
      background: 'linear-gradient(0deg,#0e0c16 60%,transparent)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "cta",
    style: {
      width: '100%'
    },
    onClick: onPost
  }, "\u30DD\u30B9\u30C8\u3059\u308B"))));
}
window.CircleTimelineSheet = CircleTimelineSheet;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/CircleTimelineSheet.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/LoginScreen.jsx
try { (() => {
/* Login / onboarding — WdAuthCard over auth_background.png */
function LoginScreen({
  onLogin
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "layer fade-in",
    style: {
      background: '#000'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../../assets/images/auth_background.png",
    alt: "",
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      opacity: .5
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(rgba(10,8,18,.55),rgba(10,8,18,.82))'
    }
  }), /*#__PURE__*/React.createElement(StatusBar, null), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '50%',
      top: 117,
      transform: 'translateX(-50%)',
      width: 351,
      height: 640,
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 30px 70px rgba(0,0,0,.6)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../../assets/images/auth_background.png",
    alt: "",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.12) 38%, rgba(0,0,0,0.20) 62%, rgba(0,0,0,0.66) 100%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      padding: '36px 24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "noselect"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 32,
      lineHeight: '37px',
      color: '#fff',
      textShadow: '0 0 8px rgba(0,0,0,.9)'
    }
  }, "Toopdbq"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-jp)',
      fontWeight: 700,
      fontSize: 22,
      lineHeight: '37px',
      color: '#fff',
      textShadow: '0 0 8px rgba(0,0,0,.9)'
    }
  }, "\u3067\u65B0\u3057\u3044\u4E16\u754C\u3092", /*#__PURE__*/React.createElement("br", null), "\u898B\u3064\u3051\u3066\u304F\u3060\u3055\u3044")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      padding: '0 8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "login-btn google",
    onClick: onLogin
  }, /*#__PURE__*/React.createElement("div", {
    className: "inner"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../../assets/images/logo_google.png",
    alt: ""
  }), "Google\u30A2\u30AB\u30A6\u30F3\u30C8\u3067\u59CB\u3081\u308B")), /*#__PURE__*/React.createElement("div", {
    className: "login-btn apple",
    onClick: onLogin
  }, /*#__PURE__*/React.createElement("div", {
    className: "inner",
    style: {
      color: '#141414'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../../assets/images/logo_apple.png",
    alt: ""
  }), "Apple\u30A2\u30AB\u30A6\u30F3\u30C8\u3067\u59CB\u3081\u308B"))))), /*#__PURE__*/React.createElement("div", {
    className: "home-indicator"
  }));
}
window.LoginScreen = LoginScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/LoginScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Primitives.jsx
try { (() => {
/* Shared primitives for the Toopdbq UI kit. Exposed on window for cross-file use. */
const {
  useState,
  useRef,
  useEffect
} = React;
const Icon = ({
  name,
  size = 24,
  style
}) => /*#__PURE__*/React.createElement("img", {
  src: window.ICONS + 'icon_' + name + '.png',
  alt: name,
  style: {
    width: size,
    height: size,
    objectFit: 'contain',
    ...style
  }
});

// Glass / colorful circular icon button. variant: simple | standart | color
// badge ⇒ バッジは常に glass（カラーなし）。color + badge = badgeColor variant.
function IconButton({
  name,
  variant = 'standart',
  size = 47,
  badge,
  onClick,
  style
}) {
  const cls = 'ibtn' + (variant === 'simple' ? ' simple' : '') + (variant === 'color' ? ' color' : '') + (badge ? ' has-badge' : '');
  return /*#__PURE__*/React.createElement("button", {
    className: cls,
    style: {
      width: size,
      height: size,
      ...style
    },
    onClick: onClick
  }, /*#__PURE__*/React.createElement(Icon, {
    name: name,
    size: Math.round(size * 0.44)
  }), badge && /*#__PURE__*/React.createElement("span", {
    className: "badge"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: badge,
    size: 11
  })));
}

// Labelled action (like / comment) used on the story side rail.
function ActionButton({
  name,
  count,
  active,
  onClick
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ibtn-lab noselect",
    onClick: onClick
  }, /*#__PURE__*/React.createElement("button", {
    className: "ibtn",
    style: {
      width: 47,
      height: 47
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: name,
    size: 21,
    style: active ? {
      filter: 'brightness(0) saturate(100%) invert(36%) sepia(82%) saturate(3000%) hue-rotate(312deg)'
    } : null
  })), /*#__PURE__*/React.createElement("span", {
    className: "lab",
    style: active ? {
      color: 'var(--like)'
    } : null
  }, count));
}
function StatusBar({
  dark
}) {
  const c = dark ? '#000' : '#fff';
  return /*#__PURE__*/React.createElement("div", {
    className: "statusbar",
    style: {
      color: c
    }
  }, /*#__PURE__*/React.createElement("span", null, "9:41"), /*#__PURE__*/React.createElement("div", {
    className: "right"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "12",
    viewBox: "0 0 18 12",
    fill: c
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "7",
    width: "3",
    height: "5",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "5",
    y: "4.5",
    width: "3",
    height: "7.5",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "10",
    y: "2",
    width: "3",
    height: "10",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "15",
    y: "0",
    width: "3",
    height: "12",
    rx: "1"
  })), /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "12",
    viewBox: "0 0 17 12",
    fill: c
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8.5 2.5c2.1 0 4 .8 5.4 2.1l1.3-1.4A10 10 0 0 0 8.5.5 10 10 0 0 0 1.8 3.2l1.3 1.4A8 8 0 0 1 8.5 2.5Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.5 6c1 0 2 .4 2.7 1.1l1.3-1.4A6 6 0 0 0 8.5 4 6 6 0 0 0 4 5.7l1.3 1.4A4 4 0 0 1 8.5 6Z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8.5",
    cy: "9.8",
    r: "1.8"
  })), /*#__PURE__*/React.createElement("svg", {
    width: "26",
    height: "12",
    viewBox: "0 0 26 12",
    fill: "none"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "1",
    y: "1",
    width: "21",
    height: "10",
    rx: "2.5",
    stroke: c,
    strokeOpacity: "0.5"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "2.5",
    y: "2.5",
    width: "16",
    height: "7",
    rx: "1.5",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "23",
    y: "4",
    width: "2",
    height: "4",
    rx: "1",
    fill: c,
    fillOpacity: "0.5"
  }))));
}

// distance status (pin + value + unit)
function StatusChip({
  distance,
  unit
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 1
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "spot",
    size: 12,
    style: {
      marginBottom: 2
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-latin)',
      fontWeight: 600,
      fontSize: 15,
      lineHeight: 1,
      textShadow: '0 0 6px #000'
    }
  }, distance), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-latin)',
      fontWeight: 600,
      fontSize: 7,
      marginBottom: 1,
      opacity: .85
    }
  }, unit));
}

// circle identity bar (footer)
function CircleBar({
  circle,
  onClick
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "circle-bar noselect",
    onClick: onClick
  }, /*#__PURE__*/React.createElement("img", {
    className: "cover",
    src: circle.cover,
    alt: ""
  }), /*#__PURE__*/React.createElement("div", {
    className: "meta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nm"
  }, circle.name), /*#__PURE__*/React.createElement("div", {
    className: "ds"
  }, circle.desc)));
}
function Avatar({
  src,
  size = 40,
  badge
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "avatar",
    style: {
      width: size,
      height: size
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: ""
  }) : /*#__PURE__*/React.createElement("div", {
    className: "ph"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "person",
    size: size * 0.5
  })), badge && /*#__PURE__*/React.createElement("span", {
    className: "b"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: badge,
    size: 11
  })));
}
function Toggle({
  on,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: 'toggle noselect' + (on ? ' on' : ''),
    onClick: () => onChange(!on)
  }, /*#__PURE__*/React.createElement("span", {
    className: 'lab ' + (on ? 'on' : 'off')
  }, on ? 'ON' : 'OFF'), /*#__PURE__*/React.createElement("span", {
    className: "pill"
  }));
}
Object.assign(window, {
  Icon,
  IconButton,
  ActionButton,
  StatusBar,
  StatusChip,
  CircleBar,
  Avatar,
  Toggle
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Primitives.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/StoryCommentSheet.jsx
try { (() => {
/* Story Comment Sheet — bottom sheet over the Story Viewer: comment list + composer.
   Matches CircleTimelineSheet's dark-glass idiom; comments follow WdUserComment
   (name = hero / --text-1, body = --text-2, time = --text-3). */
const {
  useState: useStateC,
  useRef: useRefC
} = React;
function CommentRow({
  c,
  liked,
  onLike
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    src: c.avatar,
    size: 36
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-jp)',
      fontWeight: 700,
      fontSize: 13,
      color: 'var(--text-1)'
    }
  }, c.user), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-latin)',
      fontWeight: 400,
      fontSize: 10,
      color: 'var(--text-3)'
    }
  }, c.time)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-jp)',
      fontWeight: 400,
      fontSize: 13,
      lineHeight: 1.5,
      color: 'var(--text-2)',
      marginTop: 2,
      wordBreak: 'break-word'
    }
  }, c.text)), /*#__PURE__*/React.createElement("button", {
    onClick: onLike,
    className: "noselect",
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 3,
      padding: '2px 0',
      flex: 'none',
      minWidth: 28
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "like",
    size: 16,
    style: liked ? {
      filter: 'brightness(0) saturate(100%) invert(36%) sepia(82%) saturate(3000%) hue-rotate(312deg)'
    } : {
      opacity: .65
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-latin)',
      fontWeight: 600,
      fontSize: 10,
      color: liked ? 'var(--like)' : 'var(--text-3)'
    }
  }, c.likes + (liked ? 1 : 0))));
}
function StoryCommentSheet({
  story,
  onClose,
  onSend
}) {
  const base = window.COMMENTS[story.id] || window.COMMENTS.DEFAULT;
  const [list, setList] = useStateC(base);
  const [liked, setLiked] = useStateC({});
  const [draft, setDraft] = useStateC('');
  const scrollRef = useRefC(null);
  const toggleLike = i => setLiked(m => ({
    ...m,
    [i]: !m[i]
  }));
  const submit = () => {
    const t = draft.trim();
    if (!t) return;
    setList(l => [...l, {
      user: 'あなた',
      avatar: window.AV.sunny,
      text: t,
      time: 'たった今',
      likes: 0
    }]);
    setDraft('');
    requestAnimationFrame(() => {
      const s = scrollRef.current;
      if (s) s.scrollTop = s.scrollHeight;
    });
    onSend && onSend();
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "layer",
    style: {
      zIndex: 80
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--scrim-strong)',
      animation: 'fade .25s ease both'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: '74%',
      background: 'linear-gradient(180deg,#1b1726,#0e0c16)',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      boxShadow: '0 -20px 60px rgba(0,0,0,.6)',
      animation: 'sheetUp .34s var(--ease-out) both',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 5,
      borderRadius: 99,
      background: 'rgba(255,255,255,.3)',
      margin: '12px auto 0'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 20px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-jp)',
      fontWeight: 700,
      fontSize: 17,
      color: '#fff'
    }
  }, "\u30B3\u30E1\u30F3\u30C8"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-latin)',
      fontWeight: 600,
      fontSize: 13,
      color: 'var(--text-3)'
    }
  }, list.length), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(IconButton, {
    name: "close",
    variant: "standart",
    size: 40,
    onClick: onClose
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'linear-gradient(90deg, rgba(255,255,255,.04), rgba(255,255,255,.14) 50%, rgba(255,255,255,.04))'
    }
  }), /*#__PURE__*/React.createElement("div", {
    ref: scrollRef,
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, list.map((c, i) => /*#__PURE__*/React.createElement(CommentRow, {
    key: i,
    c: c,
    liked: !!liked[i],
    onLike: () => toggleLike(i)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 16px',
      paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: 'linear-gradient(0deg,#0e0c16 70%,transparent)',
      borderTop: '1px solid rgba(255,255,255,.08)'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    src: window.AV.sunny,
    size: 36
  }), /*#__PURE__*/React.createElement("div", {
    className: "field",
    style: {
      flex: 1,
      height: 44,
      paddingRight: 6
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: draft,
    onChange: e => setDraft(e.target.value),
    onKeyDown: e => {
      if (e.key === 'Enter') submit();
    },
    placeholder: "\u30B3\u30E1\u30F3\u30C8\u3092\u8FFD\u52A0..."
  }), /*#__PURE__*/React.createElement("button", {
    onClick: submit,
    disabled: !draft.trim(),
    className: "ibtn color",
    style: {
      width: 34,
      height: 34,
      opacity: draft.trim() ? 1 : .4,
      transition: 'opacity .15s var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "next",
    size: 16
  }))))));
}
window.StoryCommentSheet = StoryCommentSheet;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/StoryCommentSheet.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/StoryViewerScreen.jsx
try { (() => {
/* Story Viewer — full-screen story browser with glass overlay UI. */
const {
  useState: useStateS
} = React;
function ProgressBar({
  segments,
  activeFill
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4
    }
  }, Array.from({
    length: segments
  }).map((_, i) => {
    const filled = i < activeFill;
    const active = i === activeFill;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        flex: 1,
        height: 3,
        borderRadius: 99,
        background: 'rgba(255,255,255,.3)',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        borderRadius: 99,
        background: 'rgba(255,255,255,.85)',
        width: filled ? '100%' : active ? '55%' : '0%',
        transition: 'width .4s var(--ease-out)'
      }
    }));
  }));
}
function StoryViewerScreen({
  flat,
  startIndex,
  onClose,
  onOpenTimeline,
  onOpenComments,
  onPost
}) {
  const [idx, setIdx] = useStateS(startIndex);
  const [liked, setLiked] = useStateS({});
  const cur = flat[idx];
  const circle = cur.circle;
  const isLiked = !!liked[cur.id];
  const go = d => {
    const n = idx + d;
    if (n >= 0 && n < flat.length) setIdx(n);else if (n >= flat.length) onClose();
  };
  const toggleLike = () => setLiked(m => ({
    ...m,
    [cur.id]: !m[cur.id]
  }));
  return /*#__PURE__*/React.createElement("div", {
    className: "layer",
    style: {
      background: '#000'
    }
  }, /*#__PURE__*/React.createElement("img", {
    key: cur.id,
    src: cur.image,
    alt: "",
    className: "fade-in",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      background: 'linear-gradient(135deg,#3a2a52,#11131f)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    onClick: () => go(-1),
    style: {
      position: 'absolute',
      top: 110,
      bottom: 220,
      left: 0,
      width: '32%',
      zIndex: 20
    }
  }), /*#__PURE__*/React.createElement("div", {
    onClick: () => go(1),
    style: {
      position: 'absolute',
      top: 110,
      bottom: 220,
      right: 0,
      width: '32%',
      zIndex: 20
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "veil-top",
    style: {
      height: 200
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "veil-bottom"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 50,
      left: 14,
      right: 14,
      zIndex: 40
    }
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    segments: cur.segments,
    activeFill: Math.ceil(cur.segments / 2) - 1
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11
    },
    className: "noselect"
  }, /*#__PURE__*/React.createElement(Avatar, {
    src: cur.avatar,
    size: 42
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-latin)',
      fontWeight: 600,
      fontSize: 14,
      color: '#fff',
      textShadow: '0 1px 4px rgba(0,0,0,.8)'
    }
  }, cur.user), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-latin)',
      fontWeight: 400,
      fontSize: 11,
      color: 'rgba(255,255,255,.8)',
      textShadow: '0 1px 4px rgba(0,0,0,.8)'
    }
  }, cur.time))), /*#__PURE__*/React.createElement(IconButton, {
    name: "close",
    variant: "simple",
    onClick: onClose
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: 12,
      bottom: 210,
      zIndex: 40,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(ActionButton, {
    name: "like",
    count: cur.likes + (isLiked ? 1 : 0),
    active: isLiked,
    onClick: toggleLike
  }), /*#__PURE__*/React.createElement(ActionButton, {
    name: "comment",
    count: cur.comments,
    onClick: () => onOpenComments(cur)
  }), /*#__PURE__*/React.createElement("div", {
    className: "ibtn-lab noselect"
  }, /*#__PURE__*/React.createElement("button", {
    className: "ibtn"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "share",
    size: 20
  })), /*#__PURE__*/React.createElement("span", {
    className: "lab"
  }, "\u5171\u6709"))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 32,
      left: 8,
      right: 8,
      zIndex: 40
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginBottom: 14,
      paddingRight: 1
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    name: "camera",
    variant: "color",
    size: 56,
    badge: "add",
    onClick: onPost
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(CircleBar, {
    circle: circle,
    onClick: () => onOpenTimeline(circle)
  }), /*#__PURE__*/React.createElement(IconButton, {
    name: "search",
    size: 55,
    badge: "camera",
    onClick: onClose
  }))), /*#__PURE__*/React.createElement("div", {
    className: "home-indicator"
  }));
}
window.StoryViewerScreen = StoryViewerScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/StoryViewerScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/UniverseScreen.jsx
try { (() => {
/* Universe — 3D-ish globe of story pins. Tap a pin → Hero into the Story Viewer. */
const {
  useMemo: useMemoU
} = React;
function Starfield() {
  const stars = useMemoU(() => Array.from({
    length: 70
  }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    s: Math.random() * 1.8 + 0.4,
    o: Math.random() * 0.7 + 0.3,
    d: Math.random() * 3
  })), []);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      overflow: 'hidden'
    }
  }, stars.map((st, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      position: 'absolute',
      left: st.x + '%',
      top: st.y + '%',
      width: st.s,
      height: st.s,
      borderRadius: '50%',
      background: '#fff',
      opacity: st.o,
      boxShadow: '0 0 ' + st.s * 2 + 'px #fff',
      animation: `twinkle 3.5s ${st.d}s ease-in-out infinite`
    }
  })));
}
function Pin({
  x,
  y,
  avatar,
  main,
  onClick
}) {
  const size = main ? 58 : 40;
  return /*#__PURE__*/React.createElement("div", {
    className: "noselect",
    onClick: onClick,
    style: {
      position: 'absolute',
      left: x + '%',
      top: y + '%',
      transform: 'translate(-50%,-50%)',
      cursor: 'pointer',
      zIndex: main ? 5 : 3
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: size,
      height: size,
      animation: `floaty ${main ? 4 : 5}s ease-in-out infinite`
    }
  }, main && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: -7,
      borderRadius: '50%',
      background: 'var(--gradient-colorful)',
      filter: 'blur(7px)',
      opacity: .9
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: '50%',
      padding: main ? 2.5 : 1.5,
      background: main ? 'var(--gradient-colorful)' : 'linear-gradient(135deg,#211c1c,rgba(255,255,255,.64))'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: avatar,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      objectFit: 'cover',
      background: '#333',
      display: 'block'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: -5,
      left: '50%',
      transform: 'translateX(-50%) rotate(45deg)',
      width: 9,
      height: 9,
      background: main ? '#ff3e88' : 'rgba(255,255,255,.64)'
    }
  })));
}
function UniverseScreen({
  onOpenStory,
  onMenu
}) {
  const data = window.TOOPDATA;
  return /*#__PURE__*/React.createElement("div", {
    className: "layer fade-in",
    style: {
      background: 'radial-gradient(130% 110% at 50% 38%, #1a2546 0%, #0a0c1c 45%, #05060d 100%)'
    }
  }, /*#__PURE__*/React.createElement(Starfield, null), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '50%',
      top: '46%',
      transform: 'translate(-50%,-50%)',
      width: 360,
      height: 360
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: -40,
      borderRadius: '50%',
      background: 'radial-gradient(circle at 50% 50%, rgba(80,130,220,.35), transparent 62%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: '50%',
      overflow: 'hidden',
      background: 'radial-gradient(circle at 36% 32%, #2e5aa8 0%, #19386f 34%, #0c1c3e 64%, #060d22 100%)',
      boxShadow: 'inset -28px -24px 70px rgba(0,0,0,.75), inset 18px 14px 50px rgba(120,170,255,.25), 0 0 60px rgba(60,110,210,.35)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '-25%',
      left: '-25%',
      width: '150%',
      height: '150%',
      background: 'radial-gradient(40px 30px at 30% 40%, rgba(70,150,120,.5), transparent 60%), radial-gradient(60px 40px at 62% 55%, rgba(60,140,110,.45), transparent 60%), radial-gradient(34px 30px at 50% 72%, rgba(80,160,130,.4), transparent 60%), radial-gradient(48px 34px at 74% 30%, rgba(60,130,110,.4), transparent 60%)',
      animation: 'spin 40s linear infinite',
      opacity: .9
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '12%',
      left: '20%',
      width: '34%',
      height: '26%',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255,255,255,.4), transparent 70%)',
      filter: 'blur(6px)'
    }
  })), data.map(c => /*#__PURE__*/React.createElement(Pin, {
    key: c.id,
    x: c.pin.x,
    y: c.pin.y,
    avatar: c.stories[0].avatar,
    main: c.pin.role === 'main',
    onClick: () => onOpenStory(c.id)
  })), window.EXTRA_PINS.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      position: 'absolute',
      left: p.x + '%',
      top: p.y + '%',
      transform: 'translate(-50%,-50%)',
      width: 22,
      height: 22,
      borderRadius: '50%',
      zIndex: 2,
      padding: 1.2,
      background: 'linear-gradient(135deg,#211c1c,rgba(255,255,255,.5))',
      animation: `floaty ${5 + i * 0.4}s ease-in-out infinite`,
      opacity: .8
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: p.avatar,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      objectFit: 'cover',
      background: '#333'
    }
  })))), /*#__PURE__*/React.createElement("div", {
    className: "veil-top"
  }), /*#__PURE__*/React.createElement(StatusBar, null), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 58,
      left: 12,
      right: 12,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    src: window.AV.pixel,
    size: 40,
    badge: "edit"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-jp)',
      fontWeight: 700,
      fontSize: 15,
      color: '#fff',
      textShadow: '0 1px 6px rgba(0,0,0,.8)'
    }
  }, "\u3042\u306A\u305F")), /*#__PURE__*/React.createElement(IconButton, {
    name: "menu",
    variant: "simple",
    onClick: onMenu
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 36,
      left: 16,
      right: 16,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      padding: '10px 16px',
      borderRadius: 99,
      background: 'var(--glass-fill)',
      backdropFilter: 'blur(2px)',
      WebkitBackdropFilter: 'blur(2px)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "explore",
    size: 16
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-jp)',
      fontWeight: 500,
      fontSize: 12
    }
  }, "\u30D4\u30F3\u3092\u30BF\u30C3\u30D7\u3057\u3066\u4E16\u754C\u3092\u8997\u304F")), /*#__PURE__*/React.createElement(IconButton, {
    name: "near",
    variant: "color",
    size: 55,
    onClick: () => onOpenStory('circle1')
  })), /*#__PURE__*/React.createElement("div", {
    className: "home-indicator"
  }));
}
window.UniverseScreen = UniverseScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/UniverseScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/data.js
try { (() => {
/* Sample content — lifted from lib/component/constants/Sample*Data.dart.
   Only midjourney.com CDN images are used (verified to load); each photo also
   sits on a gradient fallback so the kit never shows a broken image. */
(function () {
  const IMG = {
    a: '../../../assets/images/reel/reel00012.jpg',
    b: '../../../assets/images/sample_3d.png',
    c: '../../../assets/images/reel/reel00006.jpg',
    d: '../../../assets/images/sample_photo.png'
  };
  const AV = {
    sunny: '../../../assets/images/user/user00003.jpg',
    pixel: '../../../assets/images/user/user00002.jpg',
    star: '../../../assets/images/user/user00007.jpg'
  };
  window.ICONS = '../../../assets/icons/';
  window.IMG = IMG;
  window.AV = AV;

  // Three location circles; each holds a vertical stack of users' stories.
  window.TOOPDATA = [{
    id: 'circle1',
    name: '渋谷コミュニティ',
    desc: '渋谷駅周辺のコミュニティ',
    cover: IMG.a,
    members: 128,
    distance: '10.0',
    unit: 'm',
    online: true,
    pin: {
      x: 41,
      y: 47,
      role: 'main'
    },
    stories: [{
      id: 's1',
      user: 'SunnyVi',
      avatar: AV.sunny,
      image: IMG.a,
      time: '2時間前',
      likes: 24,
      comments: 2,
      segments: 3
    }, {
      id: 's2',
      user: 'Kawaii',
      avatar: AV.pixel,
      image: IMG.b,
      time: '4時間前',
      likes: 58,
      comments: 7,
      segments: 2
    }]
  }, {
    id: 'circle2',
    name: '新宿グループ',
    desc: '新宿エリアの交流グループ',
    cover: IMG.b,
    members: 86,
    distance: '1.2',
    unit: 'km',
    online: true,
    pin: {
      x: 63,
      y: 33,
      role: 'sub'
    },
    stories: [{
      id: 's3',
      user: 'Dreamy',
      avatar: AV.star,
      image: IMG.c,
      time: '1時間前',
      likes: 41,
      comments: 4,
      segments: 2
    }, {
      id: 's4',
      user: 'foodie',
      avatar: AV.sunny,
      image: IMG.d,
      time: '3時間前',
      likes: 12,
      comments: 1,
      segments: 4
    }]
  }, {
    id: 'circle3',
    name: '原宿コミュニティ',
    desc: '原宿・表参道周辺のコミュニティ',
    cover: IMG.c,
    members: 203,
    distance: '5.4',
    unit: 'km',
    online: false,
    pin: {
      x: 30,
      y: 64,
      role: 'sub'
    },
    stories: [{
      id: 's5',
      user: 'Pixel',
      avatar: AV.pixel,
      image: IMG.b,
      time: '30分前',
      likes: 76,
      comments: 9,
      segments: 3
    }, {
      id: 's6',
      user: 'Starry',
      avatar: AV.star,
      image: IMG.a,
      time: '5時間前',
      likes: 33,
      comments: 3,
      segments: 1
    }]
  }];

  // Comment threads per story id (falls back to DEFAULT for unlisted stories).
  window.COMMENTS = {
    s1: [{
      user: 'Kawaii',
      avatar: AV.pixel,
      text: 'この景色すごく好き！どこで撮ったの？',
      time: '1時間前',
      likes: 4
    }, {
      user: 'Dreamy',
      avatar: AV.star,
      text: '渋谷の夜って最高だよね🌃',
      time: '52分前',
      likes: 1
    }],
    s2: [{
      user: 'SunnyVi',
      avatar: AV.sunny,
      text: 'これは保存した。次行くとき教えて！',
      time: '3時間前',
      likes: 9
    }, {
      user: 'foodie',
      avatar: AV.sunny,
      text: '色味がきれい',
      time: '2時間前',
      likes: 2
    }, {
      user: 'Pixel',
      avatar: AV.pixel,
      text: 'いいね〜🔥',
      time: '1時間前',
      likes: 0
    }],
    DEFAULT: [{
      user: 'Starry',
      avatar: AV.star,
      text: 'すてき！',
      time: '40分前',
      likes: 3
    }, {
      user: 'Kawaii',
      avatar: AV.pixel,
      text: 'また近くに来たら寄ってみる',
      time: '20分前',
      likes: 0
    }]
  };

  // extra floating pins (no story) to populate the globe
  window.EXTRA_PINS = [{
    x: 52,
    y: 22,
    avatar: AV.star
  }, {
    x: 73,
    y: 58,
    avatar: AV.pixel
  }, {
    x: 20,
    y: 35,
    avatar: AV.sunny
  }, {
    x: 48,
    y: 72,
    avatar: AV.pixel
  }, {
    x: 80,
    y: 41,
    avatar: AV.sunny
  }];
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/data.js", error: String((e && e.message) || e) }); }

})();
