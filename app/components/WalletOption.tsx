'use client'
import React, {useState} from 'react'
import Button from '@mui/material/Button'
import { Connector, useConnect, useConnectors } from 'wagmi'
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import WalletModal from './WalletModal'
export function WalletOptions() {
  // 禁用自动连接，只允许手动连接
  const { mutate } = useConnect({
    mutation: {
      onSuccess: () => {
        console.log('连接成功')
      },
      onError: (err) => {
        console.error('连接失败', err)
      },
    }
  })
  const connectors = useConnectors()
  const [openModal, setOpenModal] = useState(false)

  return <div>
    <Button variant="contained" onClick={()=>setOpenModal(true)}>连接钱包</Button>
    <WalletModal isOpen={openModal} onClose={()=>setOpenModal(false)}>
      <List>
      {connectors.map((connector) => (
        <ListItem disablePadding key={connector.id}>
            <ListItemButton onClick={() => mutate({ connector })}>
              <ListItemIcon>
                <img src={connector.icon} className='w-8 h-8'/>
              </ListItemIcon>
              <ListItemText primary={connector.name} />
            </ListItemButton>
          </ListItem>
      ))}
      </List>
    </WalletModal>
  </div>
}
