<script setup>
import { onMounted } from 'vue'
import { useUser } from '../helpers/db_functions/useUser'

const { balance, getBalance, onBalanceUpdate } = useUser()

onMounted(async () => {
  getBalance()

  onBalanceUpdate(() => {
    getBalance()
  })
})
</script>

<template>
  <div class="balanceWrapper">
    <img
      src="../assets/crystal.png"
      alt="Crystal Symbol"
    />
    <p class="balance">
      {{ balance }}
    </p>
  </div>
</template>
