import { AmmPosition, Position } from "../../generated/schema"
import { Bytes, BigInt, Address } from "@graphprotocol/graph-ts"

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
  position.blockNumber = BigInt.fromI32(0)
  position.timestamp = BigInt.fromI32(0)
  position.save()
  return position
}

export function createAmmPosition(amm: Address, trader: Address): AmmPosition {
  let ammPositionId = parseAmmPositionId(amm, trader)
  let ammPosition = new AmmPosition(ammPositionId)
  ammPosition.amm = amm
  ammPosition.trader = trader
  ammPosition.margin = BigInt.fromI32(0)
  ammPosition.positionNotional = BigInt.fromI32(0)
  ammPosition.positionSize = BigInt.fromI32(0)
  ammPosition.realizedPnl = BigInt.fromI32(0)
  ammPosition.unrealizedPnl = BigInt.fromI32(0)
  ammPosition.fee = BigInt.fromI32(0)
  ammPosition.badDebt = BigInt.fromI32(0)
  ammPosition.liquidationPenalty = BigInt.fromI32(0)
  ammPosition.position = ammPositionId
  ammPosition.blockNumber = BigInt.fromI32(0)
  ammPosition.timestamp = BigInt.fromI32(0)
  ammPosition.save()
  return ammPosition
}

export function parseAmmPositionId(amm: Address, trader: Address): string {
  return amm.toHexString() + "-" + trader.toHexString()
}
