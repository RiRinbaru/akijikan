import './WeekCalendar.css'

// 候補ごとの区間
type EventWindow = {
    id: string
    start_at: string
    end_at: string
}

// WeekCalendarが必要な情報
type WeekCalendarProps = {
    startDate: string
    endDate: string
    windows: EventWindow[]
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
    const windowStart = new Date(window.start_at)
    const windowEnd = new Date(window.end_at)

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

// ほんへ
function WeekCalendar({
    startDate,
    endDate,
    windows,
}: WeekCalendarProps) {
    const dates = getDates(startDate, endDate)

    const hours = Array.from(
        { length: 24 },
        (_, i) => i
    )

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
                                        top: `${style.top}px`,
                                        height: `${style.height}px`,
                                    }}
                                />
                            )
                        })}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default WeekCalendar