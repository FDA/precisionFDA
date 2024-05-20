import { Injectable } from '@nestjs/common'
import { Node } from '@shared/domain/user-file/node.entity'
import sanitize from 'sanitize-filename'
import {FILE_STI_TYPE} from "@shared/domain/user-file/user-file.types";

interface FilesByFolder {
  [key: string]: Node[]
}

/**
 * Component that should contain helper methods for nodes.
 * TODO Ideally this should contain all functions from user-file.helper.
 */
@Injectable()
export class NodeHelper {
  /**
   * Returns a string with warnings for unclosed files.
   * @param nodesToCheck
   */
  getWarningsForUnclosedFiles(nodesToCheck: Node[]) {
    // Collect names of unclosed files
    const unclosedFileNames = nodesToCheck
      .filter((node) => node.stiType === FILE_STI_TYPE.USERFILE && node.state !== 'closed')
      .map((node) => `'${node.name}'`)

    // Check if there are any unclosed files
    if (unclosedFileNames.length === 0) {
      return null
    } else {
      // Join the file names and construct the warning message
      const fileList = unclosedFileNames.join(', ')
      return `Warning: The following files couldn't be attached in the download: ${fileList}.`
    }
  }

  /**
   * Sanitizes the names of the nodes.
   * @param nodes
   */
  sanitizeNodeNames(nodes: Node[]): Node[] {
    return nodes.map((node) => {
      const sanitizedNode = { ...node } as Node
      sanitizedNode.name = sanitize(node.name)
      return sanitizedNode
    })
  }

  private renameFile = (name: string, index: number) => {
    const dotIndex = name.lastIndexOf('.')
    if (dotIndex !== -1) {
      // Insert index before the extension
      return `${name.substring(0, dotIndex)} ${index}${name.substring(dotIndex)}`
    }
    // No extension found, append index to the end
    return `${name} ${index}`
  }

  /**
   * Renames duplicate files in the same folder. First file is not renamed.
   * Second file is renamed to "name 1", third to "name 2" and so on.
   * @param nodes
   */
  renameDuplicateFiles(nodes: Node[]) {
    // Group files by their parentFolderId
    const filesByFolder = nodes.reduce<FilesByFolder>((acc, node) => {
      if (node.stiType === FILE_STI_TYPE.FOLDER) {
        return acc
      }
      const folderId = node.parentFolder === null ? 'root' : node.parentFolder.id.toString()
      if (!acc[folderId]) {
        acc[folderId] = []
      }
      acc[folderId].push(node)
      return acc
    }, {})

    // Process each group to find and rename duplicates
    Object.values(filesByFolder).forEach((group) => {
      const nameCounts: { [key: string]: number } = {}

      group.forEach((node) => {
        let name = node.name
        if (nameCounts[name]) {
          // Duplicate found, rename it
          let newName: string
          do {
            newName = this.renameFile(name, nameCounts[name])
            nameCounts[name] = nameCounts[name] + 1 || 1 // Increment the count for the original name
          } while (nameCounts[newName])
          {
            // Ensure the new name is also unique within the folder
            name = newName
          }
        }
        nameCounts[name] = (nameCounts[name] || 0) + 1 // Initialize or increment the count for the new/unique name
        node.name = name // Update the node's name
      })
    })

    return nodes
  }
}
