import { ChangeStep } from '@/components/change-step.tsx'
import { GenericLoader } from '@/components/generic-loader.tsx'
import { Position } from '@/components/position.tsx'
import { Button } from '@/components/ui/button.tsx'
import { useSetConf } from '@/mutations/set-conf.mutation.ts'
import { confQuery } from '@/queries/conf.query.ts'
import { guidesQuery } from '@/queries/guides.query.ts'
import { Page } from '@/routes/-page.tsx'
import { GuideProgress } from '@/types/profile.ts'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, notFound } from '@tanstack/react-router'
import { MapIcon } from 'lucide-react'
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
  loader: async ({ context, params }) => {
    const [downloads, conf] = await Promise.all([
      await context.queryClient.ensureQueryData(guidesQuery),
      await context.queryClient.ensureQueryData(confQuery),
    ])

    const guide = downloads.guides.find((guide) => guide.id === params.id)

    if (!guide) {
      throw notFound({
        data: 'guide not found',
      })
    }

    const profile = conf.profiles.find((profile) => profile.id === conf.profileInUse)

    if (!profile) {
      throw notFound({
        data: 'profile not found',
      })
    }

    return guide
  },
  pendingComponent: Pending,
})

function Pending() {
  return (
    <Page title="" key="guide" to="/guides">
      <header className="flex h-11 items-center justify-between gap-2 bg-gray-500 p-2" />
      <div className="flex grow items-center justify-center">
        <GenericLoader />
      </div>
    </Page>
  )
}

function GuideIdPage() {
  const index = Route.useSearch({ select: (s) => s.step })
  const guide = Route.useLoaderData()
  const conf = useSuspenseQuery(confQuery)
  const setConf = useSetConf()
  const step = guide.steps[index]
  const navigate = Route.useNavigate()

  const changeStep = async (nextStep: (progress: Pick<GuideProgress, 'step'>) => number) => {
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
                      step: step < 0 ? 0 : step >= guide.steps.length ? guide.steps.length - 1 : step,
                    }
                  }

                  return progress
                })
              : [
                  ...p.progresses,
                  {
                    id: guide.id,
                    step: 1, // 1 means the second step
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

    await navigate({
      search: {
        step: nextStep(progress ?? { step: 0 }),
      },
    })
  }

  const onClickPrevious = async () => {
    if (index === 0) {
      return
    }

    await changeStep((progress) => progress.step - 1)
  }

  const onClickNext = async () => {
    if (index === guide.steps.length - 1) {
      return
    }

    await changeStep((progress) => progress.step + 1)
  }

  return (
    <Page key="guide" title={guide.name} to="/guides">
      <header className="sticky top-[66px] bg-gray-500">
        <div className="relative flex h-10 items-center justify-between gap-2 p-1">
          {step && (
            <>
              <Position pos_x={step.pos_x} pos_y={step.pos_y} />
              <ChangeStep
                current={index + 1}
                max={guide.steps.length}
                onPrevious={onClickPrevious}
                onNext={onClickNext}
              />
              <Button size="icon">
                <MapIcon className="size-4" />
              </Button>
            </>
          )}
        </div>
      </header>
      {/* dangerouslySetInnerHTML for now but keep in mind for script tags */}
      {step && <div className="guide p-2 text-sm leading-4" dangerouslySetInnerHTML={{ __html: step.web_text }}></div>}
    </Page>
  )
}
