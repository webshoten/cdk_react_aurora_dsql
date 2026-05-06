# 12. DB選定調査 論点メモ

## 目的
- DB選定に関連する未確定論点を、設計判断前の議論単位として整理する

## 論点1: SharedStack に VPC を置くか

### 背景
- `../cdk_serverless` では VPC を Shared 側に置き、DB は app stack ごとに分離している

### 論点
- `cdk_pf` でも同じ責務分離（共通ネットワークは shared、DB本体は app）に合わせるか

### 判断観点
- ネットワーク基盤の共通化メリット（再利用性・運用一貫性）
- stateful リソースのライフサイクル分離（VPCとDBの変更頻度差）
- stack 間参照（VPC/Subnet/SecurityGroup）の複雑性

## 論点2: Aurora Serverless v2 を Proxy なしで運用するか

### 背景
- Proxyなし構成を志向
- `min ACU > 0` で接続失敗は下がる見込み
- `min ACU = 0` はウォームアップ遅延でエラー経験あり

### 論点
- 初期方針を `Proxyなし + retry/jitter` とするか
- 失敗率しきい値を超えた場合に Proxy 導入へ切替える運用にするか

### 判断観点
- 同時接続スパイク時の失敗率
- リトライ実装で吸収可能な範囲
- Proxy固定費と運用複雑度のトレードオフ

## 論点3: NAT Gateway なしでローカルDB閲覧・更新を行う方法

### 背景
- NAT Gateway は使わない方針
- ローカルのDBクライアント（DB Browser等）で接続確認したい

### 論点
- SSM port-forward を公式手順として採用するか
- 踏み台EC2の有無（最小構成/保守性）をどうするか

### 判断観点
- NAT不要で実現可能か
- 開発者の運用負荷（接続手順の分かりやすさ）
- セキュリティ境界（Public公開しないこと）

## 次に決める項目
- SharedStack に VPC を置く責務分離を採用するか
- Aurora v2 の初期 `min ACU` をいくつにするか
- NATなしローカル接続の標準手順を `SSM port-forward` に固定するか
