import store from "../popup/store";
import { Harmony } from "@harmony-js/core";

export default function API() {
  if (currentNetwork != store.state.network.name) {
    currentNetwork = store.state.network.name;
    console.log("current network changed to", currentNetwork);
    harmony = new Harmony(
      // rpc url
      store.state.network.apiUrl,
      {
        chainType: store.state.network.type, //ChainType.Harmony,
        chainId: store.state.network.chainId, //ChainID.HmyMainnet,
      }
    );
  }

  return harmony;
}
