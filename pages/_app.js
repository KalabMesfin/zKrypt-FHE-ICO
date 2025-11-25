import "../styles/global.css";

// 1. Import your Context Provider
import { ERC20ICONProvider } from "../context/ERC20ICO"; 

function MyApp({ Component, pageProps }) {
  return (
    // 2. Wrap the entire application with the Provider
    <ERC20ICONProvider>
      <Component {...pageProps} />
    </ERC20ICONProvider>
  );
}

export default MyApp;