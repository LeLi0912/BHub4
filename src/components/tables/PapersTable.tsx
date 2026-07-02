'use client';

import { useState, useMemo, useRef } from 'react';
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
import { Paper } from '@/types';
import { useI18n, dict } from '@/lib/i18n';

interface PapersTableProps {
  papers: Paper[];
}

export default function PapersTable({ papers }: PapersTableProps) {
  const { lang, t } = useI18n();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo<ColumnDef<Paper>[]>(
    () => [
      {
        id: 'title',
        header: dict['table.title'][lang],
        cell: ({ row }) => (
          <span className="text-sm whitespace-normal break-words leading-snug">
            {row.original.title.en}
          </span>
        ),
      },
      {
        accessorKey: 'journal',
        header: dict['table.journal'][lang],
        cell: ({ row }) => (
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            {row.original.journal}
          </span>
        ),
      },
      {
        accessorKey: 'citations',
        header: dict['table.citations'][lang],
        cell: ({ row }) => (
          <span className="text-xs font-medium">{row.original.citations.toLocaleString()}</span>
        ),
      },
      {
        id: 'link',
        header: dict['table.link'][lang],
        cell: ({ row }) => (
          <a
            href={row.original.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs no-underline hover:opacity-80 transition-opacity"
            style={{ color: 'var(--primary)' }}
          >
            DOI
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        ),
        enableSorting: false,
      },
    ],
    [lang]
  );

  const table = useReactTable({
    data: papers,
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
          {table.getFilteredRowModel().rows.length} / {papers.length} items
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
