import * as DocumentPicker from 'expo-document-picker';

export interface PickedDocument {
    uri: string;
    name: string;
    mimeType?: string;
    size?: number;
}

/**
 * Opens the system document picker to select a PDF file.
 * Returns the selected file details or null if canceled/error.
 */
// 15MB Limit in bytes
const MAX_FILE_SIZE = 15 * 1024 * 1024;

export const pickDocument = async (): Promise<PickedDocument | null> => {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: ['application/pdf', 'image/jpeg', 'image/png'],
            copyToCacheDirectory: true,
        });

        if (result.canceled) {
            console.log('Document picking canceled');
            return null;
        }

        const asset = result.assets[0];

        if (!asset.uri) return null;

        // Validation
        if (asset.size && asset.size > MAX_FILE_SIZE) {
            // throw error so UI can catch it.
            throw new Error("FILE_TOO_LARGE");
        }

        return {
            uri: asset.uri,
            name: asset.name,
            mimeType: asset.mimeType,
            size: asset.size,
        };

    } catch (error) {
        if (error instanceof Error && error.message === "FILE_TOO_LARGE") {
            throw error;
        }
        console.error('Error picking document:', error);
        return null;
    }
};
