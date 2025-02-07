import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider as ChakraProvider } from './components/ui/provider.tsx'
import { Toaster } from "./components/ui/toaster"
import { Peer2PeerProvider } from './contexts/Peer2PeerProvider'
import { MemoryRouter } from "react-router";
import { SeedProvider } from './contexts/SeedProvider'
import { UserProvider } from './contexts/UserProvider'
import { UIProvider } from './contexts/UIContext.tsx'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider>
      <Peer2PeerProvider>
        <UserProvider>
          <SeedProvider>
            <UIProvider>
              <MemoryRouter>
                {/* @ts-ignore */}
                <pear-ctrl style={{ display: "none" }}></pear-ctrl>
                <App />
                <Toaster />
              </MemoryRouter>
            </UIProvider>
          </SeedProvider>
        </UserProvider>
      </Peer2PeerProvider>
    </ChakraProvider>
  </StrictMode>,
)
