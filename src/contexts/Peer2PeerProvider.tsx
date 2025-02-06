import { createContext, useEffect, useRef, useState } from "react";
import Hyperswarm from "hyperswarm";
import Hyperdrive from "hyperdrive";
import Hyperbee from "hyperbee";
import Autopass from "autopass"
import Corestore from "corestore";
import Hypercore from "hypercore";

export type IPeer2PeerContext = {
    appVersion?: any,
    setAppVersion: (appVersion: any) => void,
    corestores?: { [key: string]: any },
    drives?: { [key: string]: any },
    swarms?: { [key: string]: any },
    cores?: { [key: string]: any },
    bees?: { [key: string]: any },
    autopasses?: { [key: string]: any },
    getBee: (name: string) => Promise<any>
}

export const Peer2PeerProviderState = createContext<IPeer2PeerContext>({
    autopasses: {},
    bees: {},
    cores: {},
    drives: {},
    swarms: {},
    corestores: {},
    setAppVersion: () => { },
    getBee: () => Promise.resolve(null) as any
})

export const Peer2PeerProvider = ({ children }: { children: React.ReactNode }) => {
    const [appVersion, setAppVersion] = useState<any>(null)
    const swarms = useRef<{ [key: string]: Hyperswarm.Discovery }>({})
    const cores = useRef<{ [key: string]: Hypercore }>({})
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
        for (const core of Object.values(cores.current)) {
            console.log('Destroying core: ', core);
            await core.close()
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
        console.log(name);

        if (!corestore) {
            corestores.current[name] = new Hypercore(name)
            await corestores.current[name].ready()
            console.log("corestore ready", corestores.current[name]);
        }

        console.log("initializing bee", corestores.current[name]);
        const bee = new Hyperbee(corestores.current[name])
        bees.current[name] = bee
        return bee;
    }

    return <Peer2PeerProviderState.Provider value={{
        swarms: swarms.current,
        cores: cores.current,
        drives: drives.current,
        bees: bees.current,
        autopasses: autopasses.current,
        corestores: corestores.current,
        getBee,
        appVersion,
        setAppVersion
    }}>{children}</Peer2PeerProviderState.Provider>
}   