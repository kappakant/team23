import { createContext, useContext, useState, ReactNode } from "react";

interface WorkoutEntry {
  id: string;
  date: string;
  workoutType: string;
  customTitle: string;
  durationMinutes: string;
  note: string;
}

interface WorkoutContextType {
  pendingWorkout: WorkoutEntry | null;
  logWorkout: (w: WorkoutEntry) => void;
  clearWorkout: () => void;
}

const WorkoutContext = createContext<WorkoutContextType | null>(null);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [pendingWorkout, setPendingWorkout] = useState<WorkoutEntry | null>(null);

  const logWorkout = (w: WorkoutEntry) => setPendingWorkout(w);
  const clearWorkout = () => setPendingWorkout(null);

  return (
    <WorkoutContext.Provider value={{ pendingWorkout, logWorkout, clearWorkout }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export const useWorkouts = () => {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error("useWorkouts must be used inside WorkoutProvider");
  return ctx;
};