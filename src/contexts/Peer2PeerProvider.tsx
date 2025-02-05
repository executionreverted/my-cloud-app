import { createContext, useEffect, useRef, useState } from "react";
import Hyperswarm from "hyperswarm";
import Hyperdrive from "hyperdrive";
import Hyperbee from "hyperbee";
import Autopass from "autopass"
import Corestore from "corestore";

export type IPeer2PeerContext = {
    appVersion?: any,
    setAppVersion: (appVersion: any) => void,
    corestores?: { [key: string]: any },
    drives?: { [key: string]: any },
    swarms?: { [key: string]: any },
    bees?: { [key: string]: any },
    autopasses?: { [key: string]: any },
    getBee: (name: string) => Promise<Hyperbee>
}

export const Peer2PeerProviderState = createContext<IPeer2PeerContext>({
    autopasses: {},
    bees: {},
    drives: {},
    swarms: {},
    corestores: {},
    setAppVersion: () => { },
    getBee: () => Promise.resolve(null) as any
})

export const Peer2PeerProvider = ({ children }: { children: React.ReactNode }) => {
    const [appVersion, setAppVersion] = useState<any>(null)
    const swarms = useRef<{ [key: string]: Hyperswarm.Discovery }>({})
    const drives = useRef<{ [key: string]: Hyperdrive }>({})
    const bees = useRef<{ [key: string]: Hyperbee }>({})
    const autopasses = useRef<{ [key: string]: Autopass }>({})
    const corestores = useRef<{ [key: string]: Corestore }>({})
    useEffect(() => {
        Pear.teardown(onTeardown)
    }, [])

    async function onTeardown() {
        console.log('teardown   ')
        for (const swarm of Object.values(swarms.current)) {
            console.log('Destroying swarm: ', swarm);
            await swarm.destroy()
        }
        for (const drive of Object.values(drives.current)) {
            console.log('Destroying drive: ', drive);
            await drive.close()
        }
       
        for (const bee of Object.values(bees.current)) {
            console.log('Destroying bee: ', bee);
            await bee.close()
        }
        for (const autopass of Object.values(autopasses.current)) {
            console.log('Destroying autopass: ', autopass);
            await autopass.close()
        }
    }

    async function getBee(name: string): Promise<Hyperbee> {
        if (bees.current[name]) {
            return bees.current[name]
        }

        let corestore = corestores.current[name]
        if (!corestore) {
            corestores.current[name] = new Corestore(name)
        }
        const bee = new Hyperbee(corestore)
        bees.current[name] = bee
        return bee;
    }

    return <Peer2PeerProviderState.Provider value={{
        swarms: swarms.current,
        drives: drives.current,
        bees: bees.current,
        autopasses: autopasses.current,
        corestores: corestores.current,
        getBee,
        appVersion,
        setAppVersion
    }}>{children}</Peer2PeerProviderState.Provider>
}   