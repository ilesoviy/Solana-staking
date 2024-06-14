import {
    WalletDialogProvider as MaterialUIWalletDialogProvider,
    WalletMultiButton as MaterialUIWalletMultiButton,
    WalletConnectButton
} from '@solana/wallet-adapter-material-ui';

import { RiMenuFoldLine } from "react-icons/ri";
import { RiMenuLine } from "react-icons/ri";

import { useGlobalContext } from '../providers/GlobalProvider';

export default function Header() {

    const { showNav, showNavFunc } = useGlobalContext();

    return (
        <div className='header dark:bg-gradient-to-r from-white to to-white bg-[linear-gradient(127deg,_rgba(6,_11,_40,_0.74)_28.26%,_rgba(10,_14,_35,_0.71)_91.2%)] flex justify-end items-center'>
            {/* <RiMenuLine className={`hidden xs:flex text-white dark:text-black w-6 h-6`} onClick={() => {showNavFunc(true)}}/> */}
            <MaterialUIWalletMultiButton variant="text" style={{
                display: "flex",
                padding: "8px 20px",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                borderRadius: "8px",
                background: "#4628FF",
                color: 'white'
                
                // border: "2px solid #00c59a",
                // fontWeight: 900,
                // background: "transparent",
                // borderRadius: '10px',
                // color: '#00c59a',
                // padding: '8px 16px'
            }} />
        </div>
    )
}