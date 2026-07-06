"use client";

import { StaffCredential, type CredentialAccent } from "./staff-credential";

export interface CredentialSheetProps {
  name: string;
  eventTitle: string;
  accent?: CredentialAccent;
  /** Columns × rows of credentials on the sheet. Defaults to 2×4 = 8. */
  cols?: number;
  rows?: number;
}

// A4 portrait @300dpi
const PW = 2480;
const PH = 3508;
// Native A7 credential size
const CW = 1240;
const CH = 874;

/**
 * Tiles copies of a single A7 credential onto an A4 portrait sheet (2×4 = 8)
 * with an outer print margin and gutters between cards. A dashed border around
 * each card is the cut guide; corner crop ticks mark where to slice the sheet.
 */
export function CredentialSheet({
  name,
  eventTitle,
  accent = "purple",
  cols = 2,
  rows = 4,
}: CredentialSheetProps) {
  const margin = 90;   // safe outer margin for the printer / cutting
  const gutter = 48;   // space between cards to cut cleanly

  const cellW = (PW - 2 * margin - (cols - 1) * gutter) / cols;
  const cellH = (PH - 2 * margin - (rows - 1) * gutter) / rows;
  const scale = Math.min(cellW / CW, cellH / CH);
  const tileW = CW * scale;
  const tileH = CH * scale;

  const count = cols * rows;

  return (
    <div
      style={{
        position: "relative",
        width: PW,
        height: PH,
        background: "#ffffff",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: margin,
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${tileW}px)`,
          gridTemplateRows: `repeat(${rows}, ${tileH}px)`,
          columnGap: gutter,
          rowGap: gutter,
          justifyContent: "center",
          alignContent: "center",
        }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "relative",
              width: tileW,
              height: tileH,
              outline: "2px dashed #c9c4bc",
              outlineOffset: 0,
            }}
          >
            <div
              style={{
                width: CW,
                height: CH,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <StaffCredential name={name} eventTitle={eventTitle} accent={accent} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
