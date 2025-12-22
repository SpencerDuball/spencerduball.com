import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/p/$slug')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/posts/p/$slug"!</div>
}
