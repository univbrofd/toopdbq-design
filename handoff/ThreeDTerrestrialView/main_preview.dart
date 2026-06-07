import 'dart:math' show pi;
import 'package:flutter/material.dart';

// Throwaway: Claude Design specimen (comp-terrestrial-stage.html) と同一フォーマットで
// 実装の beacon 描画を並べる比較ハーネス。_BeaconPainter は ThreeDTerrestrialView の
// _ThreeDBeaconPainter / _paintStage / _paintUnifiedShadow を verbatim で写すこと。検証後に削除。

void main() => runApp(const _PreviewApp());

const _bg0 = Color(0xFF0D0E14);
const _bg1 = Color(0xFF08080C);
const _bg2 = Color(0xFF050507);
const _text1 = Color(0xFFFFFFFF);
const _text2 = Color(0xC7FFFFFF);
const _text3 = Color(0x99FFFFFF);

class _PreviewApp extends StatelessWidget {
  const _PreviewApp();
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        backgroundColor: Colors.black,
        body: Center(
          child: FittedBox(
            fit: BoxFit.contain,
            child: SizedBox(
              width: 1040,
              height: 1180,
              child: DecoratedBox(
                decoration: const BoxDecoration(
                  gradient: RadialGradient(
                    center: Alignment(0, -1.16),
                    radius: 1.1,
                    colors: [_bg0, _bg1, _bg2],
                    stops: [0.0, 0.55, 1.0],
                  ),
                ),
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(30, 28, 30, 36),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      _Head(),
                      SizedBox(height: 20),
                      _Hero(),
                      SizedBox(height: 20),
                      _Rail(),
                      SizedBox(height: 16),
                      _Foot(),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _Head extends StatelessWidget {
  const _Head();
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          children: const [
            Text('3D オブジェクト表示 — ',
                style: TextStyle(
                    color: _text1, fontSize: 24, fontWeight: FontWeight.w300)),
            Text('ステージビーコン',
                style: TextStyle(
                    color: _text1, fontSize: 24, fontWeight: FontWeight.w700)),
            SizedBox(width: 12),
            Text('STAGE MARKER',
                style: TextStyle(
                    color: Color(0x80FFFFFF),
                    fontSize: 11,
                    letterSpacing: 2.4,
                    fontWeight: FontWeight.w500)),
          ],
        ),
        const SizedBox(height: 9),
        const SizedBox(
          width: 880,
          child: Text(
            '装飾を削ぎ、地点に刺さったステージとその上の3Dオブジェクトだけにした最小構成。地点から細い光の軸が立ち上がり、宙に薄いリングのステージが浮く。ステージ下の淡い白グローだけで浮かせる。色を持たないモノクロのホログラム。',
            style: TextStyle(color: _text2, fontSize: 12.5, height: 1.9),
          ),
        ),
      ],
    );
  }
}

class _Panel extends StatelessWidget {
  final double height;
  final String? tag;
  final Widget child;
  const _Panel({required this.height, this.tag, required this.child});
  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      clipBehavior: Clip.hardEdge,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x14FFFFFF)),
        gradient: const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFF090A0E), Color(0xFF060609)],
        ),
      ),
      child: Stack(
        children: [
          Positioned.fill(child: child),
          if (tag != null)
            Positioned(
              top: 12,
              left: 13,
              child: Text(tag!.toUpperCase(),
                  style: const TextStyle(
                      color: _text3,
                      fontSize: 8.5,
                      letterSpacing: 1.4,
                      fontWeight: FontWeight.w600)),
            ),
        ],
      ),
    );
  }
}

class _Hero extends StatelessWidget {
  const _Hero();
  @override
  Widget build(BuildContext context) {
    return _Panel(
      height: 380,
      tag: 'stage beacon · hero',
      child: Stack(
        children: [
          Positioned.fill(
            child: CustomPaint(
              painter: _BeaconPainter([
                _Spec(cxFrac: 0.5, objw: 78, poleLen: 150, isMain: true),
              ]),
            ),
          ),
          // annotations
          const _Lbl(rightSide: true, leftFrac: 0.62, top: 70, text: '3Dオブジェクト', en: 'OBJECT'),
          const _Lbl(rightSide: false, leftFrac: 0.16, top: 165, text: 'ステージ', en: 'FLOATING STAGE'),
          const _Lbl(rightSide: true, leftFrac: 0.56, top: 250, text: '光の軸', en: 'LIGHT STEM'),
          const _Lbl(rightSide: false, leftFrac: 0.20, top: 330, text: '接地点', en: 'PINNED POINT'),
        ],
      ),
    );
  }
}

