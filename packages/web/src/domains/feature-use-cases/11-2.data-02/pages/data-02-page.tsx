import { resolveConfigError } from "@/app/config/runtime-config.ts";
import { Card, CardContent, CardHeader } from "@/shared/ui/card.tsx";
import { useCallback, useEffect, useState } from "react";
import { Data02Specification } from "../components/data-02-specification.tsx";
import { ImageStatusMessages } from "../components/image-status-messages.tsx";
import { ImageUploadControls } from "../components/image-upload-controls.tsx";
import { ImagesTable } from "../components/images-table.tsx";
import type { ImageRow } from "../components/types.ts";
import { useCreateImageUploadUrlMutation } from "../hooks/use-create-image-upload-url-mutation.ts";
import { useImagesQuery } from "../hooks/use-images-query.ts";
import { useRegisterImageMutation } from "../hooks/use-register-image-mutation.ts";

/*
 * # 11-2.data-02 ページ（画像アップロード検証）
 *
 * ## 目的
 * 画像アップロード（Presigned URL）と画像メタデータ登録（GraphQL）を end-to-end で確認する。
 */
export function Data02Page() {
  const configError = resolveConfigError();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [{ data, fetching, error }, reexecuteImagesQuery] = useImagesQuery(Boolean(configError));
  const [{ data: createUrlData, error: createUrlError }, createImageUploadUrl] =
    useCreateImageUploadUrlMutation();
  const [{ data: registerData, error: registerError }, registerImage] = useRegisterImageMutation();
  const [viewImages, setViewImages] = useState<ImageRow[]>([]);

  useEffect(() => {
    if (!data?.images) return;
    setViewImages(data.images);
  }, [data]);

  const selectedFileType = selectedFile?.type || "application/octet-stream";
  const handleUpload = useCallback(async () => {
    if (!selectedFile || configError) return;

    setIsUploading(true);
    try {
      const createResult = await createImageUploadUrl({
        fileName: selectedFile.name,
        contentType: selectedFileType,
      });
      const uploadUrl = createResult.data?.createImageUploadUrl?.uploadUrl;
      const imagePath = createResult.data?.createImageUploadUrl?.imagePath;

      if (!uploadUrl || !imagePath) {
        return;
      }

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "content-type": selectedFileType,
        },
        body: selectedFile,
      });
      if (!uploadResponse.ok) {
        throw new Error(`S3 upload failed: ${uploadResponse.status}`);
      }

      const registerResult = await registerImage({
        imagePath,
        fileName: selectedFile.name,
        contentType: selectedFileType,
        sizeBytes: selectedFile.size,
      });
      if (!registerResult.error) {
        setSelectedFile(null);
        setInputKey((current) => current + 1);
        reexecuteImagesQuery({ requestPolicy: "network-only" });
      }
    } finally {
      setIsUploading(false);
    }
  }, [
    configError,
    createImageUploadUrl,
    reexecuteImagesQuery,
    registerImage,
    selectedFile,
    selectedFileType,
  ]);

  return (
    <Card>
      <CardHeader>
        <Data02Specification />
      </CardHeader>
      <CardContent className="space-y-4">
        <ImageUploadControls
          configError={configError}
          inputKey={inputKey}
          isUploading={isUploading}
          onSelectFile={setSelectedFile}
          onUpload={handleUpload}
          selectedFile={selectedFile}
        />

        <ImageStatusMessages
          configError={configError}
          createUrlError={createUrlError}
          fetching={fetching}
          hasImages={viewImages.length > 0}
          imagePath={createUrlData?.createImageUploadUrl?.imagePath ?? null}
          queryError={error}
          registerAppliedCount={registerData?.registerImage?.appliedCount ?? null}
          registerError={registerError}
        />

        <ImagesTable images={viewImages} />
      </CardContent>
    </Card>
  );
}
