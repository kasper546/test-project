<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Управление учетными записями</h2>
      <button class="btn btn-primary" @click="addAccount">
        + Добавить учетную запись
      </button>
    </div>

    <div class="mb-3">
      <small class="text-muted">
        Метка: вводите текстовые метки через знак ; (максимум 50 символов)
      </small>
    </div>

    <div v-for="account in accounts" :key="account.id" class="card mb-3">
      <div class="card-body">
        <div class="row">
          <!-- Метка -->
          <div class="col-md-3 mb-3">
            <label class="form-label">Метка</label>
            <input
              v-model="account.label"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors[account.id]?.label }"
              maxlength="50"
              @blur="validateAccount(account)"
              placeholder="метка1;метка2"
            >
            <div v-if="errors[account.id]?.label" class="invalid-feedback">
              {{ errors[account.id]?.label }}
            </div>
          </div>

          <!-- Тип записи -->
          <div class="col-md-2 mb-3">
            <label class="form-label">Тип записи</label>
            <select
              v-model="account.type"
              class="form-select"
              :class="{ 'is-invalid': errors[account.id]?.type }"
              @change="onTypeChange(account)"
            >
              <option value="Локальная">Локальная</option>
              <option value="LDAP">LDAP</option>
            </select>
            <div v-if="errors[account.id]?.type" class="invalid-feedback">
              {{ errors[account.id]?.type }}
            </div>
          </div>

          <!-- Логин -->
          <div class="col-md-3 mb-3">
            <label class="form-label">Логин *</label>
            <input
              v-model="account.login"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors[account.id]?.login }"
              maxlength="100"
              @blur="validateAccount(account)"
              placeholder="Введите логин"
            >
            <div v-if="errors[account.id]?.login" class="invalid-feedback">
              {{ errors[account.id]?.login }}
            </div>
          </div>

          <!-- Пароль (только для локальных) -->
          <div v-if="account.type === 'Локальная'" class="col-md-3 mb-3">
            <label class="form-label">Пароль *</label>
            <input
              v-model="account.password"
              type="password"
              class="form-control"
              :class="{ 'is-invalid': errors[account.id]?.password }"
              maxlength="100"
              @blur="validateAccount(account)"
              placeholder="Введите пароль"
            >
            <div v-if="errors[account.id]?.password" class="invalid-feedback">
              {{ errors[account.id]?.password }}
            </div>
          </div>

          <!-- Кнопка удаления -->
          <div class="col-md-1 mb-3 d-flex align-items-end">
            <button
              class="btn btn-danger"
              @click="removeAccount(account.id)"
              title="Удалить учетную запись"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAccountsStore, type Account } from '@/stores/accounts'

const store = useAccountsStore()
const errors = ref<Record<string, Partial<Record<keyof Account, string>>>>({})

const accounts = computed(() => store.accounts)

const addAccount = () => {
  store.addAccount()
}

const removeAccount = (id: string) => {
  store.removeAccount(id)
  delete errors.value[id]
  store.saveToLocalStorage()
}

const onTypeChange = (account: Account) => {
  if (account.type === 'LDAP') {
    account.password = null
  } else if (account.type === 'Локальная' && account.password === null) {
    account.password = ''
  }
  validateAccount(account)
}

const validateAccount = (account: Account) => {
  const accountErrors: Partial<Record<keyof Account, string>> = {}

  if (account.login.trim().length === 0) {
    accountErrors.login = 'Логин обязателен для заполнения'
  }

  if (account.type === 'Локальная') {
    if (!account.password || account.password.trim().length === 0) {
      accountErrors.password = 'Пароль обязателен для локальных учетных записей'
    }
  }

  if (Object.keys(accountErrors).length > 0) {
    errors.value[account.id] = accountErrors
  } else {
    delete errors.value[account.id]
    // Преобразование метки в массив объектов
    const labels = account.label.split(';')
      .filter(label => label.trim())
      .map(label => ({ text: label.trim() }))
    
    console.log('Сохраненные метки:', labels)
    store.saveToLocalStorage()
  }
}

onMounted(() => {
  store.loadFromLocalStorage()
})
</script>