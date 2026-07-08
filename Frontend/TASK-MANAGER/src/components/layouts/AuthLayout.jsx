import React from 'react'
import ReactLogo from "../../assets/react.svg"

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 md:flex">
      <div className="relative w-full px-6 py-8 sm:px-10 md:w-[56vw] md:px-12 lg:px-16">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 shadow-lg shadow-cyan-500/10 backdrop-blur">
            <img src={ReactLogo} alt="Task Manager" className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-wide text-white">Task Manager</h2>
            <p className="text-sm text-slate-400">Plan, track, and ship work faster</p>
          </div>
        </div>

        {children}
      </div>

      <div className="relative hidden overflow-hidden md:flex md:w-[44vw] md:items-center md:justify-center">
        <div className="absolute inset-0 bg-linear-to-br from-cyan-500 via-blue-600 to-slate-950" />
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] bg-size-[18px_18px]" />

        <div className="relative z-10 mx-auto flex max-w-md flex-col items-center px-10 text-center text-white">
          <div className="mb-6 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-100 backdrop-blur">
            Portfolio SaaS workspace
          </div>

          <div className="mb-8 rounded-4xl border border-white/15 bg-white/10 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-white/10">
              <img src={ReactLogo} alt="Task Manager" className="h-14 w-14" />
            </div>

            <h3 className="mt-6 text-2xl font-semibold">Built for real team workflows</h3>
            <p className="mt-3 text-sm leading-6 text-cyan-50/80">
              A modern task management platform for startups, students, and growing teams.
            </p>
          </div>

          <div className="grid w-full grid-cols-3 gap-3 text-left">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">Tasks</p>
              <p className="mt-2 text-2xl font-semibold">120+</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">Teams</p>
              <p className="mt-2 text-2xl font-semibold">08</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">Sprints</p>
              <p className="mt-2 text-2xl font-semibold">24</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};
export default AuthLayout
