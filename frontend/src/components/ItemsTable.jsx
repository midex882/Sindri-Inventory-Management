import { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table'
import { ArrowUpDown, ArrowUp, ArrowDown, Pencil, Trash2, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDeleteItem } from '../hooks/useItems'

export default function ItemsTable({ data = [], globalFilter, onEdit }) {
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const navigate = useNavigate()
  const { isAdmin, isEditor } = useAuth()
  const deleteItem = useDeleteItem()

  const columns = useMemo(() => [
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => (
        <span className="font-medium text-[var(--color-text)]">
          {row.original.nombre}
        </span>
      )
    },
    {
      accessorKey: 'categoria',
      header: 'Categoría',
      cell: ({ getValue }) => (
        <span
          className="px-2 py-0.5 rounded-full text-xs font-medium"
          style={{
            background: 'var(--color-primary-highlight)',
            color: 'var(--color-primary)'
          }}
        >
          {getValue()}
        </span>
      )
    },
    {
      accessorKey: 'material',
      header: 'Material',
      cell: ({ getValue }) => (
        <span className="text-sm text-[var(--color-text-muted)]">{getValue() ?? '—'}</span>
      )
    },
    {
      accessorKey: 'localizacion',
      header: 'Localización',
      cell: ({ getValue }) => (
        <span className="text-sm text-[var(--color-text-muted)]">{getValue()}</span>
      )
    },
    {
      accessorKey: 'cantidad',
      header: 'Cantidad',
      cell: ({ getValue }) => (
        <span
          className="font-semibold tabular-nums"
          style={{
            color: getValue() === 0
              ? 'var(--color-error)'
              : getValue() < 5
              ? 'var(--color-warning)'
              : 'var(--color-success)'
          }}
        >
          {getValue()}
        </span>
      )
    },
    {
      accessorKey: 'imagen_url',
      header: 'Imagen',
      enableSorting: false,
      cell: ({ getValue }) => getValue() ? (
        <img
          src={getValue()}
          alt="artículo"
          width={56}
          height={56}
          loading="lazy"
          className="rounded-md object-cover"
          style={{ width: 56, height: 56 }}
        />
      ) : (
        <div
          className="rounded-md flex items-center justify-center text-xs"
          style={{
            width: 56, height: 56,
            background: 'var(--color-surface-offset)',
            color: 'var(--color-text-faint)'
          }}
        >
          —
        </div>
      )
    },  
    {
      id: 'acciones',
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={() => navigate(`/items/${row.original.id}`)}
            className="p-1.5 rounded-md transition-colors hover:bg-[var(--color-surface-offset)]"
            title="Ver detalle"
          >
            <Eye size={14} className="text-[var(--color-text-muted)]" />
          </button>
          {isEditor && (
            <button
              onClick={() => onEdit(row.original)}
              className="p-1.5 rounded-md transition-colors hover:bg-[var(--color-surface-offset)]"
              title="Editar"
            >
              <Pencil size={14} className="text-[var(--color-text-muted)]" />
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => {
                if (confirm(`¿Eliminar "${row.original.nombre}"?`)) {
                  deleteItem.mutate(row.original.id)
                }
              }}
              className="p-1.5 rounded-md transition-colors hover:bg-[var(--color-surface-offset)]"
              title="Eliminar"
            >
              <Trash2 size={14} className="text-[var(--color-error)]" />
            </button>
          )}
        </div>
      )
    }
  ], [isAdmin, isEditor, navigate, onEdit])

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium tracking-wide"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {header.column.getCanSort() ? (
                      <button
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex items-center gap-1.5 hover:text-[var(--color-text)] transition-colors"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc'
                          ? <ArrowUp size={12} />
                          : header.column.getIsSorted() === 'desc'
                          ? <ArrowDown size={12} />
                          : <ArrowUpDown size={12} className="opacity-40" />
                        }
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    No hay artículos que coincidan con los filtros
                  </p>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  style={{
                    background: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-2)',
                    borderBottom: '1px solid var(--color-divider)',
                    transition: 'background 150ms'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-offset)'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-2)'}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}