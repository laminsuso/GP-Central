import React, { useRef, useEffect, useState } from 'react'
import { useSupportChat } from '../hooks/useSupportChat'
import { Card, CardBody } from '../components/ui/Card'
import Button from '../components/ui/Button'

function bubbleColor(self) {
  return self ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
}

export default function SupportChatPage(){
  const { messages, loading, error, send, remove, user } = useSupportChat()
  const [text, setText] = useState('')
  const listRef = useRef(null)

  useEffect(() => {
    // Auto-scroll to bottom on new message
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      await send(text)
      setText('')
    } catch (e) {
      alert(e.message || 'Failed to send')
    }
  }

  return (
    <section className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{color:'var(--brand-ink)'}}>Support Chat</h2>
        <p className="text-sm text-gray-600 mt-1">You’re in the global support room. A team member will respond here.</p>

        <Card className="mt-4">
          <CardBody>
            <div
              ref={listRef}
              className="h-[420px] overflow-y-auto pr-2 space-y-3 border border-gray-100 rounded-xl p-3"
            >
              {loading && <p className="text-gray-500">Loading…</p>}
              {error && <p className="text-red-600">{error}</p>}
              {!loading && !messages.length && <p className="text-gray-500">No messages yet. Say hello 👋</p>}

              {messages.map(m => {
                const self = user && m.user_id === user.id
                return (
                  <div key={m.id} className={`max-w-[85%] rounded-2xl px-3 py-2 ${bubbleColor(self)} ${self ? 'ml-auto' : ''}`}>
                    <div className="text-sm whitespace-pre-wrap break-words">{m.body}</div>
                    <div className={`text-[10px] mt-1 opacity-70 ${self ? 'text-blue-50' : 'text-gray-500'}`}>
                      {new Date(m.created_at).toLocaleString()}
                    </div>
                    {self && (
                      <button
                        onClick={()=>remove(m.id).catch(e=>alert(e.message))}
                        className="text-[10px] underline mt-1"
                        title="Delete (available for a short time)"
                      >
                        delete
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            <form onSubmit={onSubmit} className="mt-3 flex gap-2">
              <input
                value={text}
                onChange={(e)=>setText(e.target.value)}
                placeholder="Type your message…"
                className="flex-1 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <Button type="submit">Send</Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </section>
  )
}
