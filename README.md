# Formify

Formify is a robust Q&A application fully running on the Internet Computer blockchain.

## Prerequisites

Before getting started with Formify, ensure you have the following tools installed:

#### DFX 0.15.2

To install DFX 0.15.2, run the following command:

```bash
DFX_VERSION=0.15.2 sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
```

#### NPM

Download and install NPM from [https://nodejs.org/en/download](https://nodejs.org/en/download).

## Running Locally

1. Navigate to the project directory and start DFX using the following command:

   ```bash
   dfx start --clean --background
   ```

   > **Note:** If starting DFX returns an error, open the `dfx.json` file, remove "local" from "networks," and run:

   ```bash
   dfx start --clean --background --host 127.0.0.1:4943
   ```

2. Install project dependencies by running:

   ```bash
   npm install
   ```

   Ensure to add "local" back to the "networks" section in `dfx.json` if you removed it while starting DFX.

3. Deploy the canisters locally with:

   ```bash
   dfx deploy && dfx generate
   ```

   After deployment, you will receive URIs for the canisters. Click on the URI for the `assets` canister to open the local DApp in your browser.

4. If you are developing the front-end of the DApp and want to avoid running `dfx deploy` every time you make changes, run:
   ```bash
   npm run dev
   ```
   Open the DApp through the link provided by the Vite dev server.

## Stopping Canisters

1. Before stopping canisters, ensure that the "local" is removed from the "networks" section in your `dfx.json` file, if you removed it while
   starting DFX and added it back during deployment, then run following command:
   ```bash
   dfx stop
   ```
2. After stopping the canisters, if you removed "local" earlier, make sure to add it back to the "networks" section in your `dfx.json` file:
