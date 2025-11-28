// Declaration for the global mammoth object loaded via script tag
declare const mammoth: any;

export const extractTextFromDocx = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!(window as any).mammoth) {
      reject(new Error("Mammoth.js library not loaded"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const arrayBuffer = loadEvent.target?.result;
      if (!arrayBuffer) {
        reject(new Error("Failed to read file"));
        return;
      }

      mammoth.extractRawText({ arrayBuffer: arrayBuffer })
        .then((result: any) => {
          resolve(result.value);
        })
        .catch((err: any) => {
          reject(err);
        });
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};