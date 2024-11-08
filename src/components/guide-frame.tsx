import { useToggleGuideCheckbox } from '@/mutations/toggle-guide-checkbox.mutation'
import parse, { DOMNode, domToReact, type HTMLReactParserOptions } from 'html-react-parser'
import { useProgressStep } from '@/hooks/use_progress_step'
import { useSuspenseQuery } from '@tanstack/react-query'
import { confQuery } from '@/queries/conf.query'
import { copyPosition } from '@/lib/copy-position'
import { useOpenGuideLink } from '@/mutations/open-guide-link.mutation'
import { cn } from '@/lib/utils'
import { writeText } from '@tauri-apps/plugin-clipboard-manager'

export function GuideFrame({
  className,
  html,
  guideId,
  stepIndex,
}: {
  className?: string
  html: string
  guideId: number
  stepIndex: number
}) {
  const conf = useSuspenseQuery(confQuery)
  const toggleGuideCheckbox = useToggleGuideCheckbox()
  const step = useProgressStep(guideId, stepIndex)
  const openGuideLink = useOpenGuideLink()

  let checkboxesCount = 0

  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      const posReg = /(.*)\[(-?\d+),\s?(-?\d+)\](\w*)/

      if (domNode.type === 'text') {
        const groups = posReg.exec(domNode.data)

        if (!groups) return

        const [, prefix, posX, posY, suffix] = groups

        return (
          <>
            {prefix}
            <button
              type="button"
              className="inline-flex font-semibold hover:saturate-50 focus:saturate-[12.5%]"
              onClick={async () => {
                await copyPosition(Number.parseInt(posX, 10), Number.parseInt(posY, 10), conf.data)
              }}
            >
              [{posX},{posY}]
            </button>{' '}
            {suffix}
          </>
        )
      }

      if (domNode.type === 'tag') {
        if (domNode.name === 'p' && domNode.children.length === 0) {
          const countEmptyP = (node: DOMNode | null): number => {
            if (!node) return 0

            if (node.type === 'tag' && node.name === 'p' && node.children.length === 0) {
              return 1 + countEmptyP(node.next as DOMNode | null)
            }

            return 0
          }

          const countNextEmptyP = countEmptyP(domNode)

          // disallow multiple empty p tags
          if (countNextEmptyP > 1) {
            return <></>
          }

          return <br />
        }

        if (
          domNode.attribs['data-type'] === 'custom-tag' &&
          (domNode.attribs.type === 'monster' || domNode.attribs.type === 'quest')
        ) {
          const name = domNode.attribs.name ?? ''
          const { class: nodeClassName, ...restAttribs } = domNode.attribs

          return (
            <div {...restAttribs} className={cn('inline-flex hover:saturate-150 focus:saturate-[25%]', nodeClassName)}>
              {domToReact([domNode.children[0]] as DOMNode[], options)}
              <button
                type="button"
                onClick={async (evt) => {
                  // open in browser if ctrl/cmd is pressed
                  if (navigator.userAgent.includes('AppleWebKit') ? evt.metaKey : evt.ctrlKey) {
                    openGuideLink.mutate(
                      `https://dofusdb.fr/fr/database/${domNode.attribs.type}/${domNode.attribs.dofusdbid}`,
                    )
                  } else {
                    await writeText(name)
                  }
                }}
              >
                {name}
              </button>
            </div>
          )
        }

        if (domNode.name === 'img') {
          const imgSrc = domNode.attribs.src ?? ''

          return (
            <button
              type="button"
              className="inline-flex self-end"
              onClick={() => {
                if (imgSrc !== '' && imgSrc.startsWith('http')) {
                  openGuideLink.mutate(imgSrc)
                }
              }}
            >
              <img {...domNode.attribs} draggable={false} className="select-none" />
            </button>
          )
        }

        if (domNode.name === 'a') {
          const href = domNode.attribs.href ?? ''

          return (
            <button
              data-href={href}
              type="button"
              className="inline-flex"
              onClick={() => {
                if (href !== '' && href.startsWith('http')) {
                  openGuideLink.mutate(href)
                }
              }}
            >
              {domToReact(domNode.children as DOMNode[], options)}
            </button>
          )
        }

        if (domNode.name === 'input' && domNode.attribs.type === 'checkbox') {
          const index = checkboxesCount++

          return (
            <input
              {...domNode.attribs}
              onChange={() => {
                toggleGuideCheckbox.mutate({
                  guideId,
                  checkboxIndex: index,
                  stepIndex,
                })
              }}
              checked={step.checkboxes.includes(index)}
            />
          )
        }
      }
    },
  }

  return <div className={className}>{parse(html, options)}</div>
}
