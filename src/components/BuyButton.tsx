import React, { useState, useEffect } from "react";

import { TezosToolkit } from "@taquito/taquito";
//import { BeaconWallet } from "@taquito/beacon-wallet";
import { bytes2Char } from '@taquito/utils';


import config from "./../config";


interface BuyButtonProps {
    Tezos: TezosToolkit,
    FA2address: string,
    swapContract: string,
    sender: string,
    receiver: string,
    amountUsd: number,
    redirectSuccess: string
}

interface CoinGeckoPrice {
    last_updated_at: number;
    usd: number;
    usd_24h_change: number;
    usd_24h_vol: number;
    usd_market_cap: number;
}

enum ButtonState {
    CALCULATING_PRICE,
    READY_TO_PAY,
    AWAITING_CONFIRMATION
}

// interface TokenDetails {
//     
// }

const BuyButton = ({
    Tezos,
    FA2address,
    swapContract,
    sender,
    receiver,
    amountUsd,
    redirectSuccess
}: BuyButtonProps ): JSX.Element => {
    
     const [tezUsd, setTezUsd] = useState<CoinGeckoPrice>(config.defaultTezPrice);
     const [tezPool, setTezPool] = useState<number>(0);
     const [tokenPool, setTokenPool] = useState<number>(0);
     const [fiat2Token, setFiat2Token] = useState<number>(0);
     const [tokenDetails, setTokenDetails] = useState<any>({
         symbol:"",
         decimals:6
    });
     const [status, setStatus] = useState<ButtonState>(ButtonState.CALCULATING_PRICE);
     const [opHash, setOpHash] = useState<string>("");
     const tezMultiplyer = 10 ** 6;
    const [tokenMultiplyer, setTokenMultiplyer] = useState<number>(10 ** 6);

     
    async function initTokenContract(coinContract:string) {
      try {
        const newContract = await Tezos.wallet.at(coinContract);
        const newStorage: any = await newContract.storage();
        const metdata: any = await newStorage.assets.token_metadata.get(0);
        console.log(metdata);
        const tokenDetails = {
          totalSupply: parseInt(newStorage.assets.total_supply),
          name: bytes2Char(metdata['token_info'].get('name')),
          symbol: bytes2Char(metdata['token_info'].get('symbol')),
          description: bytes2Char(metdata['token_info'].get('description')),
          thumbnailUri: bytes2Char(metdata['token_info'].get('thumbnailUri')),
          decimals: parseInt(bytes2Char(metdata['token_info'].get('decimals'))),
          shouldPreferSymbol: bytes2Char(metdata['token_info'].get('shouldPreferSymbol')) === 'true',
          coinContractAddress: coinContract,
          swapContract: swapContract,
        }
        setTokenMultiplyer(10 ** tokenDetails.decimals)
        setTokenDetails(tokenDetails)
      } catch (e) {
        console.error(e)
      }
    }
    
    useEffect(() => {
        (async () => {
            await initTokenContract(FA2address);
        })();
    })
    
    useEffect(() => {
        getTezosPrice();
        getPoolSizes();
    })
    
    // calculate Price in Token
    useEffect(() => {
        if( tezUsd.usd > 0 &&
            tezPool > 0 &&
            tokenPool > 0 ) {
            setFiat2Token( tokenPool / tezPool / tezUsd.usd);
            if (status<ButtonState.READY_TO_PAY) {
                setStatus(ButtonState.READY_TO_PAY);
            }
        } else {
            
        }
        
    },[tezUsd.usd, tezPool, tokenPool, status])
    
    const getTezosPrice = async (): Promise<void> => {
        // https://www.coingecko.com/en/api#explore-api
        fetch("https://api.coingecko.com/api/v3/simple/price?ids=tezos&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true")
            .then(res => res.json())
            .then(res => setTezUsd(res.tezos))
    }
    
    const getPoolSizes = async (): Promise<void> => {
        
        fetch("https://api.tzkt.io/v1/contracts/"+tokenDetails.swapContract+"/storage")
            .then(res => res.json())
            .then(item => {
                if (item.code === 400) { } else {
                setTezPool( parseFloat(item.storage.tez_pool) / tezMultiplyer);
                setTokenPool( parseFloat(item.storage.token_pool) / tokenMultiplyer);
                //console.log(tokenPool + " -- " + parseFloat(item.storage.token_pool)) 
                }
            }
        )
    }
    
    const buyMethod = async (): Promise<void> => {
        makePayment().then(
            ()=>window.location.href = redirectSuccess,
            ()=>console.log("something went wrong")
        );
    }
    
    const makePayment = async (): Promise<void> => {
	const contract = await Tezos.wallet.at(FA2address);
        const transfer_params = [
            {
                from_: sender,
                txs: [{
                    to_: receiver,
                    token_id:0,
                    amount: Math.round(amountUsd * fiat2Token * tokenMultiplyer)
                }]
            }
        ];
        
        
         const op = await contract.methods.transfer(transfer_params).send()
             .then((op)=>{
                 setOpHash(op.opHash);
                 setStatus(ButtonState.AWAITING_CONFIRMATION);
                 op.confirmation(); 
             });
        console.log(op)
    }
    
    return (<div className="freaPay"><div className="info">
    {status === ButtonState.CALCULATING_PRICE && <span>calculating price</span>}
    {status === ButtonState.READY_TO_PAY && <span>{amountUsd} USD = {amountUsd * fiat2Token} {tokenDetails.symbol}</span>}
    {status === ButtonState.AWAITING_CONFIRMATION && <span>waiting for confirmation of transaction hash {opHash}</span>}
    </div>
    {status === ButtonState.READY_TO_PAY && 
        <button 
            className="button pay-button"
            onClick={buyMethod}>Pay
        </button>
    }
    </div>);
    
//     if (status == ButtonState.READY_TO_PAY) {
//     return (<div className="freaPay"><div className="info">{amountUsd} USD = {amountUsd * fiat2Token} {tokenDetails.symbol}</div>
//         <div className="buttons">
//         
//         
//             <button
// 	className="button pay-button"
// 	onClick={buyMethod}
// 	    >Pay {amountUsd * fiat2Token} {tokenDetails.symbol}
//         </button>
//         </div></div>
//     );
//     } else if (status == ButtonState.CALCULATING_PRICE) {
//         return (<div> calculating price</div>);
//     } else if (status == ButtonState.AWAITING_CONFIRMATION) {
//         return (<div>waiting for confirmation</div>);
//     } else return (<div>an error has occured...</div>);
};

export default BuyButton; 
