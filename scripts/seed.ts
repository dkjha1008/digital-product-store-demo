import { config } from "dotenv";

config({ path: ".env.local" });

import { deflateSync } from "node:zlib";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { accounts, products, users } from "../src/db/schema.ts";

const PASSWORD = "demo12345";
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

type SeedProduct = {
  name: string;
  description: string;
  priceMinor: number;
  cover: [number, number, number];
};

type SeedStore = {
  name: string;
  slug: string;
  email: string;
  products: SeedProduct[];
};

const stores: SeedStore[] = [
  {
    name: "Northwind Press",
    slug: "northwind",
    email: "northwind@demo.store",
    products: [
      {
        name: "The Indie Author Handbook",
        description:
          "A practical guide to outlining, editing, and publishing your first ebook.",
        priceMinor: 1299,
        cover: [37, 99, 235],
      },
      {
        name: "Short Story Starters Vol. 1",
        description: "Fifty prompts and scene templates for fiction writers.",
        priceMinor: 799,
        cover: [124, 58, 237],
      },
      {
        name: "Poetry Chapbook Template",
        description: "Print-ready layout notes and a sample chapbook structure.",
        priceMinor: 599,
        cover: [190, 24, 93],
      },
      {
        name: "Worldbuilding Workbook",
        description: "Maps, cultures, and magic-system worksheets for novelists.",
        priceMinor: 1499,
        cover: [5, 150, 105],
      },
      {
        name: "Query Letter Kit",
        description: "Agent query templates, examples, and a revision checklist.",
        priceMinor: 899,
        cover: [217, 119, 6],
      },
      {
        name: "Dialogue Masterclass Notes",
        description: "Techniques for subtext, conflict, and distinctive character voice.",
        priceMinor: 1099,
        cover: [220, 38, 38],
      },
      {
        name: "Self-Editing Checklist",
        description: "A pass-by-pass editing system for drafts of any length.",
        priceMinor: 499,
        cover: [8, 145, 178],
      },
      {
        name: "Newsletter Welcome Sequence",
        description: "Seven email templates to grow a reader list after launch.",
        priceMinor: 999,
        cover: [67, 56, 202],
      },
      {
        name: "Book Launch Timeline",
        description: "A 90-day plan covering cover design, ARCs, and launch week.",
        priceMinor: 1199,
        cover: [21, 128, 61],
      },
      {
        name: "Character Interview Pack",
        description: "Deep-dive questions to make protagonists and villains feel real.",
        priceMinor: 699,
        cover: [15, 118, 110],
      },
    ],
  },
  {
    name: "Studio Pixel",
    slug: "studiopixel",
    email: "pixel@demo.store",
    products: [
      {
        name: "Minimal Invoice Template",
        description: "Clean invoice layout for freelancers, with tax and notes fields.",
        priceMinor: 499,
        cover: [30, 64, 175],
      },
      {
        name: "Social Media Kit — Neutral",
        description: "Post, story, and banner sizes in a muted color system.",
        priceMinor: 1599,
        cover: [88, 28, 135],
      },
      {
        name: "Pitch Deck Outline",
        description: "Twelve-slide narrative structure for product and studio pitches.",
        priceMinor: 1299,
        cover: [159, 18, 57],
      },
      {
        name: "Brand Voice Guide",
        description: "Tone, vocabulary, and example lines for a small creative studio.",
        priceMinor: 899,
        cover: [180, 83, 9],
      },
      {
        name: "Client Onboarding Checklist",
        description: "Forms, kickoff agenda, and file-handoff steps for new projects.",
        priceMinor: 699,
        cover: [22, 163, 74],
      },
      {
        name: "Icon Set Starter Pack",
        description: "A 40-icon outline set with usage notes for web and print.",
        priceMinor: 1999,
        cover: [2, 132, 199],
      },
      {
        name: "Portfolio Case Study Template",
        description: "Write-up structure for process, constraints, and outcomes.",
        priceMinor: 799,
        cover: [79, 70, 229],
      },
      {
        name: "Color System Worksheet",
        description: "Build a small palette with contrast checks and naming rules.",
        priceMinor: 599,
        cover: [13, 148, 136],
      },
      {
        name: "Freelance Contract Addendum",
        description: "Plain-language clauses for revisions, licensing, and kill fees.",
        priceMinor: 1099,
        cover: [185, 28, 28],
      },
      {
        name: "Launch Landing Page Copy",
        description: "Headline formulas and section copy for a one-page product site.",
        priceMinor: 999,
        cover: [101, 116, 205],
      },
    ],
  },
];

