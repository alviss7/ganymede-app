import { useCallback, useEffect, useRef } from 'react'

export function GuideFrame({
  className,
  text,
}: {
  className?: string
  text: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  const checkForCheckboxes = useCallback((element: HTMLDivElement) => {
    const checkboxes: Array<HTMLInputElement> = Array.from(element.querySelectorAll('input[type="checkbox"]'))

    const checkboxesClean = checkboxes.map((checkbox, index) => {
      const onChange = (evt: Event) => {
        const input = evt.currentTarget as HTMLInputElement
        console.log('checkbox changed', index, input)

        // const parent = checkbox.parentElement
        // if (parent) {
        //   parent.classList.toggle('checked', checkbox.checked)
        // }
      }

      checkbox.addEventListener('change', onChange)

      return () => checkbox.removeEventListener('change', onChange)
    })

    return () => {
      checkboxesClean.forEach((evt) => {
        evt()
      })
    }
  }, [])

  useEffect(() => {
    console.log(ref.current)

    if (ref.current) {
      checkForCheckboxes(ref.current)
    }
  }, [checkForCheckboxes])

  {
    /* dangerouslySetInnerHTML for now but keep in mind for script tags */
  }
  return <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: text }} />
}
