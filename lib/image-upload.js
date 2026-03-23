// ImageUpload — client-side compression + Supabase Storage upload
// No SDK needed — uses fetch directly against the Supabase REST API

window.ImageUpload = {
  SUPABASE_URL: 'https://qalzmunlszchouocfruz.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhbHptdW5sc3pjaG91b2NmcnV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNjE5MTgsImV4cCI6MjA4NzgzNzkxOH0.EUkps4XTR2-Ec1Yh5ZkpbnoWRry88vAbMJJIOiLSxQ0',
  BUCKET: 'rentmystuff-images',

  /**
   * Compress an image file via Canvas API.
   * Max 800px wide, JPEG quality 0.75.
   * @param {File} file
   * @returns {Promise<Blob>}
   */
  compress(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const MAX_W = 800;
        let w = img.width;
        let h = img.height;
        if (w > MAX_W) {
          h = Math.round(h * (MAX_W / w));
          w = MAX_W;
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          blob => (blob ? resolve(blob) : reject(new Error('Compression failed'))),
          'image/jpeg',
          0.75
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  },

  /**
   * Compress and upload an image to Supabase Storage.
   * @param {File} file - the original file from an <input type="file">
   * @param {string} itemId - used to namespace the upload path
   * @returns {Promise<string>} the public URL of the uploaded image
   */
  async compressAndUpload(file, itemId) {
    const blob = await this.compress(file);
    const path = `items/${itemId}/${Date.now()}.jpg`;

    const res = await fetch(
      `${this.SUPABASE_URL}/storage/v1/object/${this.BUCKET}/${path}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.SUPABASE_ANON_KEY}`,
          apikey: this.SUPABASE_ANON_KEY,
          'Content-Type': 'image/jpeg',
        },
        body: blob,
      }
    );

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Image upload failed: ${res.status} ${text}`);
    }

    // Return the public URL
    return `${this.SUPABASE_URL}/storage/v1/object/public/${this.BUCKET}/${path}`;
  },
};
