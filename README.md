# AlgoLink: The Universal Identity Layer for Algorand

**AlgoLink** is the definitive identity solution for the Algorand blockchain. We bridge the gap between traditional identity (Email) and on-chain activity, allowing users to establish a persistent, human-readable presence. While we provide a powerful **Smart Explorer**, it exists primarily as the discovery engine for the people and identities that make up the Algorand ecosystem.

![AlgoLink Identity Preview](src/app/assets/nav-logo.png)

## 🌟 Core Identity Features

- **🖼️ Universal Profiles**: Create your professional blockchain identity. Support for custom display names and rich avatars, including static images, **animated GIFs**, and the ability to set **NFTs you own** directly as your profile picture.
- **🔐 Secure Wallet-to-Email Linking**: Establish a 1:1 bond between your email and your Algorand address. This link is flexible—you can unbind your wallet or switch to a new address at any time.
- **🕵️ Privacy-First Discovery**: Control your visibility. Set your wallet links to **Public** to be discoverable by colleagues or **Private** to keep your holdings anonymous.
- **📧 Proactive Security**: Receive automated email alerts and dashboard notifications for every profile change or new session, ensuring you are the only one in control of your identity.

## 🔍 The Smart Explorer (Identity Discovery)

AlgoLink includes a "Discovery Engine" that allows you to find people and assets across **Mainnet** and **Testnet**:
- **Consolidated Search**: Find users by their **Email** or **Display Name**. 
- **Deep Resolution**: Effortlessly lookup Wallet Addresses, Asset IDs (NFTs/ASA), and Transaction IDs.
- **Metadata Support**: Built-in support for ARC-3 and ARC-19 metadata, pulling high-res media from IPFS and Arweave gateways.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/the3rdweblabs/algolink.git
   cd algolink
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment:
   ```bash
   cp .env.example .env
   # Add your SMTP, Algorand and AI credentials
   ```
4. **Configure Storage Mode**:
   AlgoLink supports local development (SQLite) and cloud production (Turso/Vercel Blob). Set `STORAGE_MODE=local` for dev or `STORAGE_MODE=cloud` for production in your `.env`.

5. Run the development server:
   ```bash
   npm run dev
   ```

## 📖 Documentation

- [**The AlgoLink Vision**](docs/vision.md): Why we prioritize permanent identity over expiring domain leases.
- [**Feature Deep Dive**](docs/features.md): How our profile system and discovery engine tech works.
- [**Developer Setup**](docs/setup.md): Technical configuration and schema details.

---

Built with ❤️ to make the Algorand blockchain more human.
