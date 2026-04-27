import { CardDescription, CardTitle } from "@/shared/ui/card.tsx";

interface Data01SpecificationProps {
  institutionCode: string;
}

export function Data01Specification({ institutionCode }: Data01SpecificationProps) {
  return (
    <>
      <CardTitle>11-1.data-01 Medical Staff</CardTitle>
      <CardDescription>医療者Web表示（React + GraphQL Lambda）</CardDescription>
      <CardDescription>
        institutionCode: <code>{institutionCode}</code>
      </CardDescription>
      <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
        <p className="font-medium">このページで確認する仕様</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
          <li>一覧取得（Query）が成功し、スタッフ一覧が表示されること</li>
          <li>「ランダム追加」で `addRandomMedicalStaff`（Mutation）が実行されること</li>
          <li>「全削除」で `clearMedicalStaffsByInstitution`（Mutation）が実行されること</li>
          <li>Mutation 成功後に一覧が再取得され、最新状態が反映されること</li>
          <li>`config.js` 未設定時は API 呼び出しを止めてエラー表示すること</li>
        </ul>
      </div>
    </>
  );
}
