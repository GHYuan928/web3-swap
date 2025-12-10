import React, { useState } from 'react'
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
import { convertFormDataToParams } from '../../utils/index'
import { useWriteContract } from 'wagmi'
import { abi, poolManagerAddr} from '../../abi'
import { FormData } from '../../interface/pool';
import { waitForTransactionReceipt } from '@wagmi/core'
import { config } from '../../wagmi-config'
import { toast } from 'react-toastify';

// 0x9869d74d53857c6e0d5f6414ba35e69c2cb6625f17022e98decd04d481af26e8

interface AddModalProps {
  open: boolean;
  handleClose: (flag?: boolean) => void;
}

interface FormErrors {
  token0?: string;
  // token0Amount?: string;
  token1?: string;
  // token1Amount?: string;
  fee?: string;
  tickLower?: string;
  tickUpper?: string;
  sqrtPriceX96?: string;
}

interface TouchedFields {
  token0: boolean;
  // token0Amount: boolean;
  token1: boolean;
  // token1Amount: boolean;
  fee: boolean;
  tickLower: boolean;
  tickUpper: boolean;
  sqrtPriceX96: boolean;
}

const AddModal: React.FC<AddModalProps> = ({ open, handleClose }) => {
  const writeContract = useWriteContract()
  const [loading, setLoading] = useState(false);
  // 表单数据
  const [formData, setFormData] = useState<FormData>({
    token0: '',
    // token0Amount: '',
    token1: '',
    // token1Amount: '',
    fee: '',
    tickLower: '',
    tickUpper: '',
    sqrtPriceX96: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  // 记录字段是否被触摸过（失焦过）
  const [touched, setTouched] = useState<TouchedFields>({
    token0: false,
    // token0Amount: false,
    token1: false,
    // token1Amount: false,
    fee: false,
    tickLower: false,
    tickUpper: false,
    sqrtPriceX96: false
  });

  // 验证以太坊地址（Uniswap V3 地址格式）
  const isValidEthereumAddress = (address: string): boolean => {
    // 以太坊地址正则表达式：0x 开头，后跟 40 个十六进制字符
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(address);
  };

  // 验证单个字段
  const validateField = (field: keyof FormData, value: string): string => {
    switch (field) {
      case 'token0':
      case 'token1':
        if (!value.trim()) {
          return `${field === 'token0' ? 'Token0' : 'Token1'} 地址不能为空`;
        }
        if (!isValidEthereumAddress(value)) {
          return '请输入有效的以太坊地址（0x开头，40位十六进制）';
        }
        if ((field === 'token0' && value === formData.token1) || (field === 'token1' && value === formData.token0)) {
          return 'token0 和 token1 地址不能相同';
        }
        return '';
      
      // case 'token0Amount':
      // case 'token1Amount':
      //   if (!value) {
      //     return `${field === 'token0Amount' ? 'Token0' : 'Token1'} 数量不能为空`;
      //   }
      //   if (Number(value) <= 0) {
      //     return `${field === 'token0Amount' ? 'Token0' : 'Token1'} 数量必须大于0`;
      //   }
      //   return '';
      
      case 'fee':
        if (!value) {
          return '请选择手续费费率';
        }
        return '';
      
      case 'tickLower':
        if (!value) {
          return '最低价格不能为空';
        }
        if (Number(value) <= 0) {
          return '最低价格必须大于0';
        }
        // 如果最高价格已输入，验证最低 < 最高
        if (formData.tickUpper && Number(value) >= Number(formData.tickUpper)) {
          return '最低价格必须小于最高价格';
        }
        return '';
      
      case 'tickUpper':
        if (!value) {
          return '最高价格不能为空';
        }
        if (Number(value) <= 0) {
          return '最高价格必须大于0';
        }
        // 如果最低价格已输入，验证最高 > 最低
        if (formData.tickLower && Number(value) <= Number(formData.tickLower)) {
          return '最高价格必须大于最低价格';
        }
        return '';
      
      case 'sqrtPriceX96':
        if (!value) {
          return '当前价格不能为空';
        }
        if (Number(value) <= 0) {
          return '当前价格必须大于0';
        }
        return '';
      
      default:
        return '';
    }
  };

  // 验证整个表单
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    Object.keys(formData).forEach((field) => {
      const key = field as keyof FormData;
      const error = validateField(key, formData[key] as string);
      if (error) {
        // @ts-ignore
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // 如果字段已被触摸过（失焦过），则实时验证
    // @ts-ignore
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [field]: error || undefined
      }));
      
      // 如果是价格字段，需要验证相关的另一个价格字段
      if ((field === 'tickLower' && touched.tickUpper) || (field === 'tickUpper' && touched.tickLower)) {
        const relatedField = field === 'tickLower' ? 'tickUpper' : 'tickLower';
        if (touched[relatedField] && formData[relatedField]) {
          const relatedError = validateField(relatedField, formData[relatedField]);
          setErrors(prev => ({
            ...prev,
            [relatedField]: relatedError || undefined
          }));
        }
      }
    }
  };

  // 失焦处理函数
  const handleBlur = (field: keyof FormData) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    
    const error = validateField(field, formData[field]);
    setErrors(prev => ({
      ...prev,
      [field]: error || undefined
    }));
    
    // 如果是价格字段，需要验证相关的另一个价格字段
    if (field === 'tickLower' && touched.tickUpper && formData.tickUpper) {
      const relatedError = validateField('tickUpper', formData.tickUpper);
      setErrors(prev => ({
        ...prev,
        tickUpper: relatedError || undefined
      }));
    } else if (field === 'tickUpper' && touched.tickLower && formData.tickLower) {
      const relatedError = validateField('tickLower', formData.tickLower);
      setErrors(prev => ({
        ...prev,
        tickLower: relatedError || undefined
      }));
    }
  };
  const submitToContract = async (data: any) => {
    setLoading(true)
    const h = await writeContract.mutateAsync({ 
          abi,
          address: poolManagerAddr,
          functionName: 'createAndInitializePoolIfNecessary',
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
    
    // 提交前标记所有字段为已触摸
    setTouched({
      token0: true,
      // token0Amount: true,
      token1: true,
      // token1Amount: true,
      fee: true,
      tickLower: true,
      tickUpper: true,
      sqrtPriceX96: true
    });
    
    if (validateForm()) {
      console.log('表单提交:', formData);
      // 转换
      const data = convertFormDataToParams(formData, 18, 18);
      console.log('转换后参数:', data);
      // submit
      
      try {
        submitToContract(data)
      } catch (error) {
        console.error('提交合约出错:', error);
        setLoading(false)
      }
    } else {
      console.log('表单验证失败');
    }
  };

  const handleCloseModal = () => {
    setFormData({
      token0: '',
      // token0Amount: '',
      token1: '',
      // token1Amount: '',
      fee: '',
      tickLower: '',
      tickUpper: '',
      sqrtPriceX96: ''
    });
    setErrors({});
    setTouched({
      token0: false,
      // token0Amount: false,
      token1: false,
      // token1Amount: false,
      fee: false,
      tickLower: false,
      tickUpper: false,
      sqrtPriceX96: false
    });
    setLoading(false)
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleCloseModal} maxWidth={"sm"} fullWidth>
      <DialogTitle>Add Pool</DialogTitle>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column' }}
      >
        <DialogContent>
          <FormLabel>Token0</FormLabel>
          <Box className="flex gap-3 mb-4">
            <TextField
              label="Token0 地址"
              required
              fullWidth
              value={formData.token0}
              onChange={(e) => handleInputChange('token0', e.target.value)}
              onBlur={() => handleBlur('token0')}
              error={touched.token0 && !!errors.token0}
              helperText={touched.token0 && errors.token0}
              placeholder="0x..."
            />
            {/* <TextField
              label="数量"
              type="number"
              required
              className="w-[140px]"
              slotProps={{ htmlInput: { min: 1, step: '1' }}}
              value={formData.token0Amount}
              onChange={(e) => handleInputChange('token0Amount', e.target.value)}
              onBlur={() => handleBlur('token0Amount')}
              error={touched.token0Amount && !!errors.token0Amount}
              helperText={touched.token0Amount && errors.token0Amount}
            /> */}
          </Box>
          
          <FormLabel>Token1</FormLabel>
          <Box className="flex gap-3 mb-4">
            <TextField
              label="Token1 地址"
              required
              fullWidth
              value={formData.token1}
              onChange={(e) => handleInputChange('token1', e.target.value)}
              onBlur={() => handleBlur('token1')}
              error={touched.token1 && !!errors.token1}
              helperText={touched.token1 && errors.token1}
              placeholder="0x..."
            />
            {/* <TextField
              label="数量"
              type="number"
              required
              className="w-[140px]"
              slotProps={{ htmlInput: { min: 1, step: '1' }}}
              value={formData.token1Amount}
              onChange={(e) => handleInputChange('token1Amount', e.target.value)}
              onBlur={() => handleBlur('token1Amount')}
              error={touched.token1Amount && !!errors.token1Amount}
              helperText={touched.token1Amount && errors.token1Amount}
            /> */}
          </Box>
         
          <FormLabel>手续费费率 Fee Tier</FormLabel>
          <Box className="mb-4">
            <FormControl required error={touched.fee && !!errors.fee}>
              <RadioGroup 
                row 
                value={formData.fee}
                onChange={(e) => {
                  handleInputChange('fee', e.target.value);
                  // 对于 RadioGroup，选择后立即标记为已触摸
                  if (!touched.fee) {
                    handleBlur('fee');
                  }
                }}
              >
                {[0.01, 0.05, 0.3, 1].map(fee => (
                  <FormControlLabel
                    key={fee}
                    value={fee.toString()}
                    control={<Radio />}
                    label={`${fee}%`}
                  />
                ))}
              </RadioGroup>
              {touched.fee && errors.fee && (
                <div style={{ color: '#d32f2f', fontSize: '0.75rem', marginLeft: '14px', marginTop: '3px' }}>
                  {errors.fee}
                </div>
              )}
            </FormControl>
          </Box>
          
          <FormLabel>价格区间</FormLabel>
          <Box className="flex gap-3 mb-4">
            <TextField
              label="最低"
              type="number"
              required
              fullWidth
              value={formData.tickLower}
              onChange={(e) => handleInputChange('tickLower', e.target.value)}
              onBlur={() => handleBlur('tickLower')}
              error={touched.tickLower && !!errors.tickLower}
              helperText={touched.tickLower && errors.tickLower}
              slotProps={{ htmlInput: { min: 0.000001, step: '0.000001' }}}
            />
            <TextField
              label="最高"
              type="number"
              required
              fullWidth
              value={formData.tickUpper}
              onChange={(e) => handleInputChange('tickUpper', e.target.value)}
              onBlur={() => handleBlur('tickUpper')}
              error={touched.tickUpper && !!errors.tickUpper}
              helperText={touched.tickUpper && errors.tickUpper}
              slotProps={{ htmlInput: { min: 0.000001, step: '0.000001' }}}
            />
          </Box>
          
          <FormLabel>当前价格</FormLabel>
          <Box className="flex">
            <TextField
              type="number"
              required
              fullWidth
              value={formData.sqrtPriceX96}
              onChange={(e) => handleInputChange('sqrtPriceX96', e.target.value)}
              onBlur={() => handleBlur('sqrtPriceX96')}
              error={touched.sqrtPriceX96 && !!errors.sqrtPriceX96}
              helperText={touched.sqrtPriceX96 && errors.sqrtPriceX96}
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