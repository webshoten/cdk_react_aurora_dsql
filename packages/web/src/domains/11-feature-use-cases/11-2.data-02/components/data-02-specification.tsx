import { CardDescription, CardTitle } from "@/shared/ui/card.tsx";

/*
 * # 11-2 仕様説明ヘッダ
 *
 * ## 目的
 * 11-2.data-02 の検証観点を画面上に明示する。
 *
 * ## 説明
 * Presigned URL 発行、S3 PUT、DB 登録、一覧確認の流れを表示する。
 */
export function Data02Specification() {
  return (
    <>
      <CardTitle>11-2.data-02</CardTitle>
      <CardDescription>画像登録（React + GraphQL Lambda + S3 Presigned URL）</CardDescription>
      <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
        <p className="font-medium">このページで確認する仕様</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
          <li>createImageUploadUrl で S3 PUT 用 URL を発行できること</li>
          <li>ブラウザから S3 へ PUT し、registerImage で DB 登録できること</li>
          <li>images Query で一覧とサムネイル表示を確認できること</li>
        </ul>
      </div>
    </>
  );
}
