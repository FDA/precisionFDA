/**
 * Nodes (files and folders) that were not copied together
 * with their target scope.
 */
export class NodeCopyInputDto {
  destination: string
  notCopiedFolderNames: string[]
  notCopiedFileNames: string[]
}
