import { createContext, useEffect, useRef, useState } from "react";
import Hyperswarm from "hyperswarm";
import Hyperdrive from "hyperdrive";
import Hyperbee from "hyperbee";
import Autopass from "autopass"
import Corestore from "corestore";
import Hypercore from "hypercore";
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
    getBee: (name: string) => Promise<any>
    getAutopass: (name: string) => Promise<any>
}

export const Peer2PeerProviderState = createContext<IPeer2PeerContext>({
    autopasses: {},
    bees: {},
    cores: {},
    drives: {},
    swarms: {},
    corestores: {},
    setAppVersion: () => { },
    getBee: () => Promise.resolve(null) as any,
    getAutopass: () => Promise.resolve(null) as any
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
        }

        const bee = new Hyperbee(corestores.current[name], {
            keyEncoding: "utf-8",
            valueEncoding: "utf-8"
        })
        bees.current[name] = bee
        return bee;
    }

    async function getAutopass(name: string): Promise<Autopass> {
        if (autopasses.current[name]) {
            // if instance exists, return it
            return autopasses.current[name]
        }

        autopasses.current[name] = new Autopass(new Corestore(SECRET_AUTOPASS_CORE_STORAGE_PATH))
        await autopasses.current[name].ready()
        const inviteFile = SECRET_AUTOPASS_CORE_STORAGE_PATH + "/invite.json"
        console.log("fs", fs)
        try {
            if (!fs.existsSync(inviteFile)) {
                console.log("Creating invite file.")
                fs.writeFileSync(inviteFile, 'w')
            }
        } catch (error) {
            console.log("error", error)
        }

        return autopasses.current[name]
    }

    async function joinSecretChannel(): Promise<Corestore> {
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
        setAppVersion
    }}>{children}</Peer2PeerProviderState.Provider>
}   