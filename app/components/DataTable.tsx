'use client'
import React, { useState, useMemo, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  TablePagination,
  TableFooter,
} from '@mui/material'
import type { SxProps, Theme } from '@mui/material'

export interface Column<T = any> {
  title: string
  dataIndex: string
  key?: string
  align?: 'left' | 'center' | 'right'
  width?: number | string
  minWidth?: number
  render?: (value: any, record: T, index: number) => React.ReactNode
  sorter?: (a: T, b: T) => number
}

export interface DataTableProps<T = any> {
  columns: Column<T>[]
  dataSource: T[]
  rowKey?: string | ((record: T) => string)
  pagination?: boolean | {
    pageSize?: number
    pageSizeOptions?: number[]
    current?: number
    total?: number
    onChange?: (page: number, pageSize: number) => void
  }
  loading?: boolean
  stickyHeader?: boolean
  size?: 'small' | 'medium'
  maxHeight?: number // ✨支持自定义最大高度
  sx?: SxProps<Theme>
  header?: React.ReactNode
  emptyText?: React.ReactNode
}

function DataTable<T extends Record<string, any> = any>({
  columns,
  dataSource,
  rowKey = 'id',
  pagination = true,
  loading = false,
  size = 'medium',
  stickyHeader = true,
  maxHeight = 550,
  sx,
  header,
  emptyText = '暂无数据'
}: DataTableProps<T>) {

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(
    typeof pagination === 'object' && pagination.pageSize ? pagination.pageSize : 10
  )
  const [orderBy, setOrderBy] = useState<string | null>(null)
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')

  const getRowKey = (record: T, index: number) =>
    typeof rowKey === 'function'
      ? rowKey(record)
      : record[rowKey]?.toString() || index.toString()

  const handleSort = (column: Column<T>) => {
    if (!column.sorter) return
    const isAsc = orderBy === column.dataIndex && order === 'asc'
    setOrderBy(column.dataIndex)
    setOrder(isAsc ? 'desc' : 'asc')
  }

  const sortedData = useMemo(() => {
    if (!orderBy) return dataSource
    const column = columns.find(col => col.dataIndex === orderBy)
    if (!column?.sorter) return dataSource
    const sorted = [...dataSource].sort(column.sorter)
    return order === 'asc' ? sorted : sorted.reverse()
  }, [dataSource, orderBy, order, columns])

  const paginatedData = useMemo(() => {
    if (pagination === false) return sortedData
    const start = page * rowsPerPage
    return sortedData.slice(start, start + rowsPerPage)
  }, [sortedData, page, rowsPerPage, pagination])

  useEffect(() => {
    // 切换排序时回到第一页
    setPage(0)
  }, [order, orderBy])

  const paginationConfig = typeof pagination === 'object' ? pagination : {}
  const pageSizeOptions = paginationConfig.pageSizeOptions || [5, 10, 20, 50]
  const total = paginationConfig.total ?? dataSource.length

  const handleChangePage = (_: any, newPage: number) => setPage(newPage)
  const handleChangeRowsPerPage = (e: any) => {
    setRowsPerPage(parseInt(e.target.value, 10))
    setPage(0)
  }

  // ✨ 自动生成 minWidth 触发横向滚动
  const tableMinWidth =
    columns.reduce((sum, col) => sum + (col.minWidth || 150), 0)

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', ...sx }}>
      {header}

      <TableContainer
        sx={{ maxHeight, overflow: 'auto' }} // 双向滚动支持
      >
        <Table
          stickyHeader={stickyHeader}
          size={size}
          sx={{ minWidth: tableMinWidth }}
        >
          <TableHead >
            <TableRow >
              {columns.map(col => (
                <TableCell
                  key={col.key || col.dataIndex}
                  align={col.align || 'left'}
                  className=' bg-gray-50'
                  onClick={() => col.sorter && handleSort(col)}
                  sx={{
                    fontWeight: 'bold',
                    minWidth: col.minWidth || 150,
                    cursor: col.sorter ? 'pointer' : 'default',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {col.title}
                  {col.sorter && orderBy === col.dataIndex &&
                    <span style={{ marginLeft: 4 }}>
                      {order === 'asc' ? '↑' : '↓'}
                    </span>
                  }
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={columns.length} align="center">加载中...</TableCell></TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow><TableCell colSpan={columns.length} align="center">{emptyText}</TableCell></TableRow>
            ) : (
              paginatedData.map((row, i) => (
                <TableRow hover key={getRowKey(row, i)}>
                  {columns.map(col => (
                    <TableCell
                      key={col.key || col.dataIndex}
                      align={col.align || 'left'}
                      sx={{
                        maxWidth: col.width || 200,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {col.render
                        ? col.render(row[col.dataIndex], row, page * rowsPerPage + i)
                        : row[col.dataIndex]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ✨分页独立，不随横向滚动 */}
      {pagination !== false && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <TablePagination
            rowsPerPageOptions={pageSizeOptions}
            count={total}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="每页："
            component="div"
          />
        </Box>
      )}
    </Paper>
  )
}

export default DataTable
