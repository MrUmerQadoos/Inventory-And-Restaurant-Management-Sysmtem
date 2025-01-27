/**
 * This is an advanced example for creating icon bundles for Iconify SVG Framework.
 *
 * It creates a bundle from:
 * - All SVG files in a directory.
 * - Custom JSON files.
 * - Iconify icon sets.
 * - SVG framework.
 *
 * This example uses Iconify Tools to import and clean up icons.
 * For Iconify Tools documentation visit https://docs.iconify.design/tools/tools2/
 */
import { promises as fs } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { cleanupSVG, importDirectory, isEmptyColor, parseColors, runSVGO } from '@iconify/tools'
import { getIcons, getIconsCSS, stringToIcon } from '@iconify/utils'
import riJson from '@iconify/json/json/ri.json'
import lineMdJson from '@iconify/json/json/line-md.json'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const sources = {
  json: [
    { filename: 'ri', content: riJson },
    {
      filename: 'line-md',
      content: lineMdJson,
      icons: ['home-twotone-alt', 'github', 'document-list', 'document-code', 'image-twotone']
    }
  ],
  icons: ['bx-basket', 'bi-airplane-engines', 'tabler-anchor', 'uit-adobe-alt', 'twemoji-auto-rickshaw'],
  svg: []
}

const target = join(__dirname, 'generated-icons.css')

;(async function () {
  const dir = dirname(target)

  try {
    await fs.mkdir(dir, { recursive: true })
  } catch (err) {
    console.error('Error creating directory:', err)
  }

  const allIcons = []

  if (sources.icons) {
    const sourcesJSON = sources.json || []
    const organizedList = organizeIconsList(sources.icons)

    for (const prefix in organizedList) {
      const filename = require.resolve(`@iconify/json/json/${prefix}.json`)
      sourcesJSON.push({ filename, icons: organizedList[prefix] })
    }
  }

  if (sources.json) {
    for (const item of sources.json) {
      const content = item.content

      if (item.icons?.length) {
        const filteredContent = getIcons(content, item.icons)
        if (!filteredContent) throw new Error(`Cannot find required icons in ${item.filename}`)
        allIcons.push(filteredContent)
      } else {
        allIcons.push(content)
      }
    }
  }

  if (sources.svg) {
    for (const source of sources.svg) {
      const iconSet = await importDirectory(source.dir, { prefix: source.prefix })

      await iconSet.forEach(async (name, type) => {
        if (type !== 'icon') return

        const svg = iconSet.toSVG(name)
        if (!svg) {
          iconSet.remove(name)
          return
        }

        try {
          await cleanupSVG(svg)
          if (source.monotone) {
            await parseColors(svg, {
              defaultColor: 'currentColor',
              callback: (attr, colorStr, color) => (!color || isEmptyColor(color) ? colorStr : 'currentColor')
            })
          }
          await runSVGO(svg)
        } catch (err) {
          console.error(`Error parsing ${name} from ${source.dir}:`, err)
          iconSet.remove(name)
        }

        iconSet.fromSVG(name, svg)
      })

      allIcons.push(iconSet.export())
    }
  }

  const cssContent = allIcons
    .map(iconSet => getIconsCSS(iconSet, Object.keys(iconSet.icons), { iconSelector: '.{prefix}-{name}' }))
    .join('\n')

  await fs.writeFile(target, cssContent, 'utf8')
  console.log(`Saved CSS to ${target}!`)
})().catch(err => {
  console.error('Error during icon bundling:', err)
})

function organizeIconsList(icons) {
  const sorted = {}

  icons.forEach(icon => {
    const item = stringToIcon(icon)
    if (!item) return

    const prefix = item.prefix
    const prefixList = sorted[prefix] || (sorted[prefix] = [])

    if (!prefixList.includes(item.name)) prefixList.push(item.name)
  })

  return sorted
}
