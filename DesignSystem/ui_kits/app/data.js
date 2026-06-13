/* Sample content — lifted from lib/component/constants/Sample*Data.dart.
   Only midjourney.com CDN images are used (verified to load); each photo also
   sits on a gradient fallback so the kit never shows a broken image. */
(function () {
  const IMG = {
    a: '../../../assets/images/reel/reel015.jpg',
    b: '../../../assets/images/reel/reel002.jpg',
    c: '../../../assets/images/reel/reel007.jpg',
    d: '../../../assets/images/reel/reel010.jpg',
  };
  const AV = {
    sunny: '../../../assets/images/user/user010.jpg',
    pixel: '../../../assets/images/user/user009.jpg',
    star:  '../../../assets/images/user/user005.jpg',
  };

  window.ICONS = '../../../assets/icons/';
  window.IMG = IMG;
  window.AV = AV;

  // Three location circles; each holds a vertical stack of users' stories.
  window.TOOPDATA = [
    {
      id: 'circle1', name: '渋谷コミュニティ', desc: '渋谷駅周辺のコミュニティ',
      cover: IMG.a, members: 128, distance: '10.0', unit: 'm', online: true,
      pin: { x: 41, y: 47, role: 'main' },
      stories: [
        { id: 's1', user: 'SunnyVi', avatar: AV.sunny, image: IMG.a, time: '2時間前', likes: 24, comments: 2, segments: 3 },
        { id: 's2', user: 'Kawaii', avatar: AV.pixel, image: IMG.b, time: '4時間前', likes: 58, comments: 7, segments: 2 },
      ],
    },
    {
      id: 'circle2', name: '新宿グループ', desc: '新宿エリアの交流グループ',
      cover: IMG.b, members: 86, distance: '1.2', unit: 'km', online: true,
      pin: { x: 63, y: 33, role: 'sub' },
      stories: [
        { id: 's3', user: 'Dreamy', avatar: AV.star, image: IMG.c, time: '1時間前', likes: 41, comments: 4, segments: 2 },
        { id: 's4', user: 'foodie', avatar: AV.sunny, image: IMG.d, time: '3時間前', likes: 12, comments: 1, segments: 4 },
      ],
    },
    {
      id: 'circle3', name: '原宿コミュニティ', desc: '原宿・表参道周辺のコミュニティ',
      cover: IMG.c, members: 203, distance: '5.4', unit: 'km', online: false,
      pin: { x: 30, y: 64, role: 'sub' },
      stories: [
        { id: 's5', user: 'Pixel', avatar: AV.pixel, image: IMG.b, time: '30分前', likes: 76, comments: 9, segments: 3 },
        { id: 's6', user: 'Starry', avatar: AV.star, image: IMG.a, time: '5時間前', likes: 33, comments: 3, segments: 1 },
      ],
    },
  ];

  // Comment threads per story id (falls back to DEFAULT for unlisted stories).
  window.COMMENTS = {
    s1: [
      { user: 'Kawaii', avatar: AV.pixel, text: 'この景色すごく好き！どこで撮ったの？', time: '1時間前', likes: 4 },
      { user: 'Dreamy', avatar: AV.star, text: '渋谷の夜って最高だよね🌃', time: '52分前', likes: 1 },
    ],
    s2: [
      { user: 'SunnyVi', avatar: AV.sunny, text: 'これは保存した。次行くとき教えて！', time: '3時間前', likes: 9 },
      { user: 'foodie', avatar: AV.sunny, text: '色味がきれい', time: '2時間前', likes: 2 },
      { user: 'Pixel', avatar: AV.pixel, text: 'いいね〜🔥', time: '1時間前', likes: 0 },
    ],
    DEFAULT: [
      { user: 'Starry', avatar: AV.star, text: 'すてき！', time: '40分前', likes: 3 },
      { user: 'Kawaii', avatar: AV.pixel, text: 'また近くに来たら寄ってみる', time: '20分前', likes: 0 },
    ],
  };

  // extra floating pins (no story) to populate the globe
  window.EXTRA_PINS = [
    { x: 52, y: 22, avatar: AV.star }, { x: 73, y: 58, avatar: AV.pixel },
    { x: 20, y: 35, avatar: AV.sunny }, { x: 48, y: 72, avatar: AV.pixel },
    { x: 80, y: 41, avatar: AV.sunny },
  ];
})();
