"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { ImagePlus, UploadCloud, X } from "lucide-react";
import { Button } from "./ui/button";

export function ImageUploadField() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const updateFileName = (file?: File) => {
    setFileName(file?.name ?? "");
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateFileName(event.target.files?.[0]);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (!file || !inputRef.current) {
      return;
    }

    const transfer = new DataTransfer();
    transfer.items.add(file);
    inputRef.current.files = transfer.files;
    updateFileName(file);
  };

  const clearFile = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }

    setFileName("");
  };

  return (
    <div className="space-y-3">
      <label
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center transition ${
          isDragging
            ? "border-amber-600 bg-amber-50"
            : "border-slate-300 bg-slate-50 hover:border-amber-600 hover:bg-amber-50/60"
        }`}
      >
        <input
          ref={inputRef}
          name="imageFile"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="sr-only"
          onChange={handleInputChange}
        />
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-amber-700 shadow-sm">
          {fileName ? (
            <ImagePlus className="h-6 w-6" />
          ) : (
            <UploadCloud className="h-6 w-6" />
          )}
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-950">
          {fileName || "Drag and drop an image here"}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          PNG, JPG, WEBP, or GIF. Click to browse from your device.
        </p>
      </label>

      {fileName ? (
        <Button type="button" variant="outline" size="sm" onClick={clearFile}>
          <X className="h-4 w-4" />
          Remove selected image
        </Button>
      ) : null}
    </div>
  );
}
