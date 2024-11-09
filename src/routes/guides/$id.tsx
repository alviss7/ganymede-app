import { ChangeStep } from '@/components/change-step.tsx'
import { GenericLoader } from '@/components/generic-loader.tsx'
import { GuideFrame } from '@/components/guide-frame'
import { Position } from '@/components/position.tsx'
import { useGuide } from '@/hooks/use_guide'
import { cn } from '@/lib/utils'
import { useSetConf } from '@/mutations/set-conf.mutation.ts'
import { confQuery } from '@/queries/conf.query.ts'
import { Page } from '@/routes/-page.tsx'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useLayoutEffect } from 'react'
import { z } from 'zod'

const ParamsZod = z.object({
  id: z.coerce.number(),
})

const SearchZod = z.object({
  step: z.coerce.number(),
})

export const Route = createFileRoute('/guides/$id')({
  component: GuideIdPage,
  validateSearch: SearchZod.parse,
  params: {
    parse: ParamsZod.parse,
    stringify: (params) => ({ id: params.id.toString() }),
  },
  pendingComponent: Pending,
})

function Pending() {
  return (
    <Page title="" key="guide" to="/guides">
      <header className="flex h-10 items-center justify-between gap-2 bg-gray-500 p-2" />
      <div className="flex grow items-center justify-center">
        <GenericLoader />
      </div>
    </Page>
  )
}

function GuideIdPage() {
  const params = Route.useParams()
  const index = Route.useSearch({ select: (s) => s.step })
  const conf = useSuspenseQuery(confQuery)
  const guide = useGuide(params.id)
  const setConf = useSetConf()
  const step = guide.steps[index]
  const navigate = Route.useNavigate()
  const stepMax = guide.steps.length - 1

  // biome-ignore lint/correctness/useExhaustiveDependencies: want to scroll to top when step changes
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [step])

  const changeStep = async (nextStep: number) => {
    await setConf.mutateAsync({
      ...conf.data,
      profiles: conf.data.profiles.map((p) => {
        if (p.id === conf.data.profileInUse) {
          const existingProgress = p.progresses.find((progress) => progress.id === guide.id)

          return {
            ...p,
            progresses: existingProgress
              ? p.progresses.map((progress) => {
                  if (progress.id === guide.id) {
                    return {
                      ...progress,
                      currentStep: nextStep < 0 ? 0 : nextStep >= guide.steps.length ? stepMax : nextStep,
                    }
                  }

                  return progress
                })
              : [
                  ...p.progresses,
                  {
                    id: guide.id,
                    currentStep: 1, // 1 means the second step
                    steps: {},
                  },
                ],
          }
        }

        return p
      }),
    })

    await navigate({
      search: {
        step: nextStep,
      },
    })
  }

  const onClickPrevious = async (): Promise<boolean> => {
    if (index === 0) {
      return false
    }

    await changeStep(index - 1)

    return true
  }

  const onClickNext = async (): Promise<boolean> => {
    if (index === stepMax) {
      return false
    }

    await changeStep(index + 1)

    return true
  }

  return (
    <Page key="guide" title={guide.name} to="/guides" pageTitleTextClassName="text-md leading-5 line-clamp-1">
      <header className="sticky top-[62px] z-10 bg-primary">
        <div className="relative flex h-10 items-center justify-between gap-2 p-1">
          {step && (
            <>
              <Position pos_x={step.pos_x} pos_y={step.pos_y} />
              <ChangeStep
                currentIndex={index}
                maxIndex={stepMax}
                onPrevious={onClickPrevious}
                onNext={onClickNext}
                setCurrentIndex={async (currentIndex) => {
                  return changeStep(currentIndex)
                }}
              />
            </>
          )}
        </div>
      </header>
      {step && (
        <GuideFrame
          className={cn(
            'guide p-2 leading-5',
            conf.data.fontSize === 'Small' && 'text-sm leading-4',
            conf.data.fontSize === 'Large' && 'text-md leading-5',
            conf.data.fontSize === 'Extra' && 'text-lg leading-6',
          )}
          guideId={guide.id}
          html={step.web_text}
          stepIndex={index}
        />
      )}
    </Page>
  )
}
