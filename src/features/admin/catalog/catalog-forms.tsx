import type {
  AdminAttribute,
  AdminBrand,
  AdminCategory,
  AdminCollection,
  AdminTag,
} from '#/orpc/schemas/admin/catalog'
import type {
  AttributeFormValue,
  BrandFormValue,
  CategoryFormValue,
  CollectionFormValue,
  TagFormValue,
} from './catalog-types'

import {
  ActiveSwitch,
  SelectInput,
  TextAreaInput,
  TextInput,
} from './catalog-shared'

export const emptyBrandForm: BrandFormValue = {
  name: '',
  slug: '',
  description: '',
  websiteUrl: '',
  isActive: true,
}

export const emptyCategoryForm: CategoryFormValue = {
  name: '',
  slug: '',
  parentId: 'none',
  description: '',
  sortOrder: 0,
  isActive: true,
}

export const emptyAttributeForm: AttributeFormValue = {
  name: '',
  code: '',
  type: 'text',
  scope: 'product',
  unit: '',
  isFilterable: true,
  isVariantOption: false,
  isRequired: false,
  valuesText: '',
}

export const emptyCollectionForm: CollectionFormValue = {
  name: '',
  slug: '',
  type: 'manual',
  description: '',
  isActive: true,
}

export const emptyTagForm: TagFormValue = {
  name: '',
  slug: '',
  type: 'tag',
  color: '',
  isActive: true,
}

export function brandToForm(item: AdminBrand): BrandFormValue {
  return {
    name: item.name,
    slug: item.slug,
    description: item.description ?? '',
    websiteUrl: item.websiteUrl ?? '',
    isActive: item.isActive,
  }
}

export function categoryToForm(item: AdminCategory): CategoryFormValue {
  return {
    name: item.name,
    slug: item.slug,
    parentId: item.parentId ?? 'none',
    description: item.description ?? '',
    sortOrder: item.sortOrder,
    isActive: item.isActive,
  }
}

export function attributeToForm(item: AdminAttribute): AttributeFormValue {
  return {
    name: item.name,
    code: item.code,
    type: item.type,
    scope: item.scope,
    unit: item.unit ?? '',
    isFilterable: item.isFilterable,
    isVariantOption: item.isVariantOption,
    isRequired: item.isRequired,
    valuesText: item.values
      .map(value => value.value)
      .join('\n'),
  }
}

export function collectionToForm(item: AdminCollection): CollectionFormValue {
  return {
    name: item.name,
    slug: item.slug,
    type: item.type,
    description: item.description ?? '',
    isActive: item.isActive,
  }
}

export function tagToForm(item: AdminTag): TagFormValue {
  return {
    name: item.name,
    slug: item.slug,
    type: item.type,
    color: item.color ?? '',
    isActive: item.isActive,
  }
}

export function BrandForm({
  value,
  onChange,
}: {
  value: BrandFormValue
  onChange: (value: BrandFormValue) => void
}) {
  return (
    <div className="grid gap-4">
      <TextInput
        label="نام"
        value={value.name}
        onChange={name => onChange({ ...value, name })}
      />
      <TextInput
        label="اسلاگ"
        value={value.slug}
        dir="ltr"
        onChange={slug => onChange({ ...value, slug })}
      />
      <TextInput
        label="وب‌سایت"
        value={value.websiteUrl}
        dir="ltr"
        onChange={websiteUrl => onChange({ ...value, websiteUrl })}
      />
      <TextAreaInput
        label="توضیحات"
        value={value.description}
        onChange={description => onChange({ ...value, description })}
      />
      <ActiveSwitch
        checked={value.isActive}
        onChange={isActive => onChange({ ...value, isActive })}
      />
    </div>
  )
}

export function CategoryForm({
  value,
  parentOptions,
  onChange,
}: {
  value: CategoryFormValue
  parentOptions: AdminCategory[]
  onChange: (value: CategoryFormValue) => void
}) {
  return (
    <div className="grid gap-4">
      <TextInput
        label="نام"
        value={value.name}
        onChange={name => onChange({ ...value, name })}
      />
      <TextInput
        label="اسلاگ"
        value={value.slug}
        dir="ltr"
        onChange={slug => onChange({ ...value, slug })}
      />
      <SelectInput
        label="دسته والد"
        value={value.parentId}
        options={[
          ['none', 'بدون والد'],
          ...parentOptions.map(
            (category): [string, string] => [category.id, category.name],
          ),
        ]}
        onChange={parentId => onChange({ ...value, parentId })}
      />
      <TextInput
        label="ترتیب نمایش"
        type="number"
        value={String(value.sortOrder)}
        dir="ltr"
        onChange={sortOrder => onChange({
          ...value,
          sortOrder: Number(sortOrder) || 0,
        })}
      />
      <TextAreaInput
        label="توضیحات"
        value={value.description}
        onChange={description => onChange({ ...value, description })}
      />
      <ActiveSwitch
        checked={value.isActive}
        onChange={isActive => onChange({ ...value, isActive })}
      />
    </div>
  )
}

