export default function WalkthroughPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <p className="text-xs uppercase tracking-[0.18em] text-[#6b6b66]">Ajaia Docs</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Walkthrough</h1>
      <p className="mt-3 max-w-2xl text-sm text-[#6b6b66]">
        Silent screen recording of the reviewer flow (login, edit, persist, import, share). Captions
        are burned into the bottom of the frame. Audio narration was skipped so this could ship
        without a Loom account.
      </p>
      <video className="mt-6 w-full rounded-xl border border-[#ece9e2] bg-black" controls playsInline>
        <source src="/walkthrough.webm" type="video/webm" />
      </video>
      <p className="mt-4 text-sm text-[#6b6b66]">
        Demo accounts: <code>alex@ajaia.dev</code>, <code>jordan@ajaia.dev</code>,{" "}
        <code>sam@ajaia.dev</code> / <code>demo1234</code>
      </p>
    </main>
  );
}
