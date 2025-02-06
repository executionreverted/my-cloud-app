import { deterministicHex } from "./deterministicHex"
import b4a from "b4a"

export const generateTopicBySeed = (seed: string) => {
    const topic = deterministicHex(seed)
    const topicBuffer = b4a.from(topic.slice(0, 64), 'hex')
    return topicBuffer
}
