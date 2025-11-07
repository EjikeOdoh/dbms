import * as bcrypt from 'bcrypt'

export async function passHash(pass: string) {
    const saltRounds = 12
    const salt = await bcrypt.genSalt(saltRounds);

    return await bcrypt.hash(pass, salt)

}

export async function comparePass(pass: string, hash: string) {
    return await bcrypt.compare(pass, hash);
}