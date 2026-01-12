const SESSION_KEY = "training.session";
const LAST_WORKOUT_KEY = "training.lastWorkout";

const isBrowser = () => typeof window !== "undefined" && !!window.localStorage;

export function loadSession() {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSession(session) {
  if (!isBrowser() || !session) return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  if (session.workoutId) {
    window.localStorage.setItem(LAST_WORKOUT_KEY, session.workoutId);
  }
}

export function clearSession() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(SESSION_KEY);
}

export function loadLastWorkoutId() {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(LAST_WORKOUT_KEY);
}

export function saveLastWorkoutId(workoutId) {
  if (!isBrowser() || !workoutId) return;
  window.localStorage.setItem(LAST_WORKOUT_KEY, workoutId);
}
