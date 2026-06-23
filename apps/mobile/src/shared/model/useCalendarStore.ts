import { create } from "zustand"

interface CalendarStore {
  selectedDate: string
  setSelectedDate: (date: string) => void
}

const todayKey = () => new Date().toLocaleDateString("en-CA")

export const useCalendarStore = create<CalendarStore>((set) => ({
  selectedDate: todayKey(),
  setSelectedDate: (date) => set({ selectedDate: date }),
}))
