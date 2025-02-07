import { createContext, useEffect, useRef, useState } from "react";
import Hyperswarm from "hyperswarm";
import Hyperdrive from "hyperdrive";
import Hyperbee from "hyperbee";
import Autopass from "autopass"
import Corestore from "corestore";
import Hypercore from "hypercore";
import RPC from "protomux-rpc"

import { SECRET_AUTOPASS_CORE_STORAGE_PATH } from "../config/storage";

// @ts-ignore
import fs from 'fs'


export type IPeer2PeerContext = {
    appVersion?: any,
    setAppVersion: (appVersion: any) => void,
    corestores?: { [key: string]: any },
    drives?: { [key: string]: any },
    swarms?: { [key: string]: any },
    cores?: { [key: string]: any },
    bees?: { [key: string]: any },
    autopasses?: { [key: string]: any },
    rpcs?: { [key: string]: any },
    getBee: (name: string) => Promise<any>
    getAutopass: (corestorePath?: string) => Promise<any>
    getRPC: (key: string) => Promise<any>
    getCore: (storagePath: string) => Promise<any>
    getDrive: (storagePath: string) => Promise<any>
}

export const Peer2PeerProviderState = createContext<IPeer2PeerContext>({
    autopasses: {},
    bees: {},
    cores: {},
    drives: {},
    swarms: {},
    corestores: {},
    rpcs: {},
    setAppVersion: () => { },
    getBee: () => Promise.resolve(null) as any,
    getAutopass: () => Promise.resolve(null) as any,
    getRPC: () => Promise.resolve(null) as any,
    getCore: () => Promise.resolve(null) as any,
    getDrive: () => Promise.resolve(null) as any
})

export const Peer2PeerProvider = ({ children }: { children: React.ReactNode }) => {
    const [appVersion, setAppVersion] = useState<any>(null)
    const swarms = useRef<{ [key: string]: Hyperswarm.Discovery }>({})
    const cores = useRef<{ [key: string]: Hypercore }>({})
    const drives = useRef<{ [key: string]: Hyperdrive }>({})
    const bees = useRef<{ [key: string]: Hyperbee }>({})
    const autopasses = useRef<{ [key: string]: Autopass }>({})
    const corestores = useRef<{ [key: string]: Corestore }>({})
    const rpcs = useRef<{ [key: string]: RPC }>({})

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
        for (const rpc of Object.values(rpcs.current)) {
            console.log('Destroying rpc: ', rpc);
            await rpc.close()
        }
    }

    async function getBee(name: string): Promise<Hyperbee> {
        if (bees.current[name]) {
            return bees.current[name]
        }

        let corestore = corestores.current[name]

        if (!corestore) {
            corestores.current[name] = new Hypercore(name)
            await corestores.current[name].ready()
        }

        const bee = new Hyperbee(corestores.current[name], {
            keyEncoding: "utf-8",
            valueEncoding: "utf-8"
        })
        bees.current[name] = bee
        return bee;
    }

    async function getAutopass(name: string = SECRET_AUTOPASS_CORE_STORAGE_PATH): Promise<Autopass> {
        if (autopasses.current[name]) {
            // if instance exists, return it
            return autopasses.current[name]
        }

        autopasses.current[name] = new Autopass(new Corestore(name))
        console.log("autopass", autopasses.current[name])
        await autopasses.current[name].ready()
        const inviteFile = name + "/.invite"
        console.log("inviteFile", inviteFile)
        try {
            if (!fs.existsSync(inviteFile)) {
                fs.mkdirSync(name, { recursive: true })
                console.log("Creating invite file.")
                fs.writeFileSync(inviteFile, 'w')
            }
        } catch (error) {
            console.log("error", error)
        }

        return autopasses.current[name]
    }

    async function getRPC(key: string): Promise<RPC> {
        if (rpcs.current[key]) {
            return rpcs.current[key]
        }

        const rpc = new RPC()
        rpcs.current[key] = rpc
        return rpc
    }

    async function getCore(storagePath: string): Promise<Hypercore> {
        if (cores.current[storagePath]) {
            return cores.current[storagePath]
        }

        const core = new Hypercore(storagePath)
        cores.current[storagePath] = core
        return core
    }

    async function getCoreStore(storagePath: string): Promise<Corestore> {
        if (corestores.current[storagePath]) {
            console.log("corestore already exists", corestores.current[storagePath])
            return corestores.current[storagePath]
        }

        const corestore = new Corestore(storagePath)
        await corestore.ready()
        corestores.current[storagePath] = corestore
        return corestores.current[storagePath]
    }

    async function getDrive(storagePath: string): Promise<Hyperdrive> {
        console.log("getting drive", storagePath)
        if (drives.current[storagePath]) {
            console.log("drive already exists", drives.current[storagePath])
            return drives.current[storagePath]
        }
        console.log("getting core store", storagePath)
        const core = await getCoreStore(storagePath)
        const drive = new Hyperdrive(core)
        await drive.ready()
        console.log("drive", drive)
        drives.current[storagePath] = drive
        return drives.current[storagePath]
    }

    return <Peer2PeerProviderState.Provider value={{
        swarms: swarms.current,
        cores: cores.current,
        drives: drives.current,
        bees: bees.current,
        autopasses: autopasses.current,
        corestores: corestores.current,
        getBee,
        getAutopass,
        appVersion,
        setAppVersion,
        getRPC,
        getCore,
        getDrive,
        rpcs: rpcs.current
    }}>{children}</Peer2PeerProviderState.Provider>
}   