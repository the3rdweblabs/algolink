# AlgoLink Features: Identity & discovery

AlgoLink is an **Identity-First** platform. This document explains the features that help users establish their on-chain presence and the tools used to discover others within the ecosystem.

---

## 🖼️ Universal Identity & Profiles

The core of AlgoLink is the profile system, allowing every Algorand address to have a human-readable face.

### Profile Attributes
-   **Display Name**: Sets the "Public Name" for your wallet address. This is what other users see when they find you via search or on-chain activity.
-   **Enhanced Avatars**:
    -   **Animated GIFs**: Full support for GIF uploads to create dynamic, expressive profiles.
    -   **NFT Verified PFP**: Users can select an NFT from their own collection (including Mainnet and Testnet) and set it as their verified profile icon.
-   **Permanent & Flexible Wallet Linking**:
    - Establishes a secure, persistent 1:1 bond between an email address and an Algorand wallet.
    - **Unbinding & Switching**: Users have full control over their links. You can unbind a wallet (sever the connection) or switch the linked address to a different wallet at any time.
    - **Future-Proof**: We are actively working on allowing users to update their primary email address while maintaining their established identity.

### Privacy Controls
Users decide how they want to be seen.
-   **Public Profiles**: Discoverable via email-to-wallet search.
-   **Private Profiles**: Identities that remain hidden from the broad directory whilst still benefiting from dashboard features.

---

## 🔍 The Discovery Engine (Smart Search)

Once identities are established, AlgoLink provides a powerful engine to find them, along with traditional blockchain data.

### Consolidated Search
A single input field that intelligently routes your query across **Mainnet** and **Testnet**:
1.  **Identity Lookup**: Search for users by their **Email** or **Display Name**.
2.  **Asset & NFT Search**: Identifynumeric IDs and resolve them as ASAs or NFTs.
3.  **Cross-Network Explorer**:
    -   **Addresses**: Full details for regular accounts and smart contracts.
    -   **Transaction IDs**: Detailed hashes and group tracking.
4.  **Metadata resolution**: Standard-compliant resolution for **ARC-3** and **ARC-19** NFTs, using a prioritized gateway system (Nodely -> Cloudflare -> ipfs.io).

---

## 🔔 Security & Alerts

-   **Dashboard Notifications**: Instant feedback for identity updates and wallet connections.
-   **Email security notifications**: Automated alerts sent to the registered email whenever profile details (name/avatar) are modified, providing a permanent security audit trail.
