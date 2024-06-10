import { Injectable } from '@nestjs/common'
import { EntityService } from '@shared/domain/entity/entity.service'
import fs from 'fs/promises'
import DOMPurify from 'isomorphic-dompurify'
import { JSDOM } from 'jsdom'
import path from 'path'
import { EntityProvenance } from '../../model/entity-provenance'
import { EntityProvenanceSvgOptions } from '../../model/entity-provenance-svg-options'
import { EntityProvenanceResultTransformerService } from './entity-provenance-result-transformer.service'

// D3 dropped CJS support in version 7. We cannot switch to ESM, as nestjs is not compatible.
// Because of that, it is not possible to compile and successfully start the app with a static import statement
// To get around this issue, we keep CJS during the compilation step and use dynamic import for D3 to have the
// dependency resolved by nodejs as ESM at runtime
const d3 = import('d3')

// TODO(PFDA-4835) - use import after introducing bundler with nestjs
const assetsPath = path.join(
  __dirname,
  '../../../../../../../../../../libs/shared/src/domain/provenance/assets',
)
const css = fs.readFile(path.join(assetsPath, 'main.css'), 'utf8').catch(() => '')

@Injectable()
export class EntityProvenanceSvgResultTransformerService
  implements EntityProvenanceResultTransformerService<'svg'>
{
  constructor(private readonly entityService: EntityService) {}

  async transform(
    provenance: EntityProvenance,
    options?: EntityProvenanceSvgOptions,
  ): Promise<string> {
    const { hierarchy, linkVertical, select, tree } = await d3

    const nodeSize = {
      width: 200,
      height: 36,
    }

    const verticalSpacing = 50
    const nodeHeightWithSpacing = nodeSize.height + verticalSpacing

    const treeLayout = tree()
      .nodeSize([nodeSize.width, nodeHeightWithSpacing])
      .separation((a, b) => (a.parent === b.parent ? 1.1 : 1.3))

    const childTreeLayout = tree()
      .nodeSize([nodeSize.width, -nodeHeightWithSpacing])
      .separation((a, b) => (a.parent === b.parent ? 1.1 : 1.3))

    const root = hierarchy(provenance, (d) => d.parents)
    const childRoot = hierarchy(provenance, (d) => d.children)
    const links = [...treeLayout(root).links(), ...childTreeLayout(childRoot).links()]

    const nodes = await Promise.all(
      root.descendants().map(async (node) => ({
        ...node,
        icon: await this.entityService.getEntityIcon(node.data.data.type),
      })),
    )

    const outputNodes = await Promise.all(
      childRoot
        .descendants()
        .filter((node) => node.depth !== 0)
        .map(async (node) => ({
          ...node,
          icon: await this.entityService.getEntityIcon(node.data.data.type),
        })),
    )

    nodes.push(...outputNodes)

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
      svg.append('style').html(await css)
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
      .attr('data-depth', (d) => d.depth)
      .attr('href', (d) => d.data.data.url)
      .attr('target', '_blank')
      .html((d) => d.icon)
      .append('span')
      .text((d) => `${d.data.data.title}`)

    if (options?.pixelated) {
      g.selectAll('foreignObject.node').classed('pixelated', true)
    }

    return DOMPurify.sanitize(dom.window.document.querySelector('svg.canvas')!.outerHTML, {
      ADD_TAGS: ['foreignObject'],
      ADD_ATTR: ['target'],
    })
  }

  async getStyles() {
    return await css
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
