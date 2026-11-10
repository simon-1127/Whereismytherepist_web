import { requireGenDoc } from "../../../lib/gendoc-server";
import { DEFAULT_SCHEDULE } from "../../../lib/gendoc";
import GenDocHoursForm from "../../../components/gendoc/GenDocHoursForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Consulting hours" };

export default async function GenDocHoursPage() {
  const { userId, profile } = await requireGenDoc("/gendoc/hours");

  return (
    <main className="shell py-10 md:py-14">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <h1 className="text-[2.4rem] font-bold md:text-5xl">Consulting hours</h1>
          <p className="mt-2 text-lg text-ink-2">
            Employees join a queue during these hours and get an estimated time. Saving updates everyone already waiting today.
            Times are in IST.
          </p>
        </header>
        <div className="sheet p-6 md:p-10">
          <GenDocHoursForm
            userId={userId}
            initialSchedule={profile.schedule || DEFAULT_SCHEDULE}
            initialMinutes={profile.consultation_minutes || 30}
            initialAccepting={profile.is_accepting_queue !== false}
          />
        </div>
      </div>
    </main>
  );
}
