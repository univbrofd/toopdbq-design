import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:toopdbq/feature/Universe/widgets/UniverseMenuSheet.dart';

/// Claude Design コンポーネントを単体描画して比較スクショを撮るための入口。
///
/// 実行: flutter run -t lib-design/preview/main_preview.dart -d <booted-sim>
/// 撮影: ../preview/capture.sh {Name}  → ../preview/build.sh {Name}
///
/// 本筋アプリから完全分離 (Firebase / 認証 / DI 初期化なし)。コンポーネントの
/// アクション callback は tap 時のみ発火するため描画だけなら安全に表示できる。
void main() {
  const target = String.fromEnvironment('preview', defaultValue: 'UniverseMenuSheet');
  runApp(_PreviewApp(target: target));
}

class _PreviewApp extends StatelessWidget {
  final String target;
  const _PreviewApp({required this.target});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      debugShowCheckedModeBanner: false,
      home: _PreviewStage(target: target),
    );
  }
}

class _PreviewStage extends StatelessWidget {
  final String target;
  const _PreviewStage({required this.target});

  void _present() {
    switch (target) {
      case 'UniverseMenuSheet':
        UniverseMenuSheet.show();
      default:
        Get.snackbar('preview', 'unknown target: $target');
    }
  }

  @override
  Widget build(BuildContext context) {
    WidgetsBinding.instance.addPostFrameCallback((_) => _present());
    return const DecoratedBox(
      decoration: BoxDecoration(
        gradient: RadialGradient(
          center: Alignment(0, -0.85),
          radius: 1.1,
          colors: [Color(0xFF221D38), Color(0xFF0C0A14)],
          stops: [0.0, 0.55],
        ),
      ),
      child: SizedBox.expand(),
    );
  }
}
