export function compressImageToBase64(
    file: File,
    maxSizeMB: number = 1,
    quality: number = 0.8
): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith("image/")) {
            return reject(new Error("File is not an image"));
        }

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));

        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            let { width, height } = img;
            const maxDimension = 1920;

            // Resize if necessary
            if (width > maxDimension || height > maxDimension) {
                if (width > height) {
                    height = (height * maxDimension) / width;
                    width = maxDimension;
                } else {
                    width = (width * maxDimension) / height;
                    height = maxDimension;
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            let currentQuality = quality;

            const tryCompress = () => {
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            URL.revokeObjectURL(objectUrl);
                            return reject(
                                new Error("Image compression failed")
                            );
                        }

                        if (
                            blob.size <= maxSizeMB * 1024 * 1024 ||
                            currentQuality <= 0.1
                        ) {
                            URL.revokeObjectURL(objectUrl);

                            // Convert compressed blob to Base64
                            const reader = new FileReader();
                            reader.onloadend = () =>
                                resolve(reader.result as string);
                            reader.onerror = reject;
                            reader.readAsDataURL(blob);
                        } else {
                            currentQuality -= 0.1;
                            tryCompress();
                        }
                    },
                    file.type,
                    currentQuality
                );
            };

            tryCompress();
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Failed to load image"));
        };

        img.src = objectUrl;
    });
}
