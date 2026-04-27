import {
  addRandomMedicalStaff,
  clearMedicalStaffsByInstitution,
  listImages,
  listMedicalStaffsByInstitution,
  listSeedItems,
  registerImage,
  upsertDemoMedicalStaffs,
} from "@pf/core";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import SchemaBuilder from "@pothos/core";
import type { GraphqlContext } from "./context.ts";

const builder = new SchemaBuilder<{
  Context: GraphqlContext;
}>({});

const SeedItemRef = builder.objectRef<{
  code: string;
  label: string;
}>("SeedItem");

const MedicalStaffRef = builder.objectRef<{
  institutionCode: string;
  name: string;
  profession: string;
  staffCode: string;
}>("MedicalStaff");

const UpsertMedicalStaffsPayloadRef = builder.objectRef<{
  appliedCount: number;
}>("UpsertMedicalStaffsPayload");

const ImageRef = builder.objectRef<{
  contentType: string;
  downloadUrl: string;
  fileName: string;
  imageId: string;
  imagePath: string;
  sizeBytes: number;
}>("Image");

const PresignedUploadPayloadRef = builder.objectRef<{
  imagePath: string;
  uploadUrl: string;
}>("PresignedUploadPayload");

const RegisterImagePayloadRef = builder.objectRef<{
  appliedCount: number;
}>("RegisterImagePayload");

SeedItemRef.implement({
  fields: (t) => ({
    code: t.exposeString("code"),
    label: t.exposeString("label"),
  }),
});

MedicalStaffRef.implement({
  fields: (t) => ({
    staffCode: t.exposeString("staffCode"),
    institutionCode: t.exposeString("institutionCode"),
    name: t.exposeString("name"),
    profession: t.exposeString("profession"),
  }),
});

UpsertMedicalStaffsPayloadRef.implement({
  fields: (t) => ({
    appliedCount: t.exposeInt("appliedCount"),
  }),
});

ImageRef.implement({
  fields: (t) => ({
    imageId: t.exposeString("imageId"),
    imagePath: t.exposeString("imagePath"),
    fileName: t.exposeString("fileName"),
    contentType: t.exposeString("contentType"),
    sizeBytes: t.exposeInt("sizeBytes"),
    downloadUrl: t.exposeString("downloadUrl"),
  }),
});

PresignedUploadPayloadRef.implement({
  fields: (t) => ({
    imagePath: t.exposeString("imagePath"),
    uploadUrl: t.exposeString("uploadUrl"),
  }),
});

RegisterImagePayloadRef.implement({
  fields: (t) => ({
    appliedCount: t.exposeInt("appliedCount"),
  }),
});

builder.queryType({
  fields: (t) => ({
    seedItems: t.field({
      type: [SeedItemRef],
      resolve: async (_root, _args, context) => listSeedItems(context.dbClient),
    }),
    medicalStaffsByInstitution: t.field({
      type: [MedicalStaffRef],
      args: {
        institutionCode: t.arg.string({ required: true }),
      },
      resolve: async (_root, args, context) =>
        listMedicalStaffsByInstitution(context.dbClient, args.institutionCode),
    }),
    images: t.field({
      type: [ImageRef],
      resolve: async (_root, _args, context) => {
        const rows = await listImages(context.dbClient);

        return Promise.all(
          rows.map(async (row) => ({
            ...row,
            downloadUrl: await getSignedUrl(
              context.s3Client,
              new GetObjectCommand({
                Bucket: context.imageBucket,
                Key: row.imagePath,
              }),
              {
                expiresIn: context.presignedUrlExpiresSeconds,
              },
            ),
          })),
        );
      },
    }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    seedMedicalStaffs: t.field({
      type: UpsertMedicalStaffsPayloadRef,
      resolve: async (_root, _args, context) => ({
        appliedCount: await upsertDemoMedicalStaffs(context.dbClient),
      }),
    }),
    addRandomMedicalStaff: t.field({
      type: UpsertMedicalStaffsPayloadRef,
      args: {
        institutionCode: t.arg.string({ required: true }),
      },
      resolve: async (_root, args, context) => ({
        appliedCount: await addRandomMedicalStaff(context.dbClient, args.institutionCode),
      }),
    }),
    clearMedicalStaffsByInstitution: t.field({
      type: UpsertMedicalStaffsPayloadRef,
      args: {
        institutionCode: t.arg.string({ required: true }),
      },
      resolve: async (_root, args, context) => ({
        appliedCount: await clearMedicalStaffsByInstitution(context.dbClient, args.institutionCode),
      }),
    }),
    createImageUploadUrl: t.field({
      type: PresignedUploadPayloadRef,
      args: {
        contentType: t.arg.string({ required: true }),
        fileName: t.arg.string({ required: true }),
      },
      resolve: async (_root, args, context) => {
        const imagePath = buildImagePath(context.imagePrefix, args.fileName);
        const uploadUrl = await getSignedUrl(
          context.s3Client,
          new PutObjectCommand({
            Bucket: context.imageBucket,
            Key: imagePath,
            ContentType: args.contentType,
          }),
          {
            expiresIn: context.presignedUrlExpiresSeconds,
          },
        );

        return {
          imagePath,
          uploadUrl,
        };
      },
    }),
    registerImage: t.field({
      type: RegisterImagePayloadRef,
      args: {
        contentType: t.arg.string({ required: true }),
        fileName: t.arg.string({ required: true }),
        imagePath: t.arg.string({ required: true }),
        sizeBytes: t.arg.int({ required: true }),
      },
      resolve: async (_root, args, context) => ({
        appliedCount: await registerImage(context.dbClient, {
          imagePath: args.imagePath,
          fileName: args.fileName,
          contentType: args.contentType,
          sizeBytes: args.sizeBytes,
        }),
      }),
    }),
  }),
});

function buildImagePath(imagePrefix: string, fileName: string): string {
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${imagePrefix}${Date.now()}-${Math.floor(Math.random() * 10000)}-${sanitizedName}`;
}

/*
 * # GraphQL スキーマ定義
 *
 * ## 目的
 * Yoga サーバーに渡される GraphQL スキーマ本体。Pothos で型・Query・Mutation を組み立て最終的に GraphQLSchema を吐く。
 *
 * ## 説明
 * resolver は core の repository / use case 関数を直接呼び出す薄い層。
 * SeedItem / MedicalStaff / UpsertMedicalStaffsPayload の 3 型と、Query 2 件・Mutation 1 件で構成。
 */
export const schema = builder.toSchema();
