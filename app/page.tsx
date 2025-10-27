"use client";

import Form from "@/components/form";
import Table from "@/components/table";
import { useEffect, useState } from "react";

export default function Home() {
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    // Hydrate from current DOM dataset (set by layout's inline script)
    const current = document.documentElement.dataset.theme || null;
    setTheme(current);
  }, []);

  const isDark = theme === "dark";

  function toggleTheme() {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <header className="row-start-1 flex gap-[24px] flex-wrap items-center justify-center">
        <label className="inline-flex items-center cursor-pointer">
          <input
            aria-label="Toggle dark mode"
            type="checkbox"
            className="sr-only peer"
            checked={isDark}
            onChange={toggleTheme}
            disabled={theme == null}
          />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer data-[theme=dark]:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all border-gray-600 peer-checked:bg-blue-600"></div>
          <span className="ms-3 text-sm font-medium text-gray-900 data-[theme=dark]:text-gray-300"></span>
        </label>
      </header>
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">Build List ai</h1>
        <p className="text-md text-gray-500 max-w-[600px]">Ever wonder how much a build project will cost? We can help you get a rough estimate of the cost of your project. Just fill out the form below and we will use ai to get a create a shopping list with a cost break down from Home Depot.</p>
        <hr className="w-full border-gray-200" />
        <Form />
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <p className="text-sm text-gray-500">Built by <a href="https://brooklee.io/" className="text-blue-500 hover:text-blue-600">brooklee.io</a></p>
      </footer>
    </div>
  );
}
