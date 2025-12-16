import {useState, useImperativeHandle, forwardRef, useEffect} from 'react'
import { Box, ToggleButton, ToggleButtonGroup, TextField } from '@mui/material'


type Option = {
  name: string,
  value: number
}
interface SlippageSelectorProps {
  options: Option[]
  onValueChange:(n:number)=>void
  defaultValue?: number;
}
const SlippageSelector = ({defaultValue,options, onValueChange}:SlippageSelectorProps) => {
  const [option, setOption] = useState<string|null>(null)
  useEffect(()=>{
    const v= defaultValue|| options?.[0].value
    const vstring =v ? String(v) : ''
    setOption(vstring)
    onValueChange(v)
  },[options, defaultValue])
  const [customValue, setCustomValue] = useState('')
  const handleOptionChange = (
    _: React.MouseEvent<HTMLElement>,
    value: string,
  ) => {
    setOption(value);
    setCustomValue('')
    onValueChange(Number(value))
    
  };
  const handleCustomChange = (value: string) => {
    setCustomValue(value)
    setOption(null) // 一输入 → 取消所有预设
    onValueChange(Number(value)* 0.01)
  }
  return (
    <Box className="flex items-center" gap={1}>
      <ToggleButtonGroup
        value={option}
        exclusive
        onChange={handleOptionChange}
        color="primary"
        size="small"
      >
      {
        options?.map(p=> <ToggleButton className='w-[46px]' key={p.value} value={`${p.value}`}>{p.name}</ToggleButton>)
      }
      </ToggleButtonGroup>
      <TextField
        size="small"
        value={customValue}
        onChange={(e) => handleCustomChange(e.target.value)}
        slotProps={{
          htmlInput: {
            inputMode: 'decimal',
            pattern: '[0-9.]*', 

          },
          input: {
            endAdornment: (<span>{'%'}</span>),
          }
        }}
        sx={{ 
          width: 90 ,
          '& .MuiInputBase-input': {
            color: 'primary.main',
          }}}
      />
    </Box>
  )
}

export default SlippageSelector
