import type { CombinedError } from "urql";

/*
 * # 画像登録状態メッセージ
 *
 * ## 目的
 * 画像登録フローの状態と結果をユーザーへ表示する。
 *
 * ## 説明
 * エラー、実行中、最終登録情報、空状態を条件に応じて表示する。
 */
interface ImageStatusMessagesProps {
  configError: string | null;
  createUrlError: CombinedError | undefined;
  fetching: boolean;
  hasImages: boolean;
  imagePath: string | null;
  queryError: CombinedError | undefined;
  registerAppliedCount: number | null;
  registerError: CombinedError | undefined;
}

export function ImageStatusMessages(props: ImageStatusMessagesProps) {
  const {
    configError,
    createUrlError,
    fetching,
    hasImages,
    imagePath,
    queryError,
    registerAppliedCount,
    registerError,
  } = props;

  return (
    <>
      {configError && <pre className="text-sm text-red-600">{configError}</pre>}
      {!configError && queryError && <pre className="text-sm text-red-600">{queryError.message}</pre>}
      {!configError && createUrlError && (
        <pre className="text-sm text-red-600">{createUrlError.message}</pre>
      )}
      {!configError && registerError && (
        <pre className="text-sm text-red-600">{registerError.message}</pre>
      )}
      {!configError && imagePath && (
        <p className="text-sm text-muted-foreground">
          last imagePath: <code>{imagePath}</code>
        </p>
      )}
      {!configError && registerAppliedCount !== null && (
        <p className="text-sm text-muted-foreground">
          last register appliedCount: <code>{registerAppliedCount}</code>{" "}
          <span className="text-xs">(0 は既存データのためスキップで正常)</span>
        </p>
      )}
      {!configError && fetching && <p className="text-sm">loading...</p>}
      {!configError && !fetching && !hasImages && <p className="text-sm">images: 0</p>}
    </>
  );
}
