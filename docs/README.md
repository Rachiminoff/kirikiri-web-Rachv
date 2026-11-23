# Rachv Documentation

This documentation explains the features added by the Rachv fork, how the reader is organized, and how to run and deploy the project. It is written for readers, contributors, and maintainers who may not be familiar with the codebase.

## Start here

- [What Rachv adds](features/overview.md) — a plain-language summary of the fork's additions.
- [Reading experience](features/reading-experience.md) — reading modes, controls, text settings, and the backlog.
- [Progress and saves](features/progress-and-saves.md) — resume position, route records, save slots, and portable save files.
- [Routes and scene navigation](features/routes-and-navigation.md) — route selection, day shortcuts, and the scene flowchart.
- [Mobile reading](features/mobile-reading.md) — landscape behavior, touch input, and the mobile control dock.
- [Application structure](architecture/application-structure.md) — how the main parts of the project fit together.
- [Development setup](development/getting-started.md) — install dependencies and run the project locally.
- [Vercel deployment](deployment/vercel.md) — deployment settings and the legacy OpenSSL compatibility option.

## Scope and accuracy

Rachv is a fork of the upstream KiriKiri Web project. The feature descriptions here refer to the implementation present in this repository. They do not claim that the browser application reproduces every feature or every internal rule of the original KiriKiri engine or the original game. In particular, progress percentages count indexed scenes visited, and the reader's route-state handling is limited to the conditions represented in its generated scene data.
