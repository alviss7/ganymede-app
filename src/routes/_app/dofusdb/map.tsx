import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/dofusdb/map')({
  component: () => <iframe src="https://dofusdb.fr/fr/tools/map" className="size-full grow" allow="clipboard-write" />,
})
