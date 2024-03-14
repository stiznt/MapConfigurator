import { Box, TextField } from "@mui/material";
import { ChangeEvent, useState } from "react";

function NumberInput({value, onChange, ...props}: any){
    const [inputValue, setInputValue] = useState(value ? value.toString(): "")
    const [validateValue, setValidateValue] = useState(value)

    const handleChange = (event: ChangeEvent) => {
        var new_value = (event.target as HTMLInputElement).value;
        if(/^-?\d+$/.test(new_value)){
            setValidateValue(parseInt(new_value))
            if(onChange) onChange(parseInt(new_value));
            console.log(new_value)
        }
        setInputValue(new_value);
    }

    return (
        <Box>
            <TextField
            variant="standard"
            value={inputValue} 
            onChange={handleChange} 
            inputProps={{style: {width: "25px", textAlign: "center", color: "white"}}}></TextField>
        </Box>
    )
}


export default NumberInput;