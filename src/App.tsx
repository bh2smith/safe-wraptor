import { SafeInfo, Transaction } from "@gnosis.pm/safe-apps-sdk";
import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { Button, Loader, Title } from "@gnosis.pm/safe-react-components";
import { useSafe } from "@rmeissner/safe-apps-react-sdk";
import { WraptorComponent, useWraptor } from "@w3stside/wraptor";

import useInterval from "./useInterval";

import { initWeb3 } from "./connect";

const Container = styled.form`
  margin-bottom: 2rem;
  width: 100%;
  max-width: 480px;
  display: grid;
  grid-template-columns: 1fr;
  grid-column-gap: 1rem;
  grid-row-gap: 1rem;
`;

const WETH_ADDRESS = {
  mainnet: "",
  rinkeby: "0xc778417e063141139fce010982780140aa0cd5ab",
};

const App: React.FC = () => {
  const safe = useSafe();
  const intervalChange = useInterval();
  const [submitting, setSubmitting] = useState(false);

  const web3 = initWeb3(safe.info.network);

  // const submitTx = useCallback(async () => {
  //   setSubmitting(true);

  //   try {
  //     const safeTxHash = await safe.sendTransactions([]);
  //     // const safeTx = await safe.loadSafeTransaction(safeTxHash);
  //   } catch (e) {
  //     console.error(e);
  //   }
  //   setSubmitting(false);
  // }, [safe]);

  return (
    <Container>
      <Title size="md">Safe Wraptor</Title>
      <WraptorComponent
        type="ETH"
        contractAddress={WETH_ADDRESS[safe.info.network]}
        provider={web3}
        userAddress={safe.info.safeAddress}
        catalyst={intervalChange}
        customStyle={{
          width: "50%",
          background: "#fff",
        }}
      />
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
