import { createTransform } from 'redux-persist'
import CryptoJSCore from 'crypto-js/core'
import AES from 'crypto-js/aes'
import { makeEncryptor, makeDecryptor } from './helpers'

const makeSyncEncryptor = secretKey =>
  makeEncryptor(state => AES.encrypt(state, secretKey).toString())

const decryptor = (state, secretKey) => {
    const bytes = AES.decrypt(state, secretKey)
    const decryptedString = bytes.toString(CryptoJSCore.enc.Utf8)
    return JSON.parse(decryptedString)
}

const makeSyncDecryptor = (secretKey, oldSecretKey, onError) =>
  makeDecryptor(state => {
    try {
        return decryptor(state, secretKey);
    } catch (err) {
      try {
         if (!oldSecretKey) throw new Error(
             'Could not decrypt state. Please verify that you are using the correct secret key.'
           );
         return decryptor(state, oldSecretKey);
      } catch (e) {
          throw new Error(
              'Could not decrypt state. Please verify that you are using the correct secret key.'
          );
      }
    }
  }, onError)

export default config => {
  const inbound = makeSyncEncryptor(config.secretKey)
  const outbound = makeSyncDecryptor(config.secretKey, config.oldSecretKey, config.onError)
  return createTransform(inbound, outbound, config)
}
