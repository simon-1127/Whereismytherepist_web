"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { AGE_GROUPS } from "../../lib/constants";
import { paiseToRupees, rupeesToPaise } from "../../lib/money";
import { SESSION_PRICE_MAX, SESSION_PRICE_MIN } from "../../lib/pricing";

type LookupItem = { id: string; name: string };

type ExistingProfile = {
  full_name: string;
  professional_title: string;
  years_experience: number;
  base_session_rate: number;
  license_no: string | null;
  education_credentials: string[] | null;
  age_groups_served: string[] | null;
  bio: string | null;
  approach_statement: string | null;
  photo_url: string | null;
  video_intro_url: string | null;
  application_status?: string | null;
};

function ChipSelector({
  options,
  selected,
  onToggle,
}: {
  options: LookupItem[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = selected.has(opt.id);
        return (
          <button
            type="button"
            key={opt.id}
            onClick={() => onToggle(opt.id)}
            className={`px-4 py-2 rounded-full border text-sm font-semibold transition-colors ${
              isSelected
                ? "bg-brand border-ink text-white"
                : "bg-mist border-transparent text-ink-2 hover:bg-mist-2"
            }`}
          >
            {isSelected && <span className="mr-1.5">✓</span>}
            {opt.name}
          </button>
        );
      })}
    </div>
  );
}

