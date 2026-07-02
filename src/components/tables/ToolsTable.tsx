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
import { Tool } from '@/types';
import { useI18n, dict } from '@/lib/i18n';
import { truncate, getDomainLabel, getDomainColor } from '@/lib/utils';

interface ToolsTableProps {
  tools: Tool[];
}

export default function ToolsTable({ tools }: ToolsTableProps) {
  const { lang, t } = useI18n();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo<ColumnDef<Tool>[]>(
    () => [
      {
        accessorKey: 'name',
        header: dict['table.name'][lang],
        cell: ({ row }) => (
          <span className="font-medium text-sm">{row.original.name}</span>
        ),
      },
      {
        accessorKey: 'domain',
        header: dict['table.domain'][lang],
        cell: ({ row }) => {
          const domain = row.original.domain;
          return (
            <span
              className="inline-block px-2 py-0.5 rounded text-xs font-medium"
              style={{
                backgroundColor: getDomainColor(domain) + '20',
                color: getDomainColor(domain),
              }}
            >
              {getDomainLabel(domain, lang)}
            </span>
          );
        },
      },
      {
        id: 'summary',
        header: dict['table.summary'][lang],
        accessorFn: (row) => t(row.description),
        cell: ({ row }) => (
          <span className="text-xs whitespace-normal break-words leading-snug" style={{ color: 'var(--muted)' }}>
            {t(row.original.description)}
          </span>
        ),
      },
      {
        id: 'stars',
        header: dict['table.stars'][lang],
        accessorFn: (row) => row.stars,
        cell: ({ row }) => {
          const s = row.original;
          if (!s.githubUrl || s.stars == null) return <span className="text-xs" style={{ color: 'var(--muted)' }}>-</span>;
          return (
            <span className="text-xs font-mono font-medium whitespace-nowrap" style={{ color: getDomainColor('genomics') }}>
              ⭐ {s.stars.toLocaleString()}
            </span>
          );
        },
      },
      {
        id: 'link',
        header: dict['table.link'][lang],
        cell: ({ row }) => {
          const url = row.original.githubUrl;
          return url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs no-underline hover:opacity-80 transition-opacity"
              style={{ color: 'var(--primary)' }}
            >
              GitHub
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          ) : (
            <span className="text-xs" style={{ color: 'var(--muted)' }}>-</span>
          );
        },
        enableSorting: false,
      },
    ],
    [lang]
  );

  const table = useReactTable({
    data: tools,
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
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder={dict['table.search'][lang]}
          className="h-8 px-3 rounded-lg text-sm border bg-transparent outline-none w-48 transition-colors focus:border-[var(--primary)]"
          style={{ borderColor: 'var(--border)', color: 'var(--fg)' }}
        />
      </div>

      {/* Table */}
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

      {/* Pagination */}
      <div className="flex items-center justify-between mt-3 text-xs" style={{ color: 'var(--muted)' }}>
        <span>
          {table.getFilteredRowModel().rows.length} / {tools.length} items
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
