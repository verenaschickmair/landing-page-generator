export const PromiseResult = {
  async from<T>(promise: Promise<T>, caller: string): Promise<T> {
    return promise
      .then((result) => result)
      .catch((error) => {
        console.error(caller, error);
        throw error;
      });
  },
};

export const copyToClipboard = async (copyText: string): Promise<void> => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(copyText);
  } else {
    // Use the 'out of viewport hidden text area' trick
    const textArea = document.createElement('textarea');
    textArea.value = copyText;

    // Move textarea out of the viewport so it's not visible
    textArea.style.position = 'absolute';
    textArea.style.left = '-999999px';

    document.body.prepend(textArea);
    textArea.select();

    try {
      document.execCommand('copy');
    } catch (error) {
      console.error(error);
    } finally {
      textArea.remove();
    }
  }
};
