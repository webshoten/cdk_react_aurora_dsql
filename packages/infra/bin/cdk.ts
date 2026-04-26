#!/usr/bin/env node
import * as os from "node:os";
import { ApiStack } from "@infra/lib/stacks/app/api-stack";
import { DbStack } from "@infra/lib/stacks/app/db-stack";
import { OpsStack } from "@infra/lib/stacks/app/ops-stack";
import { WebStack } from "@infra/lib/stacks/app/web-stack";
import { SharedStack } from "@infra/lib/stacks/shared/shared-stack";
import * as cdk from "aws-cdk-lib/core";

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

  const apiStack = new ApiStack(app, `${resourcePrefix}-api`, {
    dbClusterArn: dbStack.clusterArn,
    dbEndpoint: dbStack.endpoint,
    env,
    stage,
    resourcePrefix,
    sharedEnv,
  });
  apiStack.addDependency(dbStack);

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
