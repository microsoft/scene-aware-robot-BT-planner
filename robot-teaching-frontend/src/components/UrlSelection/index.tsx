import { useState } from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { Box } from '@mui/material';

export interface SimpleDialogProps {
  open: boolean;
  selectedValue: string;
  onClose: (value: string) => void;
}

function SimpleDialog(props: SimpleDialogProps) {
  const { onClose, selectedValue, open } = props;
  const [value, setValue] = useState(selectedValue);

  const handleClose = () => {
    setValue(selectedValue)
    onClose(selectedValue);
  };

  const handleListItemClick = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onClose(value);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
};

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Connect to </DialogTitle>
      <Box component="form" onSubmit={handleListItemClick} display="flex" margin="1rem" gap="1rem">
        <TextField name="url" label="URL" value={value} onChange={handleChange}/>
        <Button type="submit" variant="contained">Connect</Button>
      </Box>
    </Dialog>
  );
}

interface UrlSelectionProps {
  url: string;
  setUrl: (value: string) => void;
};

export default function UrlSelection({url, setUrl}: UrlSelectionProps) {
  const [open, setOpen] = useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (value: string) => {
    setOpen(false);
    setUrl(value);
  };

  return (
    <Box display="flex" margin="1rem" alignItems="center" gap="1rem">
      <Typography variant="subtitle1">
        Connect to: {url}
      </Typography>
      <Button variant="outlined" onClick={handleClickOpen}>
        Edit URL
      </Button>
      <SimpleDialog
        selectedValue={url}
        open={open}
        onClose={handleClose}
      />
    </Box>
  );
}