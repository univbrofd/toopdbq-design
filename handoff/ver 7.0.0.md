大幅にバーションアップする。

まず、アプリの機能で、場所の中で、アイテムやメニューや人をを登録して、ランキングを作成する。　
このランキングを投稿してタイムラインに表示される。

最初の画面は、魔と似ていてい、マップとタイムラインを表示する。

以下のようなデザインで
Use the claude_design MCP (https://api.anthropic.com/v1/design/mcp, auth via /design-login) to import this project:
https://claude.ai/design/p/6fbaf874-ef83-4d08-852c-cbc82cc750a1?file=World3D.html

Focus on these files (the whole project is readable):
- `World3D.html`

Implement: `World3D.html`

既存のフッタのーマップボタンや、ユーザーアイコンはそのまま表示。

投稿ボタンも同じように表示。ただし、ランキング作成フローに進むようにする。

以下のデザインで、プロフィールでの表示と、ランキング作成フローを作成してある。
ただタブはランキングだけにして、投稿も下書きも無しで、タブの概念すらなく、ランキング投稿のタイムラインのみで。
最初の画面のタイムラインでランキング投稿をたっぷした時の遷移画面と、プロフィールでのランキングタップで遷移する画面は一緒に。

Use the claude_design MCP (https://api.anthropic.com/v1/design/mcp, auth via /design-login) to import this project:
https://claude.ai/design/p/6fbaf874-ef83-4d08-852c-cbc82cc750a1?file=App-MenuRanking-Dark.html

Focus on these files (the whole project is readable):
- `App-MenuRanking-Dark.html`

Also read these files the selection imports:
- `assets/icons/icon_add.png`
- `assets/icons/icon_back.png`
- `assets/icons/icon_close.png`
- `assets/icons/icon_menu.png`
- `DesignSystem/colors_and_type.css`
- `DesignSystem/preview/card.css`

Implement: `App-MenuRanking-Dark.html`



タイムラインで、投稿の右側に既存お実装と同じように、場所の表示があるが、これを押した時の挙動は既存と一緒、でただし、その場所に対して、投稿されたランキング投稿だけを表示する。

ランキング作成フローの時に場所を検索するが、この時は、google api を使用せずに、データベースにあるデータだけに対して、　現在位置の直径100mの距離で検索をかける。
何もない時や、自由に追加できるように、　google map の場所の共有を促して、google map の場所の共有をしてくれたら、　検索をかけてデータがなければ新しく作る、　この時api をバックエンドで使用して、情報を保管する。

今の実装では、場所モードになった時に、サークルが限定されているが、　これをなくして
ユーザーにはサークルの概念は無しで、アプリを機能させたい。　
ただし、裏ではサークルは機能していて、もしまだ作成されていない場所で投稿された時は勝手にサークルを作成して、そのサークルに対して投稿したこととした。
時が来たらサークルの機能を解放する。

