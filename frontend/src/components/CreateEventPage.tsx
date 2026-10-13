import { useState } from 'react'
import WeekCalendar from './WeekCalendar'

import type {
    DraftWindow,
    EventWindow,
} from '../types/calendar'

function CreateEventPage() {
    const [title, setTitle] = useState('')
    const [startDate, setStartDate] = useState('2026-10-19')
    const [endDate, setEndDate] = useState('2026-10-25')
    const [requiredMinutes, setRequiredMinutes] =
        useState<number | null>(null)

    const [windows, setWindows] =
        useState<EventWindow[]>([])

    const [createdSlug, setCreatedSlug] =
        useState<string | null>(null)

    function handleWindowCreate(window: DraftWindow) {
        const newWindow: EventWindow = {
            id: crypto.randomUUID(),
            startAt: window.startAt,
            endAt: window.endAt,
        }

        setWindows([
            ...windows,
            newWindow,
        ])
    }

    function handleWindowDelete(id: string) {
        setWindows(
            windows.filter(
                (window) => window.id !== id
            )
        )
    }

    async function handleCreateEvent() {
        const response = await fetch('/api/events', {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
            },

            body: JSON.stringify({
                title,
                startDate,
                endDate,
                requiredMinutes,

                windows: windows.map((window) => ({
                    startAt: window.startAt.toISOString(),
                    endAt: window.endAt.toISOString(),
                })),
            }),
        })

        const event = await response.json()

        window.location.href = `/events/${event.slug}`
    }

    return (
        <main>
            <h1>イベント作成</h1>

            <div>
                <label>
                    タイトル
                    <input
                        value={title}
                        onChange={(event) =>
                            setTitle(event.target.value)
                        }
                    />
                </label>
            </div>

            <div>
                <label>
                    開始日
                    <input
                        type="date"
                        value={startDate}
                        onChange={(event) =>
                            setStartDate(event.target.value)
                        }
                    />
                </label>

                <label>
                    終了日
                    <input
                        type="date"
                        value={endDate}
                        onChange={(event) =>
                            setEndDate(event.target.value)
                        }
                    />
                </label>
            </div>

            <div>
                <label>
                    必要時間（分）
                    <input
                        type="number"
                        value={requiredMinutes ?? ''}
                        onChange={(event) => {
                            const value = event.target.value

                            setRequiredMinutes(
                                value === ''
                                    ? null
                                    : Number(value)
                            )
                        }}
                    />
                </label>
            </div>

            <WeekCalendar
                startDate={startDate}
                endDate={endDate}
                windows={windows}
                onWindowCreate={handleWindowCreate}
                onWindowDelete={handleWindowDelete}
            />

            <button onClick={handleCreateEvent}>
                イベントを作成
            </button>

            {createdSlug !== null && (
                <p>
                    作成しました: {createdSlug}
                </p>
            )}
        </main>
    )
}

export default CreateEventPage