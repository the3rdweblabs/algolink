
// src/app/actions/explorerActions.ts
'use server';

import type { NftData, AccountData, TransactionData, ApplicationData, BlockData, Network, AssetHolding, AssetParams } from '@/types/explorer';
import { getPublicWalletByEmail } from './walletActions';
import algosdk from 'algosdk';
import { CID } from 'multiformats/cid';
import * as digest from 'multiformats/hashes/digest';

const ALGORAND_INDEXER_API_BASES: Record<Network, string> = {
  testnet: process.env.NEXT_PUBLIC_INDEXER_SERVER_TESTNET || 'https://testnet-idx.algonode.cloud/v2',
  mainnet: process.env.NEXT_PUBLIC_INDEXER_SERVER_MAINNET || 'https://mainnet-idx.algonode.cloud/v2',
};

const PRIMARY_IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.algonode.xyz/ipfs/';
const BACKUP_IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY_BACKUP || 'https://ipfs.algonode.dev/ipfs/';

const IPFS_GATEWAYS = [
  PRIMARY_IPFS_GATEWAY,
  BACKUP_IPFS_GATEWAY,
  // 'https://gateway.pinata.cloud/ipfs/', // Previous primary gateway
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/',
];

const ARWEAVE_GATEWAY = process.env.NEXT_PUBLIC_ARWEAVE_GATEWAY || 'https://arweave.net/';

// Algolia Client initialization removed
// const ALGOLIA_INDEX_NAME removed

async function safeFetch(url: string, isJson = true): Promise<any> {
  console.log(`[BUILD-DEBUG] safeFetch (explorer) called for ${url} in phase: ${process.env.NEXT_PHASE}`);
  // During build phase, skip external network calls to avoid timeouts
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return isJson ? {} : '';
  }
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Revalidate cached data every hour
    if (!response.ok) {
      if (response.status === 404) return null;
    }
    return isJson ? await response.json() : await response.text();
  } catch (error: any) {
    if (url.includes(ALGORAND_INDEXER_API_BASES.mainnet) || url.includes(ALGORAND_INDEXER_API_BASES.testnet)) {
      console.error(`Fetch error for AlgoNode API ${url}:`, error);
      throw new Error(error.message || `Network error during API request to ${url}`);
    } else {
      console.warn(`Fetch warning for metadata ${url}:`, error);
    }
    return null;
  }
}

/**
 * Decodes an ARC-19 reserve address to an IPFS CID.
 */
function decodeArc19CID(reserveAddress: string): string | null {
  try {
    const decoded = algosdk.decodeAddress(reserveAddress);
    // sha2-256 (0x12) hash of the public key
    const multihash = digest.create(0x12, decoded.publicKey);
    // Use dag-pb (0x70) codec as preferred by Nodely for directory/metadata CIDs
    const cid = CID.createV1(0x70, multihash); 
    return cid.toString();
  } catch (e) {
    return null;
  }
}

