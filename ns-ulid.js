/**
 * @NApiVersion 2.1
 * @author marmani
 * @borrows https://github.com/skeeto/ulid-js/blob/master/ulid.js
 * @summary Converting above repo script in NetSuite-usable script.
 * 			This was also challenging because there is no 'window', so I had to get a little creative with the
 * 			N/crypto/random module to make ULIDs work.
 */
define([
	"N/crypto/random"
], (random) => {
	/**
	 * Constructs a ULID generator closure that emits universally unique,
	 * monotonic values.
	 * let generator = ULID();
	 * let ulid0 = generator();
	 * let ulid1 = generator();
	 */
	class ULID {
		constructor() {
			const BASE32 = [
				'0', '1', '2', '3', '4', '5', '6', '7',
				'8', '9', 'A', 'B', 'C', 'D', 'E', 'F',
				'G', 'H', 'J', 'K', 'M', 'N', 'P', 'Q',
				'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'
			];
			let last = -1;
			/* Pre-allocate work buffers / views */
			const RAND_BYTE_OFFSET = 6;
			let ulid = new Uint8Array(16);
			let time = new DataView(ulid.buffer, 0, 6);
			let rand = new Uint8Array(ulid.buffer, RAND_BYTE_OFFSET, 10); // Not really set into the buffer yet.
			let dest = new Array(26);
	
			const encode = (ulid) => {
				dest[0] = BASE32[ ulid[0] >> 5];
				dest[1] = BASE32[(ulid[0] >> 0) & 0x1f];
				for (let i = 0; i < 3; i++) {
					dest[i*8+2] = BASE32[ ulid[i*5+1] >> 3];
					dest[i*8+3] = BASE32[(ulid[i*5+1] << 2 | ulid[i*5+2] >> 6) & 0x1f];
					dest[i*8+4] = BASE32[(ulid[i*5+2] >> 1) & 0x1f];
					dest[i*8+5] = BASE32[(ulid[i*5+2] << 4 | ulid[i*5+3] >> 4) & 0x1f];
					dest[i*8+6] = BASE32[(ulid[i*5+3] << 1 | ulid[i*5+4] >> 7) & 0x1f];
					dest[i*8+7] = BASE32[(ulid[i*5+4] >> 2) & 0x1f];
					dest[i*8+8] = BASE32[(ulid[i*5+4] << 3 | ulid[i*5+5] >> 5) & 0x1f];
					dest[i*8+9] = BASE32[(ulid[i*5+5] >> 0) & 0x1f];
				}
				return dest.join('');
			}
	
			return () => {
				let now = Date.now();
				if (now === last) {
					/* 80-bit overflow is so incredibly unlikely that it's not
					* considered as a possiblity here.
					*/
					for (let i = 9; i >= 0; i--)
						if (rand[i]++ < 255)
							break;
				} else {
					last = now;
					time.setUint16(0, (now / 4294967296.0) | 0);
					time.setUint32(2, now | 0);
					// window.crypto.getRandomValues(rand);
					/*
					* Because `window.crypto.getRandomValues(rand)` fails due to no window,
					* I have to use the N/crypto/random to generate bytes.
					* Then, because I'm not able to set `ulid.buffer` when setting up rand,
					* because of the difference in methods between random.generateBytes() vs crypto.getRandomValues(rand),
					* so I need to loop through the rand array, and set those random values into the ulid array at the byte offset index
					*/
					rand = random.generateBytes({size: 10});
					for(let i = 0; i < rand.length; i++) {
						ulid[RAND_BYTE_OFFSET+i] = rand[i];
					}
				}
				return encode(ulid);
			};
		}
	}

	return {
		ULID: ULID
	}
});
