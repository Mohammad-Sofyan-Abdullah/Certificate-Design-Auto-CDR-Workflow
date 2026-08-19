'use client';

import { useEffect, useMemo, useState } from 'react';
import { GRADES, Grade } from '@/lib/grades';
import {
  CertificateData,
  buildFileName,
  canvasToPdfBlob,
  deriveDisplayFields,
  renderCertificate,
} from '@/lib/certificateRenderer';
import {
  downloadFallback,
  isFolderPickerSupported,
  pickFolder,
  saveIntoFolder,
} from '@/lib/saveFile';

type FormState = {
  srNo: string;
  admission: string;
  name: string;
  fatherName: string;
  guardianName: string;
  dob: string;
  dateOfAdmission: string;
  classAdmitted: Grade | '';
  classAtLeaving: Grade | '';
  dateOfLeaving: string;
  reasonOfLeaving: string;
  gender: 'He' | 'She';
};

const INITIAL_STATE: FormState = {
  srNo: '',
  admission: '',
  name: '',
  fatherName: '',
  guardianName: '',
  dob: '',
  dateOfAdmission: '',
  classAdmitted: '',
  classAtLeaving: '',
  dateOfLeaving: '',
  reasonOfLeaving: '',
  gender: 'He',
};

const REQUIRED_FIELDS: (keyof FormState)[] = [
  'srNo',
  'admission',
  'name',
  'fatherName',
  'guardianName',
  'dob',
  'dateOfAdmission',
  'classAdmitted',
  'classAtLeaving',
  'dateOfLeaving',
];

const FIELD_LABELS: Record<keyof FormState, string> = {
  srNo: 'Sr. No.',
  admission: 'Admission',
  name: 'Name',
  fatherName: 'Father Name',
  guardianName: 'Guardian Name',
  dob: 'Date of Birth',
  dateOfAdmission: 'Date of Admission',
  classAdmitted: 'Class in which admitted',
  classAtLeaving: 'Class at the time of leaving',
  dateOfLeaving: 'Date of Leaving',
  reasonOfLeaving: 'Reason of Leaving',
  gender: 'Remarks',
};

