import { Button } from "@/shared/ui/button.tsx";

/*
 * # 画像アップロード操作
 *
 * ## 目的
 * ファイル選択と登録実行の UI を提供する。
 *
 * ## 説明
 * 選択ファイル表示と実行中/エラー時のボタン制御を行う。
 */
interface ImageUploadControlsProps {
  configError: string | null;
  inputKey: number;
  isUploading: boolean;
  onSelectFile: (file: File | null) => void;
  onUpload: () => Promise<void>;
  selectedFile: File | null;
}

export function ImageUploadControls(props: ImageUploadControlsProps) {
  const { configError, inputKey, isUploading, onSelectFile, onUpload, selectedFile } = props;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="block w-full max-w-sm text-sm file:mr-3 file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-1.5"
          key={inputKey}
          onChange={(event) => {
            onSelectFile(event.target.files?.[0] ?? null);
          }}
          type="file"
        />
        <Button disabled={Boolean(configError) || !selectedFile || isUploading} onClick={onUpload}>
          {isUploading ? "登録中..." : "画像を登録"}
        </Button>
      </div>

      {selectedFile && (
        <p className="text-sm text-muted-foreground">
          selected: <code>{selectedFile.name}</code> ({selectedFile.size} bytes)
        </p>
      )}
    </>
  );
}
