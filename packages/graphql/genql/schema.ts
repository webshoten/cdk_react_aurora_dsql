// @ts-nocheck
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Scalars = {
    String: string,
    Int: number,
    Boolean: boolean,
}

export interface MedicalStaff {
    institutionCode: (Scalars['String'] | null)
    name: (Scalars['String'] | null)
    profession: (Scalars['String'] | null)
    staffCode: (Scalars['String'] | null)
    __typename: 'MedicalStaff'
}

export interface Mutation {
    seedMedicalStaffs: (UpsertMedicalStaffsPayload | null)
    __typename: 'Mutation'
}

export interface Query {
    medicalStaffsByInstitution: (MedicalStaff[] | null)
    seedItems: (SeedItem[] | null)
    __typename: 'Query'
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

export interface MedicalStaffGenqlSelection{
    institutionCode?: boolean | number
    name?: boolean | number
    profession?: boolean | number
    staffCode?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MutationGenqlSelection{
    seedMedicalStaffs?: UpsertMedicalStaffsPayloadGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueryGenqlSelection{
    medicalStaffsByInstitution?: (MedicalStaffGenqlSelection & { __args: {institutionCode: Scalars['String']} })
    seedItems?: SeedItemGenqlSelection
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
    


    const Query_possibleTypes: string[] = ['Query']
    export const isQuery = (obj?: { __typename?: any } | null): obj is Query => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQuery"')
      return Query_possibleTypes.includes(obj.__typename)
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
    