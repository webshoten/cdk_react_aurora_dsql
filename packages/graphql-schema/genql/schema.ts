// @ts-nocheck
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Scalars = {
    String: string,
    Int: number,
    Boolean: boolean,
}

export interface CreateUserPayload {
    /** 作成されたユーザー名。 */
    username: (Scalars['String'] | null)
    __typename: 'CreateUserPayload'
}

export interface CurrentUser {
    /** 認証ユーザーに付与されたグループ一覧。 */
    groups: (Scalars['String'][] | null)
    /** 認証ユーザーの所属機関コード。未設定時は null。 */
    institutionCode: (Scalars['String'] | null)
    /** 認証ユーザーの一意ID（sub）。 */
    userId: (Scalars['String'] | null)
    /** 認証ユーザーのユーザー名。 */
    username: (Scalars['String'] | null)
    __typename: 'CurrentUser'
}

export interface Image {
    /** MIME type。 */
    contentType: (Scalars['String'] | null)
    /** 署名付きダウンロードURL。 */
    downloadUrl: (Scalars['String'] | null)
    /** 元ファイル名。 */
    fileName: (Scalars['String'] | null)
    /** 画像ID。 */
    imageId: (Scalars['String'] | null)
    /** S3 上の画像パス。 */
    imagePath: (Scalars['String'] | null)
    /** ファイルサイズ（byte）。 */
    sizeBytes: (Scalars['Int'] | null)
    __typename: 'Image'
}

export interface IotState {
    /** state entity 種別。 */
    entityType: (Scalars['String'] | null)
    /** 最新反映イベント名。 */
    event: (Scalars['String'] | null)
    /** 医療機関 ID。 */
    medicalInstitutionId: (Scalars['String'] | null)
    /** patient state JSON 文字列。未設定時は null。 */
    patientStateJson: (Scalars['String'] | null)
    /** 監視ルーム ID。 */
    roomId: (Scalars['String'] | null)
    /** room state JSON 文字列。未設定時は null。 */
    roomStateJson: (Scalars['String'] | null)
    /** session UID（roomId）。 */
    sessionUid: (Scalars['String'] | null)
    /** MQTT topic。 */
    topic: (Scalars['String'] | null)
    /** 最終更新日時（ISO8601）。 */
    updatedAt: (Scalars['String'] | null)
    __typename: 'IotState'
}

export interface MedicalStaff {
    /** 所属機関コード。 */
    institutionCode: (Scalars['String'] | null)
    /** スタッフ名。 */
    name: (Scalars['String'] | null)
    /** 職種。 */
    profession: (Scalars['String'] | null)
    /** スタッフコード。 */
    staffCode: (Scalars['String'] | null)
    __typename: 'MedicalStaff'
}

export interface Mutation {
    /** 指定機関へランダムスタッフを1件追加する。 */
    addRandomMedicalStaff: (UpsertMedicalStaffsPayload | null)
    /** 指定機関のスタッフを全削除する。 */
    clearMedicalStaffsByInstitution: (UpsertMedicalStaffsPayload | null)
    /** 画像アップロード用の署名付きURLを発行する。 */
    createImageUploadUrl: (PresignedUploadPayload | null)
    /** 認証基盤と users テーブルへユーザーを作成する。 */
    createUser: (CreateUserPayload | null)
    /** room 開始イベントを backend 経由で MQTT publish する。 */
    publishOnStartRoom: (PublishOnStartRoomPayload | null)
    /** アップロード済み画像のメタデータを登録する。 */
    registerImage: (RegisterImagePayload | null)
    /** ユーザーのパスワードを再設定し、一時パスワードを返す。 */
    resetUserPassword: (ResetUserPasswordPayload | null)
    /** デモ用スタッフデータを投入/更新する。 */
    seedMedicalStaffs: (UpsertMedicalStaffsPayload | null)
    /** 認証ユーザー自身の MFA 設定を users テーブルへ同期する。 */
    syncCurrentUserMfaPreference: (SyncCurrentUserMfaPreferencePayload | null)
    __typename: 'Mutation'
}

export interface PresignedUploadPayload {
    /** アップロード先画像パス。 */
    imagePath: (Scalars['String'] | null)
    /** 署名付きアップロードURL。 */
    uploadUrl: (Scalars['String'] | null)
    __typename: 'PresignedUploadPayload'
}

export interface PublishOnStartRoomPayload {
    /** publish 実行成功フラグ。 */
    published: (Scalars['Boolean'] | null)
    /** publish 先 topic。 */
    topic: (Scalars['String'] | null)
    __typename: 'PublishOnStartRoomPayload'
}