export default function ProviderProfileForm({
  userId,
  existingProfile,
  allLanguages,
  allApproaches,
  allSpecialties,
  initialSelectedLanguageIds,
  initialSelectedApproachIds,
  initialSelectedSpecialtyIds,
}: {
  userId: string;
  existingProfile: ExistingProfile | null;
  allLanguages: LookupItem[];
  allApproaches: LookupItem[];
  allSpecialties: LookupItem[];
  initialSelectedLanguageIds: string[];
  initialSelectedApproachIds: string[];
  initialSelectedSpecialtyIds: string[];
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [savedMsg, setSavedMsg] = useState("");
  // Once onboarding is done this is an edit screen, not step 1 of 2.
  const isEditing = !!existingProfile && !!existingProfile.application_status && existingProfile.application_status !== "draft";

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(existingProfile?.photo_url || null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoName, setVideoName] = useState<string | null>(
    existingProfile?.video_intro_url ? "Video already uploaded" : null
  );

  const [fullName, setFullName] = useState(existingProfile?.full_name || "");
  const [title, setTitle] = useState(existingProfile?.professional_title || "");
  const [yearsExperience, setYearsExperience] = useState(
    existingProfile?.years_experience?.toString() || ""
  );
  const [sessionRate, setSessionRate] = useState(
    existingProfile?.base_session_rate ? paiseToRupees(existingProfile.base_session_rate).toString() : ""
  );
  const [licenseNo, setLicenseNo] = useState(existingProfile?.license_no || "");
  const [educationCredentials, setEducationCredentials] = useState(
    (existingProfile?.education_credentials || []).join(", ")
  );
  const [bio, setBio] = useState(existingProfile?.bio || "");
  const [approachStatement, setApproachStatement] = useState(existingProfile?.approach_statement || "");

  const [selectedLanguageIds, setSelectedLanguageIds] = useState(new Set(initialSelectedLanguageIds));
  const [selectedApproachIds, setSelectedApproachIds] = useState(new Set(initialSelectedApproachIds));
  const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState(new Set(initialSelectedSpecialtyIds));
  const [selectedAgeGroups, setSelectedAgeGroups] = useState(
    new Set(existingProfile?.age_groups_served || [])
  );

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  function toggleSet<T>(set: Set<T>, value: T, setter: (s: Set<T>) => void) {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Photo must be under 5MB.");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg("Video must be under 50MB.");
      return;
    }
    setVideoFile(file);
    setVideoName(file.name);
  }

  async function uploadToBucket(bucket: "provider-photos" | "provider-videos", file: File) {
    const ext = file.name.split(".").pop();
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw new Error(`Could not upload to ${bucket}: ${error.message}`);
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async function syncJoinTable(
    table: "provider_languages" | "provider_approaches" | "provider_specialties",
    foreignKeyColumn: "language_id" | "approach_id" | "specialty_id",
    selectedIds: Set<string>
  ) {
    const { error: deleteError } = await supabase.from(table).delete().eq("provider_id", userId);
    if (deleteError) throw new Error(deleteError.message);

    if (selectedIds.size === 0) return;

    const rows = Array.from(selectedIds).map((id) => ({
      provider_id: userId,
      [foreignKeyColumn]: id,
    }));
    const { error: insertError } = await supabase.from(table).insert(rows);
    if (insertError) throw new Error(insertError.message);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSavedMsg("");

    if (!fullName.trim() || !title.trim() || !yearsExperience || !sessionRate) {
      setErrorMsg("Please fill in your name, title, years of experience, and session rate.");
      return;
    }
    const rate = Number(sessionRate);
    if (!(rate >= SESSION_PRICE_MIN && rate <= SESSION_PRICE_MAX)) {
      setErrorMsg(`Price per session must be between ₹${SESSION_PRICE_MIN} and ₹${SESSION_PRICE_MAX.toLocaleString("en-IN")}.`);
      return;
    }

    setIsSaving(true);

    try {
      let photoUrl = existingProfile?.photo_url || null;
      if (photoFile) {
        photoUrl = await uploadToBucket("provider-photos", photoFile);
      }

      let videoUrl = existingProfile?.video_intro_url || null;
      if (videoFile) {
        videoUrl = await uploadToBucket("provider-videos", videoFile);
      }

      const educationArray = educationCredentials
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const { error: upsertError } = await supabase.from("provider_profiles").upsert({
        user_id: userId,
        full_name: fullName.trim(),
        professional_title: title.trim(),
        years_experience: parseInt(yearsExperience, 10),
        base_session_rate: rupeesToPaise(sessionRate),
        license_no: licenseNo.trim() || null,
        education_credentials: educationArray,
        age_groups_served: Array.from(selectedAgeGroups),
        bio: bio.trim() || null,
        approach_statement: approachStatement.trim() || null,
        photo_url: photoUrl,
        video_intro_url: videoUrl,
      });

      if (upsertError) throw new Error(upsertError.message);

      await syncJoinTable("provider_languages", "language_id", selectedLanguageIds);
      await syncJoinTable("provider_approaches", "approach_id", selectedApproachIds);
      await syncJoinTable("provider_specialties", "specialty_id", selectedSpecialtyIds);

      if (isEditing) {
        setSavedMsg("Profile saved. Clients see the changes straight away.");
        setIsSaving(false);
        router.refresh();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        router.push("/provider/payout");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong while saving your profile.");
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {errorMsg && <p role="alert" className="alert alert-error">{errorMsg}</p>}
      {savedMsg && !errorMsg && <p role="status" className="alert alert-ok">{savedMsg}</p>}

      <section>
        <div className="flex flex-col items-center mb-8">
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className="w-28 h-28 rounded-full bg-lilac flex items-center justify-center overflow-hidden relative mb-3 border-2 border-dashed border-ink-3/40"
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-8 h-8 text-ink-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
            <span className="absolute bottom-0 right-0 bg-rose text-white w-7 h-7 rounded-full flex items-center justify-center text-lg">+</span>
          </button>
          <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} className="hidden" />
          <p className="font-semibold text-ink">Upload photo</p>
          <p className="text-xs text-ink-3">JPG, PNG up to 5MB</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="field-label">Full name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required
              className="field" />
          </div>
          <div>
            <label className="field-label">Professional title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Clinical Psychologist"
              className="field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Years of experience</label>
              <input type="number" min={0} value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} required
                className="field" />
            </div>
            <div>
              <label className="field-label">Price per session (₹)</label>
              <input type="number" min={SESSION_PRICE_MIN} max={SESSION_PRICE_MAX} step={50} placeholder={`${SESSION_PRICE_MIN}–${SESSION_PRICE_MAX}`} value={sessionRate} onChange={(e) => setSessionRate(e.target.value)} required
                className="field" />
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-ink mb-3 flex items-center gap-2">
          Languages you speak
        </h3>
        <ChipSelector
          options={allLanguages}
          selected={selectedLanguageIds}
          onToggle={(id) => toggleSet(selectedLanguageIds, id, setSelectedLanguageIds)}
        />
      </section>

      <section className="space-y-5">
        <div>
          <label className="field-label">Licence or registration number</label>
          <input value={licenseNo} onChange={(e) => setLicenseNo(e.target.value)}
            className="field" />
        </div>
        <div>
          <label className="field-label">Education and credentials</label>
          <input value={educationCredentials} onChange={(e) => setEducationCredentials(e.target.value)}
            placeholder="Separate multiple with commas, e.g. MSc Psychology, RCI Licensed"
            className="field" />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-ink mb-3">Age groups you work with</h3>
        <div className="flex flex-wrap gap-2">
          {AGE_GROUPS.map((group) => {
            const isSelected = selectedAgeGroups.has(group.value);
            return (
              <button
                type="button"
                key={group.value}
                onClick={() => toggleSet(selectedAgeGroups, group.value, setSelectedAgeGroups)}
                className={`px-4 py-2 rounded-full border text-sm font-semibold transition-colors ${
                  isSelected
                    ? "bg-brand border-ink text-white"
                    : "bg-mist border-transparent text-ink-2 hover:bg-mist-2"
                }`}
              >
                {isSelected && <span className="mr-1.5">✓</span>}
                {group.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <label className="field-label">About you</label>
          <textarea
            value={bio}
            maxLength={250}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="field"
          />
          <p className="text-xs text-ink-3 text-right mt-1">{bio.length}/250</p>
        </div>
        <div>
          <label className="field-label">Your approach, in one line</label>
          <textarea
            value={approachStatement}
            maxLength={120}
            onChange={(e) => setApproachStatement(e.target.value)}
            rows={3}
            className="field"
          />
          <p className="text-xs text-ink-3 text-right mt-1">{approachStatement.length}/120</p>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-ink mb-3 flex items-center gap-2">
          Therapeutic approaches
        </h3>
        <ChipSelector
          options={allApproaches}
          selected={selectedApproachIds}
          onToggle={(id) => toggleSet(selectedApproachIds, id, setSelectedApproachIds)}
        />
      </section>

      <section>
        <h3 className="text-lg font-semibold text-ink mb-3 flex items-center gap-2">
          What you help with
        </h3>
        <ChipSelector
          options={allSpecialties}
          selected={selectedSpecialtyIds}
          onToggle={(id) => toggleSet(selectedSpecialtyIds, id, setSelectedSpecialtyIds)}
        />
      </section>

      <section>
        <h3 className="text-lg font-semibold text-ink mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          Video introduction (optional)
        </h3>
        <p className="text-xs text-ink-3 mb-3">A short intro helps clients connect with you.</p>
        <button
          type="button"
          onClick={() => videoInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2.5 border border-line rounded-xl text-sm font-semibold text-ink-2 hover:border-slate-400"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          {videoName || "Record / Upload video"}
        </button>
        <input ref={videoInputRef} type="file" accept="video/mp4,video/quicktime,video/webm" onChange={handleVideoChange} className="hidden" />
      </section>

      <button
        type="submit"
        disabled={isSaving}
        className="btn btn-primary w-full"
      >
        {isSaving ? "Saving…" : isEditing ? "Save changes" : "Save and continue"}
      </button>
    </form>
  );
}
