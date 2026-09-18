// src/app/(instructor)/layout.tsx
import { redirect }      from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { Sidebar }  from "@/components/layout/sidebar";
import { TopNav }   from "@/components/layout/topnav";

export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession();
  if (!session || !["ADMIN","INSTRUCTOR"].includes(session.user.role)) redirect("/dashboard");
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

