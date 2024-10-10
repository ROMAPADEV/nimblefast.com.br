import jwt from 'jsonwebtoken'
import forge from 'node-forge'
import fs from 'fs'

const pathPrivateKey = 'src/infrastructure/security/private-key.pem'
const pathPublicKey = 'src/infrastructure/security/public-key.pem'

export function createPrivateKey() {
  const { privateKey, publicKey } = forge.pki.rsa.generateKeyPair(2048)
  const privateKeyPem = forge.pki.privateKeyToPem(privateKey)
  const publicKeyPem = forge.pki.publicKeyToPem(publicKey)

  fs.writeFileSync(pathPrivateKey, privateKeyPem)
  fs.writeFileSync(pathPublicKey, publicKeyPem)
}

export function createToken(Params: object, expiresIn: number | string) {
  const privateKey = fs.readFileSync(pathPrivateKey, 'utf8')

  return jwt.sign(Params, privateKey, { algorithm: 'RS256', expiresIn })
}

export function verifyToken(token: string) {
  const publicKey = fs.readFileSync(pathPublicKey, 'utf8')

  return jwt.verify(token, publicKey, { algorithms: ['RS256'] })
}
