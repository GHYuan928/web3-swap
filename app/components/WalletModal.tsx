import React from 'react'

interface WalletModalProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
}

const WalletModal = ({ isOpen, onClose,children}: WalletModalProps) => {
    if (!isOpen) {
        return null
    }

    return (
        <div onClick={onClose} className='fixed top-0 left-0 w-full h-full bg-black/50 bg-opacity-50 shadow-lg z-99 flex items-center justify-center'>
            <div className='bg-white p-8 rounded-md shadow-lg'>
                <h2 className='text-2xl font-bold mb-4'>Connect Wallet</h2>
                <div className='space-y-3 max-h-[60vh] overflow-auto pr-1'>
                    {children}
                </div>
            </div>
        </div>
    )
}

export default WalletModal 
