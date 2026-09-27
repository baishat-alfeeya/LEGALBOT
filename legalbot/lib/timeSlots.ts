export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface DaySchedule {
  date: string;
  label: string;
  slots: TimeSlot[];
}

const slotTimes = ["10:00 AM","11:00 AM","12:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM","06:00 PM"];

export function generateSchedule(lawyerId: number): DaySchedule[] {
  const schedule: DaySchedule[] = [];
  const today = new Date();
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  for (let i = 1; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayName = days[d.getDay()];
    const label = `${dayName}, ${d.getDate()} ${months[d.getMonth()]}`;
    const dateStr = d.toISOString().split("T")[0];

    // Deterministic availability based on lawyerId + day
    const slots: TimeSlot[] = slotTimes.map((time, idx) => ({
      id: `${dateStr}-${idx}`,
      time,
      available: ((lawyerId + i + idx) % 3) !== 0,
    }));

    schedule.push({ date: dateStr, label, slots });
  }
  return schedule;
}
