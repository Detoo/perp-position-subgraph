import {
  FundingRateUpdated,
} from "../../generated/AmmBTCUSDC/Amm"
import {
  FundingRateUpdatedEvent,
} from "../../generated/schema"

/* Funding rate/payment event
 */
export function handleFundingRateUpdated(event: FundingRateUpdated): void {
  let entity = new FundingRateUpdatedEvent(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
  entity.amm = event.address
  entity.rate = event.params.rate
  entity.underlyingPrice = event.params.underlyingPrice
  entity.save()
}
