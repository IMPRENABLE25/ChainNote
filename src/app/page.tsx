"use client";
import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain, useWriteContract, useWaitForTransactionReceipt, useBalance } from "wagmi";
import { bscTestnet } from "wagmi/chains";
import { AlertCircle, ArrowUpRight, Check, CheckCircle2, FileImage, Fingerprint, LoaderCircle, LockKeyhole, ShieldCheck, UploadCloud, WalletCards, X } from "lucide-react";
import { chainNoteAbi, contractAddress, contractReady } from "@/lib/contract";
import { decodeEventLog } from "viem";

const MAX_TEXT = 2000, MAX_IMAGE = 4 * 1024 * 1024;
const shorten = (s: string) => `${s.slice(0, 8)}…${s.slice(-6)}`;
export default function Home() {
  const [message, setMessage] = useState(""); const [file, setFile] = useState<File | null>(null); const [error, setError] = useState(""); const [imageCid, setImageCid] = useState(""); const [uploading, setUploading] = useState(false); const [publishedId, setPublishedId] = useState<string | null>(null);
  const { address, isConnected, chainId } = useAccount(); const { connect, connectors, isPending: connecting } = useConnect(); const { disconnect } = useDisconnect(); const { switchChain, isPending: switching } = useSwitchChain(); const { writeContract, data: hash, isPending: confirming, error: txError } = useWriteContract(); const receipt = useWaitForTransactionReceipt({ hash });
  const balance = useBalance({ address, chainId: bscTestnet.id, query: { enabled: isConnected } });
  const busy = uploading || confirming || receipt.isLoading;
  async function publish() {
    setError(""); setPublishedId(null);
    if (!message.trim()) return setError("Ajoutez un message avant de publier.");
    if (new TextEncoder().encode(message).length > MAX_TEXT) return setError("Le message dépasse la limite de 2 000 octets UTF-8.");
    if (!contractReady) return setError("Le contrat n’est pas encore configuré. Consultez le README pour le déployer.");
    if (!isConnected) return setError("Connectez votre wallet pour continuer.");
    if (chainId !== bscTestnet.id) { try { await switchChain({ chainId: bscTestnet.id }); } catch { return setError("Passez sur BNB Smart Chain Testnet dans MetaMask."); } }
    let cid = "";
    if (file) {
      const form = new FormData(); form.append("file", file); setUploading(true);
      try { const res = await fetch("/api/ipfs", { method: "POST", body: form }); const data = await res.json(); if (!res.ok) throw new Error(data.error || "Échec de l’upload IPFS"); cid = data.cid; setImageCid(cid); }
      catch (e) { setError(e instanceof Error ? e.message : "Échec de l’upload IPFS."); setUploading(false); return; } setUploading(false);
    }
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(message));
    const hex = `0x${Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("")}` as `0x${string}`;
    writeContract({ address: contractAddress, abi: chainNoteAbi, functionName: "publish", args: [message, hex, cid] });
  }
  useEffect(() => {
    if (!receipt.isSuccess || !receipt.data) return;
    for (const log of receipt.data.logs) {
      try {
        const parsed = decodeEventLog({ abi: chainNoteAbi, data: log.data, topics: log.topics });
        if (parsed.eventName === "NotePublished") { setPublishedId(parsed.args.id.toString()); break; }
      } catch { /* Ignore logs emitted by other contracts. */ }
    }
  }, [receipt.isSuccess, receipt.data]);
  const txMessage = txError?.message?.split("\n")[0];
  const fileChange = (f?: File) => { setError(""); if (!f) { setFile(null); return; } if (!f.type.startsWith("image/")) return setError("Choisissez un fichier image."); if (f.size > MAX_IMAGE) return setError("L’image doit faire 5 Mo ou moins."); setFile(f); };
  return <><header className="topbar"><div className="container nav"><a className="brand" href="/"><span className="brand-mark"><Fingerprint /></span>ChainNote</a><div className="nav-right"><a href="/verify">Vérifier une preuve</a><a href="https://testnet.bscscan.com/" target="_blank" rel="noreferrer">Explorateur <ArrowUpRight size={13}/></a>{isConnected ? <button className="wallet" onClick={() => disconnect()}>{shorten(address!)} · Déconnecter</button> : <button className="wallet" onClick={() => connect({ connector: connectors[0] })}>{connecting ? "Connexion…" : <><WalletCards size={14}/> Connecter MetaMask</>}</button>}</div></div></header>
    <main className="container"><section className="hero"><div><div className="eyebrow"><span className="dot"/>Preuve publique · horodatée · vérifiable</div><h1>Une preuve,<br/><em>sur la chaîne.</em></h1><p className="lead">Ancrez un message dans le temps. Publiez une empreinte SHA-256 sur BNB Smart Chain et partagez une preuve que chacun peut vérifier.</p></div><div className="hero-note"><div className="note-head"><span className="tiny-label">Exemple de preuve</span><span className="verified"><CheckCircle2 size={14}/> Vérifiée</span></div><div className="note-text">« Cette idée existait déjà le 23 octobre 2026. »</div><div className="note-meta"><span>BNB Smart Chain Testnet</span><span className="hash mono">0x8ab4…e729</span></div></div></section>
      <section className="workspace"><div className="panel"><h2 className="panel-title"><span className="step">01</span> Composer une preuve</h2>
        <label className="field-label" htmlFor="message">Votre message <span className="hint">{new TextEncoder().encode(message).length} / {MAX_TEXT} octets</span></label><textarea id="message" className="message" value={message} onChange={e => setMessage(e.target.value)} placeholder="Écrivez le message que vous souhaitez dater et rendre vérifiable…"/>
        <label className="field-label" style={{marginTop:19}}>Capture d’écran <span className="hint">Optionnelle · 4 Mo max</span></label><label className="upload"><span className="upload-icon"><UploadCloud/></span><span><strong>Ajouter une image</strong><small>PNG, JPG ou autre format image. Stockée sur IPFS.</small></span><input type="file" accept="image/*" onChange={e => fileChange(e.target.files?.[0])}/></label>{file&&<div className="image-preview"><FileImage size={16}/>{file.name}<button className="clear" onClick={()=>fileChange()} aria-label="Retirer l’image"><X size={15}/></button></div>}
        <div className="public-notice"><LockKeyhole/><span>Votre message et son empreinte seront <strong>publics et permanents</strong> sur la blockchain. Ne publiez aucune donnée sensible. L’image (4 Mo maximum) sera accessible via IPFS.</span></div>
        {error&&<div className="error"><AlertCircle size={14} style={{verticalAlign:"middle",marginRight:5}}/>{error}</div>}{txMessage&&<div className="error">{txMessage}</div>}
        <button className="publish" disabled={busy||(!message.trim()&&isConnected)} onClick={isConnected?publish:()=>connect({ connector: connectors[0] })}>{busy?<><LoaderCircle className="spinner" size={16}/>{uploading?"Envoi de l’image…":confirming?"Confirmez dans MetaMask…":"En attente de confirmation…"}:<><ShieldCheck size={16}/>{isConnected?"Publier ma preuve":"Connecter MetaMask"}</>}</button>
        {publishedId&&hash&&<div className="result"><div className="result-head"><Check size={15} style={{verticalAlign:"middle",marginRight:5}}/>Preuve publiée avec succès</div><div className="result-row">Transaction : <a className="mono" href={`https://testnet.bscscan.com/tx/${hash}`} target="_blank" rel="noreferrer">{shorten(hash)} ↗</a></div><div className="result-row">Contrat : <span className="mono">{shorten(contractAddress)}</span></div><div className="result-row">ID : #{publishedId}</div>{imageCid&&<div className="result-row">Image IPFS : <a href={`https://gateway.pinata.cloud/ipfs/${imageCid}`} target="_blank" rel="noreferrer">{shorten(imageCid)} ↗</a></div>}<div style={{marginTop:12}}><a className="secondary" href={`/verify?id=${publishedId}`}>Consulter / vérifier la preuve</a></div></div>}
      </div><aside className="panel side-panel"><h2 className="side-title">Réseau de publication</h2><div className="network"><span className="network-mark">◆</span><span>BNB Smart Chain<small>Testnet · Chain ID 97</small></span></div><div className="stat"><div className="stat-label">Wallet connecté</div><div className="stat-value">{isConnected?shorten(address!):"Aucun wallet"}</div></div><div className="stat"><div className="stat-label">Solde de test</div><div className="stat-value">{balance.data?`${Number(balance.data.formatted).toFixed(4)} ${balance.data.symbol}`:isConnected?"Lecture du solde…":"Connectez MetaMask"}</div></div><div className="stat"><div className="stat-label">Frais de publication</div><div className="stat-value">Payés en tBNB par le wallet</div></div><p className="side-foot">Vous aurez besoin de tBNB pour publier. <a href="https://www.bnbchain.org/en/testnet-faucet" target="_blank" rel="noreferrer" style={{color:"var(--green)",textDecoration:"underline"}}>Obtenir des tBNB ↗</a></p></aside></section></main>
    <footer className="footer"><div className="container footer-inner"><span>© 2026 ChainNote · Projet expérimental sur testnet</span><span>Les preuves sont publiques et immuables.</span></div></footer></>;
}
