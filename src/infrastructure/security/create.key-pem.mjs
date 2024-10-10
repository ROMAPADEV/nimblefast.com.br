import forge from 'node-forge'
import fs from 'fs'
// const forge = require('node-forge')
// const fs = require('fs')

const pathPrivateKey = 'src/infrastructure/security/private-key.pem'
const pathPublicKey = 'src/infrastructure/security/public-key.pem'

function createPrivateKey() {
  const { privateKey, publicKey } = forge.pki.rsa.generateKeyPair(2048)
  const privateKeyPem = forge.pki.privateKeyToPem(privateKey)
  const publicKeyPem = forge.pki.publicKeyToPem(publicKey)

  fs.writeFileSync(pathPrivateKey, privateKeyPem)
  fs.writeFileSync(pathPublicKey, publicKeyPem)
}

createPrivateKey()
