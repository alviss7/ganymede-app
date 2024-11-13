import { listen, UnlistenFn } from '@tauri-apps/api/event'

export function onEvent<Payload>(event: string, cb: (eventName: string, payload: Payload) => void): UnlistenFn {
  const unlisten = listen(event, (evt) => {
    console.log(evt)

    cb(evt.event, evt.payload as Payload)
  })

  return () => {
    unlisten.then((u) => u())
  }
}
