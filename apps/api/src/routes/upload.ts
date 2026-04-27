import { Hono } from 'hono';

type Bindings = {
  IMAGES: R2Bucket;
};

export const uploadRouter = new Hono<{ Bindings: Bindings }>();

uploadRouter.post('/', async (c) => {
  const body = await c.req.parseBody();
  const file = body['file'];

  if (!file || !(file instanceof File)) {
    return c.json({ error: 'No file uploaded' }, 400);
  }

  // Generate a unique filename
  const extension = file.name.split('.').pop();
  const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;

  // Upload to R2
  try {
    await c.env.IMAGES.put(filename, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    });

    // We assume the bucket is public or has a custom domain attached.
    // For now, construct the URL based on typical R2 public URL format or Cloudflare worker URL.
    // Wait, the worker could serve the image itself, or we can use the R2 dev URL.
    // Let's create an endpoint in this router to serve the image, or return the URL if there's a public domain.
    // We will serve the images from the worker itself: GET /v1/upload/:filename
    
    const url = `${new URL(c.req.url).origin}/v1/upload/${filename}`;
    
    return c.json({ url });
  } catch (error) {
    console.error('Failed to upload image:', error);
    return c.json({ error: 'Failed to upload image' }, 500);
  }
});

uploadRouter.get('/:filename', async (c) => {
  const filename = c.req.param('filename');
  const object = await c.env.IMAGES.get(filename);

  if (!object) {
    return c.text('Not found', 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);

  return new Response(object.body, {
    headers,
  });
});
