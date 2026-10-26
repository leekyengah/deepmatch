export function readMp4DurationSeconds(buf: Uint8Array): number | null {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let offset = 0;
  while (offset + 8 <= buf.length) {
    let size = view.getUint32(offset);
    const type = String.fromCharCode(
      buf[offset + 4],
      buf[offset + 5],
      buf[offset + 6],
      buf[offset + 7],
    );
    let header = 8;
    if (size === 1) {
      if (offset + 16 > buf.length) break;
      size = Number(view.getBigUint64(offset + 8));
      header = 16;
    } else if (size === 0) {
      size = buf.length - offset;
    }
    if (size < header || offset + size > buf.length) break;

    if (type === "moov" || type === "trak" || type === "mdia" || type === "minf") {
      const inner = readMp4DurationSeconds(
        buf.subarray(offset + header, offset + size),
      );
      if (inner != null) return inner;
    }
    if (type === "mvhd") {
      const start = offset + header;
      if (start + 20 > buf.length) return null;
      const version = buf[start];
      if (version === 1) {
        if (start + 32 > buf.length) return null;
        const timescale = view.getUint32(start + 20);
        const duration = Number(view.getBigUint64(start + 24));
        if (timescale > 0) return duration / timescale;
      } else {
        const timescale = view.getUint32(start + 12);
        const duration = view.getUint32(start + 16);
        if (timescale > 0) return duration / timescale;
      }
      return null;
    }
    offset += size;
  }
  return null;
}

export function readWebmDurationSeconds(buf: Uint8Array): number | null {
  for (let i = 0; i + 11 < buf.length; i++) {
    if (buf[i] === 0x44 && buf[i + 1] === 0x89 && buf[i + 2] === 0x88) {
      const view = new DataView(buf.buffer, buf.byteOffset + i + 3, 8);
      const ms = view.getFloat64(0, false);
      if (Number.isFinite(ms) && ms > 0) return ms / 1000;
    }
  }
  return null;
}

export function readVideoDurationSeconds(
  mime: string,
  buf: Uint8Array,
): number | null {
  if (mime === "video/mp4") return readMp4DurationSeconds(buf);
  if (mime === "video/webm") return readWebmDurationSeconds(buf);
  return null;
}
