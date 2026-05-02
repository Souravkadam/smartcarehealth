import { useRef, useState } from "react";
import { Camera, X, Plus, Image } from "lucide-react";

interface SingleImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
}

/** Single image — supports URL input OR file upload (base64 preview) */
export function SingleImageUpload({ value, onChange, label = "Image", placeholder = "https://..." }: SingleImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"url" | "file">("url");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-1.5">{label}</label>
      <div className="flex gap-2 mb-2">
        <button type="button" onClick={() => setMode("url")}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${mode === "url" ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}>
          URL
        </button>
        <button type="button" onClick={() => setMode("file")}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${mode === "file" ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}>
          Upload File
        </button>
      </div>

      {mode === "url" ? (
        <input type="url" value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
      ) : (
        <div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <button type="button" onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 flex flex-col items-center gap-2 hover:border-primary transition-colors text-gray-400 hover:text-primary">
            <Camera className="w-6 h-6" />
            <span className="text-xs font-medium">Click to upload image</span>
          </button>
        </div>
      )}

      {value && (
        <div className="mt-2 relative inline-block">
          <img src={value} alt="Preview" className="h-20 w-32 object-cover rounded-lg border border-gray-200" />
          <button type="button" onClick={() => onChange("")}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}

interface MultiImageUploadProps {
  values: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  max?: number;
}

/** Multiple images — for hospital gallery */
export function MultiImageUpload({ values, onChange, label = "Gallery Images", max = 6 }: MultiImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");

  const addUrl = () => {
    if (!urlInput.trim() || values.length >= max) return;
    onChange([...values, urlInput.trim()]);
    setUrlInput("");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.slice(0, max - values.length).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => onChange([...values, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const remove = (idx: number) => onChange(values.filter((_, i) => i !== idx));

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-1.5">{label} <span className="text-gray-400 font-normal">({values.length}/{max})</span></label>

      {/* Existing images */}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {values.map((url, idx) => (
            <div key={idx} className="relative">
              <img src={url} alt={`img-${idx}`} className="h-16 w-24 object-cover rounded-lg border border-gray-200" />
              <button type="button" onClick={() => remove(idx)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <X className="w-3 h-3 text-white" />
              </button>
              {idx === 0 && (
                <span className="absolute bottom-0 left-0 right-0 text-center text-xs bg-primary/80 text-white rounded-b-lg py-0.5">Main</span>
              )}
            </div>
          ))}
        </div>
      )}

      {values.length < max && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)}
              placeholder="Paste image URL..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addUrl())} />
            <button type="button" onClick={addUrl}
              className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 rounded-lg py-3 flex items-center justify-center gap-2 hover:border-primary transition-colors text-gray-400 hover:text-primary text-sm">
              <Image className="w-4 h-4" /> Upload from device
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