async function resolveNftImageUrl(assetParamsUrl: string | undefined, assetId?: string, network?: Network, reserveAddress?: string): Promise<string | null> {
  const safeAssetId = assetId;
  const safeNetwork = network || 'mainnet';

  if (!assetParamsUrl && !safeAssetId) return null;

  // 1. Handle ARC-19 (template-ipfs)
  if (assetParamsUrl?.startsWith('template-ipfs://') && reserveAddress) {
    const cid = decodeArc19CID(reserveAddress);
    if (cid) {
      // Extract path suffix if present (e.g. /nfd.json)
      const pathSuffix = assetParamsUrl.split('}')[1] || '';
      return `${PRIMARY_IPFS_GATEWAY}${cid}${pathSuffix}${pathSuffix.includes('.') ? '' : '?optimizer=image'}`;
    }
  }

  // 2. Handle data URIs directly
  if (assetParamsUrl?.startsWith('data:image')) {
    return assetParamsUrl;
  }

  // 3. Handle direct HTTP/S image URLs (common extensions)
  if (assetParamsUrl && (assetParamsUrl.startsWith('http://') || assetParamsUrl.startsWith('https://')) && /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(assetParamsUrl)) {
    return assetParamsUrl;
  }

  // 4. Attempt to fetch and parse as metadata JSON (ARC3/ARC19)
  if (assetParamsUrl) {
    let metadataUrlToFetch = assetParamsUrl;
    let isOriginalIpfs = assetParamsUrl.startsWith('ipfs://');
    let isOriginalArweave = assetParamsUrl.startsWith('ar://');

    if (isOriginalIpfs) {
      const cid = assetParamsUrl.substring(7);
      metadataUrlToFetch = `${PRIMARY_IPFS_GATEWAY}${cid}${cid.includes('.') ? '' : '?optimizer=image'}`;
    } else if (isOriginalArweave) {
      const txId = assetParamsUrl.substring(5);
      metadataUrlToFetch = ARWEAVE_GATEWAY + txId;
    }

    if (metadataUrlToFetch.startsWith('http://') || metadataUrlToFetch.startsWith('https://')) {
      try {
        const metadata = await safeFetch(metadataUrlToFetch, true); 
        if (metadata && typeof metadata === 'object') {
          let imageUrlFromJson =
            metadata.image ||
            metadata.image_url ||
            metadata.media_url ||
            metadata.animation_url;

          if (!imageUrlFromJson && metadata.properties) {
            imageUrlFromJson =
              metadata.properties.image?.description ||
              metadata.properties.image_url?.description ||
              metadata.properties.media_url?.description ||
              metadata.properties.animation_url?.description;
          }

          if (imageUrlFromJson && typeof imageUrlFromJson === 'string') {
            const nestedResolvedUrl = await resolveNftImageUrl(imageUrlFromJson, safeAssetId, safeNetwork, reserveAddress);
            if (nestedResolvedUrl) return nestedResolvedUrl;
          }
        }
      } catch (e) {
        // Silent failure for metadata fetch
      }
    }

    // 5. Treat original assetParamsUrl as a direct IPFS/Arweave image CID
    if (isOriginalIpfs) {
      const cid = assetParamsUrl.substring(7);
      return `${PRIMARY_IPFS_GATEWAY}${cid}${cid.includes('.') ? '' : '?optimizer=image'}`;
    }
    if (isOriginalArweave) {
      const txId = assetParamsUrl.substring(5);
      return ARWEAVE_GATEWAY + txId;
    }
  }

  // 6. Failover Coin/ASA Fallback (Universal Resolver)
  if (safeAssetId) {
    // Try Tinyman first as per user priority for coins
    if (safeNetwork === 'mainnet') {
      return `https://mainnet.tinyman.org/api/v1/assets/${safeAssetId}/logo/`;
    }
  }

  // 7. Last resort: Return assetParamsUrl if it's HTTPS
  if (assetParamsUrl?.startsWith('https://')) {
    return assetParamsUrl;
  }

  return null; 
}


async function transformRawAssetToNftData(asset: any, network: Network, owner?: string): Promise<NftData | null> {
  if (!asset || !asset.index) return null;
  const resolvedImageUrl = await resolveNftImageUrl(asset.params?.url, asset.index.toString(), network, asset.params?.reserve);
  return {
    id: asset.index.toString(),
    name: asset.params?.name || `Asset #${asset.index}`,
    imageUrl: resolvedImageUrl || `https://placehold.co/300x300.png?text=${asset.params?.['unit-name'] || asset.index}`,
    dataAiHint: `${asset.params?.name || ''} ${asset.params?.['unit-name'] || ''}`.trim(),
    collectionName: asset.params?.['collection-name'] || 'N/A',
    creatorAddress: asset.params?.creator,
    ownerAddress: owner,
    description: asset.params?.description || `Total: ${asset.params?.total}, Decimals: ${asset.params?.decimals}, Unit: ${asset.params?.['unit-name'] || 'N/A'}`,
    network,
    params: asset.params
  };
}


