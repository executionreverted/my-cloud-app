export const SECRET_BEE_NAME = Pear.config.storage + "/secret-bee.db"
export const SECRET_CORE_NAME = Pear.config.storage + "/secret-core.db"
export const SECRET_DRIVE_NAME = Pear.config.storage + "/secret-drive.db"
export const SECRET_SWARM_NAME = Pear.config.storage + "/secret-swarm.db"
export const SECRET_AUTOPASS_NAME = Pear.config.storage + "/secret-autopass.db"


export async function getStoragePath(name: string = "default_storage") {
    const { app } = await Pear.versions()
    const key_ = app.key || '57337a386673415371314f315a6d386f504576774259624e32446a7377393752';
    return key_ + name
}