class _Lbl extends StatelessWidget {
  final bool rightSide;
  final double leftFrac, top;
  final String text, en;
  const _Lbl(
      {required this.rightSide,
      required this.leftFrac,
      required this.top,
      required this.text,
      required this.en});
  @override
  Widget build(BuildContext context) {
    final col = Column(
      crossAxisAlignment:
          rightSide ? CrossAxisAlignment.start : CrossAxisAlignment.end,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(text,
            style: const TextStyle(
                color: _text1, fontSize: 9.5, fontWeight: FontWeight.w500)),
        Text(en,
            style: const TextStyle(
                color: _text3,
                fontSize: 7.5,
                letterSpacing: 0.9,
                fontWeight: FontWeight.w600)),
      ],
    );
    final line = Container(
        width: 30,
        height: 1,
        color: const Color(0x59FFFFFF),
        margin: const EdgeInsets.symmetric(horizontal: 8));
    return Positioned(
      left: 980 * leftFrac,
      top: top,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: rightSide ? [line, col] : [col, line],
      ),
    );
  }
}

class _Rail extends StatelessWidget {
  const _Rail();
  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: const [
        Expanded(
          child: _Card(
            nm: 'デフォルト',
            role: 'default',
            isMainCard: false,
            specs: [_Spec(cxFrac: 0.5, objw: 52, poleLen: 96, isMain: false)],
            desc: '基本の1基。ステージ＋オブジェクトのみ。陰影はステージ下の淡い白グローだけ。',
          ),
        ),
        SizedBox(width: 16),
        Expanded(
          child: _Card(
            nm: 'メイン',
            role: 'main',
            isMainCard: true,
            specs: [_Spec(cxFrac: 0.5, objw: 64, poleLen: 104, isMain: true)],
            desc: '主役。ステージを大きく・明るくし、白グローをより強く。形は共通。',
          ),
        ),
        SizedBox(width: 16),
        Expanded(
          child: _Card(
            nm: 'サブ ×2',
            role: 'sub',
            isMainCard: false,
            specs: [
              _Spec(cxFrac: 0.33, objw: 36, poleLen: 150, isMain: false),
              _Spec(cxFrac: 0.71, objw: 44, poleLen: 58, isMain: false),
            ],
            desc: '同じステージを縮小。軸の長さ＝地点までの距離（遠＝長 / 近＝短）。',
          ),
        ),
      ],
    );
  }
}

class _Card extends StatelessWidget {
  final String nm, role, desc;
  final bool isMainCard;
  final List<_Spec> specs;
  const _Card(
      {required this.nm,
      required this.role,
      required this.desc,
      required this.isMainCard,
      required this.specs});
  @override
  Widget build(BuildContext context) {
    return Container(
      clipBehavior: Clip.hardEdge,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x17FFFFFF)),
        gradient: const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0x0AFFFFFF), Color(0x03FFFFFF)],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(15, 13, 15, 11),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(nm,
                    style: const TextStyle(
                        color: _text1,
                        fontSize: 14,
                        fontWeight: FontWeight.w600)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
                  decoration: BoxDecoration(
                    color: isMainCard ? Colors.white : null,
                    border: isMainCard
                        ? null
                        : Border.all(color: const Color(0x24FFFFFF)),
                    borderRadius: BorderRadius.circular(5),
                  ),
                  child: Text(role.toUpperCase(),
                      style: TextStyle(
                          color: isMainCard ? const Color(0xFF0C0C12) : _text3,
                          fontSize: 9,
                          letterSpacing: 1.3,
                          fontWeight: FontWeight.w600)),
                ),
              ],
            ),
          ),
          SizedBox(
            height: 266,
            child: DecoratedBox(
              decoration: const BoxDecoration(
                border: Border(top: BorderSide(color: Color(0x0FFFFFFF))),
              ),
              child: CustomPaint(painter: _BeaconPainter(specs)),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(15, 13, 15, 16),
            child: Text(desc,
                style: const TextStyle(color: _text2, fontSize: 10.5, height: 1.6)),
          ),
        ],
      ),
    );
  }
}