const ALGORAND_ADDRESS_REGEX = /^[A-Z2-7]{58}$/;
const ALGORAND_TXID_REGEX = /^[A-Z2-7]{52}$/; // Covers TxIDs and GroupIDs
const ALGORAND_ID_REGEX = /^[0-9]+$/; // For Asset, App, or Block Round
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

function transformTxData(tx: any, network: Network): TransactionData {
  const data: TransactionData = {
    id: tx.id,
    type: tx['tx-type'],
    sender: tx.sender,
    fee: tx.fee / 1_000_000,
    roundTime: tx['round-time'] ? tx['round-time'] : Math.floor(Date.now() / 1000), // Fallback for pending
    note: tx.note ? Buffer.from(tx.note, 'base64').toString('utf-8').replace(/\u0000/g, '') : undefined,
    group: tx.group,
    confirmedRound: tx['confirmed-round'],
    signature: tx.signature?.sig,
    txTypeSpecific: {},
    network,
  };

  if (tx['payment-transaction']) {
    data.receiver = tx['payment-transaction'].receiver;
    data.amount = tx['payment-transaction'].amount / 1_000_000;
    data.txTypeSpecific.payment = {
      receiver: tx['payment-transaction'].receiver,
      amount: tx['payment-transaction'].amount / 1_000_000,
      closeRemainderTo: tx['payment-transaction']['close-remainder-to'],
    };
  } else if (tx['asset-transfer-transaction']) {
    data.receiver = tx['asset-transfer-transaction'].receiver;
    data.assetId = tx['asset-transfer-transaction']['asset-id']?.toString();
    data.assetAmount = tx['asset-transfer-transaction'].amount;
    data.txTypeSpecific.assetTransfer = {
      assetId: tx['asset-transfer-transaction']['asset-id'],
      amount: tx['asset-transfer-transaction'].amount,
      receiver: tx['asset-transfer-transaction'].receiver,
      closeTo: tx['asset-transfer-transaction']['close-to'],
      sender: tx['asset-transfer-transaction'].sender,
    };
  } else if (tx['application-transaction']) {
    data.applicationId = tx['application-transaction']['application-id'];
    data.txTypeSpecific.applicationCall = {
      applicationId: tx['application-transaction']['application-id'],
      onCompletion: tx['application-transaction']['on-completion'],
      applicationArgs: tx['application-transaction']['application-args']?.map((arg: string) => Buffer.from(arg, 'base64').toString('utf-8').replace(/\u0000/g, '')),
      accounts: tx['application-transaction'].accounts,
      foreignApps: tx['application-transaction']['foreign-apps'],
      foreignAssets: tx['application-transaction']['foreign-assets'],
    };
  } else if (tx['asset-config-transaction']) {
    data.assetId = tx['asset-config-transaction']['asset-id']?.toString() || tx['created-asset-index']?.toString();
    data.txTypeSpecific.assetConfig = {
      assetId: tx['asset-config-transaction']['asset-id'] || tx['created-asset-index'],
      params: tx['asset-config-transaction'].params ? {
        creator: tx['asset-config-transaction'].params.creator,
        decimals: tx['asset-config-transaction'].params.decimals,
        total: tx['asset-config-transaction'].params.total,
        unitName: tx['asset-config-transaction'].params['unit-name'],
        name: tx['asset-config-transaction'].params.name,
        url: tx['asset-config-transaction'].params.url,
        manager: tx['asset-config-transaction'].params.manager,
        reserve: tx['asset-config-transaction'].params.reserve,
        freeze: tx['asset-config-transaction'].params.freeze,
        clawback: tx['asset-config-transaction'].params.clawback,
      } : undefined,
    };
  } else if (tx['keyreg-transaction']) {
    data.txTypeSpecific.keyRegistration = {
      voteParticipationKey: tx['keyreg-transaction']['vote-participation-key'],
      selectionParticipationKey: tx['keyreg-transaction']['selection-participation-key'],
      voteFirstValid: tx['keyreg-transaction']['vote-first-valid'],
      voteLastValid: tx['keyreg-transaction']['vote-last-valid'],
      voteKeyDilution: tx['keyreg-transaction']['vote-key-dilution'],
      nonParticipation: tx['keyreg-transaction']['non-participation'],
    };
  }
  return data;
}

