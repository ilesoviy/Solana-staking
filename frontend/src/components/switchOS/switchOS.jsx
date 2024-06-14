import Switch from '@mui/material/Switch';
import { styled } from '@mui/material/styles';

const OSSwitch = styled((props) => (
    <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
    width: 42,
    height: 26,
    padding: 0,
    '& .MuiSwitch-switchBase': {
        padding: 0,
        margin: 2,
        transitionDuration: '300ms',
        backgroundColor: '#03132C',
        '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            backgroundColor: '#03132C',
            '& + .MuiSwitch-track': {
                backgroundColor: theme.palette.mode === 'dark' ? '#03132C' : '#4628FF', //#4628FF
                opacity: 1,
                border: 0,
            },
            '&.Mui-disabled + .MuiSwitch-track': {
                opacity: 0.5,
                backgroundColor: '#03132C'
            },
        },
        '&.Mui-checked .MuiSwitch-thumb': {
            // color: '#33cf4d',
            // border: '6px solid #fff',
            backgroundColor: '#04102B'
        },
        '&.Mui-focusVisible .MuiSwitch-thumb': {
            color: '#33cf4d',
            // border: '6px solid #fff',
            backgroundColor: '#E9E9EA'
        },
        '&.Mui-disabled .MuiSwitch-thumb': {
            color:
                theme.palette.mode === 'light'
                    ? theme.palette.grey[100]
                    : theme.palette.grey[600],
            backgroundColor: '#E9E9EA'
        },
        '&.Mui-disabled + .MuiSwitch-track': {
            opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
            backgroundColor: '#03132C'
        },
    },
    '& .MuiSwitch-thumb': {
        boxSizing: 'border-box',
        width: 22,
        height: 22,
        backgroundColor: '#4628FF'
    },
    '& .MuiSwitch-track': {
        borderRadius: 26 / 2,
        backgroundColor: theme.palette.mode === 'light' ? '#03132C' : '#03132C',
        opacity: 1,
        transition: theme.transitions.create(['background-color'], {
            duration: 500,
        }),
    },
}));

export default OSSwitch;