export function AttributeForm({
  value,
  onChange,
}: {
  value: AttributeFormValue
  onChange: (value: AttributeFormValue) => void
}) {
  return (
    <div className="grid gap-4">
      <TextInput
        label="نام"
        value={value.name}
        onChange={name => onChange({ ...value, name })}
      />
      <TextInput
        label="کد"
        value={value.code}
        dir="ltr"
        onChange={code => onChange({ ...value, code })}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <SelectInput
          label="نوع"
          value={value.type}
          options={[
            ['text', 'Text'],
            ['number', 'Number'],
            ['boolean', 'Boolean'],
            ['select', 'Select'],
            ['multiselect', 'Multi Select'],
            ['color', 'Color'],
            ['date', 'Date'],
          ]}
          onChange={type => onChange({ ...value, type })}
        />
        <SelectInput
          label="محدوده"
          value={value.scope}
          options={[
            ['product', 'Product'],
            ['variant', 'Variant'],
            ['both', 'Both'],
          ]}
          onChange={scope => onChange({ ...value, scope })}
        />
      </div>
      <TextInput
        label="واحد"
        value={value.unit}
        onChange={unit => onChange({ ...value, unit })}
      />
      <TextAreaInput
        label="مقادیر انتخابی"
        description="هر مقدار را در یک خط بنویسید. برای color/select/multiselect کاربرد دارد."
        value={value.valuesText}
        dir="ltr"
        onChange={valuesText => onChange({ ...value, valuesText })}
      />
      <div className="grid gap-3 md:grid-cols-3">
        <ActiveSwitch
          label="قابل فیلتر"
          checked={value.isFilterable}
          onChange={isFilterable => onChange({ ...value, isFilterable })}
        />
        <ActiveSwitch
          label="گزینه تنوع"
          checked={value.isVariantOption}
          onChange={isVariantOption => onChange({ ...value, isVariantOption })}
        />
        <ActiveSwitch
          label="اجباری"
          checked={value.isRequired}
          onChange={isRequired => onChange({ ...value, isRequired })}
        />
      </div>
    </div>
  )
}

export function CollectionForm({
  value,
  onChange,
}: {
  value: CollectionFormValue
  onChange: (value: CollectionFormValue) => void
}) {
  return (
    <div className="grid gap-4">
      <TextInput
        label="نام"
        value={value.name}
        onChange={name => onChange({ ...value, name })}
      />
      <TextInput
        label="اسلاگ"
        value={value.slug}
        dir="ltr"
        onChange={slug => onChange({ ...value, slug })}
      />
      <SelectInput
        label="نوع"
        value={value.type}
        options={[
          ['manual', 'Manual'],
          ['smart', 'Smart'],
        ]}
        onChange={type => onChange({ ...value, type })}
      />
      <TextAreaInput
        label="توضیحات"
        value={value.description}
        onChange={description => onChange({ ...value, description })}
      />
      <ActiveSwitch
        checked={value.isActive}
        onChange={isActive => onChange({ ...value, isActive })}
      />
    </div>
  )
}

export function TagForm({
  value,
  onChange,
}: {
  value: TagFormValue
  onChange: (value: TagFormValue) => void
}) {
  return (
    <div className="grid gap-4">
      <TextInput
        label="نام"
        value={value.name}
        onChange={name => onChange({ ...value, name })}
      />
      <TextInput
        label="اسلاگ"
        value={value.slug}
        dir="ltr"
        onChange={slug => onChange({ ...value, slug })}
      />
      <SelectInput
        label="نوع"
        value={value.type}
        options={[
          ['tag', 'Tag'],
          ['label', 'Label'],
        ]}
        onChange={type => onChange({ ...value, type })}
      />
      <TextInput
        label="رنگ"
        value={value.color}
        dir="ltr"
        placeholder="#111827"
        onChange={color => onChange({ ...value, color })}
      />
      <ActiveSwitch
        checked={value.isActive}
        onChange={isActive => onChange({ ...value, isActive })}
      />
    </div>
  )
}
