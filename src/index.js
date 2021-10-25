import React, {useState} from "react";
import ReactDOM from "react-dom";
import App from "./App.tsx";
import * as serviceWorker from "./serviceWorker";

import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import {
  NetworkType,
  BeaconEvent,
  defaultEventCallbacks
} from "@airgap/beacon-sdk";


const appNodes = document.getElementsByClassName("pay-button");

function setPublicToken(pubKey) {
    console.log("successfully connected to "+pubKey);
}

if (appNodes) {
//     const [Tezos, setTezos] = useState<TezosToolkit>(
//         new TezosToolkit("https://mainnet.api.tez.ie/")
//     );
    const Tezos = new TezosToolkit("https://mainnet.api.tez.ie/");
//     const wallet = new BeaconWallet({
//         name: "freaPay",
//         preferredNetwork: NetworkType.MAINNET,
//         disableDefaultEvents: true, // Disable all events / UI. This also disables the pairing alert.
//         eventHandlers: {
//           // To keep the pairing alert, we have to add the following default event handlers back
//           [BeaconEvent.PAIR_INIT]: {
//             handler: defaultEventCallbacks.PAIR_INIT
//           },
//           [BeaconEvent.PAIR_SUCCESS]: {
//             handler: data => setPublicToken(data.publicKey)
//           }
//         }
//       });

    for (var i = 0; i<appNodes.length; i++) {
        let appNode = appNodes[i];
        
        ReactDOM.render(
            <React.StrictMode>
                <App 
                    swapContract={appNode.dataset.swapContract}
                    fa2Contract={appNode.dataset.fa2Contract}
                    receiver={appNode.dataset.receiver}
                    amount={appNode.dataset.amount}
                    redirectSuccess={appNode.dataset.redirectSuccess}
                    Tezos={Tezos}
                    
                />
            </React.StrictMode>,
            appNode
            //document.getElementsByClassName("c")
        );
    }
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
//serviceWorker.unregister();
