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

/* Trader open/close/modify position
 */
export function handlePositionChanged(event: PositionChanged): void {
  let entity = new PositionChangedEvent(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
  entity.trader = event.params.trader
  entity.amm = event.params.amm
  entity.margin = event.params.margin
  entity.positionNotional = event.params.positionNotional
  entity.exchangedPositionSize = event.params.exchangedPositionSize
  entity.fee = event.params.fee
  entity.positionSizeAfter = event.params.positionSizeAfter
  entity.realizedPnl = event.params.realizedPnl
  entity.unrealizedPnlAfter = event.params.unrealizedPnlAfter
  entity.badDebt = event.params.badDebt
  entity.liquidationPenalty = event.params.liquidationPenalty
  entity.quoteAssetReserve = event.params.quoteAssetReserve
  entity.baseAssetReserve = event.params.baseAssetReserve
  entity.save()
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
  entity.save()
}
