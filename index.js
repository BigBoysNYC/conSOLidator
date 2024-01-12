const fs = require('fs');
const splToken = require('@solana/spl-token');
const web3 = require('@solana/web3.js');
const bs58 = require('bs58');

const connection = new web3.Connection('https://special-cosmological-uranium.solana-mainnet.quiknode.pro/ff712b9440572110e660fd967337d14ff8f2169c/');

const readline = require('node:readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

readline.question(`Enter recipient wallet: `, async name1 => {
    readline.question(`Confirm recipient wallet: `, async name2 => {
        readline.question();
        if (name1 === name2) {
            readline.question(`Enter token address: `, async token1 => {
                readline.question(`Confirm token address: `, async token2 => {
                    if (token1 === token2) {
                        await processRequest(name1,token1);
                    } else {
                        console.log("Tokens do not match!");
                    }
                    readline.close();
                });
            });
        } else {
            console.log("Wallets do not match!");
            readline.close();
        }
    });
});

const processRequest = async (wallet, token) => {
    console.log("Wallet: " + wallet);
    fs.readFile('./walletlist.json', 'utf8', async (err, data) => {
        console.log("Reading file");
        if (err) {
            console.log('Error reading walletlist.json');
            return;
        }

        const walletdata = JSON.parse(data);

        const tokenAccountForWallet = await splToken.getAssociatedTokenAddress(new web3.PublicKey(token), new web3.PublicKey(wallet));

        console.log(tokenAccountForWallet);

        for (let i = 0; i < walletdata.publicKeys.length; i++) {
            const pubKey = walletdata.publicKeys[i];
            const privKey = walletdata.privateKeys[i];

            const slaveWallet = web3.Keypair.fromSecretKey(bs58.decode(privKey));

            const slaveTokenAccount = await splToken.getAssociatedTokenAddress(new web3.PublicKey(token), new web3.PublicKey(pubKey));

            const lamports = await connection.getBalance(slaveTokenAccount);

            try {
                await splToken.transfer(
                    connection,
                    slaveWallet,
                    slaveTokenAccount,
                    tokenAccountForWallet,
                    slaveWallet.publicKey,
                    lamports
                  );
            } catch (e) {
                console.log(e);
                return;
            } 
        }

    })
}