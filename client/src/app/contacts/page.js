import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0b3364]">
      <Header showAccountButton={false} fixed={true} />

      <main className="mx-auto max-w-4xl px-4 pb-16 pt-32 sm:px-6">
        <section className="rounded-3xl bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)] sm:p-10">
          <h1 className="mb-4 text-2xl font-bold sm:text-3xl">Контакты Sadap Clinic</h1>
          <p className="mb-6 text-sm text-slate-600 sm:text-base">
            Мы на связи ежедневно и готовы помочь с выбором врача и записью на прием.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 p-4">
              <h2 className="mb-2 text-lg font-semibold">Телефон</h2>
              <p className="text-sm text-slate-700">+7 (727) 000-00-00</p>
              <p className="text-sm text-slate-700">+7 (701) 000-00-00</p>
            </article>

            <article className="rounded-2xl border border-slate-200 p-4">
              <h2 className="mb-2 text-lg font-semibold">Адрес</h2>
              <p className="text-sm text-slate-700">г. Алматы, ул. Садовая 12</p>
              <p className="text-sm text-slate-700">Ежедневно: 08:00 — 20:00</p>
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
