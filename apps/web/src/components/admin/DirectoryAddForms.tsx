"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, User } from "lucide-react";
import { API_BASE, apiFetch, uploadFile } from "@/lib/admin-api";
import { bloodGroups } from "@/lib/directory-data";
import { Modal } from "./Modal";
import { useAdminText } from "@/lib/admin-strings";
import { useLocale } from "@/components/providers/LocaleProvider";
import { districtOptionLabel } from "@/lib/dhaka-zones";
import { DhakaZoneHint } from "@/components/directory/DistrictPicker";

/**
 * Adding a lawyer, blood donor or hospital from the admin panel.
 *
 * The same details a reader gives when listing themselves, so a row the
 * newsroom adds looks exactly like one that came through review — but it goes
 * live at once: the person adding it is the reviewer. Every open admin tab and
 * the public pages pick it up over the socket, without a reload.
 */

interface District {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand-crimson focus:outline-none focus:ring-2 focus:ring-brand-crimson/15";
const labelCls = "font-ui text-xs font-semibold text-foreground-muted";

function useDistricts() {
  const [list, setList] = useState<District[]>([]);
  useEffect(() => {
    fetch(`${API_BASE}/api/districts`)
      .then((r) => r.json())
      .then((d) => setList(d.districts ?? []))
      .catch(() => {});
  }, []);
  return list;
}

function Field({
  label,
  required,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className={labelCls}>
        {label}
        {required && <span className="text-brand-crimson"> *</span>}
      </span>
      {children}
    </label>
  );
}

function DistrictSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ax = useAdminText();
  const { locale } = useLocale();
  const districts = useDistricts();
  return (
    <>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        <option value="">{ax("জেলা বেছে নিন")}</option>
        {districts.map((d) => (
          <option key={d.id} value={d.id}>
            {districtOptionLabel(d, locale)}
          </option>
        ))}
      </select>
      {/* Which areas a part of Dhaka covers, once one is picked. */}
      <DhakaZoneHint slug={districts.find((d) => d.id === value)?.slug} />
    </>
  );
}

