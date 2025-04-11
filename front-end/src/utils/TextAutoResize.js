export const handleTextareaAutoResize = (e,
                                         setValue) => {
  const textarea = e.target;
  textarea.style.height = 'auto';
  textarea.style.overflowY = 'hidden';
  textarea.style.height = `${textarea.scrollHeight}px`;

  if (textarea.scrollHeight > 128) {
    textarea.style.overflowY = 'auto';
    textarea.style.height = '128px';
  }

  setValue(e.target.value);
};