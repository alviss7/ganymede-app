import { useToggleGuideCheckbox } from '@/mutations/toggle-guide-checkbox.mutation'
import parse from 'html-react-parser'
import { useProgressStep } from '@/hooks/use_progress_step'

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
  const toggleGuideCheckbox = useToggleGuideCheckbox()
  const step = useProgressStep(guideId, stepIndex)

  let checkboxesCount = 0

  return (
    <div className={className}>
      {parse(html, {
        replace: (domNode) => {
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