export interface Query {
    /** 認証済みユーザー情報を返す。未認証時は null。 */
    currentUser: (CurrentUser | null)
    /** 画像メタデータ一覧を返し、各行に署名付きダウンロードURLを付与する。 */
    images: (Image[] | null)
    /** 指定 roomId に対応する IoT state 一覧を返す。 */
    iotStatesByRoom: (IotState[] | null)
    /** 指定機関のスタッフ一覧を返す。 */
    medicalStaffsByInstitution: (MedicalStaff[] | null)
    /** シード項目一覧を返す。 */
    seedItems: (SeedItem[] | null)
    /** users テーブルの一覧を返す。 */
    users: (User[] | null)
    __typename: 'Query'
}

export interface RegisterImagePayload {
    /** 反映件数。 */
    appliedCount: (Scalars['Int'] | null)
    __typename: 'RegisterImagePayload'
}

export interface ResetUserPasswordPayload {
    /** 再設定後の一時パスワード。 */
    temporaryPassword: (Scalars['String'] | null)
    /** 再設定対象のユーザー名。 */
    username: (Scalars['String'] | null)
    __typename: 'ResetUserPasswordPayload'
}

export interface SeedItem {
    /** シード項目コード。 */
    code: (Scalars['String'] | null)
    /** シード項目ラベル。 */
    label: (Scalars['String'] | null)
    __typename: 'SeedItem'
}

export interface SyncCurrentUserMfaPreferencePayload {
    /** 同期成功フラグ。 */
    synced: (Scalars['Boolean'] | null)
    __typename: 'SyncCurrentUserMfaPreferencePayload'
}

export interface UpsertMedicalStaffsPayload {
    /** 反映件数。 */
    appliedCount: (Scalars['Int'] | null)
    __typename: 'UpsertMedicalStaffsPayload'
}

export interface User {
    /** レコード作成日時（ISO8601）。 */
    createdAt: (Scalars['String'] | null)
    /** メールアドレス。 */
    email: (Scalars['String'] | null)
    /** 所属医療機関 ID。未設定時は null。 */
    medicalInstitutionId: (Scalars['String'] | null)
    /** MFA 設定（none/sms/email）。 */
    mfaPreference: (Scalars['String'] | null)
    /** Cognito sub を保持するユーザーID。 */
    uid: (Scalars['String'] | null)
    /** ユーザー種別。 */
    userType: (Scalars['String'] | null)
    /** ユーザー名。 */
    username: (Scalars['String'] | null)
    __typename: 'User'
}