function transformAppData(app: any, network: Network): ApplicationData {
  return {
    id: app.id,
    creator: app.params.creator,
    approvalProgram: app.params['approval-program'],
    clearStateProgram: app.params['clear-state-program'],
    globalState: app.params['global-state']?.map((item: any) => ({
      key: Buffer.from(item.key, 'base64').toString('utf-8').replace(/\u0000/g, ''),
      value: {
        ...item.value,
        bytes: item.value.bytes ? Buffer.from(item.value.bytes, 'base64').toString('utf-8').replace(/\u0000/g, '') : undefined,
        uint: item.value.uint
      }
    })) || [],
    globalStateSchema: {
      numUint: app.params['global-state-schema']?.['num-uint'] || 0,
      numByteSlice: app.params['global-state-schema']?.['num-byte-slices'] || 0,
    },
    localStateSchema: {
      numUint: app.params['local-state-schema']?.['num-uints'] || 0,
      numByteSlice: app.params['local-state-schema']?.['num-byte-slices'] || 0,
    },
    extraProgramPages: app.params['extra-program-pages'] || 0,
    network,
    params: app.params,
  };
}

function transformBlockData(blockDetails: any, network: Network): BlockData {
  return {
    round: blockDetails.round,
    timestamp: blockDetails.timestamp,
    transactionCount: blockDetails['txn-counter'] || (blockDetails.transactions?.length || 0),
    proposer: blockDetails.proposer || 'N/A',
    blockHash: blockDetails.hash || 'N/A',
    network,
    transactions: blockDetails.transactions?.map((tx: any) => transformTxData(tx, network)) || [],
    rewards: blockDetails.rewards ? {
      'fee-sink': blockDetails.rewards['fee-sink'],
      'rewards-calculation-round': blockDetails.rewards['rewards-calculation-round'],
      'rewards-level': blockDetails.rewards['rewards-level'],
      'rewards-pool': blockDetails.rewards['rewards-pool'],
      'rewards-rate': blockDetails.rewards['rewards-rate'],
      'rewards-residue': blockDetails.rewards['rewards-residue'],
    } as any : undefined,
  };
}


export interface SearchResult {
  query: string;
  accounts: AccountData[];
  transactions: TransactionData[];
  nfts: NftData[];
  applications: ApplicationData[];
  blocks: BlockData[];
  error?: string;
}

