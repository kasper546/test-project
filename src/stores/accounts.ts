import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Account {
  id: string
  label: string
  type: 'LDAP' | 'Локальная'
  login: string
  password: string | null
}

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref<Account[]>([])

  const addAccount = () => {
    const newAccount: Account = {
      id: Date.now().toString(),
      label: '',
      type: 'Локальная',
      login: '',
      password: ''
    }
    accounts.value.push(newAccount)
  }

  const removeAccount = (id: string) => {
    accounts.value = accounts.value.filter(account => account.id !== id)
  }

  const updateAccount = (id: string, updates: Partial<Account>) => {
    const index = accounts.value.findIndex(account => account.id === id)
    if (index !== -1) {
      accounts.value[index] = { ...accounts.value[index], ...updates }
    }
  }

  const saveToLocalStorage = () => {
    localStorage.setItem('accounts', JSON.stringify(accounts.value))
  }

  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem('accounts')
    if (saved) {
      accounts.value = JSON.parse(saved)
    }
  }

  return {
    accounts,
    addAccount,
    removeAccount,
    updateAccount,
    saveToLocalStorage,
    loadFromLocalStorage
  }
})