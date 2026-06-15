import React, { useState } from 'react';
import { storage } from '../firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Camera, Upload, Image as ImageDataIcon, Sparkles, Check, Trash2, X, Plus } from 'lucide-react';
import { DEMO_PHOTO_PRESETS } from '../firebase/mockData';

interface PhotoUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ photos, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [customUrl, setCustomUrl] = useState('');
  const [showPresetsModal, setShowPresetsModal] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (storage) {
      setUploading(true);
      setProgress(10);
      const storageRef = ref(storage, `rooms/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setProgress(prog);
        },
        (error) => {
          console.error("Storage upload err:", error);
          setUploading(false);
          // Fallback to local URL generator
          const localUrl = URL.createObjectURL(file);
          onChange([...photos, localUrl]);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUploading(false);
          onChange([...photos, downloadURL]);
        }
      );
    } else {
      // Local demo mode
      const localUrl = URL.createObjectURL(file);
      onChange([...photos, localUrl]);
    }
  };

  const handleAddCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    onChange([...photos, customUrl.trim()]);
    setCustomUrl('');
  };

  const handleAddPreset = (url: string) => {
    if (!photos.includes(url)) {
      onChange([...photos, url]);
    }
  };

  const handleRemovePhoto = (idx: number) => {
    const updated = photos.filter((_, i) => i !== idx);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      
      {/* Upload Drop/Click area */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Main Upload Box */}
        <label className="border-2 border-dashed border-indigo-300 hover:border-indigo-600 bg-indigo-50/40 hover:bg-indigo-50/80 rounded-3xl p-6 flex flex-col items-center justify-center text-center transition cursor-pointer group h-48 relative overflow-hidden">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
          
          {uploading ? (
            <div className="flex flex-col items-center justify-center w-full space-y-3">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
              <span className="text-xs font-bold text-indigo-900">Uploading Image... {progress}%</span>
              <div className="w-full bg-indigo-200 h-2 rounded-full overflow-hidden max-w-xs">
                <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 bg-white rounded-2xl shadow-md group-hover:scale-110 transition flex items-center justify-center text-indigo-600 mb-3 group-hover:bg-indigo-600 group-hover:text-white">
                <Camera className="w-7 h-7" />
              </div>
              <span className="text-sm font-extrabold text-slate-800">Upload Room Photo</span>
              <span className="text-[10px] text-slate-500 mt-1">Supports local device or live storage</span>
            </>
          )}
        </label>

        {/* Quick Unsplash Preset Button box */}
        <div className="sm:col-span-2 border border-slate-200 bg-white rounded-3xl p-6 flex flex-col justify-between h-48">
          <div>
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
              <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
              <span>Don't have real photos right now?</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Use our verified demo AI/Unsplash Photo Gallery. Select instant highly professional interior photographs suitable for single rooms, shared apartments, or luxury PG spaces.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowPresetsModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <ImageDataIcon className="w-4 h-4" /> Open Instant Presets Gallery
            </button>
          </div>
        </div>

      </div>

      {/* Manual URL input */}
      <form onSubmit={handleAddCustomUrl} className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Upload className="w-4 h-4" />
          </span>
          <input
            type="url"
            placeholder="Or paste any direct web Image URL here (https://...)"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Add URL
        </button>
      </form>

      {/* Uploaded Photos Preview Tray */}
      {photos.length > 0 ? (
        <div className="space-y-2">
          <div className="text-xs font-extrabold text-slate-700 flex items-center justify-between">
            <span>Room Image Gallery ({photos.length} uploaded)</span>
            <span className="text-[10px] text-indigo-600 font-bold">First image will be the primary cover photo</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {photos.map((url, idx) => (
              <div key={url + idx} className="group relative rounded-2xl overflow-hidden aspect-square bg-slate-100 border border-slate-200 shadow-xs">
                <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="p-2 rounded-full bg-rose-600 text-white hover:scale-110 transition shadow-lg"
                    title="Delete photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {idx === 0 && (
                  <span className="absolute top-2 left-2 bg-indigo-600 text-white font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider shadow">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center text-xs text-slate-400 font-medium">
          No photos uploaded yet. Please add at least 1 image to list your room.
        </div>
      )}

      {/* Presets Modal */}
      {showPresetsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">High-Resolution Interior Presets</h3>
                  <p className="text-xs text-slate-500">Click any image below to instantly attach it to your room listing</p>
                </div>
              </div>
              <button
                onClick={() => setShowPresetsModal(false)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-2">
              {DEMO_PHOTO_PRESETS.map((presetUrl) => {
                const isSelected = photos.includes(presetUrl);
                return (
                  <div
                    key={presetUrl}
                    onClick={() => handleAddPreset(presetUrl)}
                    className={`relative rounded-2xl overflow-hidden aspect-square cursor-pointer group border-2 transition ${
                      isSelected ? 'border-emerald-500 ring-4 ring-emerald-500/20' : 'border-slate-200 hover:border-indigo-500'
                    }`}
                  >
                    <img src={presetUrl} alt="Preset" className="w-full h-full object-cover group-hover:scale-105 transition" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-emerald-500/30 backdrop-blur-2xs flex items-center justify-center text-white">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                          <Check className="w-5 h-5" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPresetsModal(false)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Confirm & Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};