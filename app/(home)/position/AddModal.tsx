import React, { useEffect, useMemo, useState } from 'react'
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import {convertFormDataToParams, tickToPrice, sqrtPriceX96ToPrice} from '../../utils/index'
import { useWriteContract, useReadContract, useConnection } from 'wagmi'
import { abi, poolManagerAddr, positionManagerAddr} from '../../abi'
import { FormData } from '../../interface/pool';
import { waitForTransactionReceipt } from '@wagmi/core'
import { config } from '../../wagmi-config'
import { toast } from 'react-toastify';
import usePairs from '@/app/hooks/usePairs';
import TokenAmountField from '@/app/components/TokenAmountField';
import {parseUnits} from 'viem'

interface AddModalProps {
  open: boolean;
  handleClose: (flag?: boolean) => void;
}



const AddModal: React.FC<AddModalProps> = ({ open, handleClose }) => {
  const { address } = useConnection()
  const writeContract = useWriteContract()
  const { paris ,pairToken0s, getPairToke1sFromToken0} = usePairs();
  // 获取交易池子
  const {data: pools} = useReadContract({
    abi,
    address: poolManagerAddr,
    functionName: 'getAllPools',
    args: [],
  }) as { data: Record<string,any>[] }

  const [loading, setLoading] = useState(false);
  // 表单数据
  const [formData, setFormData] = useState<FormData>({
    token0: '',
    token0Amount: '',
    token1: '',
    token1Amount: '',
    fee: '',
    tickLower: '',
    tickUpper: '',
    sqrtPriceX96: ''
  });
  const currentPool = useMemo(()=>{
    if(formData.token0 && formData.token1 && pools?.length) {
      const pool = pools?.find((p: any)=>{
        return ( (p.token0 === formData.token0 && p.token1 === formData.token1) || (p.token0 === formData.token1 && p.token1 === formData.token0) )
      })
      return pool;
    }
    return null
  },[formData.token0, formData.token1,pools])
  console.log('current Pool',currentPool)
  useEffect(()=>{
    if(currentPool){
      setFormData({
        ...formData,
        fee: currentPool.fee / 10000 + '',
        tickLower: tickToPrice(currentPool.tickLower,18,18).toFixed(4),
        tickUpper: tickToPrice(currentPool.tickUpper,18,18).toFixed(4),
        sqrtPriceX96: sqrtPriceX96ToPrice(currentPool.sqrtPriceX96,18,18).toFixed(4),
      })
    }
  },[currentPool])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };


  const submitToContract = async (data: any) => {
    setLoading(true)
    const h = await writeContract.mutateAsync({ 
          abi,
          address: positionManagerAddr,
          functionName: 'mint',
          args: data,
       })
    
    console.log('Transaction submitted, hash:', h);
    const receipt = await waitForTransactionReceipt(config,{hash:h})
    if(receipt.status === 'success'){
      toast.success('add Pool success')
      handleClose(true)
    }else {
      toast.error('add Pool error')
    }
    console.log('Transaction mined, receipt:', receipt);
    setLoading(false)
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('表单提交:', formData);
    // 转换
    const data:Record<string,any> = {};
    data.token0 = formData.token0;
    data.amount0Desired = parseUnits( formData.token0Amount!, 18)
    data.token1 = formData.token1;
    data.amount1Desired = parseUnits( formData.token1Amount!, 18)
    data.index = currentPool?.index;
    data.recipient = address;
    data.deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20)
    console.log('转换后参数:', data);
    // submit
    
    submitToContract([data])
  };

  const handleCloseModal = () => {
    setFormData({
      token0: '',
      token0Amount: '',
      token1: '',
      token1Amount: '',
      fee: '',
      tickLower: '',
      tickUpper: '',
      sqrtPriceX96: ''
    });

    setLoading(false)
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleCloseModal} maxWidth={"sm"} fullWidth>
      <DialogTitle>Add Position</DialogTitle>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column' }}
      >
        <DialogContent>
          <TokenAmountField
            label="Token 0"
            amount={formData.token0Amount||''}
            token={formData.token0}
            tokenList={pairToken0s||[]}
            onAmountChange={(val)=>{
              handleInputChange('token0Amount',val)
            }}
            onTokenChange={(val)=>{
              handleInputChange('token0',val)
            }}
          />
          
          <TokenAmountField
            label="Token 1"
            amount={formData.token1Amount||''}
            token={formData.token1}
            tokenList={getPairToke1sFromToken0(formData.token0)||[]}
            onAmountChange={(val)=>{
              handleInputChange('token1Amount',val)
            }}
            onTokenChange={(val)=>{
              handleInputChange('token1',val)
            }}
          />
         
          <FormLabel>手续费费率 Fee Tier</FormLabel>
          <Box className="mb-4">
            <FormControl required >
              <RadioGroup 
                row 
                value={formData.fee}
                onChange={(e) => {
                  handleInputChange('fee', e.target.value);
                }}
              >
                {[0.01, 0.05, 0.3, 1].map(fee => (
                  <FormControlLabel
                    key={fee}
                    disabled
                    value={fee.toString()}
                    control={<Radio />}
                    label={`${fee}%`}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
          
          <FormLabel>价格区间</FormLabel>
          <Box className="flex gap-3 mb-4">
            <TextField
              label="最低"
              type="number"
              disabled
              fullWidth
              value={formData.tickLower}
            />
            <TextField
              label="最高"
              type="number"
              disabled
              fullWidth
              value={formData.tickUpper}
            />
          </Box>
          
          <FormLabel>当前价格</FormLabel>
          <Box className="flex">
            <TextField
              type="number"
              required
              fullWidth
              disabled
              value={formData.sqrtPriceX96}
              onChange={(e) => handleInputChange('sqrtPriceX96', e.target.value)}
              slotProps={{ htmlInput: { min: 0.000001, step: '0.000001' }}}
            />
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button type="submit" variant="contained" loading={loading}>
            Confirm
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default AddModal