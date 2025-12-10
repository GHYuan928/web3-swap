const abi = [
  {
    name: 'name',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }]
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }]
  },
  {
  "name": "getAllPools",
  "type": "function",
  "stateMutability": "view",
  "inputs": [],
  "outputs": [
    {
      "name": "poolsInfo",
      "type": "tuple[]",
      "components": [
        {
          "name": "pool",
          "type": "address"
        },
        {
          "name": "token0",
          "type": "address"
        },
        {
          "name": "token1",
          "type": "address"
        },
        {
          "name": "index",
          "type": "uint32"
        },
        {
          "name": "fee",
          "type": "uint24"
        },
        {
          "name": "feeProtocol",
          "type": "uint8"
        },
        {
          "name": "tickLower",
          "type": "int24"
        },
        {
          "name": "tickUpper",
          "type": "int24"
        },
        {
          "name": "tick",
          "type": "int24"
        },
        {
          "name": "sqrtPriceX96",
          "type": "uint160"
        },
        {
          "name": "liquidity",
          "type": "uint128"
        }
      ]
    }
  ]
},
  {
    "name": "createAndInitializePoolIfNecessary",
    "type": "function",
    "stateMutability": "payable",
    "inputs": [
      {
        "name": "params",
        "type": "tuple",
        "components": [
          { "name": "token0", "type": "address" },
          { "name": "token1", "type": "address" },
          { "name": "fee", "type": "uint24" },
          { "name": "tickLower", "type": "int24" },
          { "name": "tickUpper", "type": "int24" },
          { "name": "sqrtPriceX96", "type": "uint160" }
        ]
      }
    ],
    "outputs": [
      { "name": "pool", "type": "address" }
    ]
  },
  {
    "name": "getPositionInfo",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      {
        "name": "positionId",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "positionInfo",
        "type": "tuple",
        "components": [
          {
            "name": "owner",
            "type": "address"
          },
          {
            "name": "token0",
            "type": "address"
          },
          {
            "name": "token1",
            "type": "address"
          },
          {
            "name": "index",
            "type": "uint32"
          },
          {
            "name": "fee",
            "type": "uint24"
          },
          {
            "name": "liquidity",
            "type": "uint128"
          },
          {
            "name": "tickLower",
            "type": "int24"
          },
          {
            "name": "tickUpper",
            "type": "int24"
          },
          {
            "name": "tokensOwed0",
            "type": "uint256"
          },
          {
            "name": "tokensOwed1",
            "type": "uint256"
          }
        ]
      }
    ]
  },
  {
    "name": "getAllPositions",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [
      {
        "name": "positionInfo",
        "type": "tuple[]",
        "components": [
          {
            "name": "id",
            "type": "uint256"
          },
          {
            "name": "owner",
            "type": "address"
          },
          {
            "name": "token0",
            "type": "address"
          },
          {
            "name": "token1",
            "type": "address"
          },
          {
            "name": "index",
            "type": "uint32"
          },
          {
            "name": "fee",
            "type": "uint24"
          },
          {
            "name": "liquidity",
            "type": "uint128"
          },
          {
            "name": "tickLower",
            "type": "int24"
          },
          {
            "name": "tickUpper",
            "type": "int24"
          },
          {
            "name": "tokensOwed0",
            "type": "uint128"
          },
          {
            "name": "tokensOwed1",
            "type": "uint128"
          },
          {
            "name": "feeGrowthInside0LastX128",
            "type": "uint256"
          },
          {
            "name": "feeGrowthInside1LastX128",
            "type": "uint256"
          }
        ]
      }
    ]
  },
  {
    "name": "getPairs",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "components": [
          {
            "name": "token0",
            "type": "address"
          },
          {
            "name": "token1",
            "type": "address"
          }
        ]
      }
    ]
  },
  {
    "name": "burn",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      {
        "name": "positionId",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "amount0",
        "type": "uint256"
      },
      {
        "name": "amount1",
        "type": "uint256"
      }
    ]
  },
  {
    "name": "collect",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      {
        "name": "positionId",
        "type": "uint256"
      },
      {
        "name": "recipient",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "name": "amount0",
        "type": "uint256"
      },
      {
        "name": "amount1",
        "type": "uint256"
      }
    ]
  },
  {
    "name": "mint",
    "type": "function",
    "stateMutability": "payable",
    "inputs": [
      {
        "name": "params",
        "type": "tuple",
        "components": [
          {
            "name": "token0",
            "type": "address"
          },
          {
            "name": "token1",
            "type": "address"
          },
          {
            "name": "index",
            "type": "uint32"
          },
          {
            "name": "amount0Desired",
            "type": "uint256"
          },
          {
            "name": "amount1Desired",
            "type": "uint256"
          },
          {
            "name": "recipient",
            "type": "address"
          },
          {
            "name": "deadline",
            "type": "uint256"
          }
        ]
      }
    ],
    "outputs": [
      {
        "name": "positionId",
        "type": "uint256"
      },
      {
        "name": "liquidity",
        "type": "uint128"
      },
      {
        "name": "amount0",
        "type": "uint256"
      },
      {
        "name": "amount1",
        "type": "uint256"
      }
    ]
  }
]
const poolManagerAddr =  "0xddC12b3F9F7C91C79DA7433D8d212FB78d609f7B"
const positionManagerAddr = "0xbe766Bf20eFfe431829C5d5a2744865974A0B610"
const swapRouterAddr = "0xD2c220143F5784b3bD84ae12747d97C8A36CeCB2"

export {
  abi,
  poolManagerAddr,
  positionManagerAddr,
  swapRouterAddr,

};