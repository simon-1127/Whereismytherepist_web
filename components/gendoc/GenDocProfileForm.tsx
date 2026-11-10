"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { rpcMessage, type GenDocProfile } from "../../lib/gendoc";
import { Avatar } from "../ui";

type LookupItem = { id: string; name: string };

/**
 * UPDATE only, never upsert: gendoc_profiles has owner select/update but no
 * INSERT policy (rows come from the HR dashboard). application_status,
 * rejection_reason and approval fields are deliberately never sent: the
 * update policy has no column restriction, so leaving them out of the
 * payload is what stops a doctor approving themselves. Languages are fully
 * replaced, like the app.
 */
export default function GenDocProfileForm({
  profile,
  userId,
  allLanguages,
  onboarding,
}: {
  profile: GenDocProfile;
  userId: string;
  allLanguages: LookupItem[];
  onboarding: boolean;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(profile.photo_url);
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [title, setTitle] = useState(profile.professional_title || "General Physician");
  const [years, setYears] = useState(profile.years_experience != null ? String(profile.years_experience) : "");
  const [regNo, setRegNo] = useState(profile.registration_no || "");
  const [council, setCouncil] = useState(profile.registration_council || "");
  const [qualifications, setQualifications] = useState((profile.qualifications || []).join(", "));
  const [clinic, setClinic] = useState(profile.clinic_affiliation || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [languageIds, setLanguageIds] = useState(new Set(profile.languages.map((l) => l.id)));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setError("Photo must be under 5MB.");
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function toggleLanguage(id: string) {
    const next = new Set(languageIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setLanguageIds(next);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved("");
    if (!fullName.trim() || !title.trim() || years === "" || !regNo.trim() || !qualifications.trim()) {
      return setError("Please fill in your name, title, years of experience, registration number and qualifications.");
    }
    const yearsNum = parseInt(years, 10);
    if (!(yearsNum >= 0 && yearsNum <= 70)) return setError("Years of experience doesn't look right.");

    setSaving(true);
    try {
      let photoUrl = profile.photo_url;
      if (photoFile) {
        // Same bucket and path shape the app uses for doctor photos.
        const ext = photoFile.name.split(".").pop();
        const path = `${userId}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("provider-photos").upload(path, photoFile, { upsert: true });
        if (upErr) throw new Error(`Couldn't upload your photo: ${upErr.message}`);
        photoUrl = supabase.storage.from("provider-photos").getPublicUrl(path).data.publicUrl;
      }

      const { data: updated, error: upd } = await supabase
        .from("gendoc_profiles")
        .update({
          full_name: fullName.trim(),
          professional_title: title.trim(),
          years_experience: yearsNum,
          registration_no: regNo.trim(),
          registration_council: council.trim() || null,
          qualifications: qualifications.split(",").map((s) => s.trim()).filter(Boolean),
          clinic_affiliation: clinic.trim() || null,
          bio: bio.trim() || null,
          photo_url: photoUrl,
          profile_completed_by_gendoc: true,
        })
        .eq("user_id", userId)
        .select("user_id")
        .maybeSingle();
      if (upd) throw upd;
      if (!updated) throw new Error("No doctor account was found for this login. Ask your HR team to set it up.");

      const { error: delErr } = await supabase.from("gendoc_languages").delete().eq("gendoc_id", userId);
      if (delErr) throw delErr;
      if (languageIds.size) {
        const { error: insErr } = await supabase
          .from("gendoc_languages")
          .insert([...languageIds].map((id) => ({ gendoc_id: userId, language_id: id })));
        if (insErr) throw insErr;
      }

      if (onboarding) {
        router.push("/gendoc");
        router.refresh();
        return;
      }
      setSaved("Profile saved. Employees see the changes straight away.");
      setSaving(false);
      router.refresh();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(`Couldn't save your profile: ${rpcMessage(err)}`);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-10">
      {error && <p role="alert" className="alert alert-error">{error}</p>}
      {saved && !error && <p role="status" className="alert alert-ok">{saved}</p>}

      <section>
        <div className="mb-8 flex flex-col items-center">
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className="relative mb-3 grid h-28 w-28 place-items-center overflow-hidden rounded-full border-2 border-dashed border-ink-3/40 bg-lilac"
            aria-label="Upload photo"
          >
            {photoPreview ? (
              <img src={photoPreview} alt="" className="h-full w-full object-cover" />
            ) : (
              <Avatar name={fullName} size={104} />
            )}
            <span className="absolute bottom-0 right-0 grid h-7 w-7 place-items-center rounded-full bg-rose text-lg text-white">+</span>
          </button>
          <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onPhoto} className="hidden" />
          <p className="font-semibold text-ink">Your photo</p>
          <p className="text-xs text-ink-3">Shown on every queue card. JPG or PNG up to 5MB.</p>
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="gd-name" className="field-label">Full name</label>
            <input id="gd-name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="field" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="gd-title" className="field-label">Professional title</label>
              <input id="gd-title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. General Physician" className="field" />
            </div>
            <div>
              <label htmlFor="gd-years" className="field-label">Years of experience</label>
              <input id="gd-years" type="number" min={0} max={70} value={years} onChange={(e) => setYears(e.target.value)} required className="field" />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="gd-reg" className="field-label">Registration number</label>
            <input id="gd-reg" value={regNo} onChange={(e) => setRegNo(e.target.value)} required className="field" />
          </div>
          <div>
            <label htmlFor="gd-council" className="field-label">Registration council</label>
            <input id="gd-council" value={council} onChange={(e) => setCouncil(e.target.value)} placeholder="e.g. Karnataka Medical Council" className="field" />
          </div>
        </div>
        <div>
          <label htmlFor="gd-qual" className="field-label">Qualifications</label>
          <input
            id="gd-qual"
            value={qualifications}
            onChange={(e) => setQualifications(e.target.value)}
            required
            placeholder="Separate with commas, e.g. MBBS, MD (General Medicine)"
            className="field"
          />
        </div>
        <div>
          <label htmlFor="gd-clinic" className="field-label">Clinic or hospital (optional)</label>
          <input id="gd-clinic" value={clinic} onChange={(e) => setClinic(e.target.value)} className="field" />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-semibold text-ink">Languages you consult in</h3>
        <div className="flex flex-wrap gap-2">
          {allLanguages.map((l) => {
            const on = languageIds.has(l.id);
            return (
              <button
                type="button"
                key={l.id}
                onClick={() => toggleLanguage(l.id)}
                aria-pressed={on}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  on ? "border-ink bg-brand text-white" : "border-transparent bg-mist text-ink-2 hover:bg-mist-2"
                }`}
              >
                {on && <span className="mr-1.5">✓</span>}
                {l.name}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <label htmlFor="gd-bio" className="field-label">About you</label>
        <textarea id="gd-bio" value={bio} maxLength={250} onChange={(e) => setBio(e.target.value)} rows={4} className="field" />
        <p className="mt-1 text-right text-xs text-ink-3">{bio.length}/250</p>
      </section>

      <button type="submit" disabled={saving} className="btn btn-primary w-full">
        {saving ? "Saving…" : onboarding ? "Save and open my queue" : "Save changes"}
      </button>
    </form>
  );
}
