export type TimeRange = {
    startAt: Date
    endAt: Date
}

// 候補ごとの区間
export type EventWindow = TimeRange & {
    id: string
}

// 作ってる途中の区間
export type DraftWindow = TimeRange

export type ApiEventWindow = {
    id: string
    start_at: string
    end_at: string
}