#!/usr/bin/env node
import * as os from "node:os";
import { ApiStack } from "@infra/lib/stacks/app/api-stack";
import { DbStack } from "@infra/lib/stacks/app/db-stack";
import { OpsStack } from "@infra/lib/stacks/app/ops-stack";
import { StorageStack } from "@infra/lib/stacks/app/storage-stack";
import { WebStack } from "@infra/lib/stacks/app/web-stack";
import { SharedStack } from "@infra/lib/stacks/shared/shared-stack";
import * as cdk from "aws-cdk-lib/core";

/*
 * # CDK アプリケーションエントリ
 *
 * ## 目的
 * 全 Stack のインスタンス化と依存解決を行う synth 入口。`cdk` CLI から実行される。
 *
 * ## 説明
 * 環境構成は 2 層: SharedStack（環境ごと 1 つ・長命）と App 系 Stack（stage ごと・破棄前提）。
 * shared-env は context または CDK_SHARED_ENV から、stage は context または OS ユーザー名から解決。
 * shared-only=true 指定時は SharedStack のみ synth する（共有層だけ事前構築する用途）。
 * App 層は Db → Api / Ops の順に依存。Web は API URL を受けるが addDependency なし（CFN 側で参照解決のみ）。
 *
 * ## NOTE
 * - リージョン既定値を ap-northeast-1 でハードコード。CDK_DEFAULT_REGION 未設定時のフォールバック。
 */
const app = new cdk.App();
const stage = app.node.tryGetContext("stage") || os.userInfo().username;
const sharedEnv = app.node.tryGetContext("shared-env") || process.env.CDK_SHARED_ENV;
const sharedOnly = app.node.tryGetContext("shared-only") === "true";

if (!sharedEnv) {
  throw new Error(
    "--context shared-env=<env> または環境変数 CDK_SHARED_ENV を指定してください（例: dev）",
  );
}

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || "ap-northeast-1",
};

// SharedStack 群（環境に1つ・長命）
new SharedStack(app, `pf-${sharedEnv}-shared`, { env, sharedEnv });

// AppStack（stage ごと・破棄前提）
if (!sharedOnly) {
  const resourcePrefix = `pf-${sharedEnv}-${stage}`;
  const dbStack = new DbStack(app, `${resourcePrefix}-db`, {
    env,
    sharedEnv,
    stage,
    resourcePrefix,
  });

  const storageStack = new StorageStack(app, `${resourcePrefix}-storage`, {
    env,
    sharedEnv,
    stage,
    resourcePrefix,
  });

  const apiStack = new ApiStack(app, `${resourcePrefix}-api`, {
    dbClusterArn: dbStack.clusterArn,
    dbEndpoint: dbStack.endpoint,
    imageBucketName: storageStack.imageBucketName,
    imagePrefix: storageStack.imagePrefix,
    env,
    stage,
    resourcePrefix,
    sharedEnv,
  });
  apiStack.addDependency(dbStack);
  apiStack.addDependency(storageStack);

  const opsStack = new OpsStack(app, `${resourcePrefix}-ops`, {
    dbClusterArn: dbStack.clusterArn,
    dbEndpoint: dbStack.endpoint,
    env,
    stage,
    resourcePrefix,
    sharedEnv,
  });
  opsStack.addDependency(dbStack);

  new WebStack(app, `${resourcePrefix}-web`, {
    env,
    sharedEnv,
    stage,
    resourcePrefix,
    apiUrl: apiStack.apiUrl,
  });
}
