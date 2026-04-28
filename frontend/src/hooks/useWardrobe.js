import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { wardrobeApi } from '../services/api'

export function useWardrobe(params) {
  return useQuery({
    queryKey: ['wardrobe', params],
    queryFn: () => wardrobeApi.list(params).then(r => r.data),
  })
}

export function useCreatePrenda() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (formData) => wardrobeApi.create(formData).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wardrobe'] }),
  })
}

export function useUpdatePrenda() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, formData }) => wardrobeApi.update(id, formData).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wardrobe'] }),
  })
}

export function useDeletePrenda() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => wardrobeApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wardrobe'] }),
  })
}