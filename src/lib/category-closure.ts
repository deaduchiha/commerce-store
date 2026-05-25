import { db } from '#/db'
import { categories, categoryClosure } from '#/db/schema'

export async function rebuildCategoryClosure() {
  const rows = await db.select().from(categories)
  const byId = new Map(rows.map(row => [row.id, row]))

  const closureRows: Array<{
    ancestorId: string
    descendantId: string
    depth: number
  }> = []

  for (const category of rows) {
    closureRows.push({
      ancestorId: category.id,
      descendantId: category.id,
      depth: 0,
    })

    let parentId = category.parentId
    let depth = 1

    while (parentId) {
      closureRows.push({
        ancestorId: parentId,
        descendantId: category.id,
        depth,
      })

      parentId = byId.get(parentId)?.parentId ?? null
      depth += 1
    }
  }

  await db.delete(categoryClosure)

  if (closureRows.length > 0) {
    await db.insert(categoryClosure).values(closureRows)
  }
}

