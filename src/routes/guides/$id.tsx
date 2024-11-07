import { ChangeStep } from '@/components/change-step.tsx'
import { GenericLoader } from '@/components/generic-loader.tsx'
import { Position } from '@/components/position.tsx'
import { cn } from '@/lib/utils'
import { useSetConf } from '@/mutations/set-conf.mutation.ts'
import { confQuery } from '@/queries/conf.query.ts'
import { Page } from '@/routes/-page.tsx'
import { GuideProgress } from '@/types/profile.ts'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useLayoutEffect } from 'react'
import { z } from 'zod'
import { GuideFrame } from '@/components/guide-frame'
import { useGuide } from '@/hooks/use_guide'

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: want to scroll to top when step changes
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [step])

  const changeStep = async (nextStep: (progress: Pick<GuideProgress, 'currentStep'>) => number): Promise<number> => {
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
                    const step = nextStep(progress)

                    return {
                      ...progress,
                      currentStep: step < 0 ? 0 : step >= guide.steps.length ? guide.steps.length - 1 : step,
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

    const progress = conf.data.profiles
      .find((p) => p.id === conf.data.profileInUse)
      ?.progresses.find((p) => p.id === guide.id)

    const newStep = nextStep(progress ?? { currentStep: 0 })

    await navigate({
      search: {
        step: newStep,
      },
    })

    return newStep
  }

  const onClickPrevious = async () => {
    if (index === 0) {
      return
    }

    await changeStep((progress) => progress.currentStep - 1)
  }

  const onClickNext = async () => {
    if (index === guide.steps.length - 1) {
      return
    }

    await changeStep((progress) => progress.currentStep + 1)
  }

  return (
    <Page key="guide" title={guide.name} to="/guides" pageTitleTextClassName="text-md leading-5 line-clamp-1">
      <header className="sticky top-[62px] bg-primary">
        <div className="relative flex h-10 items-center justify-between gap-2 p-1">
          {step && (
            <>
              <Position pos_x={step.pos_x} pos_y={step.pos_y} />
              <ChangeStep
                current={index + 1}
                max={guide.steps.length}
                onPrevious={onClickPrevious}
                onNext={onClickNext}
                setCurrent={async (current) => {
                  return changeStep(() => current - 1)
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
