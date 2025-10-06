import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';

// Try to use Metaplex if installed; otherwise fall back to RPC-based token metadata lookup.
// Returns the first validated image URL for an NFT owned by `ownerAddress`, or null.
export async function findFirstNftImageForOwner(ownerAddress, opts = {}) {
  if (!ownerAddress) return null;
  const network = opts.network || 'devnet';
  const endpoint = opts.endpoint || clusterApiUrl(network);
  const connection = new Connection(endpoint);

  let ownerPub;
  try {
    ownerPub = new PublicKey(ownerAddress);
  } catch (e) {
    console.warn('Invalid owner address', ownerAddress, e);
    return null;
  }

  // If Metaplex is available, prefer it for convenience
  try {
    // Compose package string to avoid bundlers statically analyzing the dependency
    const pkg = '@metaplex-foundation' + '/js';
    const mp = await import(pkg);
    if (mp && mp.Metaplex) {
      const metaplex = mp.Metaplex.make(connection);
      const nfts = await metaplex.nfts().findAllByOwner({ owner: ownerPub });
      if (nfts && nfts.length) {
        for (const nft of nfts) {
          try {
            const metadata = nft.json || (nft.metadataTask ? await nft.metadataTask.run() : null);
            const uri = metadata && (metadata.image || metadata.image_url) ? (metadata.image || metadata.image_url) : null;
            if (!uri) continue;
            const finalUrl = normalizeUri(uri);
            if (finalUrl) return finalUrl;
          } catch (e) {
            continue;
          }
        }
      }
    }
  } catch (e) {
    // Metaplex not available or failed; fall back
    console.warn('Metaplex not available, falling back to RPC method');
  }

  // Fallback: use token accounts to find NFTs owned by the wallet and fetch metadata manually
  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(ownerPub, { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') });
    for (const { account } of tokenAccounts.value) {
      const info = account.data && account.data.parsed && account.data.parsed.info;
      if (!info) continue;
      const tokenAmount = info.tokenAmount || {};
      // NFTs usually have amount === '1' and decimals === 0
      if (tokenAmount.amount !== '1' || tokenAmount.decimals !== 0) continue;
      const mintAddress = info.mint;
      if (!mintAddress) continue;
      // Derive metadata PDA and fetch metadata account
      try {
        const metadataPDA = await findMetadataPDA(mintAddress);
        const accountInfo = await connection.getAccountInfo(metadataPDA);
        if (!accountInfo || !accountInfo.data) continue;
        // Metadata is serialized; parsing it properly without metaplex is involved.
        // As a pragmatic fallback, try to fetch metadata via known RPC endpoints (like arweave/ipfs links are often in on-chain metadata JSON uri)
        // Use getParsedAccountInfo for additional info
        // This fallback is intentionally conservative: return null to avoid false positives.
      } catch (e) {
        continue;
      }
    }
  } catch (e) {
    console.warn('Fallback RPC method failed', e);
  }

  return null;
}

function normalizeUri(uri) {
  if (!uri) return null;
  let finalUrl = uri;
  if (uri.startsWith('ipfs://')) {
    finalUrl = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  if (!finalUrl.startsWith('http') && finalUrl.includes('arweave.net')) {
    finalUrl = 'https://' + finalUrl;
  }
  if (finalUrl.startsWith('http://')) {
    // prefer https
    finalUrl = finalUrl.replace('http://', 'https://');
  }
  if (finalUrl.startsWith('https://') || finalUrl.includes('arweave.net')) return finalUrl;
  return null;
}

async function findMetadataPDA(mint) {
  // Use Metaplex metadata program id
  const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
  const mintPub = new PublicKey(mint);
  const [pda] = await PublicKey.findProgramAddress([
    Buffer.from('metadata'),
    METADATA_PROGRAM_ID.toBuffer(),
    mintPub.toBuffer()
  ], METADATA_PROGRAM_ID);
  return pda;
}

// Returns the first validated metadata for an NFT owned by `ownerAddress`, or null.
export async function findFirstNftMetadataForOwner(ownerAddress, opts = {}) {
  if (!ownerAddress) return null;
  const network = opts.network || 'devnet';
  const endpoint = opts.endpoint || clusterApiUrl(network);
  const connection = new Connection(endpoint);

  let ownerPub;
  try {
    ownerPub = new PublicKey(ownerAddress);
  } catch (e) {
    console.warn('Invalid owner address', ownerAddress, e);
    return null;
  }

  // If Metaplex is available, prefer it for convenience
  try {
    // Compose package string to avoid bundlers statically analyzing the dependency
    const pkg = '@metaplex-foundation' + '/js';
    const mp = await import(pkg);
    if (mp && mp.Metaplex) {
      const metaplex = mp.Metaplex.make(connection);
      const nfts = await metaplex.nfts().findAllByOwner({ owner: ownerPub });
      if (nfts && nfts.length) {
        for (const nft of nfts) {
          try {
            const metadata = nft.json || (nft.metadataTask ? await nft.metadataTask.run() : null);
            if (metadata && metadata.attributes) {
              return {
                name: metadata.name,
                description: metadata.description,
                image: metadata.image || metadata.image_url,
                attributes: metadata.attributes,
                mint: nft.mintAddress.toString()
              };
            }
          } catch (e) {
            continue;
          }
        }
      }
    }
  } catch (e) {
    // Metaplex not available or failed; fall back
    console.warn('Metaplex not available for metadata, falling back to RPC method');
  }

  // Fallback: use token accounts to find NFTs owned by the wallet and fetch metadata manually
  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(ownerPub, { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') });
    for (const { account } of tokenAccounts.value) {
      const info = account.data && account.data.parsed && account.data.parsed.info;
      if (!info) continue;
      const tokenAmount = info.tokenAmount || {};
      // NFTs usually have amount === '1' and decimals === 0
      if (tokenAmount.amount !== '1' || tokenAmount.decimals !== 0) continue;
      const mintAddress = info.mint;
      if (!mintAddress) continue;
      
      // Try to fetch metadata from IPFS/Arweave
      try {
        const metadataPDA = await findMetadataPDA(mintAddress);
        const accountInfo = await connection.getAccountInfo(metadataPDA);
        if (!accountInfo || !accountInfo.data) continue;
        
        // This is a simplified approach - in a real implementation you'd parse the metadata account
        // For now, return null to avoid false positives
        console.log('Found NFT mint but metadata parsing not implemented in fallback');
      } catch (e) {
        continue;
      }
    }
  } catch (e) {
    console.warn('Fallback RPC method failed for metadata', e);
  }

  return null;
}

export default { findFirstNftImageForOwner, findFirstNftMetadataForOwner };
