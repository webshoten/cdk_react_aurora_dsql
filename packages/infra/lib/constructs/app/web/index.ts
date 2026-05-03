import { createWebBucket } from "@infra/lib/constructs/app/web/web-bucket";
import { buildWebConfigContent } from "@infra/lib/constructs/app/web/web-config";
import { createWebDeployment } from "@infra/lib/constructs/app/web/web-deployment";
import { createWebDistribution } from "@infra/lib/constructs/app/web/web-distribution";
import { Construct } from "constructs";

export interface WebConstructProps {
  resourcePrefix: string;
  apiUrl: string;
  cognitoRegion: string;
  userPoolId: string;
  userPoolClientId: string;
}

/*
 * # Web 配信基盤作成（S3 + CloudFront + 静的アセット配置）
 *
 * ## 目的
 * Web ビルド成果物（packages/web/dist）の配信基盤を立てる。stage ごとの CloudFront ディストリビューション + 専用 S3 バケット。
 *
 * ## 説明
 * - S3 はパブリックブロック。CloudFront からは Origin Access Control 経由で取得。
 * - SPA ルーティング対応: 403/404 を /index.html に書き換えて 200 で返す。
 * - 配信物に config.js を Source.data で注入し、apiUrl を実行時に window.__CONFIG__ で供給。
 *   API URL 変更時に Web バンドルを再ビルドしなくて済むのが狙い。
 * - distributionPaths ["/*"] 指定で BucketDeployment ごとに CloudFront 全体 invalidate。
 *
 * ## NOTE
 * - autoDeleteObjects + RemovalPolicy.DESTROY。stage 破棄前提。本番運用 stage では要見直し。
 */
export class WebConstruct extends Construct {
  public readonly distributionDomain: string;

  constructor(scope: Construct, id: string, props: WebConstructProps) {
    super(scope, id);

    const bucket = createWebBucket(this, "WebBucket");
    const distribution = createWebDistribution(this, "Distribution", bucket);
    const configContent = buildWebConfigContent({
      apiUrl: props.apiUrl,
      cognitoRegion: props.cognitoRegion,
      userPoolId: props.userPoolId,
      userPoolClientId: props.userPoolClientId,
    });

    createWebDeployment(this, "WebDeploy", {
      configContent,
      destinationBucket: bucket,
      distribution,
    });

    this.distributionDomain = distribution.distributionDomainName;
  }
}
