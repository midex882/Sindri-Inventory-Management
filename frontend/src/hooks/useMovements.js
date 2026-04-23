import { useQuery } from '@tanstack/react-query'
import { movementsApi } from '../services/api'

export function useMovements(itemId) {
  return useQuery({
    queryKey: ['movements', itemId],
    queryFn: () => movementsApi.getByItem(itemId).then(r => r.data),
    enabled: !!itemId,
  })
}