async function _searchSingleNetwork(query: string, network: Network): Promise<Omit<SearchResult, 'query' | 'error'>> {
  const normalizedQuery = query.trim();
  const indexerApiBase = ALGORAND_INDEXER_API_BASES[network];
  const processedNftIds = new Set<string>();

  const results: Omit<SearchResult, 'query' | 'error'> = {
    accounts: [],
    transactions: [],
    nfts: [],
    applications: [],
    blocks: [],
  };

  if (!normalizedQuery) return results;

  if (ALGORAND_ADDRESS_REGEX.test(normalizedQuery)) {
    const accountRaw = await safeFetch(`${indexerApiBase}/accounts/${normalizedQuery}`);
    if (accountRaw && accountRaw.account) {
      results.accounts.push({
        address: accountRaw.account.address,
        balance: accountRaw.account.amount / 1_000_000,
        assetCount: accountRaw.account.assets?.length || 0,
        appsLocalStateCount: accountRaw.account['apps-local-state']?.length || 0,
        appsCreatedCount: accountRaw.account['created-apps']?.length || 0,
        minBalance: accountRaw.account['min-balance'] / 1_000_000,
        authAddr: accountRaw.account['auth-addr'],
        sigType: accountRaw.account['sig-type'],
        network,
      });
    }
  }

  if (ALGORAND_TXID_REGEX.test(normalizedQuery)) {
    // Attempt to fetch as a single transaction first
    const txData = await safeFetch(`${indexerApiBase}/transactions/${normalizedQuery}`);
    if (txData && txData.transaction) {
      results.transactions.push(transformTxData(txData.transaction, network));
    }

    // Always attempt to fetch as a group ID, even if a single tx was found (it could be part of a group)
    const groupTxsData = await safeFetch(`${indexerApiBase}/transactions?group-id=${normalizedQuery}&limit=20`);
    if (groupTxsData && groupTxsData.transactions && groupTxsData.transactions.length > 0) {
      groupTxsData.transactions.forEach((tx: any) => {
        if (!results.transactions.some(existingTx => existingTx.id === tx.id)) { // Avoid duplicates if single tx was part of group
          results.transactions.push(transformTxData(tx, network));
        }
      });
    }
  }

  if (ALGORAND_ID_REGEX.test(normalizedQuery)) {
    const assetData = await safeFetch(`${indexerApiBase}/assets/${normalizedQuery}`);
    if (assetData && assetData.asset) {
      let ownerAddress: string | undefined = undefined;
      if (assetData.asset.params.total === 1 && assetData.asset.params.decimals === 0) {
        const balancesData = await safeFetch(`${indexerApiBase}/assets/${normalizedQuery}/balances?limit=1`);
        if (balancesData && balancesData.balances && balancesData.balances.length > 0) {
          const ownerBalance = balancesData.balances.find((bal: any) => bal.amount > 0);
          if (ownerBalance) ownerAddress = ownerBalance.address;
        }
      }
      const nft = await transformRawAssetToNftData(assetData.asset, network, ownerAddress);
      if (nft) {
        results.nfts.push(nft);
        processedNftIds.add(nft.id);

        const collectionName = assetData.asset.params['collection-name'];
        if (collectionName) {
          const collectionAssetsData = await safeFetch(`${indexerApiBase}/assets?collection=${encodeURIComponent(collectionName)}&limit=3`);
          if (collectionAssetsData && collectionAssetsData.assets) {
            const relatedNftsPromises = collectionAssetsData.assets.map(async (asset: any) => {
              if (!processedNftIds.has(asset.index.toString()) && asset.index.toString() !== normalizedQuery) {
                let relatedOwner: string | undefined;
                if (asset.params.total === 1 && asset.params.decimals === 0) {
                  const bal = await safeFetch(`${indexerApiBase}/assets/${asset.index}/balances?limit=1`);
                  if (bal?.balances?.[0]) relatedOwner = bal.balances[0].address;
                }
                return transformRawAssetToNftData(asset, network, relatedOwner);
              }
              return null;
            });
            const relatedNfts = (await Promise.all(relatedNftsPromises)).filter(Boolean) as NftData[];
            results.nfts.push(...relatedNfts);
            relatedNfts.forEach(rnft => processedNftIds.add(rnft.id));
          }
        }
        const creatorAddress = assetData.asset.params.creator;
        if (creatorAddress) {
          const creatorAssetsData = await safeFetch(`${indexerApiBase}/accounts/${creatorAddress}/created-assets?limit=3`);
          if (creatorAssetsData && creatorAssetsData.assets) {
            const createdNftsPromises = creatorAssetsData.assets.map(async (asset: any) => {
              if (!processedNftIds.has(asset.index.toString()) && asset.index.toString() !== normalizedQuery) {
                let relatedOwner: string | undefined;
                if (asset.params.total === 1 && asset.params.decimals === 0) {
                  const bal = await safeFetch(`${indexerApiBase}/assets/${asset.index}/balances?limit=1`);
                  if (bal?.balances?.[0]) relatedOwner = bal.balances[0].address;
                }
                return transformRawAssetToNftData(asset, network, relatedOwner);
              }
              return null;
            });
            const createdNfts = (await Promise.all(createdNftsPromises)).filter(Boolean) as NftData[];
            results.nfts.push(...createdNfts);
            createdNfts.forEach(cnft => processedNftIds.add(cnft.id));
          }
        }
      }
    }

    const appData = await safeFetch(`${indexerApiBase}/applications/${normalizedQuery}`);
    if (appData && appData.application) {
      results.applications.push(transformAppData(appData.application, network));
    }

    const blockDataRaw = await safeFetch(`${indexerApiBase}/blocks/${normalizedQuery}`);
    if (blockDataRaw && blockDataRaw.round !== undefined) {
      results.blocks.push(transformBlockData(blockDataRaw, network));
    }
  }

  if (!ALGORAND_ADDRESS_REGEX.test(normalizedQuery) &&
    !ALGORAND_TXID_REGEX.test(normalizedQuery) &&
    !ALGORAND_ID_REGEX.test(normalizedQuery) &&
    !EMAIL_REGEX.test(normalizedQuery) && // Also exclude emails from this text search
    normalizedQuery.length > 2 && normalizedQuery.length < 30) {
    const assetsByName = await safeFetch(`${indexerApiBase}/assets?name=${encodeURIComponent(normalizedQuery)}&limit=5`);
    if (assetsByName && assetsByName.assets) {
      const namedNftsPromises = assetsByName.assets.map(async (asset: any) => {
        if (!processedNftIds.has(asset.index.toString())) {
          let ownerAddress: string | undefined;
          if (asset.params.total === 1 && asset.params.decimals === 0) {
            const balancesData = await safeFetch(`${indexerApiBase}/assets/${asset.index}/balances?limit=1`);
            if (balancesData?.balances?.[0]) ownerAddress = balancesData.balances[0].address;
          }
          return transformRawAssetToNftData(asset, network, ownerAddress);
        }
        return null;
      });
      const namedNfts = (await Promise.all(namedNftsPromises)).filter(Boolean) as NftData[];
      results.nfts.push(...namedNfts);
      namedNfts.forEach(nnft => processedNftIds.add(nnft.id));
    }
  }
  return results;
}

