// @ts-nocheck
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Scalars = {
    String: string,
    Int: number,
    Boolean: boolean,
}

export interface Image {
    contentType: (Scalars['String'] | null)
    downloadUrl: (Scalars['String'] | null)
    fileName: (Scalars['String'] | null)
    imageId: (Scalars['String'] | null)
    imagePath: (Scalars['String'] | null)
    sizeBytes: (Scalars['Int'] | null)
    __typename: 'Image'
}

export interface MedicalStaff {
    institutionCode: (Scalars['String'] | null)
    name: (Scalars['String'] | null)
    profession: (Scalars['String'] | null)
    staffCode: (Scalars['String'] | null)
    __typename: 'MedicalStaff'
}

export interface Mutation {
    addRandomMedicalStaff: (UpsertMedicalStaffsPayload | null)
    clearMedicalStaffsByInstitution: (UpsertMedicalStaffsPayload | null)
    createImageUploadUrl: (PresignedUploadPayload | null)
    registerImage: (RegisterImagePayload | null)
    seedMedicalStaffs: (UpsertMedicalStaffsPayload | null)
    __typename: 'Mutation'
}

export interface PresignedUploadPayload {
    imagePath: (Scalars['String'] | null)
    uploadUrl: (Scalars['String'] | null)
    __typename: 'PresignedUploadPayload'
}

export interface Query {
    images: (Image[] | null)
    medicalStaffsByInstitution: (MedicalStaff[] | null)
    seedItems: (SeedItem[] | null)
    __typename: 'Query'
}

export interface RegisterImagePayload {
    appliedCount: (Scalars['Int'] | null)
    __typename: 'RegisterImagePayload'
}

export interface SeedItem {
    code: (Scalars['String'] | null)
    label: (Scalars['String'] | null)
    __typename: 'SeedItem'
}

export interface UpsertMedicalStaffsPayload {
    appliedCount: (Scalars['Int'] | null)
    __typename: 'UpsertMedicalStaffsPayload'
}

export interface ImageGenqlSelection{
    contentType?: boolean | number
    downloadUrl?: boolean | number
    fileName?: boolean | number
    imageId?: boolean | number
    imagePath?: boolean | number
    sizeBytes?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MedicalStaffGenqlSelection{
    institutionCode?: boolean | number
    name?: boolean | number
    profession?: boolean | number
    staffCode?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MutationGenqlSelection{
    addRandomMedicalStaff?: (UpsertMedicalStaffsPayloadGenqlSelection & { __args: {institutionCode: Scalars['String']} })
    clearMedicalStaffsByInstitution?: (UpsertMedicalStaffsPayloadGenqlSelection & { __args: {institutionCode: Scalars['String']} })
    createImageUploadUrl?: (PresignedUploadPayloadGenqlSelection & { __args: {contentType: Scalars['String'], fileName: Scalars['String']} })
    registerImage?: (RegisterImagePayloadGenqlSelection & { __args: {contentType: Scalars['String'], fileName: Scalars['String'], imagePath: Scalars['String'], sizeBytes: Scalars['Int']} })
    seedMedicalStaffs?: UpsertMedicalStaffsPayloadGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface PresignedUploadPayloadGenqlSelection{
    imagePath?: boolean | number
    uploadUrl?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueryGenqlSelection{
    images?: ImageGenqlSelection
    medicalStaffsByInstitution?: (MedicalStaffGenqlSelection & { __args: {institutionCode: Scalars['String']} })
    seedItems?: SeedItemGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface RegisterImagePayloadGenqlSelection{
    appliedCount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SeedItemGenqlSelection{
    code?: boolean | number
    label?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UpsertMedicalStaffsPayloadGenqlSelection{
    appliedCount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


    const Image_possibleTypes: string[] = ['Image']
    export const isImage = (obj?: { __typename?: any } | null): obj is Image => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isImage"')
      return Image_possibleTypes.includes(obj.__typename)
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
    


    const SeedItem_possibleTypes: string[] = ['SeedItem']
    export const isSeedItem = (obj?: { __typename?: any } | null): obj is SeedItem => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSeedItem"')
      return SeedItem_possibleTypes.includes(obj.__typename)
    }
    


    const UpsertMedicalStaffsPayload_possibleTypes: string[] = ['UpsertMedicalStaffsPayload']
    export const isUpsertMedicalStaffsPayload = (obj?: { __typename?: any } | null): obj is UpsertMedicalStaffsPayload => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUpsertMedicalStaffsPayload"')
      return UpsertMedicalStaffsPayload_possibleTypes.includes(obj.__typename)
    }
    