const S={
row:{display:'grid',gridTemplateColumns:'44px 1fr',gap:12,padding:'20px 24px',borderBottom:'1px solid rgba(8,8,11,.08)',fontFamily:"'Noto Sans JP','Hiragino Sans',sans-serif",color:'#08080b',background:'#ffffff'},
avatar:{width:44,height:44,borderRadius:9999,objectFit:'cover',display:'block'},
col:{minWidth:0,display:'flex',flexDirection:'column',gap:10},
head:{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'},
name:{fontWeight:700,fontSize:15,lineHeight:1.3},
meta:{fontFamily:"'Inter',system-ui,sans-serif",fontSize:13,color:'rgba(8,8,11,.56)'},
body:{margin:0,fontSize:15,lineHeight:1.75,textWrap:'pretty'},
mediaOne:{borderRadius:16,overflow:'hidden',border:'1px solid rgba(8,8,11,.08)'},
mediaTwo:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4,borderRadius:16,overflow:'hidden',border:'1px solid rgba(8,8,11,.08)'},
actions:{display:'flex',alignItems:'center',gap:32,paddingTop:2},
action:{display:'flex',alignItems:'center',gap:8,background:'none',border:0,padding:0,cursor:'pointer',minHeight:44},
actionIcon:{width:18,height:18,filter:'invert(1)',opacity:.5,display:'block'},
likeIcon:{width:18,height:18,display:'block',filter:'invert(29%) sepia(93%) saturate(4000%) hue-rotate(320deg) brightness(102%)'},
count:{fontFamily:"'Inter',system-ui,sans-serif",fontSize:13,color:'rgba(8,8,11,.56)'},
countOn:{fontFamily:"'Inter',system-ui,sans-serif",fontWeight:600,fontSize:13,color:'#ff3e88'}
};

export function WdTimelinePost({
  avatar,name,handle,time,body,media=[],
  comments=0,likes=0,liked=false,shareLabel='共有',
  iconBase='assets/icons',onComment,onLike,onShare,style
}){
  const ic=n=>`${iconBase}/${n}.png`;
  const pics=(media||[]).slice(0,2);
  return (
    <article style={{...S.row,...style}}>
      <img src={avatar} alt="" style={S.avatar}/>
      <div style={S.col}>
        <div style={S.head}>
          <span style={S.name}>{name}</span>
          <span style={S.meta}>{[handle,time].filter(Boolean).join(' · ')}</span>
        </div>
        {body&&<p style={S.body}>{body}</p>}
        {pics.length===1&&<div style={S.mediaOne}><img src={pics[0]} alt="" style={{width:'100%',height:320,objectFit:'cover',display:'block'}}/></div>}
        {pics.length===2&&<div style={S.mediaTwo}>{pics.map((p,i)=><img key={i} src={p} alt="" style={{width:'100%',height:220,objectFit:'cover',display:'block'}}/>)}</div>}
        <div style={S.actions}>
          <button type="button" style={S.action} onClick={onComment}>
            <img src={ic('icon_comment')} alt="" style={S.actionIcon}/><span style={S.count}>{comments}</span>
          </button>
          <button type="button" style={S.action} onClick={onLike}>
            <img src={ic('icon_like')} alt="" style={liked?S.likeIcon:S.actionIcon}/>
            <span style={liked?S.countOn:S.count}>{likes}</span>
          </button>
          <button type="button" style={S.action} onClick={onShare}>
            <img src={ic('icon_share')} alt="" style={S.actionIcon}/><span style={S.count}>{shareLabel}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