export async function searchAlgorand(query: string): Promise<SearchResult> {
  let effectiveQuery = query.trim();

  // Check if query is an email and resolve it
  if (EMAIL_REGEX.test(effectiveQuery)) {
    const walletLink = await getPublicWalletByEmail(effectiveQuery);
    if (walletLink?.walletAddress) {
      effectiveQuery = walletLink.walletAddress;
    }
    // If no wallet is found, continue with the original email query, which likely won't match blockchain patterns.
  }

  const originalQuery = query.trim();
  const normalizedQueryForComparison = effectiveQuery.toUpperCase();

  const finalResult: SearchResult = {
    query: originalQuery,
    accounts: [],
    transactions: [],
    nfts: [],
    applications: [],
    blocks: [],
    error: undefined,
  };

  if (!effectiveQuery) {
    return finalResult;
  }

  try {
    const [mainnetResults, testnetResults] = await Promise.allSettled([
      _searchSingleNetwork(effectiveQuery, 'mainnet'),
      _searchSingleNetwork(effectiveQuery, 'testnet')
    ]);

    const mainnetData = mainnetResults.status === 'fulfilled' ? mainnetResults.value : { accounts: [], transactions: [], nfts: [], applications: [], blocks: [] };
    const testnetData = testnetResults.status === 'fulfilled' ? testnetResults.value : { accounts: [], transactions: [], nfts: [], applications: [], blocks: [] };

    function prioritizeAndCombine<T extends { network: Network; id?: string | number; address?: string; group?: string; round?: number }>(
      mainItems: T[],
      testItems: T[],
      searchQueryUC: string,
      getItemIdentifier: (item: T) => string | number | undefined
    ): T[] {
      const directMatches: T[] = [];
      const groupMatches: T[] = [];
      const relatedItems: T[] = [];
      const seenRelatedItemKeys = new Set<string>();

      const processItems = (items: T[], network: Network) => {
        items.forEach(item => {
          const itemIdentifierUC = getItemIdentifier(item)?.toString().toUpperCase();

          if (itemIdentifierUC === searchQueryUC) {
            directMatches.push(item);
          }
          else if ((item as unknown as TransactionData).group && (item as unknown as TransactionData).group?.toUpperCase() === searchQueryUC) {
            groupMatches.push(item);
          }
          else {
            const uniqueKey = `${item.network}-${itemIdentifierUC || JSON.stringify(item)}`;
            if (!seenRelatedItemKeys.has(uniqueKey)) {
              relatedItems.push(item);
              seenRelatedItemKeys.add(uniqueKey);
            }
          }
        });
      };

      processItems(mainItems, 'mainnet');
      processItems(testItems, 'testnet');

      directMatches.sort((a, b) => {
        if (getItemIdentifier(a) === getItemIdentifier(b)) {
          return a.network === 'mainnet' ? -1 : 1;
        }
        return 0;
      });

      groupMatches.sort((a, b) => {
        if (a.network !== b.network) return a.network === 'mainnet' ? -1 : 1;
        const txA = a as unknown as TransactionData;
        const txB = b as unknown as TransactionData;
        return (txA.confirmedRound || 0) - (txB.confirmedRound || 0);
      });

      relatedItems.sort((a, b) => (a.network !== b.network ? (a.network === 'mainnet' ? -1 : 1) : 0));

      return [...directMatches, ...groupMatches, ...relatedItems];
    }

    finalResult.accounts = prioritizeAndCombine(mainnetData.accounts, testnetData.accounts, normalizedQueryForComparison, item => item.address);
    finalResult.transactions = prioritizeAndCombine(mainnetData.transactions, testnetData.transactions, normalizedQueryForComparison, item => item.id);
    finalResult.nfts = prioritizeAndCombine(mainnetData.nfts, testnetData.nfts, normalizedQueryForComparison, item => item.id);
    finalResult.applications = prioritizeAndCombine(mainnetData.applications, testnetData.applications, normalizedQueryForComparison, item => item.id.toString());
    finalResult.blocks = prioritizeAndCombine(mainnetData.blocks, testnetData.blocks, normalizedQueryForComparison, item => item.round.toString());

  } catch (error: any) {
    console.error(`Smart search action error:`, error);
    finalResult.error = error.message || `An unexpected error occurred during smart search.`;
  }
  return finalResult;
}


