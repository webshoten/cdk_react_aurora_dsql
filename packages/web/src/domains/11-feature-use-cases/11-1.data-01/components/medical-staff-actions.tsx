import { Button } from "@/shared/ui/button.tsx";

/*
 * # 医療スタッフ操作ボタン
 *
 * ## 目的
 * 一覧に対する追加/削除アクションを提供する。
 *
 * ## 説明
 * 実行中状態や設定エラーに応じてボタン活性を制御する。
 */
interface MedicalStaffActionsProps {
  configError: string | null;
  isAddingRandom: boolean;
  isClearing: boolean;
  onAddRandom: () => Promise<void>;
  onClear: () => Promise<void>;
}

export function MedicalStaffActions(props: MedicalStaffActionsProps) {
  const { configError, isAddingRandom, isClearing, onAddRandom, onClear } = props;
  const isDisabled = Boolean(configError) || isAddingRandom || isClearing;

  return (
    <div className="flex flex-wrap gap-2">
      <Button disabled={isDisabled} onClick={onAddRandom}>
        {isAddingRandom ? "追加中..." : "ランダム追加"}
      </Button>
      <Button disabled={isDisabled} onClick={onClear} variant="outline">
        {isClearing ? "削除中..." : "全削除"}
      </Button>
    </div>
  );
}
