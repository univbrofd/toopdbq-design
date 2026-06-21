/* ============================================================================
   earth/posts.js — UniverseView の単一の真実 (single source of truth)

   実機の連携モデルに合わせ、1 投稿 = 1 エンティティに統一する:

       { id, lat, lng, circleId, glbUrl, thumbUrl }

   - glbUrl  : 地図上に乗る実 3D。本番 Firebase Storage の公開 GLB（CORS:* なので
               Claude Design からも取得可）。real-NN.glb。
   - thumbUrl: その投稿の縦サムネ。共有プール assets/sample/models/real-NN.jpg を
               *参照*（per-View に複製しない）。real-NN.glb ↔ real-NN.jpg のペアで、
               生成元（3D の見た目）がそのままサムネになる。

   3D オーバーレイ(objects3d.js) は glbUrl を、下端リールは thumbUrl を、同じ id で
   引く。代表 id を 1 本に統一して「リール白枠 / 地図の巨大 main / フォーカス対象」を
   連動させる（連動の実体は objects3d.js + Earth Globe.html の reel controller）。
   ※ handoff 配置（handoff/UniverseView/）からは共有プールを ../../assets/ で参照する。
   ========================================================================== */
(function () {
  // user / circle center — 渋谷ハチ公像 (map-core.js の CENTER と一致)
  const CENTER = [139.70064, 35.65905];

  // サークル（実機 SampleCircleData 由来の名／DS 同梱の circle-NN サムネ）
  const circles = {
    'circle-01': { name: '渋谷コミュニティ',   desc: '渋谷駅周辺のコミュニティ', thumb: '../../assets/sample/uv/circle-11.png' },
    'circle-02': { name: '神宮前コミュニティ', desc: '神宮前エリアの仲間たち',   thumb: '../../assets/sample/uv/circle-12.png' },
    'circle-03': { name: '代々木サークル',     desc: '代々木公園が拠点',         thumb: '../../assets/sample/uv/circle-13.png' },
    'circle-04': { name: '新宿グループ',       desc: '新宿の街をシェア',         thumb: '../../assets/sample/uv/circle-14.png' },
    // ── 新クラスタ用サークル（uv サムネを循環利用）────────────────────────
    'circle-05': { name: '道玄坂コミュニティ', desc: '道玄坂の坂上から',         thumb: '../../assets/sample/uv/circle-11.png' },
    'circle-06': { name: '宮益坂グループ',     desc: '宮益坂エリアの仲間たち',   thumb: '../../assets/sample/uv/circle-12.png' },
    'circle-07': { name: '原宿コミュニティ',   desc: '原宿駅周辺のコミュニティ', thumb: '../../assets/sample/uv/circle-13.png' },
    'circle-08': { name: '表参道サークル',     desc: '表参道のけやき並木',       thumb: '../../assets/sample/uv/circle-14.png' },
    'circle-09': { name: '恵比寿コミュニティ', desc: '恵比寿の路地裏から',       thumb: '../../assets/sample/uv/circle-11.png' },
    'circle-10': { name: '中目黒グループ',     desc: '目黒川沿いのみんな',       thumb: '../../assets/sample/uv/circle-12.png' },
  };

  // Studio 3D サンプルの raw ベース（public・CORS:*）。GLB / mp4 はバイナリ取り込み不可の
  // ため raw を直接参照（three.js GLTFLoader / <video> ともクロスオリジンで読める）。
  // thumbnail.jpg はローカル取り込み済み（../../assets/sample/3d/{id}/thumbnail.jpg）。
  const S3D = 'https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/assets/sample/3d/';
  const studio = (id) => ({
    glbUrl:   S3D + id + '/model.glb',
    thumbUrl: '../../assets/sample/3d/' + id + '/thumbnail.jpg',
    video:    S3D + id + '/video.mp4',
  });

  // GLB base — 本番 RTDB /story の modelUrl（公開 URL）。real-10 = ハチ公像(=CENTER)。
  const GLB = {
    'real-01': 'https://firebasestorage.googleapis.com/v0/b/toopdbq.appspot.com/o/story%2F143a6501-ecdd-4308-a15c-fe001a9e87e5%2F143a6501-ecdd-4308-a15c-fe001a9e87e5.glb?alt=media&token=acbff054-09fd-42df-a230-61df164c53d9',
    'real-02': 'https://firebasestorage.googleapis.com/v0/b/toopdbq.appspot.com/o/story%2F1e12abf7-44fc-4079-84d6-2deb5febb45b%2F1e12abf7-44fc-4079-84d6-2deb5febb45b.glb?alt=media&token=00110597-b631-442c-a2d8-87618f43600c',
    'real-03': 'https://firebasestorage.googleapis.com/v0/b/toopdbq.appspot.com/o/story%2F25eb1144-1387-4351-9365-bfa51378156b%2F25eb1144-1387-4351-9365-bfa51378156b.glb?alt=media&token=9ac6ec33-1333-4713-9bc0-fb93f9073177',
    'real-04': 'https://firebasestorage.googleapis.com/v0/b/toopdbq.appspot.com/o/story%2F353711cd-ac35-4de2-9955-6456270e6e3d%2F353711cd-ac35-4de2-9955-6456270e6e3d.glb?alt=media&token=835211dc-c26a-4cf8-8f65-13b4d0c34ced',
    'real-05': 'https://firebasestorage.googleapis.com/v0/b/toopdbq.appspot.com/o/story%2F7339918b-267f-4539-bd69-0f6e92453764%2F7339918b-267f-4539-bd69-0f6e92453764.glb?alt=media&token=054a4173-c80a-42c4-b052-f94a9513e4e4',
    'real-06': 'https://firebasestorage.googleapis.com/v0/b/toopdbq.appspot.com/o/story%2F7fa30005-fed9-45d8-8aed-780aee8b5a2c%2F7fa30005-fed9-45d8-8aed-780aee8b5a2c.glb?alt=media&token=1db6cf4c-763a-4c84-9e69-83c3a596a600',
    'real-07': 'https://firebasestorage.googleapis.com/v0/b/toopdbq.appspot.com/o/story%2F97ef6494-a592-4b91-9b17-6763573ee93f%2F97ef6494-a592-4b91-9b17-6763573ee93f.glb?alt=media&token=63fd3cf6-990e-416b-8ebd-773f7e30a502',
    'real-08': 'https://firebasestorage.googleapis.com/v0/b/toopdbq.appspot.com/o/story%2Fbf56f848-04f8-41e6-b6f4-5471a7fc151c%2Fbf56f848-04f8-41e6-b6f4-5471a7fc151c.glb?alt=media&token=a81d7e33-6526-4837-8d65-2ebf042f2d10',
    'real-09': 'https://firebasestorage.googleapis.com/v0/b/toopdbq.appspot.com/o/story%2Fd91a62e2-b0e9-4eef-b431-177d8b7d0c27%2Fd91a62e2-b0e9-4eef-b431-177d8b7d0c27.glb?alt=media&token=faf2b753-ce43-4c1d-a46b-3b5d2bb616af',
    'real-10': 'https://firebasestorage.googleapis.com/v0/b/toopdbq.appspot.com/o/story%2Fe40ad36b-647d-4bcd-bb2b-16eccef94fa8%2Fe40ad36b-647d-4bcd-bb2b-16eccef94fa8.glb?alt=media&token=db6e1b18-7d7a-4708-bafa-f1d0a8e5377e',
    'real-11': 'https://firebasestorage.googleapis.com/v0/b/toopdbq.appspot.com/o/story%2Fe42972fe-8884-4863-9fd9-0d1642c738e6%2Fe42972fe-8884-4863-9fd9-0d1642c738e6.glb?alt=media&token=6d048a08-4750-4c21-ac79-295e29e329a7',
  };

  // 1 投稿 = 1 エンティティ。lat/lng は本番 /story の実座標。circleId は実地理で割当。
  // cluster = *固定*のクラスタ割当（地理ベースの手動グルーピング）。動的なタイル bin だと
  // 密集地帯(渋谷中心)がタイル境界で割れてクラスタされないため、固定で束ねる。
  // メインクラスタ = この cluster 群のうち画面中心に最も近いもの。リールはその全メンバー。
  // 2 オブジェクト。real-10 = ハチ公像(CENTER)、real-09 = その約80m 北東に置く 2 個目。
  // 同じ cluster 'shibuya' で束ねるので、両方ともメインクラスタ＝リール／地図に同時表示。
  const posts = [
    { id: 'real-10', lat: CENTER[1], lng: CENTER[0], circleId: 'circle-01', cluster: 'shibuya', video: '../../assets/sample/models/real-10.mp4' },
    { id: 'real-09', lat: CENTER[1], lng: CENTER[0], circleId: 'circle-01', cluster: 'shibuya', video: 'uploads/social_coou_93826_httpss.mj.run6rjKpUJCKXI_--ar_59128_--video_1_400b99f8-5d82-47b5-8281-72ae75f41ce7_0.mp4' },
    // Studio 3D サンプル（mqmav1c7_wnam）= 1 投稿 = 動画 + 先頭フレーム + 3D。
    // glb/thumb/video はローカル取り込み済みの共有プール ../../assets/sample/3d/{id}/ を直接参照。
    { id: 'mqmav1c7_wnam', lat: CENTER[1], lng: CENTER[0], circleId: 'circle-01', cluster: 'shibuya',
      glbUrl:   '../../assets/sample/3d/mqmav1c7_wnam/model.glb',
      thumbUrl: '../../assets/sample/3d/mqmav1c7_wnam/thumbnail.jpg',
      video:    '../../assets/sample/3d/mqmav1c7_wnam/video.mp4' },
    // Studio 3D サンプル（mqmaxkwz_tkvb）= 画像投稿 → 3D（動画なし・画像 → 3D の 2 段）。
    // shibuya から北東 約600m に新クラスタ 'jingumae'（circle-02 神宮前）として置く。
    { id: 'mqmaxkwz_tkvb', lat: 35.66075, lng: 139.70225, circleId: 'circle-02', cluster: 'jingumae',
      glbUrl:   '../../assets/sample/3d/mqmaxkwz_tkvb/model.glb',
      thumbUrl: '../../assets/sample/3d/mqmaxkwz_tkvb/thumbnail.jpg' },   // video 無し → videoUrl は null
    // Studio 3D サンプル（mqmay0ya_pk9f）= 動画投稿・quality=detailed の高精細 GLB（約4.85MB）。
    // shibuya から北西 約600m に新クラスタ 'yoyogi'（circle-03 代々木）として置く。動画 + 先頭フレーム + 3D。
    { id: 'mqmay0ya_pk9f', lat: 35.66305, lng: 139.69564, circleId: 'circle-03', cluster: 'yoyogi',
      glbUrl:   '../../assets/sample/3d/mqmay0ya_pk9f/model.glb',
      thumbUrl: '../../assets/sample/3d/mqmay0ya_pk9f/thumbnail.jpg',
      video:    '../../assets/sample/3d/mqmay0ya_pk9f/video.mp4' },

    // ════════════════════════════════════════════════════════════════════════
    // 新規 Studio 3D 12 件（mqmb… / mqmc…）。すべて動画投稿。GLB/動画は raw 参照。
    //
    //  ① 近隣に新クラスタを 2 つ（渋谷ハチ公の至近 ~300m）:
    //     ・dogenzaka（道玄坂・南西）= mqmbpeas_f3co
    //     ・miyamasu （宮益坂・北東）= mqmbpk42_d6sz
    //  ② 残り 10 件 = 5 クラスタへ均等(各 2 件)。広域に散らして別ピンとして見える様に:
    //     harajuku / omotesando / ebisu / nakameguro / shinjuku
    // ════════════════════════════════════════════════════════════════════════

    // ── ① 近隣の新クラスタ（単独メンバー・ハチ公至近）──────────────────────
    { id: 'mqmbpeas_f3co', lat: 35.65730, lng: 139.69790, circleId: 'circle-05', cluster: 'dogenzaka', ...studio('mqmbpeas_f3co') },
    { id: 'mqmbpk42_d6sz', lat: 35.66020, lng: 139.70280, circleId: 'circle-06', cluster: 'miyamasu',  ...studio('mqmbpk42_d6sz') },

    // ── ② harajuku（原宿駅周辺・北 ~1.3km）×2 ─────────────────────────────
    { id: 'mqmb21ww_8yqs', lat: 35.67020, lng: 139.70270, circleId: 'circle-07', cluster: 'harajuku', ...studio('mqmb21ww_8yqs') },
    { id: 'mqmbpn15_v9lg', lat: 35.67085, lng: 139.70380, circleId: 'circle-07', cluster: 'harajuku', ...studio('mqmbpn15_v9lg') },

    // ── ② omotesando（表参道・北東 ~1.5km）×2 ────────────────────────────
    { id: 'mqmcjxrf_jsvq', lat: 35.66520, lng: 139.71240, circleId: 'circle-08', cluster: 'omotesando', ...studio('mqmcjxrf_jsvq') },
    { id: 'mqmcqqwa_wa2w', lat: 35.66585, lng: 139.71340, circleId: 'circle-08', cluster: 'omotesando', ...studio('mqmcqqwa_wa2w') },

    // ── ② ebisu（恵比寿駅・南東 ~1.5km）×2 ───────────────────────────────
    { id: 'mqmcqvk9_82tm', lat: 35.64670, lng: 139.71000, circleId: 'circle-09', cluster: 'ebisu', ...studio('mqmcqvk9_82tm') },
    { id: 'mqmcslrd_nb9u', lat: 35.64720, lng: 139.71090, circleId: 'circle-09', cluster: 'ebisu', ...studio('mqmcslrd_nb9u') },

    // ── ② nakameguro（中目黒・南西 ~1.8km）×2 ────────────────────────────
    { id: 'mqmcygak_b0id', lat: 35.64400, lng: 139.69850, circleId: 'circle-10', cluster: 'nakameguro', ...studio('mqmcygak_b0id') },
    { id: 'mqmcyl7q_ts1m', lat: 35.64455, lng: 139.69940, circleId: 'circle-10', cluster: 'nakameguro', ...studio('mqmcyl7q_ts1m') },

    // ── ② shinjuku（新宿駅・北 ~3.5km・既存 circle-04 を再利用）×2 ─────────
    { id: 'mqmcyoah_ssvh', lat: 35.68960, lng: 139.70050, circleId: 'circle-04', cluster: 'shinjuku', ...studio('mqmcyoah_ssvh') },
    { id: 'mqmcyrxm_wpic', lat: 35.69025, lng: 139.70150, circleId: 'circle-04', cluster: 'shinjuku', ...studio('mqmcyrxm_wpic') },
  ].map((p) => ({
    ...p,
    glbUrl:   p.glbUrl   || GLB[p.id],                    // 投稿が明示した URL を優先（無ければ本番 GLB）
    thumbUrl: p.thumbUrl || '../../assets/sample/models/' + p.id + '.jpg',  // 〃（無ければ共有プール real-NN.jpg）
    videoUrl: p.video || null,                            // フルスクリーン時に再生する動画（任意）
  }));

  const byId = {};
  posts.forEach((p) => { byId[p.id] = p; });

  // circle 出現順（リールの行順を安定させる）
  const circleOrder = [];
  posts.forEach((p) => { if (!circleOrder.includes(p.circleId)) circleOrder.push(p.circleId); });

  window.UniverseData = { CENTER, circles, posts, byId, circleOrder };
})();
