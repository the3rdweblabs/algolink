// src/types/explorer.ts

export type Network = 'mainnet' | 'testnet';

export interface AssetParams {
    creator: string;
    decimals: number;
    total: number;
    unitName?: string;
    name?: string;
    url?: string;
    manager?: string;
    reserve?: string;
    freeze?: string;
    clawback?: string;
}

export interface NftData {
    id: string;
    name: string;
    imageUrl: string;
    dataAiHint?: string;
    collectionName?: string;
    creatorAddress?: string;
    ownerAddress?: string;
    description?: string;
    network: Network;
    params?: AssetParams;
}

export interface AssetHolding {
    assetId: number;
    amount: number;
    decimals: number; // Added for correct display
    isFrozen: boolean;
    name?: string;
    unitName?: string;
}

export interface AppLocalState {
    id: number;
    schema?: { 'num-uint': number; 'num-byte-slice': number };
}


export interface AccountData {
    address: string;
    balance: number;
    minBalance?: number;
    authAddr?: string;
    sigType?: 'sig' | 'msig' | 'lsig';

    assetCount?: number;
    totalAssets?: number;

    appsLocalStateCount?: number;
    totalAppsOptedIn?: number;

    appsCreatedCount?: number;
    totalCreatedApps?: number;

    assets?: AssetHolding[];
    createdApps?: ApplicationData[];
    transactions?: TransactionData[];

    network: Network;
}

export interface PaymentTransactionSpecifics {
    receiver: string;
    amount: number;
    closeRemainderTo?: string;
}
export interface AssetTransferTransactionSpecifics {
    assetId: number;
    amount: number;
    receiver: string;
    closeTo?: string;
    sender?: string;
}
export interface ApplicationCallTransactionSpecifics {
    applicationId: number;
    onCompletion: string;
    applicationArgs?: string[];
    accounts?: string[];
    foreignApps?: number[];
    foreignAssets?: number[];
}
export interface AssetConfigTransactionSpecifics {
    assetId?: number;
    params?: AssetParams;
}
export interface KeyRegistrationTransactionSpecifics {
    voteParticipationKey?: string;
    selectionParticipationKey?: string;
    voteFirstValid?: number;
    voteLastValid?: number;
    voteKeyDilution?: number;
    nonParticipation?: boolean;
}

export interface TransactionData {
    id: string;
    type: string;
    sender: string;
    receiver?: string;
    amount?: number;
    assetId?: string;
    assetAmount?: number;
    applicationId?: number;
    fee: number;
    roundTime: number;
    confirmedRound?: number;
    note?: string;
    group?: string;
    signature?: string;
    txTypeSpecific: {
        payment?: PaymentTransactionSpecifics;
        assetTransfer?: AssetTransferTransactionSpecifics;
        applicationCall?: ApplicationCallTransactionSpecifics;
        assetConfig?: AssetConfigTransactionSpecifics;
        keyRegistration?: KeyRegistrationTransactionSpecifics;
    };
    network: Network;
}

export interface ApplicationParams {
    creator: string;
    'approval-program': string;
    'clear-state-program': string;
    'global-state'?: { key: string; value: { type: number; bytes?: string; uint?: number } }[];
    'global-state-schema'?: { 'num-uint': number; 'num-byte-slices': number };
    'local-state-schema'?: { 'num-uints': number; 'num-byte-slices': number };
    'extra-program-pages'?: number;
}

export interface ApplicationData {
    id: number;
    params?: ApplicationParams;
    creator: string;
    approvalProgram: string;
    clearStateProgram: string;
    globalState?: { key: string; value: { type: number; bytes?: string; uint?: number } }[];
    globalStateSchema?: { numUint: number; numByteSlice: number };
    localStateSchema?: { numUint: number; numByteSlice: number };
    extraProgramPages?: number;
    network: Network;
    transactions?: TransactionData[];
}

export interface BlockRewards {
    'fee-sink': string;
    'rewards-calculation-round': number;
    'rewards-level': number;
    'rewards-pool': string;
    'rewards-rate': number;
    'rewards-residue': number;
}

export interface BlockData {
    round: number;
    timestamp: number;
    transactionCount: number;
    proposer: string;
    blockHash: string;
    network: Network;
    transactions?: TransactionData[];
    rewards?: BlockRewards;
}