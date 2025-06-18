import { nextID } from '../helpers/nextID'
import { Reward } from '../db/types'

import { normalizePositionAfterDeletion } from '../helpers/positionNormalizer'
import { useValidations } from '../helpers/useValidations'
const { validateExistance, validateTitle, validateCost, validateBalance } = useValidations()

import { useUser } from './useUser'
const { removeBalance } = useUser()

export function useRewards() {
  const addReward = (addedReward: Reward, allRewards: Reward[]) => {
    const titleValid = validateTitle(addedReward.title)
    const costValid = validateCost(addedReward.cost)

    if (!titleValid || !costValid) return { titleValid, costValid, updatedRewards: allRewards }

    const nextId = nextID(allRewards)
    const nextPosition = allRewards.length

    const newReward = {
      id: nextId,
      title: addedReward.title,
      cost: addedReward.cost,
      repeatable: addedReward.repeatable,
      position: nextPosition,
    }

    const updatedRewards = [...allRewards, newReward]

    return { titleValid, costValid, updatedRewards }
  }

  const editReward = (editedReward: Reward, allRewards: Reward[]) => {
    const rewardExists = validateExistance(editedReward.id, allRewards)
    const titleValid = validateTitle(editedReward.title)
    const costValid = validateCost(editedReward.cost)

    if (!rewardExists || !titleValid || !costValid)
      return { rewardExists, titleValid, costValid, updatedRewards: allRewards }

    const updatedRewards = allRewards.map((reward) => {
      if (reward.id === editedReward.id) {
        return {
          ...reward,
          title: editedReward.title,
          cost: editedReward.cost,
          repeatable: editedReward.repeatable,
        }
      }
      return { ...reward }
    })

    return { rewardExists, titleValid, costValid, updatedRewards }
  }

  const deleteReward = (rewardId: number, allRewards: Reward[]) => {
    const rewardExists = validateExistance(rewardId, allRewards)
    if (!rewardExists) return { rewardExists, updatedRewards: allRewards }

    // validation returns reward object if it exists
    const updatedRewardsPreNormalizing = allRewards.filter(
      (reward) => reward.id !== rewardExists.id,
    )

    const updatedRewardsNormalized = normalizePositionAfterDeletion(
      updatedRewardsPreNormalizing,
      rewardExists.position,
    )

    const updatedRewards = updatedRewardsNormalized

    return { rewardExists, updatedRewards }
  }

  const unlockReward = (
    rewardToUnlock: Reward,
    allRewards: Reward[],
    balance: number,
    rewards_unlocked: number,
  ) => {
    const rewardExists = validateExistance(rewardToUnlock.id, allRewards)
    const enoughBalance = validateBalance(balance, rewardToUnlock.cost)
    if (!rewardExists || !enoughBalance)
      return {
        rewardExists,
        enoughBalance,
        updatedRewards: allRewards,
        updatedRewards_unlocked: rewards_unlocked,
        updatedBalance: balance,
      }

    const updatedRewards_unlocked = rewards_unlocked + 1
    const updatedBalance = removeBalance(balance, rewardToUnlock.cost)

    const updatedRewards = rewardToUnlock.repeatable
      ? allRewards
      : deleteReward(rewardToUnlock.id, allRewards).updatedRewards

    return {
      rewardExists,
      enoughBalance,
      updatedRewards,
      updatedRewards_unlocked,
      updatedBalance,
    }
  }

  return {
    addReward,
    editReward,
    deleteReward,
    unlockReward,
  }
}
