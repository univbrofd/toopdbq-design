時間帯の写真。色の帯の代わりに、時間はいつも写真で見せる。

- `dayLine.webp`（横 3 : 縦 1）: 1 日を左 朝 6 時 → 右 翌朝 6 時に並べた横版。プランの上端の帯（`DayLine` = `.al`）と、全部選んだ / 組み立て中のカード（`.fl-card`）が使う。時刻 → 横位置は 6:00 = .04 / 12:00 = .29 / 18:00 = .53 / 24:00 = .80 / 翌 6:00 = 1 の区分線形。
- `dayBand.webp`（縦）: 同じ 1 日の縦版。時間帯のダイアログの縦の帯（`TimeBand` = `.tb-img`）。
- `early` `morning` `noon` `afternoon` `evening` `night` `late` `dawn`（横長）: 3 時間の段ごとの写真。段のカード（`AskCard` = `.tm-ask-card`）の地に、白 .18 の幕と白 .5 の 1px の縁をかけて敷く。

画面では `components/img/` の同じファイルを使う（bundle.css が参照する）。