function pdfEscape(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildPdf(title: string, description: string) {
  const lines = [
    title,
    "",
    description,
    "",
    "Sample chapter",
    "This seeded PDF is a stand-in for a full digital book. Use it to test",
    "storefront thumbnails, Stripe checkout, and the download-token flow.",
    "",
    "1. Outline the idea in one paragraph.",
    "2. Draft without editing.",
    "3. Revise for clarity, then ship.",
  ];

  const contentOps = ["BT", "/F1 20 Tf", "72 720 Td", `(${pdfEscape(lines[0])}) Tj`];
  for (const line of lines.slice(1)) {
    contentOps.push("0 -18 Td", `/F1 11 Tf (${pdfEscape(line)}) Tj`);
  }
  contentOps.push("ET");
  const stream = contentOps.join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((body, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = offsets.length - 1;
  const startxref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${xref + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= xref; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer << /Size ${xref + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF`;
  return Buffer.from(pdf);
}

function crc32(buffer: Buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([length, typeBuf, data, crcBuf]);
}

function shade(channel: number, factor: number) {
  return Math.max(0, Math.min(255, Math.round(channel * factor)));
}

function buildCoverPng(rgb: [number, number, number], width = 400, height = 560) {
  const [r, g, b] = rgb;
  const raw = Buffer.alloc((1 + width * 3) * height);

  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (1 + width * 3);
    raw[rowStart] = 0;
    const band = y < 36 || y > height - 36;
    const panel = y > 90 && y < height - 110;
    for (let x = 0; x < width; x += 1) {
      const i = rowStart + 1 + x * 3;
      let factor = 1;
      if (band) factor = 0.55;
      else if (panel && x > 28 && x < width - 28) factor = 1.18;
      raw[i] = shade(r, factor);
      raw[i + 1] = shade(g, factor);
      raw[i + 2] = shade(b, factor);
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
}

function isS3Configured() {
  return Boolean(process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY);
}

function getS3() {
  return new S3Client({
    region: process.env.S3_REGION || "us-east-2",
    endpoint: process.env.S3_ENDPOINT || undefined,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
    requestChecksumCalculation: "WHEN_REQUIRED",
  });
}

async function storeBlob(
  key: string,
  body: Buffer,
  contentType: string,
  s3: S3Client | null,
) {
  const localPath = path.join(UPLOAD_DIR, key);
  await mkdir(path.dirname(localPath), { recursive: true });
  await writeFile(localPath, body);

  if (s3) {
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET || "digital-products",
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  }
}

async function writeProductAssets(
  accountId: string,
  item: SeedProduct,
  s3: S3Client | null,
) {
  const slug = slugify(item.name);
  const pdfId = randomUUID();
  const thumbId = randomUUID();
  const fileKey = `${accountId}/product/${pdfId}.pdf`;
  const thumbnailKey = `${accountId}/thumbnail/${thumbId}.png`;
  const pdf = buildPdf(item.name, item.description);
  const png = buildCoverPng(item.cover);

  await storeBlob(fileKey, pdf, "application/pdf", s3);
  await storeBlob(thumbnailKey, png, "image/png", s3);

  return {
    fileKey,
    fileName: `${slug}.pdf`,
    fileSize: pdf.length,
    thumbnailKey,
  };
}

async function seedStore(
  db: ReturnType<typeof drizzle>,
  store: SeedStore,
  passwordHash: string,
  s3: S3Client | null,
) {
  const [existing] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.slug, store.slug))
    .limit(1);

  let account = existing;

  if (!account) {
    const [created] = await db
      .insert(accounts)
      .values({ name: store.name, slug: store.slug })
      .returning();
    account = created;

    await db.insert(users).values({
      accountId: account.id,
      email: store.email,
      passwordHash,
    });
    console.log(`Created store ${store.slug}`);
  } else {
    console.log(`Store ${store.slug} already exists — refreshing product files`);
  }

  const existingProducts = await db
    .select()
    .from(products)
    .where(eq(products.accountId, account.id));
  const byName = new Map(existingProducts.map((product) => [product.name, product]));

  for (const item of store.products) {
    const files = await writeProductAssets(account.id, item, s3);
    const found = byName.get(item.name);
    const values = {
      name: item.name,
      description: item.description,
      priceMinor: item.priceMinor,
      currency: "USD" as const,
      status: "published" as const,
      fileKey: files.fileKey,
      fileName: files.fileName,
      fileSize: files.fileSize,
      thumbnailKey: files.thumbnailKey,
    };

    if (found) {
      await db.update(products).set(values).where(eq(products.id, found.id));
    } else {
      await db.insert(products).values({
        accountId: account.id,
        ...values,
      });
    }
  }

  return account;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const sql = neon(url);
  const db = drizzle(sql);
  const passwordHash = await bcrypt.hash(PASSWORD, 12);
  let s3: S3Client | null = null;

  if (isS3Configured()) {
    s3 = getS3();
    const bucket = process.env.S3_BUCKET || "digital-products";
    try {
      await s3.send(new HeadBucketCommand({ Bucket: bucket }));
    } catch {
      await s3.send(new CreateBucketCommand({ Bucket: bucket }));
    }
    console.log("Uploading seed PDFs and covers to object storage");
  } else {
    console.log("S3 is not configured — writing PDFs and covers to ./uploads");
  }

  for (const store of stores) {
    await seedStore(db, store, passwordHash, s3);
  }

  const appUrl = process.env.APP_URL || "http://localhost:3000";
  console.log("\nSeed complete. Each product has a PDF + cover image.");
  console.log("Log in with password:", PASSWORD);
  for (const store of stores) {
    console.log(`- ${store.name}: ${store.email}  →  ${appUrl}/store/${store.slug}`);
  }
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
