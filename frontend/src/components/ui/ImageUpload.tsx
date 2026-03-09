"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, X, ImageIcon } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

interface ImageUploadProps {
  value?: string;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = useCallback(
    (file: File) => {
      setError(null);

      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.");
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError("File is too large. Maximum size is 5MB.");
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onChange(file);
    },
    [onChange]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSelect(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSelect(file);
    }
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleRemove = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setError(null);
    onChange(null);
  };

  const displayImage = preview || value || null;

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />

      {displayImage ? (
        <Card className="relative overflow-hidden">
          <div className="relative h-48 w-full">
            <Image
              src={displayImage}
              alt="Upload preview"
              fill
              className="object-cover"
              unoptimized={preview !== null}
            />
          </div>
          {!disabled && (
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => inputRef.current?.click()}
              >
                Change
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <Card
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            {isDragging ? (
              <Upload className="h-10 w-10 text-primary mb-3" />
            ) : (
              <ImageIcon className="h-10 w-10 text-muted-foreground mb-3" />
            )}
            <p className="text-sm font-medium text-muted-foreground">
              {isDragging ? "Drop image here" : "Drag & drop or click to upload"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPEG, PNG, GIF, WebP up to 5MB
            </p>
          </div>
        </Card>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