export interface CreateUserPayloadGenqlSelection{
    /** 作成されたユーザー名。 */
    username?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CurrentUserGenqlSelection{
    /** 認証ユーザーに付与されたグループ一覧。 */
    groups?: boolean | number
    /** 認証ユーザーの所属機関コード。未設定時は null。 */
    institutionCode?: boolean | number
    /** 認証ユーザーの一意ID（sub）。 */
    userId?: boolean | number
    /** 認証ユーザーのユーザー名。 */
    username?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ImageGenqlSelection{
    /** MIME type。 */
    contentType?: boolean | number
    /** 署名付きダウンロードURL。 */
    downloadUrl?: boolean | number
    /** 元ファイル名。 */
    fileName?: boolean | number
    /** 画像ID。 */
    imageId?: boolean | number
    /** S3 上の画像パス。 */
    imagePath?: boolean | number
    /** ファイルサイズ（byte）。 */
    sizeBytes?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface IotStateGenqlSelection{
    /** state entity 種別。 */
    entityType?: boolean | number
    /** 最新反映イベント名。 */
    event?: boolean | number
    /** 医療機関 ID。 */
    medicalInstitutionId?: boolean | number
    /** patient state JSON 文字列。未設定時は null。 */
    patientStateJson?: boolean | number
    /** 監視ルーム ID。 */
    roomId?: boolean | number
    /** room state JSON 文字列。未設定時は null。 */
    roomStateJson?: boolean | number
    /** session UID（roomId）。 */
    sessionUid?: boolean | number
    /** MQTT topic。 */
    topic?: boolean | number
    /** 最終更新日時（ISO8601）。 */
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MedicalStaffGenqlSelection{
    /** 所属機関コード。 */
    institutionCode?: boolean | number
    /** スタッフ名。 */
    name?: boolean | number
    /** 職種。 */
    profession?: boolean | number
    /** スタッフコード。 */
    staffCode?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MutationGenqlSelection{
    /** 指定機関へランダムスタッフを1件追加する。 */
    addRandomMedicalStaff?: (UpsertMedicalStaffsPayloadGenqlSelection & { __args: {institutionCode: Scalars['String']} })
    /** 指定機関のスタッフを全削除する。 */
    clearMedicalStaffsByInstitution?: (UpsertMedicalStaffsPayloadGenqlSelection & { __args: {institutionCode: Scalars['String']} })
    /** 画像アップロード用の署名付きURLを発行する。 */
    createImageUploadUrl?: (PresignedUploadPayloadGenqlSelection & { __args: {contentType: Scalars['String'], fileName: Scalars['String']} })
    /** 認証基盤と users テーブルへユーザーを作成する。 */
    createUser?: (CreateUserPayloadGenqlSelection & { __args: {email: Scalars['String'], password: Scalars['String'], username: Scalars['String']} })
    /** room 開始イベントを backend 経由で MQTT publish する。 */
    publishOnStartRoom?: (PublishOnStartRoomPayloadGenqlSelection & { __args: {roomId: Scalars['String'], startedAt: Scalars['String']} })
    /** アップロード済み画像のメタデータを登録する。 */
    registerImage?: (RegisterImagePayloadGenqlSelection & { __args: {contentType: Scalars['String'], fileName: Scalars['String'], imagePath: Scalars['String'], sizeBytes: Scalars['Int']} })
    /** ユーザーのパスワードを再設定し、一時パスワードを返す。 */
    resetUserPassword?: (ResetUserPasswordPayloadGenqlSelection & { __args: {username: Scalars['String']} })
    /** デモ用スタッフデータを投入/更新する。 */
    seedMedicalStaffs?: UpsertMedicalStaffsPayloadGenqlSelection
    /** 認証ユーザー自身の MFA 設定を users テーブルへ同期する。 */
    syncCurrentUserMfaPreference?: (SyncCurrentUserMfaPreferencePayloadGenqlSelection & { __args: {mfaPreference: Scalars['String']} })
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PresignedUploadPayloadGenqlSelection{
    /** アップロード先画像パス。 */
    imagePath?: boolean | number
    /** 署名付きアップロードURL。 */
    uploadUrl?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PublishOnStartRoomPayloadGenqlSelection{
    /** publish 実行成功フラグ。 */
    published?: boolean | number
    /** publish 先 topic。 */
    topic?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueryGenqlSelection{
    /** 認証済みユーザー情報を返す。未認証時は null。 */
    currentUser?: CurrentUserGenqlSelection
    /** 画像メタデータ一覧を返し、各行に署名付きダウンロードURLを付与する。 */
    images?: ImageGenqlSelection
    /** 指定 roomId に対応する IoT state 一覧を返す。 */
    iotStatesByRoom?: (IotStateGenqlSelection & { __args: {roomId: Scalars['String']} })
    /** 指定機関のスタッフ一覧を返す。 */
    medicalStaffsByInstitution?: (MedicalStaffGenqlSelection & { __args: {institutionCode: Scalars['String']} })
    /** シード項目一覧を返す。 */
    seedItems?: SeedItemGenqlSelection
    /** users テーブルの一覧を返す。 */
    users?: UserGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RegisterImagePayloadGenqlSelection{
    /** 反映件数。 */
    appliedCount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface ResetUserPasswordPayloadGenqlSelection{
    /** 再設定後の一時パスワード。 */
    temporaryPassword?: boolean | number
    /** 再設定対象のユーザー名。 */
    username?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SeedItemGenqlSelection{
    /** シード項目コード。 */
    code?: boolean | number
    /** シード項目ラベル。 */
    label?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SyncCurrentUserMfaPreferencePayloadGenqlSelection{
    /** 同期成功フラグ。 */
    synced?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UpsertMedicalStaffsPayloadGenqlSelection{
    /** 反映件数。 */
    appliedCount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UserGenqlSelection{
    /** レコード作成日時（ISO8601）。 */
    createdAt?: boolean | number
    /** メールアドレス。 */
    email?: boolean | number
    /** 所属医療機関 ID。未設定時は null。 */
    medicalInstitutionId?: boolean | number
    /** MFA 設定（none/sms/email）。 */
    mfaPreference?: boolean | number
    /** Cognito sub を保持するユーザーID。 */
    uid?: boolean | number
    /** ユーザー種別。 */
    userType?: boolean | number
    /** ユーザー名。 */
    username?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


    const CreateUserPayload_possibleTypes: string[] = ['CreateUserPayload']
    export const isCreateUserPayload = (obj?: { __typename?: any } | null): obj is CreateUserPayload => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCreateUserPayload"')
      return CreateUserPayload_possibleTypes.includes(obj.__typename)
    }
    


    const CurrentUser_possibleTypes: string[] = ['CurrentUser']
    export const isCurrentUser = (obj?: { __typename?: any } | null): obj is CurrentUser => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCurrentUser"')
      return CurrentUser_possibleTypes.includes(obj.__typename)
    }
    


    const Image_possibleTypes: string[] = ['Image']
    export const isImage = (obj?: { __typename?: any } | null): obj is Image => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isImage"')
      return Image_possibleTypes.includes(obj.__typename)
    }
    


    const IotState_possibleTypes: string[] = ['IotState']
    export const isIotState = (obj?: { __typename?: any } | null): obj is IotState => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isIotState"')
      return IotState_possibleTypes.includes(obj.__typename)
    }
    


    const MedicalStaff_possibleTypes: string[] = ['MedicalStaff']
    export const isMedicalStaff = (obj?: { __typename?: any } | null): obj is MedicalStaff => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMedicalStaff"')
      return MedicalStaff_possibleTypes.includes(obj.__typename)
    }
    


    const Mutation_possibleTypes: string[] = ['Mutation']
    export const isMutation = (obj?: { __typename?: any } | null): obj is Mutation => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMutation"')
      return Mutation_possibleTypes.includes(obj.__typename)
    }
    


    const PresignedUploadPayload_possibleTypes: string[] = ['PresignedUploadPayload']
    export const isPresignedUploadPayload = (obj?: { __typename?: any } | null): obj is PresignedUploadPayload => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPresignedUploadPayload"')
      return PresignedUploadPayload_possibleTypes.includes(obj.__typename)
    }
    


    const PublishOnStartRoomPayload_possibleTypes: string[] = ['PublishOnStartRoomPayload']
    export const isPublishOnStartRoomPayload = (obj?: { __typename?: any } | null): obj is PublishOnStartRoomPayload => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPublishOnStartRoomPayload"')
      return PublishOnStartRoomPayload_possibleTypes.includes(obj.__typename)
    }
    


    const Query_possibleTypes: string[] = ['Query']
    export const isQuery = (obj?: { __typename?: any } | null): obj is Query => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQuery"')
      return Query_possibleTypes.includes(obj.__typename)
    }
    


    const RegisterImagePayload_possibleTypes: string[] = ['RegisterImagePayload']
    export const isRegisterImagePayload = (obj?: { __typename?: any } | null): obj is RegisterImagePayload => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRegisterImagePayload"')
      return RegisterImagePayload_possibleTypes.includes(obj.__typename)
    }
    


    const ResetUserPasswordPayload_possibleTypes: string[] = ['ResetUserPasswordPayload']
    export const isResetUserPasswordPayload = (obj?: { __typename?: any } | null): obj is ResetUserPasswordPayload => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isResetUserPasswordPayload"')
      return ResetUserPasswordPayload_possibleTypes.includes(obj.__typename)
    }
    


    const SeedItem_possibleTypes: string[] = ['SeedItem']
    export const isSeedItem = (obj?: { __typename?: any } | null): obj is SeedItem => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSeedItem"')
      return SeedItem_possibleTypes.includes(obj.__typename)
    }
    


    const SyncCurrentUserMfaPreferencePayload_possibleTypes: string[] = ['SyncCurrentUserMfaPreferencePayload']
    export const isSyncCurrentUserMfaPreferencePayload = (obj?: { __typename?: any } | null): obj is SyncCurrentUserMfaPreferencePayload => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSyncCurrentUserMfaPreferencePayload"')
      return SyncCurrentUserMfaPreferencePayload_possibleTypes.includes(obj.__typename)
    }
    


    const UpsertMedicalStaffsPayload_possibleTypes: string[] = ['UpsertMedicalStaffsPayload']
    export const isUpsertMedicalStaffsPayload = (obj?: { __typename?: any } | null): obj is UpsertMedicalStaffsPayload => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUpsertMedicalStaffsPayload"')
      return UpsertMedicalStaffsPayload_possibleTypes.includes(obj.__typename)
    }
    


    const User_possibleTypes: string[] = ['User']
    export const isUser = (obj?: { __typename?: any } | null): obj is User => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUser"')
      return User_possibleTypes.includes(obj.__typename)
    }
    