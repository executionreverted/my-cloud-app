import './App.css'
import { Routes, Route } from "react-router";
import Landing from './pages/Landing';
import SidebarWithHeader from './components/Sidebar/Sidebar';
import { Box, Loader } from '@chakra-ui/react';
import { useSeed } from './hooks/useSeed';
import GenerateSeed from './pages/GenerateSeed';
import { useEffect, useState } from 'react';
import { useP2P } from './hooks/useP2P';
import Import from './pages/Import';
import Chat from './pages/Chat';

function App() {
  const [loading, setLoading] = useState(true)
  const { appVersion, setAppVersion } = useP2P()
  const { seedPhrase, isSeedLoading } = useSeed()
  useEffect(() => {
    if (!appVersion) {
      getAppVersion()
    }
  }, [])

  const getAppVersion = async () => {
    const { app } = await Pear.versions()
    console.log(app);
    if (!("Notification" in window)) {

    } else {
      Notification.requestPermission();
    }
    setAppVersion(app as any)
    setLoading(false)
  }

  if (loading || isSeedLoading) {
    return <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Loader color='white' />
    </Box>
  }

  if (!seedPhrase && !isSeedLoading) {
    return <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/generate-seed" element={<GenerateSeed />} />
      <Route path="/import" element={<Import />} />
      <Route path="/help" element={<div>Help page!</div>} />
    </Routes>
  }
  return (
    <>
      <SidebarWithHeader>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/generate-seed" element={<GenerateSeed />} />
          <Route path="/help" element={<div>Help page!</div>} />
        </Routes>
      </SidebarWithHeader>
    </>
  )
}

export default App