class _Foot extends StatelessWidget {
  const _Foot();
  @override
  Widget build(BuildContext context) {
    return const SizedBox(
      width: 1000,
      child: Text(
        'ステージビーコン＝「接地点＋光の軸＋浮遊ステージ＋3Dオブジェクト」のみ。可変は軸の長さと大きさだけで、配置（NW/NE/SW/SE）・pitch・距離の規則は EarthClusterLayoutEngine のまま。陰影はステージ下の白グローに集約（カラーは不使用）。',
        style: TextStyle(color: _text3, fontSize: 11, height: 1.75),
      ),
    );
  }
}

class _Spec {
  final double cxFrac, objw, poleLen;
  final bool isMain;
  const _Spec(
      {required this.cxFrac,
      required this.objw,
      required this.poleLen,
      required this.isMain});
}

// ===== _ThreeDBeaconPainter を写したプレビュー painter (+ crystal) =====
class _BeaconPainter extends CustomPainter {
  final List<_Spec> specs;
  _BeaconPainter(this.specs);
  static const Color _white = Color(0xFFFFFFFF);

  @override
  void paint(Canvas canvas, Size size) {
    for (final s in specs) {
      final ow = s.objw;
      final thumbH = ow * 1.45; // gem 80x116 aspect
      final isMain = s.isMain;
      final cx = size.width * s.cxFrac;
      final groundY = size.height - 26;
      final objCenterY = groundY - s.poleLen - thumbH / 2;
      final ringY = objCenterY + thumbH / 2;

      final stemW = (ow * 0.03).clamp(1.2, 2.6);
      final ptR = (ow * 0.04).clamp(1.8, 3.0);
      final rw = ow * 0.46;
      final rh = rw * 0.4;
      final ring = Offset(cx, ringY);

      _paintUnifiedShadow(canvas,
          cx: cx,
          groundY: groundY,
          topY: ringY,
          stemW: stemW,
          ptR: ptR,
          rings: [ring],
          rw: rw,
          rh: rh);

      if (groundY > ringY) {
        final rect = Rect.fromLTRB(cx - stemW / 2, ringY, cx + stemW / 2, groundY);
        canvas.drawRect(
          Rect.fromLTRB(cx - stemW * 1.7, ringY, cx + stemW * 1.7, groundY),
          Paint()
            ..color = Color(isMain ? 0x66FFFFFF : 0x42FFFFFF)
            ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 2.6),
        );
        canvas.drawRect(
          rect,
          Paint()
            ..shader = LinearGradient(
              begin: Alignment.bottomCenter,
              end: Alignment.topCenter,
              colors: isMain
                  ? const [Color(0xFFFFFFFF), Color(0xF2FFFFFF), Color(0xCCFFFFFF)]
                  : const [Color(0xFFFFFFFF), Color(0xE6FFFFFF), Color(0xA8FFFFFF)],
              stops: const [0.0, 0.5, 1.0],
            ).createShader(rect)
            ..maskFilter = MaskFilter.blur(BlurStyle.normal, isMain ? 0.8 : 0.6),
        );
      }

      final pt = Offset(cx, groundY);
      canvas.drawCircle(
          pt,
          ptR * 3.0,
          Paint()
            ..color = Color(isMain ? 0x99FFFFFF : 0x66FFFFFF)
            ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 4.0));
      canvas.drawCircle(
          pt,
          ptR * 1.7,
          Paint()
            ..color = Color(isMain ? 0xF2FFFFFF : 0xCCFFFFFF)
            ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 1.6));
      canvas.drawCircle(pt, ptR, Paint()..color = _white);

      _paintStage(canvas, ring, rw, rh, isMain);
      _paintCrystal(
          canvas,
          Rect.fromCenter(
              center: Offset(cx, objCenterY), width: ow, height: thumbH));
    }
  }

  void _paintUnifiedShadow(
    Canvas canvas, {
    required double cx,
    required double groundY,
    required double topY,
    required double stemW,
    required double ptR,
    required List<Offset> rings,
    required double rw,
    required double rh,
  }) {
    final path = Path();
    if (groundY > topY) {
      path.addRect(Rect.fromLTRB(cx - stemW, topY, cx + stemW, groundY));
    }
    path.addOval(Rect.fromCircle(center: Offset(cx, groundY), radius: ptR * 1.6));
    for (final r in rings) {
      path.addOval(Rect.fromCenter(center: r, width: rw, height: rh));
    }
    canvas.drawPath(
      path.shift(const Offset(1.0, 3.0)),
      Paint()
        ..color = const Color(0x40000000)
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 3.5),
    );
  }

  void _paintStage(
      Canvas canvas, Offset center, double rw, double rh, bool isMain) {
    final rect = Rect.fromCenter(center: center, width: rw, height: rh);
    canvas.drawOval(
      Rect.fromCenter(
          center: center.translate(0, rh * 0.12), width: rw, height: rh * 1.3),
      Paint()
        ..color = Color(isMain ? 0x66FFFFFF : 0x33FFFFFF)
        ..maskFilter = MaskFilter.blur(BlurStyle.normal, isMain ? 7.0 : 5.0),
    );
    canvas.drawOval(
      rect,
      Paint()
        ..shader = const RadialGradient(
          center: Alignment(0, -0.32),
          radius: 0.9,
          colors: [Color(0x1AFFFFFF), Color(0x04FFFFFF), Color(0x00FFFFFF)],
          stops: [0.0, 0.62, 0.74],
        ).createShader(rect),
    );
    canvas.drawOval(
      rect,
      Paint()
        ..color = Color(isMain ? 0x59FFFFFF : 0x2EFFFFFF)
        ..strokeWidth = isMain ? 2.2 : 1.5
        ..style = PaintingStyle.stroke
        ..maskFilter = MaskFilter.blur(BlurStyle.normal, isMain ? 4.0 : 2.6),
    );
    canvas.drawOval(
      rect,
      Paint()
        ..color = Color(isMain ? 0xF2FFFFFF : 0xC7FFFFFF)
        ..strokeWidth = 1.0
        ..style = PaintingStyle.stroke,
    );
    canvas.drawArc(
      Rect.fromCenter(
          center: center.translate(0, 0.5), width: rw - 1.2, height: rh - 1.2),
      pi,
      pi,
      false,
      Paint()
        ..color = Color(isMain ? 0xCCFFFFFF : 0x80FFFFFF)
        ..strokeWidth = 1.0
        ..style = PaintingStyle.stroke,
    );
  }

  // spec の gem SVG (viewBox 80x116) を box へスケール
  void _paintCrystal(Canvas canvas, Rect box) {
    Offset p(double x, double y) =>
        Offset(box.left + x / 80 * box.width, box.top + y / 116 * box.height);
    Path tri(List<List<double>> pts) {
      final path = Path()..moveTo(p(pts[0][0], pts[0][1]).dx, p(pts[0][0], pts[0][1]).dy);
      for (var i = 1; i < pts.length; i++) {
        path.lineTo(p(pts[i][0], pts[i][1]).dx, p(pts[i][0], pts[i][1]).dy);
      }
      return path..close();
    }

    canvas.drawPath(tri([[40, 3], [9, 47], [40, 61]]), Paint()..color = const Color(0xFFAEB6BC));
    canvas.drawPath(tri([[40, 3], [71, 47], [40, 61]]), Paint()..color = const Color(0xFFF6F8FA));
    canvas.drawPath(tri([[9, 47], [40, 61], [40, 113]]), Paint()..color = const Color(0xFF6E757B));
    canvas.drawPath(tri([[71, 47], [40, 61], [40, 113]]), Paint()..color = const Color(0xFF9AA2A8));
    canvas.drawPath(
        tri([[40, 3], [9, 47], [40, 113], [71, 47]]),
        Paint()
          ..color = const Color(0x8CE1F8FF)
          ..strokeWidth = 1
          ..style = PaintingStyle.stroke);
  }

  @override
  bool shouldRepaint(_BeaconPainter old) => false;
}
