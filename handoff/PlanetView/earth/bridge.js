// ============================================================================
// bridge.js — Flutter / iframe との IPC 統合 (旧 bootstrap.js + iframe-bridge.js)
//
// 提供:
//   - EARTH_VERSION       : 全モジュール参照用バージョン定数
//   - _isIframe / _bridgeId : Web Stagedeck iframe 環境判定
//   - _sendToHost(json)   : 本筋 (FlutterChannel) / iframe (postMessage) の差分吸収
//   - dlog(tag, data)     : ホワイトリスト付き debug ログ
//   - parent → iframe command listener (message イベント)
//
// 注意:
//   - 公開 API (window.setCamera 等) は後続スクリプトで定義される。
//     iframe の message ハンドラは message イベント発火時 (= 全スクリプトロード後)
//     に呼ばれるため、ここで forward reference になっても問題なし。
// ============================================================================

const EARTH_VERSION = 'v152-positron';

const _isIframe = (() => {
  try { return window.parent && window.parent !== window; }
  catch (_) { return false; }
})();

// iframe では URL クエリから bridgeId を読み、送信全 JSON に bridgeId を含める。
// parent (Flutter Web) は複数 iframe からのメッセージを bridgeId で振り分ける。
const _bridgeId = (() => {
  try {
    const u = new URLSearchParams(window.location.search);
    return u.get('bridgeId') || '';
  } catch (_) { return ''; }
})();

function _sendToHost(json) {
  try {
    if (window.FlutterChannel && typeof window.FlutterChannel.postMessage === 'function') {
      window.FlutterChannel.postMessage(json);
    } else if (_isIframe) {
      // bridgeId を JSON に inject (既存の type/data を壊さずに付与)。
      // 単純な文字列置換: 先頭の `{` の直後に `"bridgeId":"...",` を差し込む。
      // 注意: IframeMessageBridge.dart は raw 文字列に "bridgeId":"..." が含まれる
      //       前提で高速 reject しているため、stringify 経由で key 順を変える等の
      //       変更はしないこと。
      let payload = json;
      if (_bridgeId && json.startsWith('{')) {
        payload = '{"bridgeId":"' + _bridgeId + '",' + json.substring(1);
      }
      window.parent.postMessage(payload, '*');
    }
  } catch (e) {
    console.error('_sendToHost error', e);
  }
}

// 旧 debug ログは完全 no-op (高頻度イベントで main isolate が詰まるため)。
// ただし起動時 1〜2 回しか発火しない初期化系タグのみ通すホワイトリスト方式に
// 切替えて Flutter 側で初期 camera の挙動を観測できるようにする。
const _DLOG_ALLOW = new Set([
  'style-loaded',
  'initial-camera-applied',
  'pitch-enforced',
  'set-camera-called',
  'post-set-camera',
  'model-loaded',
  'model-load-error',
]);
function dlog(tag, data) {
  if (!_DLOG_ALLOW.has(tag)) return;
  try {
    _sendToHost(JSON.stringify({ type: 'debug', tag: tag, data: data || {} }));
  } catch (_) {}
}

// ---------------------------------------------------------------------------
// parent → iframe command listener
//   {bridgeId: 'xxx', command: 'setCamera'|..., args: {...}}
// ---------------------------------------------------------------------------
if (_isIframe) {
  window.addEventListener('message', (event) => {
    try {
      const raw = event.data;
      if (typeof raw !== 'string') return;
      const msg = JSON.parse(raw);
      // 自分宛か確認 (bridgeId が一致しないと無視)
      if (msg.bridgeId && msg.bridgeId !== _bridgeId) return;
      const cmd = msg.command;
      if (!cmd) return;
      const args = msg.args || {};
      switch (cmd) {
        case 'setCamera':
          if (typeof window.setCamera === 'function') window.setCamera(args);
          break;
        case 'setPitch':
          if (typeof window.setPitch === 'function') window.setPitch(args.deg);
          break;
        case 'earthPanBy':
          if (typeof window.earthPanBy === 'function') window.earthPanBy(args.dx, args.dy);
          break;
        case 'setCenter':
          if (typeof window.setCenter === 'function') window.setCenter(args.lat, args.lng);
          break;
        case 'setPins':
          if (typeof window.setPins === 'function') window.setPins({ pins: args.pins });
          break;
        case 'setActivationRange':
          if (typeof window.setActivationRange === 'function') window.setActivationRange(args);
          break;
        case 'setModels':
          if (typeof window.setModels === 'function') window.setModels({ models: args.models });
          break;
      }
    } catch (e) {
      console.error('iframe message handler error', e);
    }
  });
}
