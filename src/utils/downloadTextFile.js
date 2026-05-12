/**
 * Browser download helper. Do not call `URL.revokeObjectURL` synchronously after `click()` — Chrome/Edge
 * may cancel the download. Append `<a>` to the document; revoke the URL after a short delay.
 *
 * @param {string} filename
 * @param {Blob|File} blob
 */
export function downloadBlobFile(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.setAttribute('rel', 'noopener');
  a.style.cssText = 'position:fixed;left:-10000px;top:0;';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2500);
}

/**
 * @param {string} filename
 * @param {string} text
 * @param {string} [mime]
 */
export function downloadTextFile(filename, text, mime = 'text/csv;charset=utf-8;') {
  const blob = new Blob([text], { type: mime });
  downloadBlobFile(filename, blob);
}
