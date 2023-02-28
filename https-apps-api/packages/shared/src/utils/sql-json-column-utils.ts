import { BaseEntity } from '../database/base-entity'
import { buildJsonPath } from './path'

export type ColumnNode<T extends BaseEntity> = {
  type: 'standard'
  value: keyof T
} | {
  type: 'json'
  sqlColumn: keyof T
  path: Array<string | number>
}

type MysqlJsonNode = {
  type: 'string'
  value: string
} | {
  type: 'number'
  value: number
} | {
  type: 'jsonArrayExpression'
  value: MysqlJsonNode[]
}

const mysqlJsonExtractKey = (sqlColumnName: string, jsonSelector: ReturnType<typeof buildJsonPath>) =>
  `JSON_EXTRACT(\`${sqlColumnName}\`, '$${jsonSelector}')`

const renderMysqlNode = (node: MysqlJsonNode): any => {
  switch (node.type) {
    case 'string':
      return `'${node.value}'`;
    case 'number':
      return node.value
    case 'jsonArrayExpression':
      return `JSON_ARRAY(${node.value.map(renderMysqlNode).join(', ')})`
    default:
      throw new Error('Invalid node type')
  }
}

export const mysqlJsonSet = <EntityT extends BaseEntity, KeyT extends keyof EntityT = keyof EntityT>(
  sqlColumnName: KeyT,
  jsonSelector: ReturnType<typeof buildJsonPath>,
  // TODO(samuel) implement proper type inference from entity and json path
  node: MysqlJsonNode,
) =>
  `JSON_SET(\`${String(sqlColumnName)}\`, '$${jsonSelector}', ${renderMysqlNode(node)})`

export const mysqlJsonArrayAppend = <
  EntityT extends BaseEntity,
  KeyT extends keyof EntityT = keyof EntityT
>(
  sqlColumnName: KeyT,
  jsonSelector: ReturnType<typeof buildJsonPath>,
  // TODO(samuel) implement proper type inference from entity and json path
  node: MysqlJsonNode,
) =>
  `JSON_ARRAY_APPEND(\`${String(sqlColumnName)}\`, '$${jsonSelector}', ${renderMysqlNode(node)})`

export const resolveColumnNode = <T extends BaseEntity>(node: ColumnNode<T>) => {
  switch (node.type) {
    case 'standard':
      return node.value
    case 'json':
      return mysqlJsonExtractKey(node.sqlColumn.toString(), buildJsonPath(node.path))
    default:
      throw new Error('Invalid column node type')
  }
}
