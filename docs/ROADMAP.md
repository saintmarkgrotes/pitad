# Roadmap

Each phase ends with a Phase Completion Report and a stop for approval.

| Phase | Name                          | Status      |
| ----- | ----------------------------- | ----------- |
| 0     | Planning and repository audit | Done        |
| 1     | Project foundation            | Done        |
| 2     | Database and authentication   | Not started |
| 3     | GPS tracking engine           | Not started |
| 4     | Activity management           | Not started |
| 5     | Running analytics             | Not started |
| 6     | Social features               | Not started |
| 7     | Training and pacing system    | Not started |
| 8     | Leaderboards and challenges   | Not started |
| 9     | Production preparation        | Not started |

## Decisions (see Phase 0 report)

- Prisma: stable release, with raw SQL for PostGIS queries inside repository classes. Revisit Prisma 8 after GA.
- Auth: NestJS-owned (argon2, short-lived JWT, rotating refresh tokens). Supabase Auth is not used.
- Expo SDK 58 with development builds. Expo Go cannot run background location or MapLibre.
- Development builds are required for GPS tracking and maps (Expo Go cannot run background location or MapLibre). iPhone builds need the paid Apple Developer Program or a Mac, so Android is the main native test target until then.
