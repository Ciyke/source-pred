import { mockPredictionsClient } from './mockPredictionsClient.js'

// Phase B swap point: once contracts/PredictionArena.sol is deployed, add
// `import { web3PredictionsClient } from './web3PredictionsClient.js'` and
// export that instead (or gate on an env var) — every component in
// frontend/src/predictions/ calls only the shared shape from
// predictionsClient.js, so no component changes are needed for the swap.
export const predictionsClient = mockPredictionsClient
