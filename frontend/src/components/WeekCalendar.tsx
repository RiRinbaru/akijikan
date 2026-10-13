import { useState } from 'react'
import './WeekCalendar.css'
import type {
    EventWindow,
    DraftWindow,
} from '../types/calendar'

// WeekCalendarが必要な情報
type WeekCalendarProps = {
    startDate: string
    endDate: string
    windows: EventWindow[]
    onWindowCreate?: (window: DraftWindow) => void
    onWindowDelete?: (id: string) => void
}

const MINUTES_PER_DAY = 1440

// 0時からの経過時間
function minutesFromStartOfDay(date: Date) {
    return date.getHours() * 60 + date.getMinutes()
}

// パーセンテージに変換
function minutesToPercent(minutes: number) {
    return (minutes / MINUTES_PER_DAY) * 100
}

// yyyy-mm-ddをdateに変換
function parseDate(date: string) {
    const [year, month, day] = date.split('-').map(Number)
    return new Date(year, month - 1, day)
}

// 画面表示のための文字列に変換
function formatDate(date: Date) {
    return `${date.getMonth() + 1}/${date.getDate()}`
}

// 表示しなきゃいけない日付分Date[]を作成
function getDates(startDate: string, endDate: string) {
    const start = parseDate(startDate)
    const end = parseDate(endDate)

    const dates: Date[] = []

    const current = new Date(start)

    while (current <= end) {
        dates.push(new Date(current))
        current.setDate(current.getDate() + 1)
    }

    return dates
}

// 上から何%だけ描画しないといけないか計算
function getWindowStyle(
    window: EventWindow,
    date: Date
) {
    const windowStart = window.startAt
    const windowEnd = window.endAt

    const dayStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        0,
        0,
        0
    )

    const dayEnd = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1,
        0,
        0,
        0
    )

    if (
        windowEnd <= dayStart ||
        windowStart >= dayEnd
    ) {
        return null
    }

    const visibleStart =
        windowStart < dayStart
            ? dayStart
            : windowStart

    const visibleEnd =
        windowEnd > dayEnd
            ? dayEnd
            : windowEnd

    const startMinutes =
        minutesFromStartOfDay(visibleStart)

    const durationMinutes =
        (visibleEnd.getTime() - visibleStart.getTime()) /
        1000 /
        60

    return {
        top: minutesToPercent(startMinutes),
        height: minutesToPercent(durationMinutes),
    }
}

// ドラッグしたところを今変更してる状態にする
function pointerToDate(
    event: React.PointerEvent<HTMLDivElement>,
    date: Date
) {
    const rect =
        event.currentTarget.getBoundingClientRect()

    const y = event.clientY - rect.top

    const ratio = Math.min(
        1,
        Math.max(0, y / rect.height)
    )

    const minutes = Math.round(
        ratio * MINUTES_PER_DAY
    )

    const result = new Date(date)

    result.setHours(0, minutes, 0, 0)

    return result
}

// ほんへ
function WeekCalendar({
    startDate,
    endDate,
    windows,
    onWindowCreate,
    onWindowDelete,
}: WeekCalendarProps) {
    const dates = getDates(startDate, endDate)
    const [draftWindow, setDraftWindow] = useState<DraftWindow | null>(null)

    const hours = Array.from(
        { length: 24 },
        (_, i) => i
    )

    //ドラッグ開始
    function handlePointerDown(
        event: React.PointerEvent<HTMLDivElement>,
        date: Date
    ) {
        const time = pointerToDate(event, date)

        event.currentTarget.setPointerCapture(
            event.pointerId
        )

        setDraftWindow({
            startAt: time,
            endAt: time,
        })
    }

    //ドラッグ中
    function handlePointerMove(
        event: React.PointerEvent<HTMLDivElement>,
        date: Date
    ) {
        if (draftWindow === null) {
            return
        }

        const time = pointerToDate(event, date)

        setDraftWindow({
            ...draftWindow,
            endAt: time,
        })
    }

    //ドラッグ終了
    function handlePointerUp() {
        if (draftWindow === null) {
            return
        }

        const startAt =
            draftWindow.startAt < draftWindow.endAt
                ? draftWindow.startAt
                : draftWindow.endAt

        const endAt =
            draftWindow.startAt < draftWindow.endAt
                ? draftWindow.endAt
                : draftWindow.startAt

        // クリックしただけなら区間を作らない
        if (startAt.getTime() !== endAt.getTime()) {
            onWindowCreate?.({
                startAt,
                endAt,
            })
        }

        setDraftWindow(null)
    }

    return (
        <div className="week-calendar">
            <div className="calendar-header">
                <div className="time-header" />

                {dates.map((date) => (
                    <div
                        className="day-header"
                        key={date.toISOString()}
                    >
                        {formatDate(date)}
                    </div>
                ))}
            </div>

            <div className="calendar-body">
                <div className="time-column">
                    {hours.map((hour) => (
                        <div
                            className="time-label"
                            key={hour}
                        >
                            {String(hour).padStart(2, '0')}:00
                        </div>
                    ))}
                </div>

                {dates.map((date) => (
                    <div
                        className="day-column"
                        key={date.toISOString()}
                        onPointerDown={(event) =>
                            handlePointerDown(event, date)
                        }
                        onPointerMove={(event) =>
                            handlePointerMove(event, date)
                        }
                        onPointerUp={handlePointerUp}
                    >
                        {hours.map((hour) => (
                            <div
                                className="hour-row"
                                key={hour}
                            />
                        ))}

                        {windows.map((window) => {
                            const style = getWindowStyle(
                                window,
                                date
                            )

                            if (style === null) {
                                return null
                            }

                            return (
                                <div
                                    key={window.id}
                                    className="event-window"
                                    style={{
                                        top: `${style.top}%`,
                                        height: `${style.height}%`,
                                    }}
                                    onPointerDown={(event) => {
                                        event.stopPropagation()
                                    }}
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        onWindowDelete?.(window.id)
                                    }}
                                />
                            )
                        })}

                        {draftWindow !== null &&
                            draftWindow.startAt.toDateString() ===
                            date.toDateString() && (() => {
                                const start =
                                    draftWindow.startAt <
                                        draftWindow.endAt
                                        ? draftWindow.startAt
                                        : draftWindow.endAt

                                const end =
                                    draftWindow.startAt <
                                        draftWindow.endAt
                                        ? draftWindow.endAt
                                        : draftWindow.startAt

                                const startMinutes =
                                    minutesFromStartOfDay(start)

                                const durationMinutes =
                                    (end.getTime() - start.getTime()) /
                                    1000 /
                                    60

                                return (
                                    <div
                                        className="draft-window"
                                        style={{
                                            top: `${minutesToPercent(
                                                startMinutes
                                            )}%`,
                                            height: `${minutesToPercent(
                                                durationMinutes
                                            )}%`,
                                        }}
                                    />
                                )
                            })()}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default WeekCalendar