import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/dofusdb/hunt')({
  component: () => <iframe src="https://dofusdb.fr/fr/tools/treasure-hunt" className="size-full grow" />,
})
