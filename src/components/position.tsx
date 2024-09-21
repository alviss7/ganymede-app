export function Position({
  pos_x,
  pos_y,
}: {
  pos_x: number
  pos_y: number
}) {
  // TODO: click to copy or to open in maps
  return (
    <span className="w-14 font-semibold text-yellow-400">
      [{pos_x},{pos_y}]
    </span>
  )
}
