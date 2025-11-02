// Utility to extract text content from files
export class FileProcessor {
  static async extractTextFromFile(file: File): Promise<string> {
    const fileType = file.type;

    if (fileType.startsWith('text/') || fileType === 'application/json') {
      return await this.readAsText(file);
    }

    if (fileType === 'application/pdf') {
      // For PDFs, we'll just indicate the file was attached
      // A full PDF parser would require additional libraries
      return `[PDF adjunto: ${file.name}]`;
    }

    if (fileType.startsWith('image/')) {
      return `[Imagen adjunta: ${file.name}]`;
    }

    // Default case for unknown file types
    return `[Archivo adjunto: ${file.name} (${fileType})]`;
  }

  private static readAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  static async processFiles(files: FileList | File[]): Promise<string> {
    const fileArray = Array.from(files);
    const textPromises = fileArray.map(file => this.extractTextFromFile(file));
    const texts = await Promise.all(textPromises);
    
    return texts.join('\n\n');
  }
}

