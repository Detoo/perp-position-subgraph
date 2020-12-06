import {
  PositionChanged,
  PositionLiquidated,
} from "../../generated/ClearingHouse/ClearingHouse"
import {
  Position,
  AmmPosition,
  PositionChangedEvent,
  PositionLiquidatedEvent,
} from "../../generated/schema"
import { createPosition } from "./helper"

/* Trader open/close/modify position
 */
export function handlePositionChanged(event: PositionChanged): void {
  let positionId = event.params.trader.toHexString()
  let position = Position.load(positionId)
  if (!position) {
    position = createPosition(positionId)
  }
  position.save()

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
