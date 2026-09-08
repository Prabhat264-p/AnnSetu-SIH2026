export interface Slot {
  id: string;
  centreId: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // "09:00 - 10:00", "10:00 - 11:00", etc.
  capacity: number;
  bookedCount: number;
  remainingCapacity: number;
  expectedQueue: number;
  estimatedWait: string;
}
