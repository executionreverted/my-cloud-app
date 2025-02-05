import './App.css'
import { Routes, Route } from "react-router";
import Landing from './pages/Landing';
import SidebarWithHeader from './components/Sidebar/Sidebar';
import { Box, Loader } from '@chakra-ui/react';
import { useSeed } from './hooks/useSeed';
import GenerateSeed from './pages/GenerateSeed';
import { useEffect, useState } from 'react';
import { useP2P } from './hooks/useP2P';

function App() {
  const [loading, setLoading] = useState(true)
  const { appVersion, setAppVersion } = useP2P()
  const { seedPhrase } = useSeed()
  useEffect(() => {
    if (!appVersion) {
      getAppVersion()
    }
  }, [])

  const getAppVersion = async () => {
    const { app } = await Pear.versions()
    console.log(app);

    setAppVersion(app as any)
    setLoading(false)
  }

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Loader color='white' />
    </Box>
  }

  if (!seedPhrase) {
    return <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/generate-seed" element={<GenerateSeed />} />
      <Route path="/help" element={<div>Help page!</div>} />
    </Routes>
  }
  return (
    <>
      <SidebarWithHeader>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/generate-seed" element={<GenerateSeed />} />
          <Route path="/help" element={<div>Help page!</div>} />
        </Routes>
      </SidebarWithHeader>
    </>
  )
}

export default App
