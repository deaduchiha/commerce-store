import type {
  AdminAttribute,
  AdminBrand,
  AdminCategory,
  AdminCollection,
  AdminTag,
} from '#/orpc/schemas/admin/catalog'

export type CatalogEntity
  = | AdminBrand
    | AdminCategory
    | AdminAttribute
    | AdminCollection
    | AdminTag

export type AttributeType = AdminAttribute['type']
export type AttributeScope = AdminAttribute['scope']
export type CollectionType = AdminCollection['type']
export type TagType = AdminTag['type']

export interface BrandFormValue {
  name: string
  slug: string
  description: string
  websiteUrl: string
  isActive: boolean
}

export interface CategoryFormValue {
  name: string
  slug: string
  parentId: string
  description: string
  sortOrder: number
  isActive: boolean
}

export interface AttributeFormValue {
  name: string
  code: string
  type: AttributeType
  scope: AttributeScope
  unit: string
  isFilterable: boolean
  isVariantOption: boolean
  isRequired: boolean
  valuesText: string
}

export interface CollectionFormValue {
  name: string
  slug: string
  type: CollectionType
  description: string
  isActive: boolean
}

export interface TagFormValue {
  name: string
  slug: string
  type: TagType
  color: string
  isActive: boolean
}