export default function CertificateForm() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [folderHandle, setFolderHandle] = useState<any>(null);
  const [folderName, setFolderName] = useState<string>('');

  const [folderPickerSupported, setFolderPickerSupported] = useState(false);

  useEffect(() => {
    setFolderPickerSupported(isFolderPickerSupported());
  }, []);

  const preview = useMemo(() => {
    if (!form.dob && form.gender === 'He') {
      return { dobWordsText: '', remarksText: 'He is an obedient child.' };
    }
    const derived = deriveDisplayFields({
      ...form,
      classAdmitted: (form.classAdmitted || 'PG') as Grade,
      classAtLeaving: (form.classAtLeaving || 'PG') as Grade,
    } as CertificateData);
    return derived;
  }, [form]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): string[] {
    const missing = REQUIRED_FIELDS.filter((key) => !form[key]);
    return missing.map((key) => `${FIELD_LABELS[key]} is required.`);
  }

  async function handleChooseFolder() {
    setStatus('');
    const handle = await pickFolder();
    if (handle) {
      setFolderHandle(handle);
      setFolderName('Folder selected');
    }
  }

  async function handleGenerate() {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (validationErrors.length > 0) {
      setStatus('');
      return;
    }

    setIsGenerating(true);
    setStatus('Generating certificate…');

    try {
      const data: CertificateData = {
        ...form,
        classAdmitted: form.classAdmitted as Grade,
        classAtLeaving: form.classAtLeaving as Grade,
      };

      const canvas = await renderCertificate(data);
      const previewDataUrl = canvas.toDataURL('image/png');
      setPreviewUrl(previewDataUrl);

      const blob = canvasToPdfBlob(canvas);
      const filename = buildFileName(data);

      if (folderHandle) {
        await saveIntoFolder(folderHandle, blob, filename);
        setStatus(`Saved "${filename}" to the selected folder.`);
      } else {
        downloadFallback(blob, filename);
        setStatus(`Downloaded "${filename}".`);
      }
    } catch (err) {
      console.error(err);
      setStatus('Something went wrong while generating the certificate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  function inputClass() {
    return 'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500';
  }

  function labelClass() {
    return 'block text-sm font-medium text-gray-700';
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass()}>
            Sr. No. <span className="text-red-500">*</span>
          </label>
          <input
            className={inputClass()}
            value={form.srNo}
            onChange={(e) => update('srNo', e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass()}>
            Admission <span className="text-red-500">*</span>
          </label>
          <input
            className={inputClass()}
            value={form.admission}
            onChange={(e) => update('admission', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelClass()}>
          Name <span className="text-red-500">*</span>
        </label>
        <input className={inputClass()} value={form.name} onChange={(e) => update('name', e.target.value)} />
      </div>

      <div>
        <label className={labelClass()}>
          Father Name <span className="text-red-500">*</span>
        </label>
        <input
          className={inputClass()}
          value={form.fatherName}
          onChange={(e) => update('fatherName', e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass()}>
          Guardian Name <span className="text-red-500">*</span>
        </label>
        <input
          className={inputClass()}
          value={form.guardianName}
          onChange={(e) => update('guardianName', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass()}>
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className={inputClass()}
            value={form.dob}
            onChange={(e) => update('dob', e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass()}>Date of Birth (in words)</label>
          <div className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
            {preview.dobWordsText || '—'}
          </div>
        </div>
      </div>

      <div>
        <label className={labelClass()}>
          Date of Admission <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          className={inputClass()}
          value={form.dateOfAdmission}
          onChange={(e) => update('dateOfAdmission', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass()}>
            Class in which admitted <span className="text-red-500">*</span>
          </label>
          <select
            className={inputClass()}
            value={form.classAdmitted}
            onChange={(e) => update('classAdmitted', e.target.value as Grade)}
          >
            <option value="">Select grade…</option>
            {GRADES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass()}>
            Class at the time of leaving <span className="text-red-500">*</span>
          </label>
          <select
            className={inputClass()}
            value={form.classAtLeaving}
            onChange={(e) => update('classAtLeaving', e.target.value as Grade)}
          >
            <option value="">Promoted to…</option>
            {GRADES.map((g) => (
              <option key={g} value={g}>
                Promoted to {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass()}>
          Date of Leaving <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          className={inputClass()}
          value={form.dateOfLeaving}
          onChange={(e) => update('dateOfLeaving', e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass()}>Reason of Leaving</label>
        <input
          className={inputClass()}
          value={form.reasonOfLeaving}
          onChange={(e) => update('reasonOfLeaving', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass()}>Remarks</label>
          <select
            className={inputClass()}
            value={form.gender}
            onChange={(e) => update('gender', e.target.value as 'He' | 'She')}
          >
            <option value="He">He</option>
            <option value="She">She</option>
          </select>
        </div>
        <div>
          <label className={labelClass()}>Preview</label>
          <div className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
            {preview.remarksText}
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-400">
        Date of Issue will be stamped automatically with today&apos;s date when the certificate is generated.
      </div>

      {errors.length > 0 && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          <ul className="list-disc list-inside space-y-1">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t pt-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleChooseFolder}
            disabled={!folderPickerSupported}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Choose Save Folder…
          </button>
          <span className="text-sm text-gray-500">
            {folderPickerSupported
              ? folderName || 'No folder selected — will download instead.'
              : 'Folder picker not supported in this browser — will download instead.'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
        >
          {isGenerating ? 'Generating…' : 'Generate & Save Certificate'}
        </button>

        {status && <p className="text-sm text-gray-600">{status}</p>}
      </div>

      {previewUrl && (
        <div className="border-t pt-4">
          <p className={labelClass()}>Generated Certificate Preview</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Certificate preview" className="mt-2 w-full border rounded-md" />
        </div>
      )}
    </div>
  );
}
