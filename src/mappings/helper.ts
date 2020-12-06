import { AmmPosition, Position } from "../../generated/schema"
import { BigInt, Address } from "@graphprotocol/graph-ts"

export function getPosition(trader: Address): Position {
  let position = Position.load(parsePositionId(trader))
  if (!position) {
    position = createPosition(trader)
  }
  return position!
}

export function createPosition(trader: Address): Position {
  let position = new Position(parsePositionId(trader))
  position.trader = trader
  position.margin = BigInt.fromI32(0)
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

export function parsePositionId(trader: Address): string {
  return trader.toHexString()
}

export function getAmmPosition(amm: Address, trader: Address): AmmPosition {
  let ammPosition = AmmPosition.load(parseAmmPositionId(amm, trader))
  if (!ammPosition) {
    ammPosition = createAmmPosition(amm, trader)
  }
  return ammPosition!
}

export function createAmmPosition(amm: Address, trader: Address): AmmPosition {
  let ammPositionId = parseAmmPositionId(amm, trader)
  let ammPosition = new AmmPosition(ammPositionId)
  ammPosition.amm = amm
  ammPosition.trader = trader
  ammPosition.margin = BigInt.fromI32(0)
  ammPosition.positionSize = BigInt.fromI32(0)
  ammPosition.realizedPnl = BigInt.fromI32(0)
  ammPosition.unrealizedPnl = BigInt.fromI32(0)
  ammPosition.fee = BigInt.fromI32(0)
  ammPosition.badDebt = BigInt.fromI32(0)
  ammPosition.liquidationPenalty = BigInt.fromI32(0)
  ammPosition.position = parsePositionId(trader)
  ammPosition.blockNumber = BigInt.fromI32(0)
  ammPosition.timestamp = BigInt.fromI32(0)
  ammPosition.save()
  return ammPosition
}

export function parseAmmPositionId(amm: Address, trader: Address): string {
  return amm.toHexString() + "-" + trader.toHexString()
}
