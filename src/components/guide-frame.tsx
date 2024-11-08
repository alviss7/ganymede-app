import { useToggleGuideCheckbox } from '@/mutations/toggle-guide-checkbox.mutation'
import parse from 'html-react-parser'
import { useProgressStep } from '@/hooks/use_progress_step'
import { useSuspenseQuery } from '@tanstack/react-query'
import { confQuery } from '@/queries/conf.query'
import { copyPosition } from '@/lib/copy-position'

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

  let checkboxesCount = 0

  return (
    <div className={className}>
      {parse(html, {
        replace: (domNode) => {
          const posReg = /(.*)\[(-?\d+),\s?(-?\d+)\](\w*)/

          if (domNode.type === 'text') {
            const groups = posReg.exec(domNode.data)

            if (!groups) return
            console.log(groups)

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

          if (domNode.type === 'tag' && domNode.name === 'input' && domNode.attribs.type === 'checkbox') {
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
        },
      })}
    </div>
  )
}
