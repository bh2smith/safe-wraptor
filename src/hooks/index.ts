import { useState, useEffect } from 'react'
import { initWeb3 } from 'src/connect'
import Web3 from 'web3'

const useWindowLoad = () => {
    const [windowLoaded, setWindowLoaded] = useState(false)
  
    useEffect((): void | (() => void) => {
      function listener() {
        return setWindowLoaded(true)
      }
      
      if(!window || typeof window.addEventListener !== 'function' || document?.readyState !== 'loading') {
        console.log( '[useWindowLoaded] DOCUMENT READY' );
        listener();
      } else {
          document.addEventListener('DOMContentLoaded', listener);
      }

      return () => window?.removeEventListener('load', listener)
    }, [])
  
    return windowLoaded
  }
  
  interface BlockchainParams {
    network?: string
  }
  
  export const useActiveWeb3 = ({ network }: BlockchainParams) => {
    const [web3, setWeb3] = useState<Web3 | null>(null)
    const windowLoaded = useWindowLoad()
  
    useEffect(() => {
      if (!windowLoaded || !network) return
  
      const web3 = initWeb3(network)
  
      setWeb3(web3)
    }, [network, windowLoaded])
    
    return web3
  }
  
  export const useBlockNumber = ({ network }: BlockchainParams) => {
    const [blockNumber, setBlockNumber] = useState(null)
    const web3 = useActiveWeb3({ network })
  
    useEffect((): void | (() => void) => {
      function handler(e, r) {
        if (e) {
            console.error('[NEW BLOCK HEADERS::HANDLER ERROR]', e)
            return
        }
  
        setBlockNumber(r.number)
      }
  
      if (!web3) return
  
      const sub = web3.eth.subscribe('newBlockHeaders', handler)
  
      // Fire on load
      if (!blockNumber && web3) {
        web3.eth.getBlockNumber()
          .then(res => setBlockNumber(res))
          .catch(console.error)
      }

      return () => sub.unsubscribe()
    }, [blockNumber, web3])
  
    return blockNumber
  }