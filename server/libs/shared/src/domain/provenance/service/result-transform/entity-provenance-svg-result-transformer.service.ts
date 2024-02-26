import { Injectable } from '@nestjs/common'
import { EntityType } from '@shared/domain/entity/domain/entity.type'
import { hierarchy, linkVertical, select, tree } from 'd3'
import fs from 'fs/promises'
import { JSDOM } from 'jsdom'
import path from 'path'
import { EntityProvenance } from '../../model/entity-provenance'
import { EntityProvenanceSvgOptions } from '../../model/entity-provenance-svg-options'
import { EntityProvenanceResultTransformerService } from './entity-provenance-result-transformer.service'
import DOMPurify from 'isomorphic-dompurify'

// TODO(PFDA-4835) - use import after introducing bundler with nestjs
const assetsPath = path.join(
  __dirname,
  '../../../../../../../../../../libs/shared/src/domain/provenance/assets',
)
const assetNames = [
  'main.css',
  'file-icon.svg',
  'user-icon.svg',
  'app-icon.svg',
  'asset-icon.svg',
  'comparison-icon.svg',
  'job-icon.svg',
  'workflow-icon.svg',
]
const assetPromises = assetNames.map((i) =>
  fs.readFile(path.join(assetsPath, i), 'utf8').catch(() => ''),
)

@Injectable()
export class EntityProvenanceSvgResultTransformerService
  implements EntityProvenanceResultTransformerService<'svg'>
{
  async transform(
    provenance: EntityProvenance,
    options?: EntityProvenanceSvgOptions,
  ): Promise<string> {
    const [css, fileIcon, userIcon, appIcon, assetIcon, comparisonIcon, jobIcon, workflowIcon] =
      await Promise.all(assetPromises)

    const nodeTypeToIconMap = {
      file: fileIcon,
      user: userIcon,
      app: appIcon,
      asset: assetIcon,
      comparison: comparisonIcon,
      job: jobIcon,
      workflow: workflowIcon,
    } satisfies Record<EntityType, string>

    const nodeSize = {
      width: 200,
      height: 36,
    }

    const verticalSpacing = 50

    const treeLayout = tree()
      .nodeSize([nodeSize.width, nodeSize.height + verticalSpacing])
      .separation((a, b) => (a.parent === b.parent ? 1.1 : 1.3))

    const root = hierarchy(provenance, (d) => d.parents)
    const links = treeLayout(root).links()

    const nodes = root.descendants()

    const { maxX, maxY, minX, minY } = this.getBoundaries(
      nodes as unknown as Array<{
        x: number
        y: number
      }>,
    )

    const canvasSize = {
      width: Math.abs(minX) + maxX + nodeSize.width,
      height: Math.abs(minY) + maxY + nodeSize.height,
    }

    const dom = new JSDOM('<svg class="canvas"></svg>')
    const svg = select(dom.window.document.querySelector('.canvas'))

    if (!options?.omitStyles) {
      svg.append('style').html(css)
    }

    const g = svg
      .attr('width', canvasSize.width)
      .attr('height', canvasSize.height)
      .append('g')
      .attr('transform', `translate(${Math.abs(minX)}, ${Math.abs(minY)})`)

    const linkPathGenerator = linkVertical<unknown, { x: number; y: number }>()
      .x((d) => d.x + nodeSize.width / 2)
      .y((d) => d.y + nodeSize.height / 2)

    g.selectAll('path')
      .data(links)
      .enter()
      .append('path')
      .classed('node-path', true)
      .attr('d', linkPathGenerator)

    g.selectAll('foreignObject')
      .data(nodes)
      .enter()
      .append('foreignObject')
      .classed('node', true)
      .attr('width', nodeSize.width)
      .attr('height', nodeSize.height)
      .attr('x', (d) => (d as unknown as { x: number }).x)
      .attr('y', (d) => (d as unknown as { y: number }).y)
      .append('div')
      .attr('xmlns', 'http://www.w3.org/1999/xhtml')
      .append('div')
      .classed('content', true)
      .append('a')
      .attr('href', (d) => d.data.data.url)
      .attr('target', '_blank')
      .html((d) => nodeTypeToIconMap[d.data.data.type])
      .append('span')
      .text((d) => `${d.data.data.title}`)

    if (options?.pixelated) {
      g.selectAll('foreignObject.node').classed('pixelated', true)
    }

    return DOMPurify.sanitize(dom.window.document.querySelector('svg.canvas')!.outerHTML, {
      ADD_TAGS: ['foreignObject'],
    })
  }

  async getStyles() {
    return await assetPromises[0]
  }

  private getBoundaries(nodes: Array<{ x: number; y: number }>): {
    minY: number
    minX: number
    maxY: number
    maxX: number
  } {
    const result = {} as { minY: number; minX: number; maxY: number; maxX: number }

    nodes.forEach((node) => {
      if (result.minY == null || result.minY > node.y) {
        result.minY = node.y
      }

      if (result.minX == null || result.minX > node.x) {
        result.minX = node.x
      }

      if (result.maxY == null || result.maxY < node.y) {
        result.maxY = node.y
      }

      if (result.maxX == null || result.maxX < node.x) {
        result.maxX = node.x
      }
    })

    return result
  }
}