export async function getAccountDetails(address: string, network: Network): Promise<AccountData | null> {
  const indexerApiBase = ALGORAND_INDEXER_API_BASES[network];
  const accountRaw = await safeFetch(`${indexerApiBase}/accounts/${address}`);
  if (!accountRaw || !accountRaw.account) return null;

  const account = accountRaw.account;

  const txsRaw = await safeFetch(`${indexerApiBase}/accounts/${address}/transactions?limit=10`);
  const transactions = txsRaw?.transactions?.map((tx: any) => transformTxData(tx, network)) || [];

  const rawAssetsHeld = account.assets || [];
  const assetHoldingsPromises: Promise<AssetHolding | null>[] = rawAssetsHeld.slice(0, 20).map(async (heldAsset: any) => {
    let assetName: string | undefined = undefined;
    let assetUnitName: string | undefined = undefined;
    let assetDecimals: number = 0;

    const assetDetailsRaw = await safeFetch(`${indexerApiBase}/assets/${heldAsset['asset-id']}`);
    if (assetDetailsRaw && assetDetailsRaw.asset && assetDetailsRaw.asset.params) {
      assetName = assetDetailsRaw.asset.params.name;
      assetUnitName = assetDetailsRaw.asset.params['unit-name'];
      assetDecimals = assetDetailsRaw.asset.params.decimals || 0;
    }
    return {
      assetId: heldAsset['asset-id'],
      amount: heldAsset.amount,
      decimals: assetDecimals,
      isFrozen: heldAsset['is-frozen'],
      name: assetName,
      unitName: assetUnitName,
    };
  });
  const assetHoldings = (await Promise.all(assetHoldingsPromises)).filter(Boolean) as AssetHolding[];

  const createdAppsRaw = await safeFetch(`${indexerApiBase}/accounts/${address}/created-applications?limit=10`);
  const createdApps = createdAppsRaw?.applications?.map((app: any) => transformAppData(app, network)) || [];

  return {
    address: account.address,
    balance: account.amount / 1_000_000,
    minBalance: account['min-balance'] / 1_000_000,
    authAddr: account['auth-addr'],
    sigType: account['sig-type'],
    totalAppsOptedIn: account['apps-local-state']?.length || 0,
    totalCreatedApps: account['created-apps']?.length || 0,
    totalAssets: account.assets?.length || 0,
    appsLocalStateCount: account['apps-local-state']?.length || 0,
    appsCreatedCount: account['created-apps']?.length || 0,
    assetCount: account.assets?.length || 0,
    transactions,
    assets: assetHoldings,
    createdApps,
    network,
  };
}

