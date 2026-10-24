"use client";

import { useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ImageCropDialog({
  open,
  onOpenChange,
  imageUrl,
  initialZoom,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  /** Reuses the last-saved zoom as a starting point on re-edit; position always starts centered — exact prior framing isn't reconstructed. */
  initialZoom: number;
  onSave: (focal: { focalX: number; focalY: number; zoom: number }) => void;
}) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(initialZoom);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

  function handleOpenChange(next: boolean) {
    if (next) {
      // Reset drag position each time the dialog opens; only the zoom level carries over.
      setCrop({ x: 0, y: 0 });
      setZoom(initialZoom);
      setCroppedArea(null);
    }
    onOpenChange(next);
  }

  function handleSave() {
    if (!croppedArea) {
      onOpenChange(false);
      return;
    }
    onSave({
      focalX: (croppedArea.x + croppedArea.width / 2) / 100,
      focalY: (croppedArea.y + croppedArea.height / 2) / 100,
      zoom,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Position this photo</DialogTitle>
        </DialogHeader>

        <div className="relative h-80 w-full overflow-hidden rounded-lg bg-black/5">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="rect"
            showGrid
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(percentArea) => setCroppedArea(percentArea)}
          />
        </div>

        <label className="grid gap-1.5 text-sm font-medium">
          <span>Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          />
        </label>
        <p className="text-xs text-muted-foreground">Drag the photo to reposition it within the frame — this is how it will be cropped wherever it's shown.</p>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Position
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
