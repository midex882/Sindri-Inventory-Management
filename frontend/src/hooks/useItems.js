import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { itemsApi } from '../services/api'

export function useItems(filters = {}) {
  return useQuery({
    queryKey: ['items', filters],
    queryFn: () => itemsApi.getAll(filters).then(r => r.data),
    staleTime: 1000 * 30,
  })
}

export function useItem(id) {
  return useQuery({
    queryKey: ['items', id],
    queryFn: () => itemsApi.getOne(id).then(r => r.data),
    enabled: !!id,
  })
}

export function useCreateItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => itemsApi.create(data).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
  })
}

export function useUpdateItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => itemsApi.update(id, data).then(r => r.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      queryClient.invalidateQueries({ queryKey: ['items', id] })
      queryClient.invalidateQueries({ queryKey: ['movements', id] })
    },
  })
}

export function useDeleteItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => itemsApi.delete(id).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
  })
}

export function useUploadImage() {
  return useMutation({
    mutationFn: (file) => itemsApi.uploadImage(file).then(r => r.data),
  })
}