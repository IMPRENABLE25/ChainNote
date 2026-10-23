import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const token = process.env.PINATA_JWT;
  if (!token) return NextResponse.json({ error: "L’upload IPFS n’est pas configuré. Définissez PINATA_JWT sur le serveur." }, { status: 503 });
  try {
    const data = await request.formData();
    const file = data.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Aucun fichier image reçu." }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Le fichier doit être une image." }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "L’image dépasse la limite de 5 Mo." }, { status: 413 });
    const body = new FormData(); body.append("file", file, file.name);
    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body, signal: AbortSignal.timeout(50_000) });
    const result = await response.json();
    if (!response.ok) return NextResponse.json({ error: "Le fournisseur IPFS a refusé l’image. Réessayez plus tard." }, { status: 502 });
    return NextResponse.json({ cid: result.IpfsHash });
  } catch {
    return NextResponse.json({ error: "Échec de l’envoi IPFS. Vérifiez la connexion et réessayez." }, { status: 502 });
  }
}
