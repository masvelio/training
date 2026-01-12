# PRD - Training Tracker MVP

Data: 2026-01-12
Wersja: 0.1

## 1) Cel produktu
Super prosta aplikacja webowa (React + Vite + shadcn/ui) do przechodzenia przez trening A/B/C z planu w pliku `Untitled`. Aplikacja ma byc tylko dla mnie, bez logowania, bez backendu, z persystencja w localStorage i prostym hostingiem (np. GitHub Pages).

## 2) Zakres MVP
- Wybior jednego z trzech treningow: A, B, C.
- Sekwencyjne przechodzenie przez cwiczenia.
- Dwa typy cwiczen:
  - czas (timer)
  - powtorzenia (tekst z dawka + przycisk "Koniec cwiczenia")
- Po kazdym cwiczeniu automatyczna przerwa 20 s (timer przerwy).
- Na widoku cwiczenia:
  - zdjecie
  - nazwa
  - krotkie objasnienie / wskazowki
  - dawka (czas lub powtorzenia)
- Konfiguracja treningow w pliku konfiguracyjnym (latwa edycja w edytorze tekstowym).
- Obrazki trzymane w repozytorium.
- LocalStorage do zapisu progresu i ostatniego stanu.
- Mobile-first UI.

## 3) Poza zakresem (na teraz)
- Logowanie / konta / backend.
- Zaawansowane statystyki, historie tygodniowe, eksport.
- Edycja treningow z poziomu aplikacji.
- Personalizacja czasu przerwy per cwiczenie (poza opcjonalnym polem w configu).
- Warianty cwiczen (zostaje tylko opcja A).

## 4) Uzytkownik i scenariusz
Jeden uzytkownik (ja).

Scenariusz:
1) Wchodze na apke i wybieram trening A/B/C.
2) Klikam "Start".
3) Widze kolejne cwiczenia:
   - jesli cwiczenie jest na czas: timer + przyciski Start/Pauza/Stop
   - jesli na powtorzenia: dawka + przycisk "Koniec cwiczenia"
4) Po zakonczeniu cwiczenia uruchamia sie 20-sekundowa przerwa.
5) Po przerwie aplikacja przechodzi do kolejnego cwiczenia.
6) Po ostatnim cwiczeniu widze ekran "Trening zakonczony" z prostym podsumowaniem.
7) RESET jest osobnym treningiem do wyboru z listy treningow.

## 5) Wymagania funkcjonalne
- Ekran wyboru treningu z 3 kaflami (A/B/C) i krotkim opisem.
- Dodatkowy kafel: RESET (oddzielny trening).
- Ekran cwiczenia:
  - obrazek (z katalogu w repo)
  - nazwa i opis
  - dawka (czas lub powtorzenia)
  - CTA do zakonczenia (dla powtorzen)
  - timer (dla czasu)
- Ekran przerwy (20 s):
  - countdown
  - przycisk "Pomin przerwe"
- Ekran podsumowania:
  - liczba wykonanych cwiczen
- LocalStorage:
  - ostatnio wybrany trening
  - indeks aktualnego cwiczenia
  - stan: "in_progress" / "finished"
- Przyciski duze, czytelne, pod kciuk.

## 6) Dane i konfiguracja
Konfiguracja w `src/config/workouts.js` (lub `.ts` jesli zdecydujemy sie na TS).

Proponowany model danych (JS):
```js
export const workouts = [
  {
    id: "A",
    name: "Trening A",
    subtitle: "Hinge + poslad + plecy + core",
    sections: [
      {
        id: "warmup",
        name: "Rozgrzewka",
        exercises: [
          {
            id: "a-w-90-90",
            name: "90/90 oddech",
            type: "time",
            durationSec: 120,
            image: "/exercises/90-90.jpg",
            note: "Zebra w dol, dlugi wydech 6-8 s."
          }
        ]
      },
      {
        id: "main",
        name: "Czesc glowna",
        exercises: [
          {
            id: "a-1-rdl",
            name: "RDL z hantlami",
            type: "reps",
            repsText: "3 x 10-15",
            image: "/exercises/rdl.jpg",
            note: "Tempo 3-1-1. Biodra w tyl."
          }
        ]
      }
    ]
  }
];
```

