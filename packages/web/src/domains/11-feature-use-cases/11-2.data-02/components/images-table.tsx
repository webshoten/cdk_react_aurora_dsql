import type { ImageRow } from "./types.ts";

/*
 * # 画像一覧テーブル
 *
 * ## 目的
 * 登録済み画像をサムネイル付きで一覧表示する。
 *
 * ## 説明
 * データが 0 件の場合は描画せず、存在時のみテーブルを表示する。
 */
interface ImagesTableProps {
  images: ImageRow[];
}

export function ImagesTable({ images }: ImagesTableProps) {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-[820px] text-sm">
        <thead className="bg-muted/60">
          <tr>
            <th className="px-4 py-2 text-left font-medium">thumbnail</th>
            <th className="px-4 py-2 text-left font-medium">fileName</th>
            <th className="px-4 py-2 text-left font-medium">contentType</th>
            <th className="px-4 py-2 text-left font-medium">sizeBytes</th>
            <th className="px-4 py-2 text-left font-medium">imagePath</th>
          </tr>
        </thead>
        <tbody>
          {images.map((image, index) => (
            <tr className="border-t border-border" key={image.imageId ?? `image-${index}`}>
              <td className="px-4 py-2">
                {image.downloadUrl ? (
                  <img
                    alt={image.fileName ?? "image"}
                    className="h-12 w-12 rounded border border-border object-cover"
                    src={image.downloadUrl}
                  />
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </td>
              <td className="px-4 py-2">{image.fileName ?? "-"}</td>
              <td className="px-4 py-2">{image.contentType ?? "-"}</td>
              <td className="px-4 py-2">{image.sizeBytes ?? "-"}</td>
              <td className="px-4 py-2 font-mono text-xs">{image.imagePath ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
