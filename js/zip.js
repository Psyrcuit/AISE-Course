// Minimal ZIP encoder. Stored (uncompressed) entries only. Sufficient for EPUB
// generation where the mimetype must be stored and we want zero vendored deps.
// CRC-32 table + writer; local file headers + central directory + EOCD.

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function dosDateTime(d = new Date()) {
  const t = ((d.getHours() << 11) | (d.getMinutes() << 5) | (Math.floor(d.getSeconds() / 2))) & 0xFFFF;
  const dt = (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xFFFF;
  return { time: t, date: dt };
}

function strToBytes(s) { return new TextEncoder().encode(s); }
function writeU16(buf, off, v) { buf[off] = v & 0xFF; buf[off + 1] = (v >>> 8) & 0xFF; }
function writeU32(buf, off, v) { buf[off] = v & 0xFF; buf[off + 1] = (v >>> 8) & 0xFF; buf[off + 2] = (v >>> 16) & 0xFF; buf[off + 3] = (v >>> 24) & 0xFF; }

/**
 * Build a ZIP blob from a list of {name, data, store}. `data` can be a string
 * or Uint8Array. `store` (default true) forces no compression - required for
 * the EPUB mimetype entry. Returns a Blob with 'application/octet-stream'.
 */
export function buildZip(entries) {
  const { time, date } = dosDateTime();
  const localChunks = [];
  const centralChunks = [];
  let offset = 0;

  for (const e of entries) {
    const nameBytes = strToBytes(e.name);
    const data = typeof e.data === 'string' ? strToBytes(e.data) : (e.data instanceof Uint8Array ? e.data : new Uint8Array(e.data));
    const crc = crc32(data);
    const size = data.length;

    // Local file header (30 bytes + name + data)
    const localHeader = new Uint8Array(30 + nameBytes.length);
    writeU32(localHeader, 0, 0x04034B50);   // signature
    writeU16(localHeader, 4, 20);           // version needed
    writeU16(localHeader, 6, 0);            // flags
    writeU16(localHeader, 8, 0);            // method 0 = stored
    writeU16(localHeader, 10, time);
    writeU16(localHeader, 12, date);
    writeU32(localHeader, 14, crc);
    writeU32(localHeader, 18, size);        // compressed size
    writeU32(localHeader, 22, size);        // uncompressed size
    writeU16(localHeader, 26, nameBytes.length);
    writeU16(localHeader, 28, 0);           // extra length
    localHeader.set(nameBytes, 30);

    localChunks.push(localHeader, data);

    // Central directory entry (46 bytes + name)
    const central = new Uint8Array(46 + nameBytes.length);
    writeU32(central, 0, 0x02014B50);       // central dir signature
    writeU16(central, 4, 20);               // version made by
    writeU16(central, 6, 20);               // version needed
    writeU16(central, 8, 0);                // flags
    writeU16(central, 10, 0);               // method
    writeU16(central, 12, time);
    writeU16(central, 14, date);
    writeU32(central, 16, crc);
    writeU32(central, 20, size);
    writeU32(central, 24, size);
    writeU16(central, 28, nameBytes.length);
    writeU16(central, 30, 0);               // extra
    writeU16(central, 32, 0);               // comment
    writeU16(central, 34, 0);               // disk number
    writeU16(central, 36, 0);               // internal attrs
    writeU32(central, 38, 0);               // external attrs
    writeU32(central, 42, offset);          // local header offset
    central.set(nameBytes, 46);

    centralChunks.push(central);

    offset += localHeader.length + data.length;
  }

  // End of Central Directory record
  const centralSize = centralChunks.reduce((a, b) => a + b.length, 0);
  const eocd = new Uint8Array(22);
  writeU32(eocd, 0, 0x06054B50);
  writeU16(eocd, 4, 0);                     // disk number
  writeU16(eocd, 6, 0);                     // disk where central dir starts
  writeU16(eocd, 8, entries.length);
  writeU16(eocd, 10, entries.length);
  writeU32(eocd, 12, centralSize);
  writeU32(eocd, 16, offset);               // central dir offset
  writeU16(eocd, 20, 0);                    // comment length

  return new Blob([...localChunks, ...centralChunks, eocd], { type: 'application/zip' });
}

window.aise26 = Object.assign(window.aise26 || {}, { zip: { buildZip } });
