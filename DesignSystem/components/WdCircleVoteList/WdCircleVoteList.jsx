const JP="'Noto Sans JP','Hiragino Sans',sans-serif";
const LAT="'Inter',system-ui,sans-serif";
const V={
scrim:{position:'absolute',inset:0,background:'rgba(0,0,0,.45)',display:'flex',alignItems:'flex-end',justifyContent:'center'},
sheet:{width:'100%',boxSizing:'border-box',maxHeight:'86%',display:'flex',flexDirection:'column',background:'#fff',borderTopLeftRadius:24,borderTopRightRadius:24,overflow:'hidden',boxShadow:'0 -8px 40px rgba(0,0,0,.28)',fontFamily:JP,color:'#08080b'},
grip:{width:40,height:4,borderRadius:9999,background:'rgba(8,8,11,.16)',margin:'10px auto 0'},
head:{display:'grid',gridTemplateColumns:'1fr 44px',alignItems:'start',gap:8,padding:'14px 20px 12px'},
title:{fontWeight:700,fontSize:18,lineHeight:1.35},
sub:{marginTop:5,fontSize:12,lineHeight:1.6,color:'rgba(8,8,11,.56)'},
close:{width:44,height:44,margin:'-6px -10px 0 0',display:'grid',placeItems:'center',border:0,background:'none',padding:0,cursor:'pointer'},
closeIcon:{width:16,height:16,display:'block',filter:'invert(1)',opacity:.5},
list:{margin:0,padding:'0 0 10px',listStyle:'none',overflowY:'auto'},
row:{display:'grid',gridTemplateColumns:'26px 1fr auto',alignItems:'center',gap:12,padding:'12px 20px',borderTop:'1px solid rgba(8,8,11,.08)',willChange:'transform'},
rank:{fontFamily:LAT,fontWeight:700,fontSize:14,fontVariantNumeric:'tabular-nums',color:'rgba(8,8,11,.4)',textAlign:'right'},
rank1:{fontFamily:LAT,fontWeight:700,fontSize:14,fontVariantNumeric:'tabular-nums',textAlign:'right',background:'linear-gradient(135deg,#fff0a6,#005f67 38%,#ff3e88 70%,#d0a052)',WebkitBackgroundClip:'text',backgroundClip:'text',color:'transparent'},
name:{minWidth:0,fontWeight:700,fontSize:15,lineHeight:1.4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'},
meta:{marginTop:3,fontFamily:LAT,fontSize:12,color:'rgba(8,8,11,.56)'},
btn:{minWidth:76,height:44,padding:'0 14px',display:'flex',alignItems:'center',justifyContent:'center',gap:7,borderRadius:9999,border:0,cursor:'pointer',background:'rgba(8,8,11,.06)',boxShadow:'inset 0 0 0 1px rgba(8,8,11,.08)',transition:'background .16s ease,box-shadow .16s ease'},
btnOn:{minWidth:76,height:44,padding:'0 14px',display:'flex',alignItems:'center',justifyContent:'center',gap:7,borderRadius:9999,border:0,cursor:'pointer',background:'#08080b',boxShadow:'none',transition:'background .16s ease,box-shadow .16s ease'},
icon:{width:18,height:18,display:'block',filter:'invert(1)',opacity:.5},
iconOn:{width:18,height:18,display:'block',opacity:1},
count:{fontFamily:LAT,fontWeight:600,fontSize:14,fontVariantNumeric:'tabular-nums',color:'rgba(8,8,11,.56)'},
countOn:{fontFamily:LAT,fontWeight:600,fontSize:14,fontVariantNumeric:'tabular-nums',color:'#fff'},
foot:{padding:'12px 20px 18px',borderTop:'1px solid rgba(8,8,11,.08)',fontSize:11,lineHeight:1.6,color:'rgba(8,8,11,.56)'}
};

export function WdCircleVoteList({
  candidates,circles,title='サークル名を投票',subtitle,note,
  showRank=true,iconBase='assets/icons',
  onVote,onClose,inline=false,style
}){
  const items=candidates||circles||[];
  const [votes,setVotes]=React.useState(()=>{
    const m={};items.forEach(c=>{m[c.id]={goods:c.goods||0,voted:!!c.voted}});return m;
  });
  const listRef=React.useRef(null);
  const posRef=React.useRef(new Map());

  // FLIP: 並び替えを1フレームで滑らかに見せる
  const capture=()=>{
    const el=listRef.current;if(!el)return;
    const m=new Map();
    el.querySelectorAll('[data-vote-row]').forEach(r=>m.set(r.dataset.voteRow,r.getBoundingClientRect().top));
    posRef.current=m;
  };
  React.useLayoutEffect(()=>{
    const el=listRef.current;if(!el||!posRef.current.size)return;
    el.querySelectorAll('[data-vote-row]').forEach(r=>{
      const prev=posRef.current.get(r.dataset.voteRow);if(prev==null)return;
      const dy=prev-r.getBoundingClientRect().top;
      if(!dy)return;
      r.style.transition='none';r.style.transform=`translateY(${dy}px)`;
      requestAnimationFrame(()=>{r.style.transition='transform .32s cubic-bezier(.2,.8,.2,1)';r.style.transform='translateY(0)'});
    });
    posRef.current=new Map();
  },[votes]);

  const tap=c=>{
    capture();
    setVotes(v=>{
      const cur=v[c.id]||{goods:0,voted:false};
      return {...v,[c.id]:{goods:cur.goods+(cur.voted?-1:1),voted:!cur.voted}};
    });
    onVote&&onVote(c);
  };

  const ordered=[...items].sort((a,b)=>{
    const d=(votes[b.id]?.goods||0)-(votes[a.id]?.goods||0);
    return d||String(a.name).localeCompare(String(b.name),'ja');
  });

  const sheet=(
    <div style={{...V.sheet,...(inline?{maxHeight:'100%',borderRadius:24}:null),...style}}>
      {!inline&&<div style={V.grip}></div>}
      <div style={V.head}>
        <div>
          <div style={V.title}>{title}</div>
          {subtitle&&<div style={V.sub}>{subtitle}</div>}
        </div>
        <button type="button" style={V.close} onClick={onClose} aria-label="閉じる">
          <img src={`${iconBase}/icon_close.png`} alt="" style={V.closeIcon}/>
        </button>
      </div>
      <ul style={V.list} ref={listRef}>
        {ordered.map((c,i)=>{
          const s=votes[c.id]||{goods:0,voted:false};
          return (
            <li key={c.id} data-vote-row={c.id} style={V.row}>
              {showRank&&<span style={i===0?V.rank1:V.rank}>{i+1}</span>}
              <div style={{minWidth:0}}>
                <div style={V.name}>{c.name}</div>
                {c.meta&&<div style={V.meta}>{c.meta}</div>}
              </div>
              <button type="button" style={s.voted?V.btnOn:V.btn} onClick={()=>tap(c)}
                aria-pressed={s.voted} aria-label={`${c.name} にグッド`}>
                <img src={`${iconBase}/icon_good.png`} alt="" style={s.voted?V.iconOn:V.icon}/>
                <span style={s.voted?V.countOn:V.count}>{s.goods}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {note&&<div style={V.foot}>{note}</div>}
    </div>
  );

  if(inline)return sheet;
  return <div style={V.scrim} onClick={e=>{if(e.target===e.currentTarget)onClose&&onClose()}}>{sheet}</div>;
}
