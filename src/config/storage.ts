export const SECRET_BEE_STORAGE_PATH = Pear.config.storage + "/secret-bee"
export const SECRET_CORE_STORAGE_PATH = Pear.config.storage + "/secret-core"
export const SECRET_AUTOPASS_CORE_STORAGE_PATH = Pear.config.storage + "/secret-autopass-core"
export const SECRET_DRIVE_STORAGE_PATH = Pear.config.storage + "/secret-drive"
export const SECRET_SWARM_STORAGE_PATH = Pear.config.storage + "/secret-swarm"
export const SECRET_AUTOPASS_STORAGE_PATH = Pear.config.storage + "/secret-autopass"


export const ROOMS_AUTOPASS_PATH = Pear.config.storage + "/rooms"
export const ROOMS_AUTOPASS_KEY = "rooms"
export const ROOMS_AUTOPASS_METADATA_KEY = "meta"
export const PROFILE_STORAGE_PATH = Pear.config.storage + "/profile"
export const PROFILE_FILE_PATH = Pear.config.storage + "/profile/meta/profile.json"
export const PROFILE_FILE_FOLDER = Pear.config.storage + "/profile/meta"
export const PEER_PROFILES_BEE = Pear.config.storage + "/peerProfiles"

export async function getAppKey() {
    const { app } = await Pear.versions()
    const key_ = app.key || '57337a386673415371314f315a6d386f504576774259624e32446a7377393752';
    console.log(
        ROOMS_AUTOPASS_PATH,
        ROOMS_AUTOPASS_KEY,
        ROOMS_AUTOPASS_METADATA_KEY,
        PROFILE_STORAGE_PATH,
        PROFILE_FILE_PATH,
        PROFILE_FILE_FOLDER,
        PEER_PROFILES_BEE,
    )

    return key_
}
