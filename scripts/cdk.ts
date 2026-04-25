/**
 * cdk-pf 全 CDK 操作のエントリポイント。
 *
 *   tsx scripts/cdk.ts <subcommand> [options]
 *
 * サブコマンド:
 *   deploy           AppStack 群（db + api + web）をデプロイ
 *   deploy-shared    SharedStack 群（将来の共有基盤受け口）をデプロイ
 *   diff             AppStack 群の差分表示
 *   destroy          AppStack 群を破棄
 *   destroy-shared   SharedStack 群を破棄
 *
 * 共通オプション:
 *   --shared <env>     必須。共有環境名（例: dev）
 *   --stage <stage>    AppStack のステージ名。未指定なら whoami
 *   --profile <name>   AWS profile。未指定なら AWS_PROFILE → "default"
 *
 * `--` 以降は cdk CLI へそのまま渡す。
 */
import { Command } from "commander";
import { deploy } from "./commands/deploy.ts";
import { deployShared } from "./commands/deploy-shared.ts";
import { destroy } from "./commands/destroy.ts";
import { destroyShared } from "./commands/destroy-shared.ts";
import { diff } from "./commands/diff.ts";
import type { RawOptions } from "./lib/options.ts";

const program = new Command().name("cdk").description("cdk-pf CDK 操作 CLI").passThroughOptions();

const commonOptions = (cmd: Command): Command =>
  cmd
    .option("-s, --shared <env>", "共有環境名（必須）")
    .option("--stage <stage>", "ステージ名（既定: whoami）")
    .option("--profile <name>", "AWS profile（既定: AWS_PROFILE → default）");

commonOptions(program.command("deploy"))
  .description("AppStack（db + api + web）デプロイ")
  .action((opts: RawOptions, cmd: Command) => deploy(opts, cmd.args));

commonOptions(program.command("deploy-shared"))
  .description("SharedStack（placeholder）デプロイ")
  .action((opts: RawOptions, cmd: Command) => deployShared(opts, cmd.args));

commonOptions(program.command("diff"))
  .description("AppStack 差分")
  .action((opts: RawOptions, cmd: Command) => diff(opts, cmd.args));

commonOptions(program.command("destroy"))
  .description("AppStack 破棄")
  .action((opts: RawOptions, cmd: Command) => destroy(opts, cmd.args));

commonOptions(program.command("destroy-shared"))
  .description("SharedStack 破棄")
  .action((opts: RawOptions, cmd: Command) => destroyShared(opts, cmd.args));

program.parseAsync(process.argv).catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