Uwagi:
- `type` ma wartosci: `time` lub `reps`.
- `durationSec` tylko dla `time`.
- `repsText` tylko dla `reps`.
- `image` to sciezka do pliku w `public/exercises/`.
- `note` to krotkie wskazowki (opcjonalne).
- Z planu "Untitled" przygotujemy wpisy dla A, B, C.
- Z planu "Untitled" przygotujemy wpisy dla RESET jako osobny trening.

## 7) Pliki i struktura repo (docelowo)
- `src/config/workouts.js` - config treningow.
- `public/exercises/` - katalog na obrazki.
- `src/components/` - UI (Card, Timer, ExerciseView, RestView, SummaryView).
- `src/pages/` (opcjonalnie) - Home, Workout.
- `src/lib/storage.js` - obsluga localStorage.

## 8) UX / UI
- Mobile-first, jedna kolumna, duze CTA.
- Prosty layout, kontrastowe przyciski.
- Minimalna nawigacja (Back / Reset treningu).
- Czytelny timer i progress (np. "3/12").
- Wersja desktop: max szerokosc kontenera, center.

## 9) Hosting
- Statyczny hosting na GitHub Pages.
- Build: `vite build`, deploy z `gh-pages` lub GitHub Actions.

## 10) Kryteria akceptacji MVP
- Mogę wybrac A/B/C/RESET, przejsc przez wszystkie cwiczenia i zakonczzyc trening.
- Dla cwiczen czasowych wyswietla sie timer.
- Dla cwiczen na powtorzenia wyswietla sie dawka i przycisk "Koniec cwiczenia".
- Po kazdym cwiczeniu jest 20 s przerwy z mozliwoscia pominiecia.
- Aplikacja pamieta progres po odswiezeniu strony.
- Obrazki laduja sie z repozytorium.
- UI dziala wygodnie na telefonie.

## 11) Lista zadan (MVP)
### A. Setup projektu
- [ ] Stworzyc projekt Vite React (JS)
- [ ] Dodac Tailwind CSS
- [ ] Zainstalowac i skonfigurowac shadcn/ui
- [ ] Ustawic podstawowy layout (mobile-first)

### B. Dane i config
- [ ] Utworzyc `src/config/workouts.js`
- [ ] Przepisac trening A z pliku `Untitled`
- [ ] Przepisac trening B z pliku `Untitled`
- [ ] Przepisac trening C z pliku `Untitled`
- [ ] Przepisac RESET jako osobny trening z pliku `Untitled`
- [ ] Dodac placeholdery obrazkow w `public/exercises/`

### C. Widoki i komponenty
- [ ] Home: wybor A/B/C (kafle)
- [ ] Workout: progres (index/total)
- [ ] ExerciseView: obrazek, nazwa, opis, dawka
- [ ] Timer: start/pauza/stop, tick co 1s
- [ ] RestView: 20 s countdown + "Pomin przerwe"
- [ ] SummaryView: zakonczony trening

### D. Logika treningu
- [ ] Sekwencja cwiczen (spaszczona z sekcji)
- [ ] Przejscie: cwiczenie -> przerwa -> kolejne cwiczenie
- [ ] Rozroznienie `time` vs `reps`
- [ ] Obsluga konca treningu

### E. LocalStorage
- [ ] Zapis stanu treningu (id, indeks)
- [ ] Wczytanie stanu po odswiezeniu
- [ ] Reset stanu po zakonczonym treningu

### F. UX dopracowanie
- [ ] Duze przyciski i czytelna typografia
- [ ] Responsywny layout
- [ ] Minimalne animacje (np. progress bar)

### G. Hosting
- [ ] Konfiguracja build + deploy na GitHub Pages
- [ ] Instrukcja w README

## 12) Otwarte kwestie
- Brak na ten moment.
