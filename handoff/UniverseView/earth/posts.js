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
   ========================================================================== */
(function () {
  // user / circle center — 渋谷ハチ公像 (map-core.js の CENTER と一致)
  const CENTER = [139.70064, 35.65905];

  // サークル（実機 SampleCircleData 由来の名／DS 同梱の circle-NN サムネ）
  const circles = {
    'circle-01': { name: '渋谷コミュニティ',   thumb: '../../assets/sample/uv/circle-11.png' },
    'circle-02': { name: '神宮前コミュニティ', thumb: '../../assets/sample/uv/circle-12.png' },
    'circle-03': { name: '代々木サークル',     thumb: '../../assets/sample/uv/circle-13.png' },
    'circle-04': { name: '新宿グループ',       thumb: '../../assets/sample/uv/circle-14.png' },
  };

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
  const posts = [
    { id: 'real-01', lat: 35.66553394124979, lng: 139.70113334739187, circleId: 'circle-01', cluster: 'shibuya' },
    { id: 'real-02', lat: 35.67409735583507, lng: 139.68111601742362, circleId: 'circle-03', cluster: 'harajuku' },
    { id: 'real-03', lat: 35.67536946903334, lng: 139.70509975719222, circleId: 'circle-02', cluster: 'harajuku' },
    { id: 'real-04', lat: 35.66527163126798, lng: 139.70095538623644, circleId: 'circle-01', cluster: 'shibuya' },
    { id: 'real-05', lat: 35.675310344094484, lng: 139.69697935141744, circleId: 'circle-02', cluster: 'harajuku' },
    { id: 'real-06', lat: 35.695838793359414, lng: 139.7662216045701,  circleId: 'circle-04', cluster: 'shinjuku' },
    { id: 'real-07', lat: 35.662117107192344, lng: 139.71270880388738, circleId: 'circle-01', cluster: 'shibuya' },
    { id: 'real-08', lat: 35.66773639634803,  lng: 139.69330244061905, circleId: 'circle-03', cluster: 'harajuku' },
    { id: 'real-09', lat: 35.66573411618798,  lng: 139.69614734172274, circleId: 'circle-01', cluster: 'shibuya' },
    { id: 'real-10', lat: 35.65923593831696,  lng: 139.7006143495087,  circleId: 'circle-01', cluster: 'shibuya' },
    { id: 'real-11', lat: 35.66566109829807,  lng: 139.70101954247983, circleId: 'circle-01', cluster: 'shibuya' },
  ].map((p) => ({
    ...p,
    glbUrl:   GLB[p.id],
    thumbUrl: '../../assets/sample/models/' + p.id + '.jpg',   // 共有プールを参照
  }));

  const byId = {};
  posts.forEach((p) => { byId[p.id] = p; });

  // circle 出現順（リールの行順を安定させる）
  const circleOrder = [];
  posts.forEach((p) => { if (!circleOrder.includes(p.circleId)) circleOrder.push(p.circleId); });

  window.UniverseData = { CENTER, circles, posts, byId, circleOrder };
})();
