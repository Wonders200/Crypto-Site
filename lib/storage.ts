const S3_BUCKET = process.env.S3_BUCKET ?? "";
const S3_REGION = process.env.S3_REGION ?? "auto";
const S3_ENDPOINT = process.env.S3_ENDPOINT ?? "";
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY ?? "";
const S3_SECRET_KEY = process.env.S3_SECRET_KEY ?? "";
const S3_PUBLIC_BASE = process.env.S3_PUBLIC_BASE ?? "";

export function hasS3(): boolean {
  return Boolean(S3_BUCKET && S3_ACCESS_KEY && S3_SECRET_KEY);
}

/**
 * Upload a file (from a data URL) to S3/R2.
 * Falls back to returning the data URL unchanged if S3 not configured.
 */
export async function uploadDataUrl(dataUrl: string, key: string): Promise<string> {
  if (!hasS3()) return dataUrl;

  try {
    // Dynamic import so it doesn't break if @aws-sdk/client-s3 isn't installed
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");

    const [header, b64] = dataUrl.split(",");
    const mime = header.match(/data:([^;]+)/)?.[1] ?? "image/jpeg";
    const buf = Buffer.from(b64, "base64");

    const client = new S3Client({
      region: S3_REGION,
      endpoint: S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: S3_ACCESS_KEY,
        secretAccessKey: S3_SECRET_KEY,
      },
    });

    await client.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buf,
      ContentType: mime,
    }));

    if (S3_PUBLIC_BASE) return S3_PUBLIC_BASE.replace(/\/$/, "") + "/" + key;
    return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
  } catch (e) {
    console.error("[storage] upload failed, keeping base64", e);
    return dataUrl;
  }
}