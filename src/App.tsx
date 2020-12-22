import React from "react";
import styled from "styled-components";
import { parseFixed, formatFixed } from '@ethersproject/bignumber'
import { Card, Text, TextField, Button, Title, Divider } from "@gnosis.pm/safe-react-components";
import { useSafe } from "@rmeissner/safe-apps-react-sdk";
import { useWraptor } from "@w3stside/wraptor";

import { useActiveWeb3, useBlockNumber } from './hooks';

const Container = styled.div`
  margin-bottom: 2rem;
  width: 100%;
  max-width: 480px;
  display: grid;
  grid-template-columns: 1fr;
  grid-column-gap: 1rem;
  grid-row-gap: 1rem;
`;

const WETH_ADDRESS = {
  mainnet: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  rinkeby: "0xc778417e063141139fce010982780140aa0cd5ab",
};

const WETH_DECIMALS = 18
const NO_DATA = '-'

const App: React.FC = () => {
  const safe = useSafe();
  
  const [approveValue, setApproveValue] = React.useState('0')
  const [wrapValue, setWrapValue] = React.useState('0')
  const [unwrapValue, setUnwrapValue] = React.useState('0')
  
  const [submitting, setSubmitting] = React.useState(false);
  
  const provider = useActiveWeb3({ network: safe.info.network })
  const blockNumber = useBlockNumber({ network: safe.info.network })
  
  const wraptorApi = useWraptor(
    {
      provider,
      contractAddress: WETH_ADDRESS[safe.info.network],
      userAddress: safe.info.safeAddress,
      catalyst: blockNumber,
    },
    "ETH"
  );
  const { contract } = wraptorApi;
  
  const { ETH, WETH_BALANCE, WETH_ALLOWANCE } = React.useMemo(() => {
    const wethBalanceFormatted = wraptorApi.userBalanceWei ? formatFixed(wraptorApi.userBalanceWei, WETH_DECIMALS) : NO_DATA
    const wethAllowanceFormatted = wraptorApi.userAllowanceWei ? formatFixed(wraptorApi.userAllowanceWei, WETH_DECIMALS) : NO_DATA
    return {
      ETH: {
        amount: safe.info.ethBalance,
        label: `ETH Balance: ${safe.info.ethBalance}`, 
      },
      WETH_BALANCE: {
        amount: wethBalanceFormatted,
        label: `WETH Balance: ${wethBalanceFormatted}`,
      },
      WETH_ALLOWANCE: {
        amount: wethAllowanceFormatted,
        label: `WETH Allowance: ${wethAllowanceFormatted}`,
      }
    }
  }, [safe.info.ethBalance, wraptorApi.userAllowanceWei, wraptorApi.userBalanceWei])

  const handleApprove = async () => {
    if (!contract || !safe.info.network) return
    
    try {
      const decimals = (await contract?.methods.decimals().call()) || WETH_DECIMALS.toString()
      const approveValueParsed = parseFixed(approveValue, decimals)
      const data = contract.methods.approve(safe.info.safeAddress, approveValueParsed).encodeABI()
      
      const constructedSafeTxObject = {
        to: WETH_ADDRESS[safe.info.network],
        value: "0",
        data,
      }

      setSubmitting(true)
      const safeTxHash = await safe.sendTransactions([constructedSafeTxObject])
      console.log('[WRAPTOR APPROVE::TX HASH]', safeTxHash);
      const safeTx = await safe.loadSafeTransaction(safeTxHash);
      console.log('[WRAPTOR APPROVE::LOADED TX HASH]', safeTx);
    } catch (error) {
      console.error('[WRAPTOR APPROVE ERROR]', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleWrap = async () => {
    if (!contract || !safe.info.network) return
    
    try {
      const decimals = (await contract?.methods.decimals().call()) || 'WETH_DECIMALS'
      const wrapValueParsed = parseFixed(wrapValue, decimals)
      // contract?.methods?.deposit().send({ from: userAddress, value: amount })
      const data = contract.methods.deposit().encodeABI()
      
      const constructedSafeTxObject = {
        to: WETH_ADDRESS[safe.info.network],
        value: wrapValueParsed.toString(),
        data,
      }

      setSubmitting(true)
      const safeTxHash = await safe.sendTransactions([constructedSafeTxObject])
      console.log('[WRAPTOR WRAP::TX HASH]', safeTxHash);
      const safeTx = await safe.loadSafeTransaction(safeTxHash);
      console.log('[WRAPTOR WRAP::LOADED TX HASH]', safeTx);
    } catch (error) {
      console.error('[WRAPTOR WRAP ERROR]', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUnwrap = async () => {
    if (!contract || !safe.info.network) return
    
    try {
      const decimals = (await contract?.methods.decimals().call()) || 'WETH_DECIMALS'
      const unwrapValueParsed = parseFixed(unwrapValue, decimals)
      // contract?.methods?.withdraw(amount).send({ from: userAddress })
      const data = contract.methods.withdraw(unwrapValueParsed, { from: safe.info.safeAddress }).encodeABI()
      
      const constructedSafeTxObject = {
        to: WETH_ADDRESS[safe.info.network],
        value: "0",
        data,
      }

      setSubmitting(true)
      const safeTxHash = await safe.sendTransactions([constructedSafeTxObject])
      console.log('[WRAPTOR UNWRAP::TX HASH]', safeTxHash);
      const safeTx = await safe.loadSafeTransaction(safeTxHash);
      console.log('[WRAPTOR UNWRAP::LOADED TX HASH]', safeTx);
    } catch (error) {
      console.error('[WRAPTOR UNWRAP ERROR]', error)
    } finally {
      setSubmitting(false)
    }
  }

  const onApproveChange = ({ target }) => setApproveValue(target.value)
  const onWrapChange = ({ target }) => setWrapValue(target.value)
  const onUnwrapChange = ({ target }) => setUnwrapValue(target.value)

  // const submitTx = React.useCallback(async () => {
  //   setSubmitting(true);

  //   try {
  //     const safeTxHash = await safe.sendTransactions([]);
  //     const safeTx = await safe.loadSafeTransaction(safeTxHash);
  //     console.log(safeTx);
  //   } catch (e) {
  //     console.error(e);
  //   }
  //   setSubmitting(false);
  // }, [safe]);

  return (
    <Container>
      <span role="img" aria-label="velociraptor" aria-labelledby="me">🦖</span> <Title size="md">Safe Wraptor</Title>
      {/* {provider 
        ? 
        <WraptorComponent
        type="ETH"
        contractAddress={WETH_ADDRESS[safe.info.network]}
        provider={provider}
        userAddress={safe.info.safeAddress}
        catalyst={blockNumber}
        customStyle={{
          width: "60%",
          background: "#fff",
          margin: 'auto',
        }}
        /> 
        : 
      <Loader size="md" />} */}
      <Card>
        <Text size="xl">{ETH.label}</Text>
        <Divider />
        <Text size="xl">{WETH_ALLOWANCE.label}</Text>
        <Text size="xl">{WETH_BALANCE.label}</Text>
      </Card>
      <Divider />
      {provider && wraptorApi && 
        <>
          <TextField
            value={approveValue}
            onChange={onApproveChange}
            label="Approve ETH"
            style={{
              width: '10rem'
            }}
          />
          <Button
            size="lg"
            color="primary"
            iconType="allowances"
            variant="contained"
            onClick={handleApprove}
            disabled={submitting}
          >
            Approve
          </Button>
          {/* WRAP */}
          <TextField
            value={wrapValue}
            onChange={onWrapChange}
            label="Wrap ETH into WETH"
          />
          <Button
            size="lg"
            color="primary"
            iconType="add"
            variant="contained"
            onClick={handleWrap}
            disabled={submitting}
          >
            Wrap
          </Button>
          {/* UNWRAP */}
          <TextField
            value={unwrapValue}
            onChange={onUnwrapChange}
            label="Unwrap WETH into ETH"
          />
          <Button
            size="lg"
            color="primary"
            iconType="received"
            variant="contained"
            onClick={handleUnwrap}
            disabled={submitting}
          >
            Unwrap
          </Button>
        </>
      }
      {/* {submitting ? (
        <>
          <Loader size="md" />
          <br />
          <Button
            size="lg"
            color="secondary"
            onClick={() => {
              setSubmitting(false);
            }}
          >
            Cancel
          </Button>
        </>
      ) : (
        <Button size="lg" color="primary" onClick={submitTx}>
          Submit
        </Button>
      )} */}
    </Container>
  );
};

export default App;
