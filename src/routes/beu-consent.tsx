import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent, type PointerEvent } from "react";
import { BackButton, Card, NeedsAccount, Shell, backButtonClass } from "@/components/common/Shell";
import { useCommon } from "@/lib/common/store";

export const Route = createFileRoute("/beu-consent")({
  validateSearch: (search: Record<string, unknown>) => ({
    service: typeof search.service === "string" ? search.service : "",
    treatment: typeof search.treatment === "string" ? search.treatment : "",
    date: typeof search.date === "string" ? search.date : "",
    time: typeof search.time === "string" ? search.time : "",
  }),
  component: ConsentPage,
});

const SKIN = [
  "Previous reaction to beauty, aesthetic or medical treatments",
  "Allergies or intolerances",
  "Sensitive or hypersensitive skin",
  "Heat reactive skin",
  "Skin disorder (e.g. eczema, psoriasis, dermatitis, rosacea)",
  "Active acne, infection, cuts or broken skin",
  "Cold sores (Herpes Simplex)",
  "Keloid or abnormal scarring",
  "Recent surgery or scarring (within the last 6 months)",
  "Recent sunburn or excessive sun exposure",
];

const MEDICATION = [
  "Currently taking prescribed medication",
  "Taking blood-thinning medication",
  "Currently taking or have recently taken Roaccutane (Isotretinoin)",
  "Currently taking prescription acne medication",
  "Using active skincare ingredients on the treatment area (e.g. Retinol, Retinoids, AHAs, BHAs, Benzoyl Peroxide)",
];

const MEDICAL = [
  "Pregnant",
  "Breastfeeding",
  "Diabetes",
  "Heart condition",
  "Blood disorder",
  "Autoimmune condition",
  "Epilepsy",
  "Asthma",
  "Cancer (current or previous)",
  "Eye condition or recent eye surgery",
  "Other medical condition(s)",
  "None of the above",
];

const PHOTOS = ["Website", "Social Media", "Printed Marketing", "Training Purposes", "I do not consent to use outside my treatment record"];

const CONSENT = [
  "I confirm that the information I have provided is true, accurate and complete to the best of my knowledge. I understand that it is my responsibility to inform my therapist of any changes to my medical history, medications, allergies, pregnancy status or skin condition before every future appointment.",
  "I understand that all treatments carry potential risks and that results may vary from person to person. My therapist has explained the treatment, expected outcomes, possible side effects, contraindications and aftercare requirements, and I have had the opportunity to ask questions before proceeding.",
  "I understand that temporary reactions such as redness, swelling, tenderness, irritation or sensitivity may occur depending on the treatment performed. Every reasonable care will be taken to minimise the risk of adverse reactions.",
  "I agree to follow all pre-treatment and aftercare advice provided by BE U Studio Old Town. I understand that failure to follow this advice may affect my treatment results and increase the risk of complications.",
  "If I experience an unexpected reaction or have any concerns following my treatment, I agree to contact BE U Studio Old Town as soon as reasonably possible so that appropriate advice can be provided.",
  "I understand that my therapist may decline, postpone or modify my treatment if it is considered unsuitable or unsafe to proceed on the day of my appointment.",
  "I acknowledge that BE U Studio Old Town and its therapists cannot accept responsibility for adverse reactions resulting from inaccurate or incomplete medical information, undisclosed medical conditions, failure to follow aftercare advice, or circumstances outside of their reasonable control.",
  "I confirm that I have read and understood this consultation form, have had the opportunity to ask any questions, and voluntarily consent to today’s treatment.",
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function SignaturePad({ onChange }: { onChange: (signed: boolean) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const width = canvas.offsetWidth;
    canvas.width = width * ratio;
    canvas.height = 160 * ratio;
    context.scale(ratio, ratio);
    context.lineWidth = 2.2;
    context.lineCap = "round";
    context.strokeStyle = "#1a1a1a";
  }, []);

  function point(event: PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function signed() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return false;
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let index = 3; index < data.length; index += 16) {
      if (data[index] > 0) return true;
    }
    return false;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-[#fafafa]">
      <canvas
        ref={canvasRef}
        className="h-40 w-full touch-none"
        onPointerDown={(event) => {
          drawing.current = true;
          last.current = point(event);
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!drawing.current) return;
          const canvas = canvasRef.current;
          const context = canvas?.getContext("2d");
          if (!context) return;
          const next = point(event);
          context.beginPath();
          context.moveTo(last.current.x, last.current.y);
          context.lineTo(next.x, next.y);
          context.stroke();
          last.current = next;
          onChange(true);
        }}
        onPointerUp={() => {
          drawing.current = false;
          onChange(signed());
        }}
      />
      <button
        type="button"
        className="border-t border-line px-3 py-2 text-sm"
        onClick={() => {
          const canvas = canvasRef.current;
          const context = canvas?.getContext("2d");
          if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height);
          onChange(false);
        }}
      >
        Clear
      </button>
    </div>
  );
}

