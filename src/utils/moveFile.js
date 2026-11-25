const MAX_RENAME_ATTEMPTS = 100;

async function findAvailableName(destinationHandle, name) {
  try {
    await destinationHandle.getFileHandle(name, { create: false });
  } catch (e) {
    return name; // nothing there yet — safe to use as-is
  }
  const dotIdx = name.lastIndexOf('.');
  const base = dotIdx > 0 ? name.slice(0, dotIdx) : name;
  const ext = dotIdx > 0 ? name.slice(dotIdx) : '';
  for (let i = 1; i <= MAX_RENAME_ATTEMPTS; i++) {
    const candidate = `${base} (${i})${ext}`;
    try {
      await destinationHandle.getFileHandle(candidate, { create: false });
    } catch (e) {
      return candidate;
    }
  }
  throw new Error('Too many similarly-named files already in the destination folder.');
}

// Moves a single file to `destinationHandle`, renaming on collision.
// Uses the native FileSystemHandle.move() where available (Chrome 130+),
// falling back to a manual copy-then-delete on older browsers.
export async function moveFileTo(item, destinationHandle) {
  const finalName = await findAvailableName(destinationHandle, item.name);

  if (typeof item.handle.move === 'function') {
    await item.handle.move(destinationHandle, finalName);
    return finalName;
  }

  const file = await item.handle.getFile();
  const newHandle = await destinationHandle.getFileHandle(finalName, { create: true });
  const writable = await newHandle.createWritable();
  await writable.write(file);
  await writable.close();
  await item.parentHandle.removeEntry(item.name);
  return finalName;
}
