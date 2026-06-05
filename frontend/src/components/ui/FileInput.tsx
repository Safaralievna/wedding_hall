import { useRef } from 'react';
import { Upload } from 'lucide-react';

interface FileInputProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  onChange: (files: File[]) => void;
  hint?: string;
}

export function FileInput({
  label = 'Rasm yuklash',
  accept = 'image/jpeg,image/png,image/webp',
  multiple,
  onChange,
  hint,
}: FileInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div>
      {label && <p className="mb-2 text-sm font-medium text-slate-300">{label}</p>}
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 py-8 text-slate-400 transition-colors hover:border-brand-500/40 hover:bg-brand-500/5 hover:text-brand-300"
      >
        <Upload className="h-8 w-8" />
        <span className="text-sm">Faylni tanlang yoki sudrab keling</span>
        {hint && <span className="text-xs text-slate-500">{hint}</span>}
      </button>
      <input
        ref={ref}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) onChange(files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
