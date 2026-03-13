import type { MasterProfile, Service } from '~/types'

export const useMaster = () => {
  const master = ref<(MasterProfile & { profile: { full_name: string; username: string; avatar_url: string | null } }) | null>(null)
  const services = ref<Service[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMaster(username: string) {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<typeof master.value>(`/api/masters/${username}`)
      master.value = data
    }
    catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch master'
    }
    finally {
      loading.value = false
    }
  }

  async function fetchServices(masterId: string) {
    const data = await $fetch<Service[]>(`/api/master/services`, {
      params: { master_id: masterId },
    })
    services.value = data ?? []
  }

  return { master, services, loading, error, fetchMaster, fetchServices }
}
