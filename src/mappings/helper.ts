import { Position } from "../../generated/schema"
import { Bytes, BigInt } from "@graphprotocol/graph-ts"

export function createPosition(positionId: string): Position {
  let position = new Position(positionId)
  position.trader = Bytes.fromHexString(positionId) as Bytes
  position.margin = BigInt.fromI32(0)
  position.positionNotional = BigInt.fromI32(0)
  position.realizedPnl = BigInt.fromI32(0)
  position.unrealizedPnl = BigInt.fromI32(0)
  position.fee = BigInt.fromI32(0)
  position.badDebt = BigInt.fromI32(0)
  position.liquidationPenalty = BigInt.fromI32(0)
  position.ammPositions = []
  position.blockNumber = BigInt.fromI32(0)
  position.timestamp = BigInt.fromI32(0)
  position.save()
  return position
}
