import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/guides')({
  component: Guides,
})

function Guides() {
  return <div className="flex grow flex-col">Hello from Guides!</div>
}