/** A picture: round for a person, wide for a building. */
function PhotoPicker({
  value,
  onChange,
  wide,
}: {
  value: string;
  onChange: (url: string) => void;
  wide?: boolean;
}) {
  const ax = useAdminText();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await uploadFile(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : ax("আপলোড ব্যর্থ"));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex shrink-0 items-center justify-center overflow-hidden bg-surface text-foreground-muted ${
          wide ? "h-16 w-28 rounded-lg" : "h-16 w-16 rounded-full"
        }`}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <User className="h-6 w-6" />
        )}
      </span>
      <div>
        <button
          type="button"
          disabled={busy}
          onClick={() => ref.current?.click()}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-ui text-xs font-semibold text-foreground hover:bg-surface disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
          {value ? ax("ছবি বদলান") : ax("ছবি যোগ করুন")}
        </button>
        {error && <p className="mt-1 font-ui text-[11px] text-brand-crimson">{error}</p>}
      </div>
      <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={pick} />
    </div>
  );
}

function FormShell({
  title,
  busy,
  error,
  onClose,
  onSubmit,
  children,
}: {
  title: string;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
}) {
  const ax = useAdminText();
  return (
    <Modal wide title={title} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="flex max-h-[72vh] flex-col gap-4 overflow-y-auto pr-1"
      >
        {children}
        {error && (
          <p className="rounded-lg bg-brand-crimson/10 px-3 py-2 font-ui text-sm text-brand-crimson">{error}</p>
        )}
        <p className="font-ui text-[11px] text-foreground-muted">
          {ax("অ্যাডমিন থেকে যোগ করা তথ্য অনুমোদনের অপেক্ষা ছাড়াই সাথে সাথে সাইটে প্রকাশিত হবে।")}
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 font-ui text-sm text-foreground hover:bg-surface"
          >
            {ax("বাতিল")}
          </button>
          <button
            type="submit"
            disabled={busy}
            className="flex items-center gap-1.5 rounded-lg bg-brand-crimson px-4 py-2 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {ax("যোগ ও প্রকাশ করুন")}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function useSubmit(path: string, onSaved: () => void, onClose: () => void) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (body: Record<string, unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(path, { method: "POST", body: JSON.stringify(body) });
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  };
  return { busy, error, setError, submit };
}

// ------------------------------------------------------------------ lawyer

export function AddLawyerModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const ax = useAdminText();
  const [f, setF] = useState({
    photo: "",
    name: "",
    spec: "",
    specEn: "",
    phone: "",
    districtId: "",
    chamber: "",
    barEnrollNo: "",
    enrolledOn: "",
    barAssociation: "",
    barMemberId: "",
    sanadUrl: "",
  });
  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));
  const { busy, error, setError, submit } = useSubmit("/api/admin/lawyers", onSaved, onClose);

  return (
    <FormShell
      title={ax("নতুন আইনজীবী যোগ করুন")}
      busy={busy}
      error={error}
      onClose={onClose}
      onSubmit={() => {
        if (!f.name.trim() || !f.spec.trim() || !f.phone.trim() || !f.districtId)
          return setError(ax("তারকা (*) চিহ্নিত ঘরগুলো পূরণ করুন"));
        submit(f);
      }}
    >
      <PhotoPicker value={f.photo} onChange={set("photo")} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={ax("নাম")} required>
          <input value={f.name} onChange={(e) => set("name")(e.target.value)} className={inputCls} />
        </Field>
        <Field label={ax("মোবাইল নম্বর")} required>
          <input value={f.phone} onChange={(e) => set("phone")(e.target.value)} inputMode="tel" placeholder="01XXXXXXXXX" className={inputCls} />
        </Field>
        <Field label={ax("বিশেষজ্ঞতা (বাংলা)")} required>
          <input value={f.spec} onChange={(e) => set("spec")(e.target.value)} placeholder={ax("যেমন: ফৌজদারি আইন")} className={inputCls} />
        </Field>
        <Field label={ax("বিশেষজ্ঞতা (English)")}>
          <input value={f.specEn} onChange={(e) => set("specEn")(e.target.value)} placeholder="e.g. Criminal law" className={inputCls} />
        </Field>
        <Field label={ax("জেলা")} required>
          <DistrictSelect value={f.districtId} onChange={set("districtId")} />
        </Field>
        <Field label={ax("চেম্বারের ঠিকানা")}>
          <input value={f.chamber} onChange={(e) => set("chamber")(e.target.value)} className={inputCls} />
        </Field>
      </div>
      <p className="font-ui text-xs font-bold uppercase tracking-wide text-foreground-muted">
        {ax("বার কাউন্সিলের তথ্য")}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={ax("এনরোলমেন্ট নম্বর")}>
          <input value={f.barEnrollNo} onChange={(e) => set("barEnrollNo")(e.target.value)} className={inputCls} />
        </Field>
        <Field label={ax("এনরোলমেন্টের তারিখ")}>
          <input type="date" value={f.enrolledOn} onChange={(e) => set("enrolledOn")(e.target.value)} className={inputCls} />
        </Field>
        <Field label={ax("বার অ্যাসোসিয়েশন")}>
          <input value={f.barAssociation} onChange={(e) => set("barAssociation")(e.target.value)} className={inputCls} />
        </Field>
        <Field label={ax("সদস্য আইডি")}>
          <input value={f.barMemberId} onChange={(e) => set("barMemberId")(e.target.value)} className={inputCls} />
        </Field>
      </div>
      <div>
        <span className={labelCls}>{ax("সনদের ছবি")}</span>
        <div className="mt-1">
          <PhotoPicker value={f.sanadUrl} onChange={set("sanadUrl")} wide />
        </div>
      </div>
    </FormShell>
  );
}

// ------------------------------------------------------------------- donor

export function AddDonorModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const ax = useAdminText();
  const [f, setF] = useState({
    photo: "",
    name: "",
    group: "",
    phone: "",
    districtId: "",
    gender: "",
    dob: "",
    address: "",
    lastDonation: "",
    donorNo: "",
  });
  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));
  const { busy, error, setError, submit } = useSubmit("/api/admin/donors", onSaved, onClose);

  return (
    <FormShell
      title={ax("নতুন রক্তদাতা যোগ করুন")}
      busy={busy}
      error={error}
      onClose={onClose}
      onSubmit={() => {
        if (!f.name.trim() || !f.group || !f.phone.trim() || !f.districtId)
          return setError(ax("তারকা (*) চিহ্নিত ঘরগুলো পূরণ করুন"));
        submit({ ...f, gender: f.gender || null });
      }}
    >
      <PhotoPicker value={f.photo} onChange={set("photo")} />
      <div>
        <span className={labelCls}>
          {ax("রক্তের গ্রুপ")}
          <span className="text-brand-crimson"> *</span>
        </span>
        <div className="mt-1 grid grid-cols-4 gap-2 sm:grid-cols-8">
          {bloodGroups.map((g) => (
            <button
              key={g.slug}
              type="button"
              onClick={() => set("group")(g.label)}
              className={`rounded-lg border-2 py-2 font-ui text-sm font-bold transition-colors ${
                f.group === g.label
                  ? "border-brand-crimson bg-brand-crimson text-white"
                  : "border-border text-foreground hover:border-brand-crimson"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={ax("নাম")} required>
          <input value={f.name} onChange={(e) => set("name")(e.target.value)} className={inputCls} />
        </Field>
        <Field label={ax("মোবাইল নম্বর")} required>
          <input value={f.phone} onChange={(e) => set("phone")(e.target.value)} inputMode="tel" placeholder="01XXXXXXXXX" className={inputCls} />
        </Field>
        <Field label={ax("জেলা")} required>
          <DistrictSelect value={f.districtId} onChange={set("districtId")} />
        </Field>
        <Field label={ax("লিঙ্গ")}>
          <select value={f.gender} onChange={(e) => set("gender")(e.target.value)} className={inputCls}>
            <option value="">—</option>
            <option value="male">{ax("পুরুষ")}</option>
            <option value="female">{ax("নারী")}</option>
            <option value="other">{ax("অন্যান্য")}</option>
          </select>
        </Field>
        <Field label={ax("জন্ম তারিখ")}>
          <input type="date" value={f.dob} onChange={(e) => set("dob")(e.target.value)} className={inputCls} />
        </Field>
        <Field label={ax("শেষ রক্তদানের তারিখ")}>
          <input type="date" value={f.lastDonation} onChange={(e) => set("lastDonation")(e.target.value)} className={inputCls} />
        </Field>
        <Field label={ax("ঠিকানা")}>
          <input value={f.address} onChange={(e) => set("address")(e.target.value)} className={inputCls} />
        </Field>
        <Field label={ax("ডোনার আইডি (থাকলে)")}>
          <input value={f.donorNo} onChange={(e) => set("donorNo")(e.target.value)} className={inputCls} />
        </Field>
      </div>
    </FormShell>
  );
}

