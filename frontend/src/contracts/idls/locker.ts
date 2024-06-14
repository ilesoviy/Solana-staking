export type LpLocker = {
    "version": "0.1.0",
    "name": "lp_locker",
    "instructions": [
      {
        "name": "initialize",
        "accounts": [
          {
            "name": "authority",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "globalState",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "rent",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "newAuthority",
            "type": "publicKey"
          }
        ]
      },
      {
        "name": "startLock",
        "accounts": [
          {
            "name": "authority",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "globalState",
            "isMut": true,
            "isSigner": false
          }
        ],
        "args": []
      },
      {
        "name": "lockLp",
        "accounts": [
          {
            "name": "user",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "globalState",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "userLpState",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "tokenVault",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "userVault",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "tokenMint",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "associatedTokenProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "tokenProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "rent",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "period",
            "type": "u64"
          }
        ]
      },
      {
        "name": "unlockLp",
        "accounts": [
          {
            "name": "user",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "globalState",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "userLpState",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "tokenVault",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "userVault",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "tokenMint",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "tokenProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "rent",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "globalState",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "isInitialized",
              "type": "u8"
            },
            {
              "name": "isStarted",
              "type": "u8"
            },
            {
              "name": "authority",
              "type": "publicKey"
            },
            {
              "name": "tokenMint",
              "type": "publicKey"
            },
            {
              "name": "tokenVault",
              "type": "publicKey"
            }
          ]
        }
      },
      {
        "name": "userLpState",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "isInitialized",
              "type": "u8"
            },
            {
              "name": "user",
              "type": "publicKey"
            },
            {
              "name": "mintKey",
              "type": "publicKey"
            },
            {
              "name": "isLp",
              "type": "u8"
            },
            {
              "name": "amount",
              "type": "u64"
            },
            {
              "name": "lockStart",
              "type": "u64"
            },
            {
              "name": "lockEnd",
              "type": "u64"
            }
          ]
        }
      }
    ],
    "errors": [
      {
        "code": 6000,
        "name": "NotAllowedAuthority",
        "msg": "Not allowed authority"
      },
      {
        "code": 6001,
        "name": "NotStarted",
        "msg": "Not yet started"
      },
      {
        "code": 6002,
        "name": "InsufficientBalance",
        "msg": "Not locked such amount token"
      },
      {
        "code": 6003,
        "name": "InvalidLockTime",
        "msg": "Lock period is invalid"
      },
      {
        "code": 6004,
        "name": "NotAllowedYet",
        "msg": "Lock period is not finished, yet"
      },
      {
        "code": 6005,
        "name": "InsufficientAmount",
        "msg": "Should be over minimum amount"
      },
      {
        "code": 6006,
        "name": "IncorrectUserState",
        "msg": "Incorrect User State"
      },
      {
        "code": 6007,
        "name": "IncorrectReferral",
        "msg": "Incorrect Referral Pubkey"
      }
    ]
  };
  
  export const IDL: LpLocker = {
    "version": "0.1.0",
    "name": "lp_locker",
    "instructions": [
      {
        "name": "initialize",
        "accounts": [
          {
            "name": "authority",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "globalState",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "rent",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "newAuthority",
            "type": "publicKey"
          }
        ]
      },
      {
        "name": "startLock",
        "accounts": [
          {
            "name": "authority",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "globalState",
            "isMut": true,
            "isSigner": false
          }
        ],
        "args": []
      },
      {
        "name": "lockLp",
        "accounts": [
          {
            "name": "user",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "globalState",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "userLpState",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "tokenVault",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "userVault",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "tokenMint",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "associatedTokenProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "tokenProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "rent",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "period",
            "type": "u64"
          }
        ]
      },
      {
        "name": "unlockLp",
        "accounts": [
          {
            "name": "user",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "globalState",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "userLpState",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "tokenVault",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "userVault",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "tokenMint",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "tokenProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "rent",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "globalState",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "isInitialized",
              "type": "u8"
            },
            {
              "name": "isStarted",
              "type": "u8"
            },
            {
              "name": "authority",
              "type": "publicKey"
            },
            {
              "name": "tokenMint",
              "type": "publicKey"
            },
            {
              "name": "tokenVault",
              "type": "publicKey"
            }
          ]
        }
      },
      {
        "name": "userLpState",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "isInitialized",
              "type": "u8"
            },
            {
              "name": "user",
              "type": "publicKey"
            },
            {
              "name": "mintKey",
              "type": "publicKey"
            },
            {
              "name": "isLp",
              "type": "u8"
            },
            {
              "name": "amount",
              "type": "u64"
            },
            {
              "name": "lockStart",
              "type": "u64"
            },
            {
              "name": "lockEnd",
              "type": "u64"
            }
          ]
        }
      }
    ],
    "errors": [
      {
        "code": 6000,
        "name": "NotAllowedAuthority",
        "msg": "Not allowed authority"
      },
      {
        "code": 6001,
        "name": "NotStarted",
        "msg": "Not yet started"
      },
      {
        "code": 6002,
        "name": "InsufficientBalance",
        "msg": "Not locked such amount token"
      },
      {
        "code": 6003,
        "name": "InvalidLockTime",
        "msg": "Lock period is invalid"
      },
      {
        "code": 6004,
        "name": "NotAllowedYet",
        "msg": "Lock period is not finished, yet"
      },
      {
        "code": 6005,
        "name": "InsufficientAmount",
        "msg": "Should be over minimum amount"
      },
      {
        "code": 6006,
        "name": "IncorrectUserState",
        "msg": "Incorrect User State"
      },
      {
        "code": 6007,
        "name": "IncorrectReferral",
        "msg": "Incorrect Referral Pubkey"
      }
    ]
  };
  