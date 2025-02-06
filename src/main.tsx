import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider as ChakraProvider } from './components/ui/provider.tsx'
import { Toaster } from "./components/ui/toaster"
import { Peer2PeerProvider } from './contexts/Peer2PeerProvider'
import { MemoryRouter } from "react-router";
import { SeedProvider } from './contexts/SeedProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Peer2PeerProvider>
      <SeedProvider>
        <ChakraProvider>
          <MemoryRouter>
            {/* @ts-ignore */}
            <pear-ctrl style={{ display: "none" }}></pear-ctrl>
            <App />
            <Toaster />
          </MemoryRouter>
        </ChakraProvider>
      </SeedProvider>
    </Peer2PeerProvider>
  </StrictMode>,
)
