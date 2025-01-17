const { Crypto } = require("@peculiar/webcrypto");
const ethUtil = require('ethereumjs-util');
const sigUtil = require('@metamask/eth-sig-util');
const CryptoJS = require("crypto-js");

class Crypter {
	constructor() {

	}

	static async decodeKeyFromBlockchain(thekey, theversion) {
		const crypto = new Crypto();
		let privateKeyAsHexString = '';

		if (theversion == 1) { // the version == 1 is not secure
			privateKeyAsHexString = "308204bd020100300d06092a864886f70d0101010500048204a7308204a30201000282010100a11e958b70dcdeb2bb6744a8cd15c50a165f003ee0b3854390e2820d4919a8cfb1f192ac269b7841df2297adf7f4b90345b6ac8c26578a2337183c73c902ff4187828b3d071b8ed56a8623dca5b5339587bc6caddeefc5ba50bddcbbd45ae45e0ba14316d17fa0fe2874c713487fdea79c1bc5746adceed5234e5f0309febb65b5c8db72ae06f8e732534e5293e81b71f09410925eef4778adb8f056d5d65ca392b6b2a68be340b00754b231c6af5eef55a4bc87a1017d1358a333f6d318bec95a97031a2fc2fd1060e4be0a18d61d67139cf25564c3aa634ba8b3a27f8cbf07acb4ce7b0de5b9ac526f4fb5883cefda7a7d2be11fdb918f9e0224c6ca5185dd0203010001028201000d22b030791818b3dba174b08a5fcefb9e8d4a38d61aecaf707d76fadc4dd23c74966c4dcaabfc26eaa928528f978d09de4221591fbb1d50f7a9eb2bc9648c28ec825115bda19a887db1c7f4b231ceadcf2e26721a6dd3e1f7b932e8c14c53b7f31cc79a71a4051d137149d5a1a08327890b9e927a2fdeecd37f0d31f33ba84d6646398af0cd5917365aa35135ac6efb97785004b991242bad8178481d9ca38f4c8b8bb4eb85abe784c651a86990b0155e5d12b6cfa0e717aa3be96b8061590bebc8f19d3f4a3fd0a0a8bd226c29070ecd642f2a69f5405572c340b8781c8b37ccb4abb1e3e6c0b4ec9ff8c716c68d759d85e8b8b98e0e385c3c0b7c57502ec502818100dc3fb132e237baeccd7d7be7963ceb8facd78b70c752936e4580fd97999ce9cbea60859e55e3b601a63d0b120293a082b88335509a3c343cb6d173b8eae749819932c8bc7dc712659d9b223936c0b73d30985f6af00cb70729798600a954fc36dd18d566fe378cd13542de5be84cd76bc4784dd0f92f89df965853edb18f857f02818100bb45ced2ae6cc92393f0e89be9218c8bf388cc60549688f9b36f64d91d0b71998259537be9057667a07d41835de7a193edd7ee0ac9438c8f7726248117404a6edc533f6341fcb9e5b8a21d38bea779d0f03e17456fe436ee8d304e152bfb53a4040d3870cae4e92b8b54b7ec5b331d5c069575269bed0f181f99bafb2c2f7aa302818100909a70a8cbc573408e19d903cfabe7acc8fa2b5ebc3f06f4db45393a136ce6432f7a77bfe0fc443f08fa030eac0a68d3ea789ac474bf1a3cd27ae9d37ac6a7882321289238b23eede0703e23fa42c50bb3a016e58afd8e1d71a98bc55b67a4c010a1815ac1858f3abc114f14608c32d35a86f1f045ea64471bda9a1ff0f81dd902818069b47d896deaf99d9b63dfe8212f4ea5b051070b58b39f9d522b0e417ea376fbaf17bc87b47fe0d59d4116399047ae6c5154108906119ac55ffba79f36009402ff59fded88d19e1c8c9af4e392b9f5887a1292101f98316975484ecaa488b82d5c1c1a3f9046a5566ecee3020678539a1e1d3e830c804284db516ab95bb77101028180048bdad7253331837934ca248cac74b7df10c2dad564138a5fa4f2096174d039fcbffaded5738ee419d48baeccd48b5c8adbb6a1289fe34c9d5d84a6bc0c8cc2a898f3aabfd8640b3b1277078e88357e653c8ecc4ebd625bd1ec51e17ac5c3d3e6d7fbf1bb9b4c8b4417b898fe11577acfccabe4c35fec04d147de87f1764a7b";
		}

		const privateKeyAsBuffer = Buffer.from(privateKeyAsHexString, "hex");
		const encodedAsBuffer = Buffer.from(thekey, "hex");

		const privateKey = await crypto.subtle.importKey(
			"pkcs8", // only raw format
			privateKeyAsBuffer, // BufferSource
			{
				name: "RSA-OAEP",
				hash: "SHA-256",
			},
			false, // only false
			["decrypt"],
		);

		const data = await crypto.subtle.decrypt(
			{
				name: "RSA-OAEP",
			},
			privateKey, // RSA private key
			encodedAsBuffer,    // BufferSource
		);

		// console.error(data);


		// convert to hex string
		return [...new Uint8Array(data)]
			.map(x => x.toString(16).padStart(2, '0'))
			.join('');
	}

	static async encodeKeyForUser(videoKey, userAccount, userEncryptionPublicKey) {
		// videoKey is the hex string
		const keyWordArray = CryptoJS.enc.Hex.parse(videoKey);
		const pbkdf2Salt = 'testффф';
		const pbkdf2Value = ''+userAccount; // as string

		const key = CryptoJS.PBKDF2(pbkdf2Value, pbkdf2Salt, { hasher: CryptoJS.algo.SHA512, keySize: CryptoJS.algo.AES.keySize, iterations: 1000 });

		let randomSalt = CryptoJS.lib.WordArray.random(64);
		let randomKey = CryptoJS.lib.WordArray.random(64);
		let iv = CryptoJS.PBKDF2(randomKey, randomSalt, { keySize: CryptoJS.algo.AES.ivSize, iterations: 1000 });
		iv.clamp();

		const cryptoParams = {
			mode: CryptoJS.mode.CBC,
			padding: CryptoJS.pad.Pkcs7,
			iv: iv,
		};

		const encryptor = CryptoJS.algo.AES.createEncryptor(key, cryptoParams);
		const encrypted = encryptor.finalize(keyWordArray);

		const hexResult = ''+CryptoJS.enc.Hex.stringify(iv)+''+CryptoJS.enc.Hex.stringify(encrypted);

		let toDecodeByMetaMask = hexResult;

		const encryptedMessage = ethUtil.bufferToHex(
				Buffer.from(
					JSON.stringify(
						sigUtil.encrypt({
							publicKey: userEncryptionPublicKey,
							data: toDecodeByMetaMask,
							version: 'x25519-xsalsa20-poly1305',
						})
					),
					'utf8'
				)
			);

		return encryptedMessage;
	}
}


module.exports = Crypter;