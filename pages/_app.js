import "../styles/global.css";

import { ERC20ICONProvider } from "../context/FHEICOCore"; 

function MyApp({ Component, pageProps }) {
  return (
    <ERC20ICONProvider>
      <Component {...pageProps} />
    </ERC20ICONProvider>
  );
}

export default MyApp;
