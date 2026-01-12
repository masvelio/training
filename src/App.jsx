import { useEffect, useMemo, useState } from "react"
import { workouts } from "@/config/workouts"
import {
  clearSession,
  loadLastWorkoutId,
  loadSession,
  saveLastWorkoutId,
  saveSession,
} from "@/lib/storage"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const REST_SECONDS = 20

const workoutById = Object.fromEntries(workouts.map((w) => [w.id, w]))

const flattenExercises = (workout) =>
  workout.sections.flatMap((section) =>
    section.exercises.map((exercise) => ({
      ...exercise,
      sectionName: section.name,
    }))
  )

const formatTime = (totalSeconds) => {
  const safe = Math.max(0, totalSeconds || 0)
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

function App() {
  const [session, setSession] = useState(null)
  const [summary, setSummary] = useState(null)
  const [lastWorkoutId, setLastWorkoutId] = useState(null)

  useEffect(() => {
    const savedSession = loadSession()
    if (savedSession) {
      const savedWorkout = workoutById[savedSession.workoutId]
      if (savedWorkout) {
        const list = flattenExercises(savedWorkout)
        const current = list[savedSession.index]
        if (!current) {
          clearSession()
        } else {
          const nextSession = { ...savedSession }
          if (savedSession.phase === "rest" && (savedSession.remainingSec ?? 0) <= 0) {
            nextSession.remainingSec = REST_SECONDS
          }
          if (
            savedSession.phase === "exercise" &&
            current.type === "time" &&
            (savedSession.remainingSec ?? 0) <= 0
          ) {
            nextSession.remainingSec = current.durationSec
          }
          setSession(nextSession)
        }
      } else {
        clearSession()
      }
    }
    setLastWorkoutId(loadLastWorkoutId())
  }, [])

  const workout = session ? workoutById[session.workoutId] : null
  const exercises = useMemo(() => (workout ? flattenExercises(workout) : []), [workout])
  const totalExercises = exercises.length
  const currentExercise = session ? exercises[session.index] : null

  useEffect(() => {
    if (session) saveSession(session)
  }, [session])

  useEffect(() => {
    if (!session || !session.timerRunning || session.remainingSec == null) return undefined

    const interval = window.setInterval(() => {
      setSession((prev) => {
        if (!prev || !prev.timerRunning || prev.remainingSec == null) return prev

        const nextRemaining = prev.remainingSec - 1
        if (nextRemaining > 0) {
          return { ...prev, remainingSec: nextRemaining }
        }

        if (prev.phase === "rest") {
          const nextIndex = prev.index + 1
          const nextExercise = exercises[nextIndex]
          if (!nextExercise) {
            clearSession()
            setSummary({ workoutId: prev.workoutId, totalExercises })
            return null
          }
          return {
            workoutId: prev.workoutId,
            index: nextIndex,
            phase: "exercise",
            remainingSec: nextExercise.type === "time" ? nextExercise.durationSec : null,
            timerRunning: false,
          }
        }

        if (prev.phase === "exercise") {
          const isLast = prev.index >= totalExercises - 1
          if (isLast) {
            clearSession()
            setSummary({ workoutId: prev.workoutId, totalExercises })
            return null
          }
          return {
            ...prev,
            phase: "rest",
            remainingSec: REST_SECONDS,
            timerRunning: true,
          }
        }

        return prev
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [exercises, session, totalExercises])

  const startWorkout = (workoutId) => {
    const selected = workoutById[workoutId]
    if (!selected) return

    const list = flattenExercises(selected)
    const first = list[0]
    const nextSession = {
      workoutId,
      index: 0,
      phase: "exercise",
      remainingSec: first?.type === "time" ? first.durationSec : null,
      timerRunning: false,
    }

    saveLastWorkoutId(workoutId)
    setLastWorkoutId(workoutId)
    setSummary(null)
    setSession(nextSession)
  }

  const resetWorkout = () => {
    clearSession()
    setSession(null)
  }

  const endWorkout = (workoutId) => {
    clearSession()
    setSummary({ workoutId, totalExercises })
  }

  const finishExercise = () => {
    setSession((prev) => {
      if (!prev) return prev
      const isLast = prev.index >= totalExercises - 1
      if (isLast) {
        endWorkout(prev.workoutId)
        return null
      }
      return {
        ...prev,
        phase: "rest",
        remainingSec: REST_SECONDS,
        timerRunning: true,
      }
    })
  }

  const skipRest = () => {
    setSession((prev) => {
      if (!prev) return prev
      const nextIndex = prev.index + 1
      const nextExercise = exercises[nextIndex]
      if (!nextExercise) {
        endWorkout(prev.workoutId)
        return null
      }
      return {
        workoutId: prev.workoutId,
        index: nextIndex,
        phase: "exercise",
        remainingSec: nextExercise.type === "time" ? nextExercise.durationSec : null,
        timerRunning: false,
      }
    })
  }

  const startTimer = () =>
    setSession((prev) => (prev ? { ...prev, timerRunning: true } : prev))

  const pauseTimer = () =>
    setSession((prev) => (prev ? { ...prev, timerRunning: false } : prev))

  const resetTimer = () => {
    setSession((prev) => {
      if (!prev || prev.phase !== "exercise") return prev
      const exercise = exercises[prev.index]
      if (!exercise || exercise.type !== "time") return prev
      return {
        ...prev,
        remainingSec: exercise.durationSec,
        timerRunning: false,
      }
    })
  }

  if (summary) {
    const workoutName = workoutById[summary.workoutId]?.name ?? "Trening"
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-screen flex-col gap-6 px-4 py-6 lg:max-w-full">
          <header className="flex flex-col gap-2">
            <p className="text-sm uppercase tracking-widest text-muted-foreground">
              Podsumowanie
            </p>
            <h1 className="text-2xl font-semibold">{workoutName} skonczony</h1>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Swietna robota</CardTitle>
              <CardDescription>
                Wykonane cwiczenia: {summary.totalExercises}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => setSummary(null)}>
                Wroc na start
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-screen flex-col gap-6 px-4 py-6 lg:max-w-full">
          <header className="flex flex-col gap-2">
            <p className="text-sm uppercase tracking-widest text-muted-foreground">
              Training tracker
            </p>
            <h1 className="text-2xl font-semibold">Wybierz trening</h1>
            {lastWorkoutId ? (
              <p className="text-sm text-muted-foreground">
                Ostatnio: {workoutById[lastWorkoutId]?.name}
              </p>
            ) : null}
          </header>

          <div className="flex flex-col gap-4">
            {workouts.map((workoutItem) => (
              <Card key={workoutItem.id} className="border-border/60">
                <CardHeader>
                  <CardTitle>{workoutItem.name}</CardTitle>
                  <CardDescription>{workoutItem.subtitle}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => startWorkout(workoutItem.id)}>
                    Start
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!currentExercise) {
    return null
  }

  const progressLabel = `${session.index + 1} / ${totalExercises}`

  if (session.phase === "rest") {
    const nextExercise = exercises[session.index + 1]
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-screen flex-col gap-6 px-4 py-6 lg:max-w-full">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Przerwa</p>
              <h1 className="text-xl font-semibold">{workout?.name}</h1>
            </div>
            <Button variant="ghost" onClick={resetWorkout}>
              Reset
            </Button>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Przerwa {REST_SECONDS}s</CardTitle>
              <CardDescription>
                {nextExercise ? `Nastepne: ${nextExercise.name}` : "Koniec treningu"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="text-center text-5xl font-semibold">
                {formatTime(session.remainingSec ?? REST_SECONDS)}
              </div>
              <Button className="w-full" onClick={skipRest}>
                Pomin przerwe
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const isTime = currentExercise.type === "time"
  const timerLabel = formatTime(session.remainingSec ?? currentExercise.durationSec)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen flex-col gap-6 px-4 py-6 lg:max-w-full">
        <header className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs text-muted-foreground">
              {workout?.name} · {currentExercise.sectionName} · {progressLabel}
            </p>
            <h1 className="truncate text-lg font-semibold leading-tight">
              {currentExercise.name}
            </h1>
          </div>
          <Button variant="ghost" size="sm" onClick={resetWorkout}>
            Reset
          </Button>
        </header>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 landscape:flex-row landscape:items-stretch landscape:gap-6">
              <div className="flex-1 landscape:w-[75%] landscape:flex-none">
                <div className="overflow-hidden rounded-lg border border-border/60 bg-muted">
                  <div className="aspect-[4/3] w-full landscape:aspect-auto landscape:h-[60vh]">
                    <img
                      src={currentExercise.image}
                      alt={currentExercise.name}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 landscape:w-[20%] landscape:flex-none">
                {currentExercise.note ? (
                  <p className="text-sm text-muted-foreground">{currentExercise.note}</p>
                ) : null}

                {isTime ? (
                  <div className="flex flex-col gap-4">
                    <div className="text-center text-5xl font-semibold">{timerLabel}</div>
                    <div className="flex gap-3">
                      {session.timerRunning ? (
                        <Button className="flex-1" variant="secondary" onClick={pauseTimer}>
                          Pauza
                        </Button>
                      ) : (
                        <Button className="flex-1" onClick={startTimer}>
                          Start
                        </Button>
                      )}
                      <Button className="flex-1" variant="outline" onClick={resetTimer}>
                        Reset
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mx-auto"
                      onClick={finishExercise}
                    >
                      Zakoncz cwiczenie
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="rounded-lg bg-muted px-4 py-3 text-center text-2xl font-semibold">
                      {currentExercise.repsText}
                    </div>
                    <Button className="w-full" onClick={finishExercise}>
                      Koniec cwiczenia
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground">
          Przerwa po cwiczeniu: {REST_SECONDS}s
        </div>
      </div>
    </div>
  )
}

export default App
