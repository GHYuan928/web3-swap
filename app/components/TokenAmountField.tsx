'use client'
import React from 'react'
import {
  Box,
  TextField,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  FormHelperText,
} from '@mui/material'

export interface TokenOption {
  address: string
  symbol: string
  name?: string
}

export interface TokenAmountFieldProps {
  label: string
  amount: string
  token: string
  tokenList: TokenOption[]
  onAmountChange: (val: string) => void
  onTokenChange: (val: string) => void
  error?: string
  required?: boolean
}

export default function TokenAmountField({
  label,
  amount,
  token,
  tokenList,
  onAmountChange,
  onTokenChange,
  error,
  required = true,
}: TokenAmountFieldProps) {
  const hasError = Boolean(error)

  return (
    <Box className="flex gap-3 w-full " sx={{pb: 3}}>
      {/* 左侧 数量输入 */}
      <TextField
        className='flex-2'
        fullWidth
        label={`${label} 数量`}
        value={amount}
        required={required}
        error={hasError}
        onChange={(e) => onAmountChange(e.target.value)}
        type="number"
        slotProps={{ htmlInput: { min: 1, step: 1 }}}
        
      />

      {/* 右侧 Token 选择 */}
      <FormControl className='flex-1' fullWidth required={required} error={hasError}>
        <InputLabel>{label} Token</InputLabel>
        <Select
          label={`${label} Token`}
          value={token}
          onChange={(e) => onTokenChange(e.target.value as string)}
        >
          {tokenList.map((t) => (
            <MenuItem key={t.address} value={t.address}>
              {t.symbol}
            </MenuItem>
          ))}
        </Select>
        {hasError && <FormHelperText>{error}</FormHelperText>}
      </FormControl>
    </Box>
  )
}
