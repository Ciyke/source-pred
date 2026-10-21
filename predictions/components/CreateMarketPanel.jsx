import { useState } from 'react'
import { ethers } from 'ethers'
import { predictionsClient } from '../client/index.js'
import {
  ESCROW_ABI, VERIFIER_ABI, METRO_CONTRACTS, GAME_IDS,
  hashFile, hashString, contractFor,
} from '../client/metroEscrow.js'

function fileToPreview(file) {
  if (!file) return null
  return URL.createObjectURL(file)
}

const STAGE_START = 0
const STAGE_LEVELS = 1
const STAGE_END = 2

export default function CreateMarketPanel({ onCreated, wallet, selectedGame }) {
  const [imageFile, setImageFile] = useState(null)
  const [kickLink, setKickLink] = useState('')
  const [oddsFile, setOddsFile] = useState(null)
  const [marketName, setMarketName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [created, setCreated] = useState(null)

  const gameId = GAME_IDS[selectedGame] ?? 1
  const gameLabel = selectedGame ?? 'Project Zebra: Covert Ops'

  const canSubmit = imageFile && kickLink.trim() && oddsFile && marketName.trim() && !busy

  async function handleCreate(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!marketName.trim()) { setError('Add a name for the market.'); return }
    if (!imageFile) { setError('Add an image for market creation.'); return }
    if (!kickLink.trim()) { setError('Add a Kick stream link.'); return }
    if (!oddsFile) { setError('Post an odds screenshot.'); return }
    if (!kickLink.includes('kick.com')) { setError('Kick link must be a kick.com URL.'); return }

    setBusy(true)
    try {
      const address = wallet?.address
      const chainId = wallet?.chainId
      const target = contractFor(chainId)

      if (!address || !target) {
        // No wallet on a supported chain — fall back to mock so the UI stays usable.
        await new Promise((r) => setTimeout(r, 600))
        const market = { marketName: marketName.trim(), gameId, imageFile, kickLink: kickLink.trim(), oddsFile, mock: true }
        setCreated(market)
        setSuccess('Market created (demo mode — connect a wallet on Avalanche or Monad to create it on-chain).')
        onCreated?.(market)
        return
      }

      const provider = wallet.getProvider()
      const signer = wallet.getSigner()
      const escrow = new ethers.Contract(target.escrow, ESCROW_ABI, signer)
      const verifier = new ethers.Contract(target.verifier, VERIFIER_ABI, signer)

      // Hash the uploaded assets
      const imageHash = await hashFile(imageFile)
      const oddsHash = await hashFile(oddsFile)
      const kickHash = hashString(kickLink.trim())

      // 1) Create the market on-chain
      const createTx = await escrow.createMarket(marketName.trim(), gameId, imageHash, kickHash, oddsHash)
      const receipt = await createTx.wait()
      const marketId = await escrow.getMarketCount() - 1n
      console.log(`Market created id=${marketId} tx=${receipt.hash}`)

      // 2) Verifier records the stages (start + levels/kills from the creation image,
      //    end proof still pending until the match finishes)
      try {
        await (await verifier.verifyImage(gameId, imageHash, STAGE_START, marketId)).wait()
        await (await verifier.verifyImage(gameId, oddsHash, STAGE_LEVELS, marketId)).wait()
      } catch (e) {
        console.warn('Stage verification skipped (not the verifier wallet):', e.shortMessage ?? e.message)
      }

      const market = { marketId: Number(marketId), marketName: marketName.trim(), gameId, imageHash, oddsHash, kickHash, chain: target.chainName, txHash: receipt.hash }
      setCreated(market)
      setSuccess(`Market #${marketId} created on ${target.chainName}. Bets can now flow.`)
      onCreated?.(market)
    } catch (err) {
      setError(err.shortMessage ?? err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="create-market-panel">
      <h2 className="create-market-panel__title">Create your markets</h2>
      <p className="create-market-panel__subtitle">Fill the 4 spots to create a 5-minute game matchroom market. Bets open once verifier passes.</p>
      <p className="create-market-panel__game">Game: <strong>{gameLabel}</strong> (ID {gameId})</p>

      <form className="create-market-panel__grid" onSubmit={handleCreate}>
        <label className="create-market-panel__box">
          <span className="create-market-panel__box-label">A. Add image for market creation</span>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
          {imageFile && <span className="create-market-panel__file-name">{imageFile.name}</span>}
          {imageFile && <img className="create-market-panel__preview" src={fileToPreview(imageFile)} alt="Market preview" />}
        </label>

        <label className="create-market-panel__box">
          <span className="create-market-panel__box-label">B. Add Kick stream link</span>
          <input
            type="url"
            placeholder="https://kick.com/..."
            value={kickLink}
            onChange={(e) => setKickLink(e.target.value)}
            className="create-market-panel__input"
          />
        </label>

        <label className="create-market-panel__box">
          <span className="create-market-panel__box-label">C. Post odds screenshot</span>
          <input type="file" accept="image/*" onChange={(e) => setOddsFile(e.target.files?.[0] ?? null)} />
          {oddsFile && <span className="create-market-panel__file-name">{oddsFile.name}</span>}
          {oddsFile && <img className="create-market-panel__preview" src={fileToPreview(oddsFile)} alt="Odds preview" />}
        </label>

        <label className="create-market-panel__box">
          <span className="create-market-panel__box-label">D. Name of market</span>
          <input
            type="text"
            placeholder="e.g. Special forces vs Guerilla team"
            value={marketName}
            onChange={(e) => setMarketName(e.target.value)}
            className="create-market-panel__input"
          />
        </label>

        <div className="create-market-panel__actions">
          <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
            {busy ? 'Verifying…' : 'Create market'}
          </button>
          {error && <p className="bet-form__error">{error}</p>}
          {success && <p className="bet-form__success">{success}</p>}
          <p className="create-market-panel__note">
            Verifier seeds the line graph from Player Rank, Kill count, and Rarity. First odds are scored over 100 (e.g. 20:80, 50:50, 60:40, 73:27). After creation the graph shifts on new opposing bets + in-game events (to be wired).
          </p>
        </div>
      </form>

      {created && (
        <div className="create-market-panel__livestream">
          <div className="create-market-panel__livestream-feed">
            <span className="create-market-panel__livestream-badge">● LIVE</span>
            <span className="create-market-panel__livestream-title">{created.marketName || 'Special forces vs Guerilla team'}</span>
            <span className="create-market-panel__livestream-placeholder">
              {created.txHash ? `Market #${created.marketId} on ${created.chain} — livestream feed comes from the Kick link` : 'Livestream gameplay feed — wire Kick embed here'}
            </span>
          </div>
          <div className="create-market-panel__live-odds">
            <span className="create-market-panel__live-odds-label">Live odds</span>
            <div className="create-market-panel__live-odds-bars">
              <span className="create-market-panel__odds-bar" style={{ width: '60%' }}>60</span>
              <span className="create-market-panel__odds-bar create-market-panel__odds-bar--b" style={{ width: '40%' }}>40</span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