// ---------------------------------------------------------------- hospital

const HOSPITAL_TYPES = [
  { key: "GOVERNMENT", bn: "সরকারি", en: "Government" },
  { key: "PRIVATE", bn: "বেসরকারি", en: "Private" },
  { key: "SPECIALIZED", bn: "বিশেষায়িত", en: "Specialized" },
  { key: "NGO", bn: "এনজিও", en: "NGO" },
];

export function AddHospitalModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const ax = useAdminText();
  const { locale } = useLocale();
  const [f, setF] = useState({
    photo: "",
    name: "",
    type: "GOVERNMENT",
    address: "",
    districtId: "",
    thana: "",
    hotline: "",
  });
  const [emergency24, setEmergency] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));
  const { busy, error, setError, submit } = useSubmit("/api/admin/hospitals", onSaved, onClose);

  return (
    <FormShell
      title={ax("নতুন হাসপাতাল যোগ করুন")}
      busy={busy}
      error={error}
      onClose={onClose}
      onSubmit={() => {
        if (!f.name.trim() || !f.address.trim() || !f.hotline.trim() || !f.districtId)
          return setError(ax("তারকা (*) চিহ্নিত ঘরগুলো পূরণ করুন"));
        submit({ ...f, thana: f.thana || null, emergency24 });
      }}
    >
      <PhotoPicker value={f.photo} onChange={set("photo")} wide />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={ax("হাসপাতালের নাম")} required className="sm:col-span-2">
          <input value={f.name} onChange={(e) => set("name")(e.target.value)} className={inputCls} />
        </Field>
        <Field label={ax("ধরন")} required>
          <select value={f.type} onChange={(e) => set("type")(e.target.value)} className={inputCls}>
            {HOSPITAL_TYPES.map((h) => (
              <option key={h.key} value={h.key}>
                {locale === "en" ? h.en : h.bn}
              </option>
            ))}
          </select>
        </Field>
        <Field label={ax("হটলাইন / ফোন")} required>
          <input value={f.hotline} onChange={(e) => set("hotline")(e.target.value)} inputMode="tel" className={inputCls} />
        </Field>
        <Field label={ax("জেলা")} required>
          <DistrictSelect value={f.districtId} onChange={set("districtId")} />
        </Field>
        <Field label={ax("থানা / উপজেলা")}>
          <input value={f.thana} onChange={(e) => set("thana")(e.target.value)} className={inputCls} />
        </Field>
        <Field label={ax("ঠিকানা")} required className="sm:col-span-2">
          <input value={f.address} onChange={(e) => set("address")(e.target.value)} className={inputCls} />
        </Field>
      </div>
      <label className="flex items-center gap-2 font-ui text-sm text-foreground">
        <input
          type="checkbox"
          checked={emergency24}
          onChange={(e) => setEmergency(e.target.checked)}
          className="h-4 w-4 accent-[var(--brand-crimson)]"
        />
        {ax("২৪ ঘণ্টা জরুরি সেবা আছে")}
      </label>
    </FormShell>
  );
}
