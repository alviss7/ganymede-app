import { useToggleGuideCheckbox } from '@/mutations/toggle-guide-checkbox.mutation'
import parse, { DOMNode, domToReact, type HTMLReactParserOptions } from 'html-react-parser'
import { useProgressStep } from '@/hooks/use_progress_step'
import { useSuspenseQuery } from '@tanstack/react-query'
import { confQuery } from '@/queries/conf.query'
import { copyPosition } from '@/lib/copy-position'
import { useOpenGuideLink } from '@/mutations/open-guide-link.mutation'

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
              className="inline-flex text-left font-semibold hover:saturate-50 focus-visible:saturate-[12.5%]"
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
        if (domNode.name === 'a') {
          const href = domNode.attribs.href ?? ''

          return (
            <button
              data-href={href}
              type="button"
              className="inline-flex text-left"
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
