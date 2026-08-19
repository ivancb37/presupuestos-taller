"use client";

import { useState } from "react";
import Link from "next/link";
import { login, signup } from "./actions";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/15";

export default function AuthCard({ error, mensaje }) {
  const [tab, setTab] = useState("entrar");

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/50">
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setTab("entrar")}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
            tab === "entrar"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setTab("crear")}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
            tab === "crear"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Crear cuenta
        </button>
      </div>

      <div className="space-y-4 p-5">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
            {error}
          </p>
        )}
        {mensaje && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-emerald-100">
            {mensaje}
          </p>
        )}

        {tab === "entrar" ? (
          <form className="space-y-3">
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className={inputClass}
            />
            <input
              name="password"
              type="password"
              placeholder="Contraseña"
              required
              className={inputClass}
            />
            <button
              formAction={login}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-colors hover:bg-indigo-500 active:bg-indigo-700"
            >
              Entrar
            </button>
            <p className="text-right text-sm">
              <Link href="/recuperar" className="font-medium text-indigo-600 hover:text-indigo-700">
                ¿Olvidaste tu contraseña?
              </Link>
            </p>
          </form>
        ) : (
          <form className="space-y-3">
            <input
              name="nombre_taller"
              type="text"
              placeholder="Nombre del taller"
              required
              className={inputClass}
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className={inputClass}
            />
            <input
              name="password"
              type="password"
              placeholder="Contraseña (mín. 6 caracteres)"
              required
              minLength={6}
              className={inputClass}
            />
            <button
              formAction={signup}
              className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 active:bg-slate-950"
            >
              Crear cuenta
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
