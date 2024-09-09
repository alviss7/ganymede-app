import { invoke } from '@tauri-apps/api/core'

import { Button } from '@/components/ui/button.tsx'
import { useState } from 'react'
import './main.css'
import { TitleBar } from '@/title-bar.tsx'

export function App() {
  const [greetMsg, setGreetMsg] = useState('')

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke('greet', { name: 'Green' }))
  }

  return (
    <>
      <TitleBar />
      <main className="container">
        <Button onClick={greet} variant="destructive">
          Greet
        </Button>
        <p>{greetMsg}</p>
      </main>
    </>
  )
}
