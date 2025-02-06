export const SECRET_BEE_STORAGE_PATH = Pear.config.storage + "/secret-bee"
export const SECRET_CORE_STORAGE_PATH = Pear.config.storage + "/secret-core"
export const SECRET_AUTOPASS_CORE_STORAGE_PATH = Pear.config.storage + "/secret-autopass-core"
export const SECRET_DRIVE_STORAGE_PATH = Pear.config.storage + "/secret-drive"
export const SECRET_SWARM_STORAGE_PATH = Pear.config.storage + "/secret-swarm"
export const SECRET_AUTOPASS_STORAGE_PATH = Pear.config.storage + "/secret-autopass"


export async function getAppKey() {
    const { app } = await Pear.versions()
    const key_ = app.key || '57337a386673415371314f315a6d386f504576774259624e32446a7377393752';
    return key_
}