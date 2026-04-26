import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] w-full bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
          <div className="flex-1" />
        </header>
        <main className="flex-1 flex flex-col p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
