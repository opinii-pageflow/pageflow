import { supabase } from '../supabase';

/**
 * Utilitário para gerenciar upload de imagens no Supabase Storage.
 * Transforma base64 em Blob e faz o upload para o bucket 'images'.
 */
export const storageApi = {
    /**
     * Faz upload de uma imagem (base64 ou File) para o Supabase Storage.
     * @param path Caminho dentro do bucket (ex: 'avatars/123.jpg')
     * @param source Base64 string ou Objeto File
     * @returns URL pública da imagem
     */
    async uploadImage(path: string, source: string | File): Promise<string> {
        let body: any;
        let contentType = 'image/jpeg';

        if (typeof source === 'string') {
            // Se já for uma URL (HTTP), não faz nada
            if (source.startsWith('http')) return source;

            // Se for base64
            if (source.startsWith('data:')) {
                const parts = source.split(',');
                const mime = parts[0].match(/:(.*?);/)?.[1];
                if (mime) contentType = mime;

                const bstr = atob(parts[1]);
                let n = bstr.length;
                const u8arr = new Uint8Array(n);
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }
                body = u8arr;
            } else {
                return source; // Caso desconhecido
            }
        } else {
            body = source;
            contentType = source.type;
        }

        const { data, error } = await supabase.storage
            .from('images')
            .upload(path, body, {
                contentType,
                upsert: true
            });

        if (error) {
            console.error('[storageApi] Error uploading image:', error);
            throw error;
        }

        // Retornar a URL pública
        const { data: publicUrlData } = supabase.storage
            .from('images')
            .getPublicUrl(data.path);

        return publicUrlData.publicUrl;
    },

    /**
     * Remove uma imagem do storage.
     */
    async deleteImage(path: string) {
        const cleanPath = path.split('/').pop();
        if (!cleanPath) return;

        await supabase.storage
            .from('images')
            .remove([path]);
    }
};
