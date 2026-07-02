'use client';

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  flexRender,
} from '@tanstack/react-table';
import { Algorithm } from '@/types';
import { useI18n, dict } from '@/lib/i18n';

interface AlgorithmsTableProps {
  algorithms: Algorithm[];
  onCompare: (ids: string[]) => void;
}

export default function AlgorithmsTable({ algorithms, onCompare }: AlgorithmsTableProps) {
  const { lang, t } = useI18n();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === algorithms.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(algorithms.map((a) => a.id)));
    }
  };

  const columns = useMemo<ColumnDef<Algorithm>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            checked={selected.size === algorithms.length && algorithms.length > 0}
            onChange={toggleAll}
            className="rounded cursor-pointer"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selected.has(row.original.id)}
            onChange={() => toggleSelect(row.original.id)}
            className="rounded cursor-pointer"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'name',
        header: dict['table.name'][lang],
        cell: ({ row }) => (
          <span className="font-medium text-sm">{row.original.name}</span>
        ),
      },
      {
        id: 'summary',
        header: dict['table.summary'][lang],
        cell: ({ row }) => (
          <span className="text-xs whitespace-normal break-words leading-snug" style={{ color: 'var(--muted)' }}>
            {t(row.original.description)}
          </span>
        ),
      },
      {
        id: 'stars',
        header: dict['table.stars'][lang],
        cell: ({ row }) => {
          const a = row.original;
          if (!a.githubUrl || a.stars == null) return <span className="text-xs" style={{ color: 'var(--muted)' }}>-</span>;
          return <span className="text-xs font-mono font-medium whitespace-nowrap" style={{ color: '#3B82F6' }}>⭐ {a.stars.toLocaleString()}</span>;
        },
        enableSorting: false,
      },
      {
        id: 'link',
        header: dict['table.link'][lang],
        cell: ({ row }) => {
          const a = row.original;
          if (a.githubUrl) {
            return (
              <a
                href={a.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs no-underline hover:opacity-80"
                style={{ color: 'var(--primary)' }}
              >
                GitHub ↗
              </a>
            );
          } else if (a.paperUrl) {
            return (
              <a
                href={a.paperUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs no-underline hover:opacity-80"
                style={{ color: 'var(--primary)' }}
              >
                Paper ↗
              </a>
            );
          }
          return <span className="text-xs" style={{ color: 'var(--muted)' }}>-</span>;
        },
        enableSorting: false,
      },
    ],
    [lang, selected, algorithms]
  );

  const table = useReactTable({
    data: algorithms,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <input
          type="text"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder={dict['table.search'][lang]}
          className="h-8 px-3 rounded-lg text-sm border bg-transparent outline-none w-48 transition-colors focus:border-[var(--primary)]"
          style={{ borderColor: 'var(--border)', color: 'var(--fg)' }}
        />
        {selected.size >= 2 && (
          <button
            onClick={() => onCompare(Array.from(selected))}
            className="h-8 px-3 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90 flex items-center gap-1"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {dict['table.compare'][lang]} ({selected.size})
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--border)' }}>
        <table className="table-base">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="text-xs">
                          {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted() as string] ?? ' ↕'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} style={{ borderColor: 'var(--border)' }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-3 text-xs" style={{ color: 'var(--muted)' }}>
        <span>
          {table.getFilteredRowModel().rows.length} / {algorithms.length} items
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="h-7 px-2 rounded border text-xs disabled:opacity-30 transition-colors hover:bg-[var(--border)]"
            style={{ borderColor: 'var(--border)' }}
          >
            {'<<'}
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-7 px-2 rounded border text-xs disabled:opacity-30 transition-colors hover:bg-[var(--border)]"
            style={{ borderColor: 'var(--border)' }}
          >
            {'<'}
          </button>
          <span className="px-2">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-7 px-2 rounded border text-xs disabled:opacity-30 transition-colors hover:bg-[var(--border)]"
            style={{ borderColor: 'var(--border)' }}
          >
            {'>'}
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="h-7 px-2 rounded border text-xs disabled:opacity-30 transition-colors hover:bg-[var(--border)]"
            style={{ borderColor: 'var(--border)' }}
          >
            {'>>'}
          </button>
        </div>
      </div>
    </div>
  );
}
