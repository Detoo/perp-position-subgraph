import {
  PositionChanged,
  PositionLiquidated,
  MarginChanged,
} from "../../generated/ClearingHouse/ClearingHouse"
import {
  Position,
  AmmPosition,
  PositionChangedEvent,
  PositionLiquidatedEvent,
} from "../../generated/schema"
import {
  createPosition, parseAmmPositionId, createAmmPosition,
} from "./helper"

/* Trader open/close/modify position
 */
export function handlePositionChanged(event: PositionChanged): void {
  //
  // upsert corresponding Position
  //
  let positionId = event.params.trader.toHexString()
  let position = Position.load(positionId)
  if (!position) {
    position = createPosition(positionId)
  }
  position.margin = event.params.margin // snapshot
  position.realizedPnl = position.realizedPnl.plus(event.params.realizedPnl) // delta
  position.unrealizedPnl = event.params.unrealizedPnlAfter
  position.fee = position.fee.plus(event.params.fee)
  position.badDebt = position.badDebt.plus(event.params.badDebt)
  position.liquidationPenalty = position.liquidationPenalty.plus(event.params.liquidationPenalty)
  position.blockNumber = event.block.number
  position.timestamp = event.block.timestamp
  position.save()

  //
  // upsert corresponding AmmPosition
  //
  let ammPositionId = parseAmmPositionId(event.params.amm, event.params.trader)
  let ammPosition = AmmPosition.load(ammPositionId)
  if (!ammPosition) {
    ammPosition = createAmmPosition(event.params.amm, event.params.trader)
  }
  ammPosition.margin = event.params.margin // snapshot
  ammPosition.positionSize = event.params.positionSizeAfter
  ammPosition.realizedPnl = ammPosition.realizedPnl.plus(event.params.realizedPnl) // delta
  ammPosition.unrealizedPnl = event.params.unrealizedPnlAfter
  ammPosition.fee = ammPosition.fee.plus(event.params.fee)
  ammPosition.badDebt = ammPosition.badDebt.plus(event.params.badDebt)
  ammPosition.liquidationPenalty = ammPosition.liquidationPenalty.plus(event.params.liquidationPenalty)
  ammPosition.blockNumber = event.block.number
  ammPosition.timestamp = event.block.timestamp
  ammPosition.save()

  //
  // insert PositionChanged event
  //
  let positionChanged = new PositionChangedEvent(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
  positionChanged.trader = event.params.trader
  positionChanged.amm = event.params.amm
  positionChanged.margin = event.params.margin
  positionChanged.positionNotional = event.params.positionNotional
  positionChanged.exchangedPositionSize = event.params.exchangedPositionSize
  positionChanged.fee = event.params.fee
  positionChanged.positionSizeAfter = event.params.positionSizeAfter
  positionChanged.realizedPnl = event.params.realizedPnl
  positionChanged.unrealizedPnlAfter = event.params.unrealizedPnlAfter
  positionChanged.badDebt = event.params.badDebt
  positionChanged.liquidationPenalty = event.params.liquidationPenalty
  positionChanged.quoteAssetReserve = event.params.quoteAssetReserve
  positionChanged.baseAssetReserve = event.params.baseAssetReserve
  positionChanged.blockNumber = event.block.number
  positionChanged.timestamp = event.block.timestamp
  positionChanged.save()
}

/* Trader position liquidated
 *
 * - always comes after a corresponding PositionChanged event
 * - the PositionChanged event represents the position changes due to liquidation, and the PositionLiquidated event
 *   represents the liquidation-specific information
 */
export function handlePositionLiquidated(event: PositionLiquidated): void {
  let entity = new PositionLiquidatedEvent(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
  entity.trader = event.params.trader
  entity.amm = event.params.amm
  entity.positionNotional = event.params.positionNotional
  entity.positionSize = event.params.positionSize
  entity.liquidationFee = event.params.liquidationFee
  entity.liquidator = event.params.liquidator
  entity.badDebt = event.params.badDebt
  entity.blockNumber = event.block.number
  entity.timestamp = event.block.timestamp
  entity.save()
}

/* Trader margin changed
 *
 * adjust Position margin accordingly
 */
export function handleMarginChanged(event: MarginChanged): void {
  //
  // upsert corresponding Position
  //
  let positionId = event.params.sender.toHexString()
  let position = Position.load(positionId)
  if (!position) {
    position = createPosition(positionId)
  }
  position.margin = position.margin.plus(event.params.amount) // delta
  position.blockNumber = event.block.number
  position.timestamp = event.block.timestamp
  position.save()

  //
  // upsert corresponding AmmPosition
  //
  let ammPositionId = parseAmmPositionId(event.params.amm, event.params.sender)
  let ammPosition = AmmPosition.load(ammPositionId)
  if (!ammPosition) {
    ammPosition = createAmmPosition(event.params.amm, event.params.sender)
  }
  ammPosition.margin = ammPosition.margin.plus(event.params.amount) // delta
  ammPosition.blockNumber = event.block.number
  ammPosition.timestamp = event.block.timestamp
  ammPosition.save()
}
