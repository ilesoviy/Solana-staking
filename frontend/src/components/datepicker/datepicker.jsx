import { useState } from 'react';
import dayjs from 'dayjs';
// import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { styled } from '@mui/material/styles';

export default function DateTimePickerValue({value, setValue}) {

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
                // label="Controlled picker"
                value={value}
                onChange={(newValue) => setValue(newValue)}
                sx={{
                    width: '100%',
                    height: '48px',
                    background: '#00000080',
                    borderRadius: '8px',
                    border: 'solid 1px #222229',
                    fontFamily: 'Sora',
                    fontSize: '14px',
                    alignItems: 'left',
                    outline: 'none !important',
                    '& .MuiTextField-root .Mui-focusVisible': {
                        border: 'none !important',
                        outline: 'none !important'
                    },
                    '& .MuiFormControl-root-MuiTextField-root': {
                        outline: 'none !important',
                        border: 'none !important'
                    },
                    '& .MuiInputBase-root': {
                        color: 'white',
                        fontSize: '14px',
                        fontFamily: 'Sora',
                        height: '100%',
                        '& .MuiButtonBase-root': {
                            color: 'white'
                        },
                        
                    }
                }}
            />
        </LocalizationProvider>
    );
}
