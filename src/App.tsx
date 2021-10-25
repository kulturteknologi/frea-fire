import React, { useState } from "react";
import { TezosToolkit } from "@taquito/taquito";


import "./App.css";
import ConnectButton from "./components/ConnectWallet";
import DisconnectButton from "./components/DisconnectWallet";
//import qrcode from "qrcode-generator";
//import UpdateContract from "./components/UpdateContract";
//import Transfers from "./components/Transfers";
import BuyButton from "./components/BuyButton";

// enum BeaconConnection {
//   NONE = "",
//   LISTENING = "Listening to P2P channel",
//   CONNECTED = "Channel connected",
//   PERMISSION_REQUEST_SENT = "Permission request sent, waiting for response",
//   PERMISSION_REQUEST_SUCCESS = "Wallet is connected"
// }

type AppProps = {
    swapContract: string,
    fa2Contract: string,
    receiver: string,
    amount: number,
    Tezos: TezosToolkit
    setTezos: any, 
    redirectSuccess: string
}

const App = ({
    swapContract,
    fa2Contract,
    receiver,
    amount,
    Tezos,
    setTezos,
    redirectSuccess
}: AppProps) => {
  
  const [, setContract] = useState<any>(undefined);
  const [publicToken, setPublicToken] = useState<string | null>("");
  const [wallet, setWallet] = useState<any>(null);
  const [userAddress, setUserAddress] = useState<string>("");
  const [userBalance, setUserBalance] = useState<number>(0);
  const [, setStorage] = useState<number>(0);
//  const [copiedPublicToken, setCopiedPublicToken] = useState<boolean>(false);
  const [, setBeaconConnection] = useState<boolean>(false);

  
//   const generateQrCode = (): { __html: string } => {
//     const qr = qrcode(0, "L");
//     qr.addData(publicToken || "");
//     qr.make();
// 
//     return { __html: qr.createImgTag(4) };
//   };
  


  if (publicToken && (!userAddress || isNaN(userBalance))) {
    return (
      <div className="main-box">
connecting
      </div>
    );
  } else if (userAddress && !isNaN(userBalance)) {
    return (
      <div className="main-box">


        <div id="dialog">
          <BuyButton
            Tezos={Tezos}
            sender={userAddress}
            FA2address={fa2Contract}
            swapContract={swapContract}
            receiver={receiver}
            amountUsd={amount}
            redirectSuccess={redirectSuccess}
          />
          <DisconnectButton 
                    wallet={wallet}
                    setPublicToken={setPublicToken}
                    setUserAddress={setUserAddress}
                    setWallet={setWallet}
                    setBeaconConnection={setBeaconConnection}
                    setUserBalance={setUserBalance}
          />
        </div>
      </div>
    );
  } else if (!publicToken && !userAddress && !userBalance) {
    return (
      <div className="main-box">
        <div id="dialog">
          <ConnectButton
            Tezos={Tezos}
            setContract={setContract}
            setPublicToken={setPublicToken}
            setWallet={setWallet}
            setUserAddress={setUserAddress}
            setUserBalance={setUserBalance}
            setStorage={setStorage}
//             contractAddress={contractAddress}
            setBeaconConnection={setBeaconConnection}
            wallet={wallet}
          />
        </div>
      </div>
    );
  } else {
    return <div>An error has occurred</div>;
  }
};

export default App;