function Checks({ legend, options, value, onChange }: { legend: string; options: string[]; value: string[]; onChange: (next: string[]) => void }) {
  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-medium">{legend}</legend>
      {options.map((option) => (
        <label key={option} className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={value.includes(option)}
            onChange={() => onChange(toggle(value, option))}
          />
          <span>{option}</span>
        </label>
      ))}
    </fieldset>
  );
}

function ConsentPage() {
  const { service, treatment, date, time } = Route.useSearch();
  const navigate = useNavigate();
  const account = useCommon((state) => state.account);
  const saveIndemnity = useCommon((state) => state.saveIndemnity);
  const requestBooking = useCommon((state) => state.requestBooking);
  const [fullName, setFullName] = useState(account?.name ?? "");
  const [dob, setDob] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [skinHistory, setSkinHistory] = useState<string[]>([]);
  const [medication, setMedication] = useState<string[]>([]);
  const [medical, setMedical] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [photoConsent, setPhotoConsent] = useState<string[]>([]);
  const [gdpr, setGdpr] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [clientDate, setClientDate] = useState(today());
  const [signed, setSigned] = useState(false);
  const [note, setNote] = useState("");
  const [code, setCode] = useState("");
  const [pinOpen, setPinOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [pinNote, setPinNote] = useState("");
  const [therapist, setTherapist] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!account) {
      void navigate({ to: "/account", search: { next: `/beu-consent?service=${encodeURIComponent(service)}&treatment=${encodeURIComponent(treatment)}&date=${date}&time=${time}` } });
      return;
    }
    if (!fullName.trim() || !dob || !mobile.trim() || !email.trim()) {
      setNote("Name, date of birth, mobile and email are required.");
      return;
    }
    if (!service) {
      setNote("Choose a service on the studio page before this form.");
      return;
    }
    if (!gdpr) {
      setNote("The privacy consent is required.");
      return;
    }
    if (!signed) {
      setNote("A client signature is required.");
      return;
    }
    const requested = treatment && treatment !== service ? `${service} — ${treatment}` : service;
    saveIndemnity({
      businessId: "biz_f4393427-4b76-e6d7-54b8-870177dfa5b6",
      service: requested,
      when: `${date} ${time}`.trim(),
      fullName: fullName.trim(),
      dob,
      mobile: mobile.trim(),
      email: email.trim(),
      treatments: requested,
      skinHistory: skinHistory.join(", "),
      medication: medication.join(", "),
      medical: medical.join(", "),
      additionalInfo: additionalInfo.trim(),
      photoConsent: photoConsent.join(", "),
      marketing,
      clientDate,
    });
    const result = requestBooking({
      businessId: "biz_f4393427-4b76-e6d7-54b8-870177dfa5b6",
      kind: "service",
      party: requested,
      when: `${date} ${time}`.trim() || clientDate,
    });
    if (!result.ok) {
      setNote(result.reason);
      return;
    }
    const copy = [
      "BE U Studio — Client Consultation & Consent",
      `Name: ${fullName}`,
      `Date of birth: ${dob}`,
      `Mobile: ${mobile}`,
      `Email: ${email}`,
      `Appointment: ${date} ${time}`,
      `Service: ${requested}`,
      `Skin history: ${skinHistory.join(", ") || "None ticked"}`,
      `Medication: ${medication.join(", ") || "None ticked"}`,
      `Medical history: ${medical.join(", ") || "None ticked"}`,
      `Additional: ${additionalInfo || "None"}`,
      `Photography: ${photoConsent.join(", ") || "None ticked"}`,
      `Privacy consent: Yes`,
      `Marketing: ${marketing ? "Yes" : "No"}`,
      `Signed: ${clientDate}`,
      `Booking code: ${result.code}`,
    ].join("\n");
    const file = new Blob([copy], { type: "text/plain" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `BeU-Consultation-${fullName.trim().replace(/\s+/g, "-")}-${clientDate}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setCode(result.code);
    setNote("");
  }

  if (!account) {
    return (
      <Shell>
        <Card>
          <h1 className="break-words font-serif text-3xl leading-tight">Client consultation</h1>
          <div className="mt-3"><NeedsAccount next={`/beu-consent?service=${encodeURIComponent(service)}&treatment=${encodeURIComponent(treatment)}&date=${date}&time=${time}`} /></div>
        </Card>
      </Shell>
    );
  }

  if (code) {
    return (
      <Shell>
        <Card>
          <p className="text-xs tracking-wide text-muted">
            <span className="mr-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">Saved</span>
            On this phone
          </p>
          <h1 className="mt-2 break-words font-serif text-3xl leading-tight font-medium">Consultation saved</h1>
          <p className="mt-2 text-sm">The form is stored on this phone and a copy has been downloaded. It has not been sent to Google Drive in this preview.</p>
          <p className="mt-3 text-sm">Your booking code: {code}</p>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <form className="grid gap-4" onSubmit={submit}>
        <header>
          <p className="text-xs tracking-wide text-muted">
            <span className="mr-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">Consent</span>
            Be U Studio
          </p>
          <h1 className="mt-2 break-words font-serif text-3xl leading-tight">Client consultation</h1>
          <p className="text-sm text-muted">Client consultation and consent. Required before a treatment request is held.</p>
          <p className="mt-2 text-sm">Requested: {treatment && treatment !== service ? `${service} — ${treatment}` : service || "None chosen"}{date ? ` · ${date}` : ""}{time ? ` ${time}` : ""}</p>
          {!service ? (
            <Link to="/business/$id" params={{ id: "biz_f4393427-4b76-e6d7-54b8-870177dfa5b6" }} search={{ from: "" }} className="mt-2 inline-block text-sm font-medium text-primary">
              Choose a service on the studio page first
            </Link>
          ) : null}
        </header>
        <div className="grid gap-2">
          <label className="grid gap-1 text-sm">Full name *
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} required className="min-h-11 rounded-xl border border-line bg-white px-3" />
          </label>
          <label className="grid gap-1 text-sm">Date of birth *
            <input type="date" value={dob} onChange={(event) => setDob(event.target.value)} required className="min-h-11 rounded-xl border border-line bg-white px-3" />
          </label>
          <label className="grid gap-1 text-sm">Mobile *
            <input type="tel" value={mobile} onChange={(event) => setMobile(event.target.value)} required className="min-h-11 rounded-xl border border-line bg-white px-3" />
          </label>
          <label className="grid gap-1 text-sm">Email *
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="min-h-11 rounded-xl border border-line bg-white px-3" />
          </label>
        </div>
        <h2 className="text-lg">Medical and skin history</h2>
        <p className="text-sm text-muted">Tick any that apply.</p>
        <Checks legend="Skin and treatment history" options={SKIN} value={skinHistory} onChange={setSkinHistory} />
        <Checks legend="Medication and skincare" options={MEDICATION} value={medication} onChange={setMedication} />
        <Checks legend="Medical history" options={MEDICAL} value={medical} onChange={setMedical} />
        <label className="grid gap-1 text-sm">Additional medical information
          <textarea value={additionalInfo} onChange={(event) => setAdditionalInfo(event.target.value)} className="min-h-24 rounded-xl border border-line bg-white px-3 py-2" />
        </label>
        <h2 className="text-lg">Treatment consent and declaration</h2>
        <div className="grid gap-2 rounded-2xl bg-band p-3 text-sm">
          {CONSENT.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <h2 className="text-lg">Clinical photography</h2>
        <p className="text-sm">Photographs taken for the treatment record are stored with this form on this phone. They are not used for marketing unless you tick a use below.</p>
        <Checks legend="Photography consent (optional)" options={PHOTOS} value={photoConsent} onChange={setPhotoConsent} />
        <h2 className="text-lg">Privacy and marketing</h2>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1" checked={gdpr} onChange={(event) => setGdpr(event.target.checked)} required />
          <span>I consent to BE U Studio Old Town storing this consultation on this phone for the preview. *</span>
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1" checked={marketing} onChange={(event) => setMarketing(event.target.checked)} />
          <span>I am happy to receive occasional news, offers and promotions by email or SMS.</span>
        </label>
        <h2 className="text-lg">Client signature</h2>
        <SignaturePad onChange={setSigned} />
        <label className="grid gap-1 text-sm">Date *
          <input type="date" value={clientDate} onChange={(event) => setClientDate(event.target.value)} required className="min-h-11 rounded-xl border border-line bg-white px-3" />
        </label>
        <button type="button" className="min-h-11 rounded-xl border border-line bg-white text-sm" onClick={() => { setPinOpen(true); setPinNote(""); }}>
          Therapist access (clinical notes)
        </button>
        {pinOpen ? (
          <div className="grid gap-2 rounded-2xl border border-line bg-white p-3">
            <label className="grid gap-1 text-sm">Staff PIN
              <input type="password" value={pin} onChange={(event) => setPin(event.target.value)} className="min-h-11 rounded-xl border border-line px-3" />
            </label>
            {pinNote ? <p className="text-sm text-warn">{pinNote}</p> : null}
            <button
              type="button"
              className="min-h-11 rounded-xl bg-primary text-sm font-medium text-white"
              onClick={() => {
                if (pin === "2580") {
                  setTherapist(true);
                  setPinOpen(false);
                } else setPinNote("Incorrect PIN");
              }}
            >
              Unlock
            </button>
          </div>
        ) : null}
        {therapist ? (
          <div className="grid gap-2 rounded-2xl bg-[#f9f5ef] p-3 text-sm">
            <h2 className="text-lg">Clinical record (therapist use only)</h2>
            <p>Patch test, products, machine settings and notes stay with the therapist on the day. They are not stored in this preview.</p>
          </div>
        ) : null}
        {note ? <p className="text-sm text-warn">{note}</p> : null}
        <button type="submit" className="min-h-11 rounded-xl bg-primary text-sm font-medium text-white">
          Sign and request the treatment
        </button>
      </form>
    </Shell>
  );
}
