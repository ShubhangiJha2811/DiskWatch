// Buckets file extensions into broad, non-technical categories for the
// "space by file type" view. Order matches the validated categorical palette.
export const TYPE_META = [
  { key: 'video', label: 'Videos', color: 'var(--cat-1)' },
  { key: 'image', label: 'Images', color: 'var(--cat-2)' },
  { key: 'audio', label: 'Audio', color: 'var(--cat-3)' },
  { key: 'document', label: 'Documents', color: 'var(--cat-4)' },
  { key: 'code', label: 'Code & config', color: 'var(--cat-5)' },
  { key: 'archive', label: 'Archives & installers', color: 'var(--cat-6)' },
];

// "Other" is deliberately not part of the fixed categorical order — it's the
// catch-all bucket, shown last, in neutral ink rather than a generated hue.
export const OTHER_TYPE = { key: 'other', label: 'Other', color: 'var(--text-muted)' };

const EXT_TYPE_MAP = {
  mp4: 'video', mov: 'video', mkv: 'video', avi: 'video', wmv: 'video', flv: 'video', m4v: 'video', webm: 'video', mpg: 'video', mpeg: 'video',
  jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', bmp: 'image', webp: 'image', svg: 'image', heic: 'image', heif: 'image', tiff: 'image', raw: 'image', cr2: 'image', nef: 'image',
  mp3: 'audio', wav: 'audio', flac: 'audio', aac: 'audio', m4a: 'audio', ogg: 'audio', wma: 'audio', aiff: 'audio',
  pdf: 'document', doc: 'document', docx: 'document', xls: 'document', xlsx: 'document', ppt: 'document', pptx: 'document',
  txt: 'document', md: 'document', csv: 'document', odt: 'document', rtf: 'document', epub: 'document',
  js: 'code', jsx: 'code', ts: 'code', tsx: 'code', py: 'code', java: 'code', c: 'code', cpp: 'code', h: 'code', hpp: 'code',
  cs: 'code', go: 'code', rb: 'code', php: 'code', html: 'code', htm: 'code', css: 'code', scss: 'code', json: 'code',
  yml: 'code', yaml: 'code', sh: 'code', rs: 'code', swift: 'code', kt: 'code', vue: 'code', svelte: 'code', sql: 'code',
  zip: 'archive', rar: 'archive', '7z': 'archive', tar: 'archive', gz: 'archive', tgz: 'archive', iso: 'archive',
  exe: 'archive', msi: 'archive', dmg: 'archive', pkg: 'archive', deb: 'archive', rpm: 'archive',
};

export function extToType(ext) {
  return EXT_TYPE_MAP[ext] || 'other';
}
