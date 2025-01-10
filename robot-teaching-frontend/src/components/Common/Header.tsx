import { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface HeaderProps {
  children: ReactNode;
}
const Header = ({children}: HeaderProps) => {
  return (
    <Box
      display="flex"
      width="100%"
      alignItems="center"
    >
      {children}
    </Box>
  )
}

export default Header;