export async function getTransactionDetails(txId: string, network: Network): Promise<TransactionData | null> {
  const indexerApiBase = ALGORAND_INDEXER_API_BASES[network];
  const txData = await safeFetch(`${indexerApiBase}/transactions/${txId}`);
  if (!txData || !txData.transaction) return null;
  return transformTxData(txData.transaction, network);
}

export async function getAssetDetails(assetId: string, network: Network): Promise<NftData | null> {
  const url = `${ALGORAND_INDEXER_API_BASES[network]}/assets/${assetId}`;
  const data = await safeFetch(url);
  if (!data || !data.asset) return null;
  
  const reserve = data.asset.params?.reserve;
  const nftUrl = data.asset.params?.url;
  const imageUrl = await resolveNftImageUrl(nftUrl, assetId, network, reserve);

  let ownerAddress: string | undefined = undefined;
  if (data.asset.params.total === 1 && data.asset.params.decimals === 0) {
    const balancesData = await safeFetch(`${ALGORAND_INDEXER_API_BASES[network]}/assets/${assetId}/balances?limit=1`);
    if (balancesData && balancesData.balances && balancesData.balances.length > 0) {
      const ownerBalance = balancesData.balances.find((bal: any) => bal.amount > 0);
      if (ownerBalance) ownerAddress = ownerBalance.address;
    }
  }
  return transformRawAssetToNftData(data.asset, network, ownerAddress);
}

export async function getApplicationDetails(appId: number, network: Network): Promise<ApplicationData | null> {
  const indexerApiBase = ALGORAND_INDEXER_API_BASES[network];
  const appRaw = await safeFetch(`${indexerApiBase}/applications/${appId}`);
  if (!appRaw || !appRaw.application) return null;

  const app = appRaw.application;
  const appTxsRaw = await safeFetch(`${indexerApiBase}/transactions?application-id=${appId}&limit=10`);
  const transactions = appTxsRaw?.transactions?.map((tx: any) => transformTxData(tx, network)) || [];

  return {
    ...transformAppData(app, network),
    transactions
  };
}

export async function getBlockDetails(round: number, network: Network): Promise<BlockData | null> {
  const indexerApiBase = ALGORAND_INDEXER_API_BASES[network];
  const blockRaw = await safeFetch(`${indexerApiBase}/blocks/${round}`);
  if (!blockRaw || blockRaw.round === undefined) return null;

  let transactionsInBlock: TransactionData[] = [];
  if (blockRaw.transactions && blockRaw.transactions.length > 0) {
    transactionsInBlock = blockRaw.transactions.map((txSummary: any) => {
      // The transactions in the block endpoint are summaries, not full tx objects.
      // For a full explorer, you'd fetch each tx by ID if full details are needed here.
      // For now, we'll adapt transformTxData or simplify what's shown.
      // Let's assume transformTxData can handle the summary structure or a modified version.
      return transformTxData(txSummary, network); // Using existing transformTxData
    });
  }

  return {
    ...transformBlockData(blockRaw, network),
    transactions: transactionsInBlock
  };
}
