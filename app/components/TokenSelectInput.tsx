import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

interface TokenSelectInputProps {
  token: Record<string,any>|undefined
  tokenSource: Record<string,any>[]|undefined
  amount: string|number;
  onSelect: (t: Record<string,any>)=>void
  onChangeAmount?: (s:string)=>void
  onBlurAmount?: (s:string)=>void
  children?: React.ReactNode
}
const TokenSelectInput = ({amount,token, tokenSource, onChangeAmount,onBlurAmount, onSelect, children}:TokenSelectInputProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement|null>(null);
  
  const onCloseMenu = ()=>{
    setAnchorEl(null)
  }
  return (
    <Box className="p-4 border border-gray-200 rounded-2xl hover:border-blue-200">
      <TextField
        fullWidth
        variant="standard"
        value={amount}
        onChange={(e) => onChangeAmount?.(e.target.value)}
        onBlur={(e)=> onBlurAmount?.(e.target.value)}
        placeholder="0.0"
        type="number"
        slotProps={{
          input: {
            disableUnderline: true,
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  size="small"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  className="flex items-center shadow-1 rounded-xl px-4 py-2"
                >
                  <span>{token?.symbol}</span>
                  <KeyboardArrowDownIcon />
                </Button>
              </InputAdornment>
              ),
            },
        }}
        sx={{
          '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
            WebkitAppearance: 'none',
            margin: 0,
          },
          '& input[type=number]': {
            MozAppearance: 'textfield',
          },
        }}
      />
      {children}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        slotProps={{
          paper: {
            style: {
              maxHeight: 240,
              width: '20ch',
            },
          },
          list: {
            'aria-labelledby': 'long-button',
          },
        }}
        onClose={onCloseMenu}
      >
        {(tokenSource||[]).map((t,i) => (
          <MenuItem
            key={`${t.symbol}-${i}`}
            onClick={()=>{
              onSelect && onSelect(t)
              onCloseMenu()
            }}
          >
            {t.symbol}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}

export default TokenSelectInput
