import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/docs");

  return (
    <main className="min-h-screen grid lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden lg:flex flex-col justify-between p-12 bg-[#1f4b3a] text-[#eef6f1]">
        <p className="text-sm tracking-[0.2em] uppercase opacity-80">Ajaia Docs</p>
        <div className="max-w-md">
          <h1 className="text-5xl font-semibold leading-tight tracking-tight">
            Write together. Keep the rest simple.
          </h1>
          <p className="mt-6 text-lg text-[#cfe0d7]">
            A focused document editor for creating, importing, and sharing work without the
            Google Docs surface area.
          </p>
        </div>
        <p className="text-sm opacity-70">Internal productivity exercise · scoped for 4–6 hours</p>
      </section>
      <section className="flex items-center justify-center p-6 sm:p-12 bg-[#f3f1ec]">
        <LoginForm />
      </section>
    </main>
  );
}
