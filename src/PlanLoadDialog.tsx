import { Button, Dialog, DialogTitle, List, ListItem, Stack, TextField, Typography } from "@mui/material"
import { useRef, useState } from "react";

type PlanLoadDialogProps ={
	open: boolean
	onClose: (url: string) => void
}

function PlanLoadDialog(props: PlanLoadDialogProps){
    const [fileURL, setFileURL] = useState("");
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleInputFileChange = (event: any) => {
        if(event.target.files && event.target.files[0]) setFileURL(URL.createObjectURL(event.target.files[0]));
    }

	return (
		<Dialog open={props.open} onClose={props.onClose}>
			<DialogTitle>Загрузка плана этажа</DialogTitle>
			<List>
				<ListItem alignItems='center'>
					<TextField label="url" value={fileURL} onChange={e => setFileURL(e.target.value)}></TextField>
				</ListItem>
                <ListItem alignItems='center'>
                    <Typography  variant="h5" textAlign={"center"} width={"100%"}>ИЛИ</Typography>
                </ListItem>
				<ListItem alignItems='center'>
                    <Button variant="contained" fullWidth onClick={() => {inputRef.current?.click()}}>Выбрать файл</Button>
					<input ref={inputRef} style={{display: "none"}} type='file' accept="image/*" onChange={handleInputFileChange}/>
				</ListItem>
				<ListItem alignItems='center'>
					<Stack spacing={1} direction={"row"} width={"100%"}>
						<Button variant='contained' fullWidth onClick={(event) => props.onClose(fileURL) }>Загрузить</Button>
						<Button variant='contained' fullWidth>Отмена</Button>
					</Stack>
				</ListItem>
			</List>
		</Dialog>
	)
}

export default PlanLoadDialog;